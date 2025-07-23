"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { type GlossaryTerm, disciplineMap, type Discipline } from "@/lib/data" // Import disciplineMap
import { formatEnglishTerm, formatKoreanTerm, formatDescription } from "@/lib/text-formatting"

export async function signIn(email: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    console.error("Sign-in error:", error)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Check your email for a login link!" }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect("/login")
}

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Add this console.log for debugging
  console.log("DEBUG: getSession result - Session:", session ? "FOUND" : "NOT FOUND", "User ID:", session?.user?.id)

  return session
}

export async function getUserRole(userId: string) {
  const supabase = createClient()
  console.log("DEBUG: getUserRole - Fetching role for user ID:", userId)

  try {
    const { data, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single()

    if (error) {
      console.error("DEBUG: getUserRole - Error fetching user role:", error)
      return "user" // Default to 'user' role instead of null
    }
    console.log("DEBUG: getUserRole - User role found:", data.role)
    return data.role || "user"
  } catch (err) {
    console.error("DEBUG: getUserRole - Unexpected error:", err)
    return "user" // Default to 'user' role
  }
}

export async function getGlossaryTerms(statusFilter?: "pending" | "approved", forAdmin = false) {
  const supabase = createClient()

  try {
    // First, check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from("glossary_terms")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.error("Supabase connection error:", connectionError)
      return []
    }

    // Get total count first to determine if we need pagination
    let countQuery = supabase.from("glossary_terms").select("*", { count: "exact", head: true })

    if (!forAdmin && statusFilter) {
      countQuery = countQuery.eq("status", statusFilter)
    } else if (!forAdmin) {
      countQuery = countQuery.eq("status", "approved")
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Error getting count:", countError)
      return []
    }

    console.log(`Total terms in database: ${count}`)

    // If we have more than 1000 terms, we need to fetch in batches
    const allTerms: GlossaryTerm[] = []
    const batchSize = 1000
    let from = 0

    while (from < (count || 0)) {
      let query = supabase
        .from("glossary_terms")
        .select("*")
        .range(from, from + batchSize - 1)
        .order("discipline", { ascending: true })
        .order("en", { ascending: true })

      if (!forAdmin && statusFilter) {
        query = query.eq("status", statusFilter)
      } else if (!forAdmin) {
        query = query.eq("status", "approved")
      }

      const { data, error } = await query

      if (error) {
        console.error(`Error fetching batch ${from}-${from + batchSize - 1}:`, error)
        break
      }

      if (data) {
        // Validate and clean the data before adding to results
        const validatedData = (data as GlossaryTerm[]).map((term) => {
          // Ensure discipline exists in disciplineMap, fallback to 'General' if not
          if (!disciplineMap[term.discipline as Discipline]) {
            console.warn(`Invalid discipline found: ${term.discipline} for term: ${term.en}. Defaulting to 'General'.`)
            return {
              ...term,
              discipline: "General" as Discipline,
              abbreviation: "Gen",
            }
          }
          return term
        })

        allTerms.push(...validatedData)
        console.log(`Fetched batch: ${from}-${from + batchSize - 1}, got ${data.length} terms`)
      }

      from += batchSize

      // Safety break to prevent infinite loops
      if (from > 10000) {
        console.warn("Safety break: stopping at 10,000 terms")
        break
      }
    }

    console.log(`Total terms fetched: ${allTerms.length}`)
    return allTerms
  } catch (err: any) {
    console.error("Unexpected error in getGlossaryTerms:", err)
    return []
  }
}

export async function addGlossaryTerm(
  term: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">,
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Format the term data
  const formattedTerm = {
    en: formatEnglishTerm(term.en),
    kr: formatKoreanTerm(term.kr),
    description: formatDescription(term.description),
    discipline: term.discipline,
  }

  const abbreviation = disciplineMap[formattedTerm.discipline].abbreviation

  const { error } = await supabase.from("glossary_terms").insert({
    en: formattedTerm.en,
    kr: formattedTerm.kr,
    description: formattedTerm.description,
    discipline: formattedTerm.discipline,
    abbreviation: abbreviation,
    status: "pending", // New terms are always pending
    created_by: user?.id || null, // Pass user.id if available, otherwise null
  })

  if (error) {
    console.error("Error adding glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/") // Revalidate the main page to show updates
  return { success: true, message: "용어가 성공적으로 추가되었습니다. 관리자 승인 후 표시됩니다." }
}

export async function updateGlossaryTerm(
  id: string,
  updates: Partial<Pick<GlossaryTerm, "en" | "kr" | "description" | "discipline">>,
) {
  const supabase = createClient()

  // Format the updates
  const formattedUpdates: any = {}
  if (updates.en) formattedUpdates.en = formatEnglishTerm(updates.en)
  if (updates.kr) formattedUpdates.kr = formatKoreanTerm(updates.kr)
  if (updates.description !== undefined) formattedUpdates.description = formatDescription(updates.description)
  if (updates.discipline) {
    formattedUpdates.discipline = updates.discipline
    formattedUpdates.abbreviation = disciplineMap[updates.discipline].abbreviation
  }

  const { error } = await supabase.from("glossary_terms").update(formattedUpdates).eq("id", id)

  if (error) {
    console.error("Error updating glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: "용어가 성공적으로 수정되었습니다." }
}

export async function deleteGlossaryTerm(id: string) {
  const supabase = createClient()

  // Remove authentication check - anyone can delete
  const { error } = await supabase.from("glossary_terms").delete().eq("id", id)

  if (error) {
    console.error("Error deleting glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: "용어가 성공적으로 삭제되었습니다." }
}

export async function deleteMultipleTerms(ids: string[]) {
  const supabase = createClient()

  // Delete in batches to avoid query limits
  const batchSize = 100
  let deletedCount = 0

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const { error } = await supabase.from("glossary_terms").delete().in("id", batch)

    if (error) {
      console.error(`Error deleting batch ${i}-${i + batchSize}:`, error)
      return { success: false, message: error.message }
    }

    deletedCount += batch.length
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `${deletedCount}개의 용어가 성공적으로 삭제되었습니다.` }
}

export async function deleteAllTerms() {
  const supabase = createClient()

  // Get count first
  const { count, error: countError } = await supabase.from("glossary_terms").select("*", { count: "exact", head: true })

  if (countError) {
    console.error("Error counting terms:", countError)
    return { success: false, message: "용어 개수를 확인하는 중 오류가 발생했습니다." }
  }

  if (!count || count === 0) {
    return { success: false, message: "삭제할 용어가 없습니다." }
  }

  // Delete all terms in batches
  const batchSize = 1000
  let deletedCount = 0

  while (deletedCount < count) {
    const { data, error } = await supabase.from("glossary_terms").delete().limit(batchSize)

    if (error) {
      console.error("Error deleting batch:", error)
      return { success: false, message: error.message }
    }

    deletedCount += batchSize

    // Safety check
    if (deletedCount > 10000) {
      console.warn("Safety break: stopped deleting at 10,000 terms")
      break
    }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `모든 용어 (${count}개)가 성공적으로 삭제되었습니다.` }
}

export async function approveGlossaryTerm(id: string) {
  const supabase = createClient()

  // Remove authentication check - anyone can approve
  console.log("DEBUG: approveGlossaryTerm - Attempting to update glossary term status for ID:", id)
  const { error } = await supabase.from("glossary_terms").update({ status: "approved" }).eq("id", id)

  if (error) {
    console.error("DEBUG: approveGlossaryTerm - Error updating glossary term:", error)
    return { success: false, message: error.message }
  }

  console.log("DEBUG: approveGlossaryTerm - Term approved successfully. Revalidating paths.")
  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: "용어가 성공적으로 승인되었습니다." }
}

export async function rejectGlossaryTerm(id: string) {
  const supabase = createClient()

  // Remove authentication check - anyone can reject/delete
  const { error } = await supabase.from("glossary_terms").delete().eq("id", id)

  if (error) {
    console.error("Error rejecting glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true, message: "용어가 성공적으로 거부되었습니다." }
}

export async function approveAllTerms() {
  const supabase = createClient()

  // Get all pending terms first
  const { data: pendingTerms, error: fetchError } = await supabase
    .from("glossary_terms")
    .select("id")
    .eq("status", "pending")

  if (fetchError) {
    console.error("Error fetching pending terms:", fetchError)
    return { success: false, message: "대기 중인 용어를 가져오는 중 오류가 발생했습니다." }
  }

  if (!pendingTerms || pendingTerms.length === 0) {
    return { success: false, message: "승인할 대기 중인 용어가 없습니다." }
  }

  // Update all pending terms to approved in batches
  const batchSize = 100
  let approvedCount = 0

  for (let i = 0; i < pendingTerms.length; i += batchSize) {
    const batch = pendingTerms.slice(i, i + batchSize)
    const batchIds = batch.map((term) => term.id)

    const { error } = await supabase.from("glossary_terms").update({ status: "approved" }).in("id", batchIds)

    if (error) {
      console.error(`Error approving batch ${i}-${i + batchSize}:`, error)
      return { success: false, message: error.message }
    }

    approvedCount += batch.length
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `${approvedCount}개의 용어가 모두 승인되었습니다.` }
}

export interface DuplicatePair {
  pendingTerm: GlossaryTerm
  existingTerm: GlossaryTerm
}

export async function detectDuplicateTerms(): Promise<{
  success: boolean
  message: string
  duplicates: DuplicatePair[]
}> {
  const supabase = createClient()

  try {
    // Get all pending terms (with proper pagination)
    const pendingTerms = await getGlossaryTerms("pending", false)

    // Get all approved terms (with proper pagination)
    const approvedTerms = await getGlossaryTerms("approved", false)

    if (!pendingTerms || !approvedTerms) {
      return { success: true, message: "용어를 찾을 수 없습니다.", duplicates: [] }
    }

    // Find duplicates - simple matching by EN or KR
    const duplicates: DuplicatePair[] = []

    for (const pendingTerm of pendingTerms) {
      const matchingApproved = approvedTerms.find(
        (approvedTerm) =>
          pendingTerm.en.toLowerCase() === approvedTerm.en.toLowerCase() ||
          pendingTerm.kr.toLowerCase() === approvedTerm.kr.toLowerCase(),
      )

      if (matchingApproved) {
        duplicates.push({
          pendingTerm,
          existingTerm: matchingApproved,
        })
      }
    }

    return {
      success: true,
      message: `${duplicates.length}개의 중복 용어를 발견했습니다.`,
      duplicates,
    }
  } catch (error) {
    console.error("Error in detectDuplicateTerms:", error)
    return { success: false, message: "중복 검사 중 오류가 발생했습니다.", duplicates: [] }
  }
}

export async function rejectAllTerms() {
  const supabase = createClient()

  // Get all pending terms first to count them
  const { data: pendingTerms, error: fetchError } = await supabase
    .from("glossary_terms")
    .select("id")
    .eq("status", "pending")

  if (fetchError) {
    console.error("Error fetching pending terms:", fetchError)
    return { success: false, message: "대기 중인 용어를 가져오는 중 오류가 발생했습니다." }
  }

  if (!pendingTerms || pendingTerms.length === 0) {
    return { success: false, message: "거부할 대기 중인 용어가 없습니다." }
  }

  // Delete all pending terms in batches
  const batchSize = 100
  let rejectedCount = 0

  for (let i = 0; i < pendingTerms.length; i += batchSize) {
    const batch = pendingTerms.slice(i, i + batchSize)
    const batchIds = batch.map((term) => term.id)

    const { error } = await supabase.from("glossary_terms").delete().in("id", batchIds)

    if (error) {
      console.error(`Error rejecting batch ${i}-${i + batchSize}:`, error)
      return { success: false, message: error.message }
    }

    rejectedCount += batch.length
  }

  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true, message: `${rejectedCount}개의 용어가 모두 거부되었습니다.` }
}

export interface DuplicateInfo {
  pendingTerm: GlossaryTerm
  existingTerm: GlossaryTerm
  differences: {
    en: boolean
    kr: boolean
    description: boolean
    discipline: boolean
  }
}
