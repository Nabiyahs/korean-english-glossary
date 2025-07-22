"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { type GlossaryTerm, disciplineMap } from "@/lib/data" // Import disciplineMap
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

    let query = supabase.from("glossary_terms").select("*")

    if (!forAdmin && statusFilter) {
      query = query.eq("status", statusFilter)
    } else if (!forAdmin) {
      // Default for non-admins: only approved terms
      query = query.eq("status", "approved")
    }
    // If forAdmin is true, no status filter is applied, fetching all terms.

    const { data, error } = await query.order("discipline", { ascending: true }).order("en", { ascending: true })

    if (error) {
      console.error("Error fetching glossary terms:", error)
      return []
    }

    const terms = (data ?? []) as GlossaryTerm[]

    // Debug log for General terms
    const generalTerms = terms.filter((term) => term.discipline === "프로젝트 일반 용어")
    console.log("DEBUG: getGlossaryTerms - General terms found:", generalTerms.length)
    console.log(
      "DEBUG: getGlossaryTerms - General terms:",
      generalTerms.map((t) => ({ id: t.id, en: t.en, kr: t.kr, status: t.status })),
    )

    // Debug log for all terms by discipline
    const termsByDiscipline = terms.reduce(
      (acc, term) => {
        acc[term.discipline] = (acc[term.discipline] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    console.log("DEBUG: getGlossaryTerms - Terms by discipline:", termsByDiscipline)

    return terms
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

  console.log("DEBUG: addGlossaryTerm - Adding term:", {
    ...formattedTerm,
    abbreviation,
    status: "pending",
  })

  // Check for duplicates before inserting
  const { data: existingTerms, error: checkError } = await supabase
    .from("glossary_terms")
    .select("id, en, kr")
    .or(`en.ilike.${formattedTerm.en},kr.ilike.${formattedTerm.kr}`)

  if (checkError) {
    console.error("DEBUG: addGlossaryTerm - Error checking duplicates:", checkError)
  } else if (existingTerms && existingTerms.length > 0) {
    console.log("DEBUG: addGlossaryTerm - Found potential duplicates:", existingTerms)
    const exactMatch = existingTerms.find(
      (existing) =>
        existing.en.toLowerCase() === formattedTerm.en.toLowerCase() &&
        existing.kr.toLowerCase() === formattedTerm.kr.toLowerCase(),
    )
    if (exactMatch) {
      console.log("DEBUG: addGlossaryTerm - Exact duplicate found, skipping")
      return { success: false, message: "이미 존재하는 용어입니다." }
    }
  }

  const { data, error } = await supabase
    .from("glossary_terms")
    .insert({
      en: formattedTerm.en,
      kr: formattedTerm.kr,
      description: formattedTerm.description,
      discipline: formattedTerm.discipline,
      abbreviation: abbreviation,
      status: "pending",
      created_by: user?.id || null,
    })
    .select()

  if (error) {
    console.error("DEBUG: addGlossaryTerm - Error adding term:", error)
    return { success: false, message: `용어 추가 중 오류가 발생했습니다: ${error.message}` }
  }

  console.log("DEBUG: addGlossaryTerm - Successfully added term:", data)

  revalidatePath("/")
  revalidatePath("/admin")
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

  const { error } = await supabase.from("glossary_terms").delete().in("id", ids)

  if (error) {
    console.error("Error deleting multiple terms:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `${ids.length}개의 용어가 성공적으로 삭제되었습니다.` }
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

  // Delete all terms
  const { error } = await supabase.from("glossary_terms").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all by using a condition that matches all

  if (error) {
    console.error("Error deleting all terms:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `모든 용어 (${count}개)가 성공적으로 삭제되었습니다.` }
}

export async function approveGlossaryTerm(id: string) {
  const supabase = createClient()

  console.log("DEBUG: approveGlossaryTerm - Attempting to approve term with ID:", id)

  // First, check if the term exists and is pending
  const { data: existingTerm, error: fetchError } = await supabase
    .from("glossary_terms")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("DEBUG: approveGlossaryTerm - Error fetching term:", fetchError)
    return { success: false, message: `용어를 찾을 수 없습니다: ${fetchError.message}` }
  }

  if (!existingTerm) {
    console.error("DEBUG: approveGlossaryTerm - Term not found")
    return { success: false, message: "용어를 찾을 수 없습니다." }
  }

  console.log("DEBUG: approveGlossaryTerm - Found term:", existingTerm)

  if (existingTerm.status === "approved") {
    console.log("DEBUG: approveGlossaryTerm - Term already approved")
    return { success: true, message: "용어가 이미 승인되어 있습니다." }
  }

  // Update the term status
  const { data: updatedData, error: updateError } = await supabase
    .from("glossary_terms")
    .update({ status: "approved" })
    .eq("id", id)
    .select()

  if (updateError) {
    console.error("DEBUG: approveGlossaryTerm - Error updating term:", updateError)
    return { success: false, message: `승인 중 오류가 발생했습니다: ${updateError.message}` }
  }

  console.log("DEBUG: approveGlossaryTerm - Term approved successfully:", updatedData)

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

  console.log("DEBUG: approveAllTerms - Starting batch approval")

  // Get all pending terms first with detailed logging
  const { data: pendingTerms, error: fetchError } = await supabase
    .from("glossary_terms")
    .select("*")
    .eq("status", "pending")

  if (fetchError) {
    console.error("DEBUG: approveAllTerms - Error fetching pending terms:", fetchError)
    return { success: false, message: `대기 중인 용어를 가져오는 중 오류가 발생했습니다: ${fetchError.message}` }
  }

  console.log("DEBUG: approveAllTerms - Found pending terms:", pendingTerms?.length || 0)
  console.log("DEBUG: approveAllTerms - Pending terms details:", pendingTerms)

  if (!pendingTerms || pendingTerms.length === 0) {
    return { success: false, message: "승인할 대기 중인 용어가 없습니다." }
  }

  // Update all pending terms to approved with explicit ID list
  const pendingIds = pendingTerms.map((term) => term.id)
  console.log("DEBUG: approveAllTerms - Updating term IDs:", pendingIds)

  const { data: updatedData, error: updateError } = await supabase
    .from("glossary_terms")
    .update({ status: "approved" })
    .in("id", pendingIds)
    .select()

  if (updateError) {
    console.error("DEBUG: approveAllTerms - Error updating terms:", updateError)
    return { success: false, message: `일괄 승인 중 오류가 발생했습니다: ${updateError.message}` }
  }

  console.log("DEBUG: approveAllTerms - Successfully updated terms:", updatedData?.length || 0)
  console.log("DEBUG: approveAllTerms - Updated terms data:", updatedData)

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `${updatedData?.length || pendingTerms.length}개의 용어가 모두 승인되었습니다.` }
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
    // Get all pending terms
    const { data: pendingTerms, error: pendingError } = await supabase
      .from("glossary_terms")
      .select("*")
      .eq("status", "pending")

    if (pendingError) {
      console.error("Error fetching pending terms:", pendingError)
      return { success: false, message: "대기 중인 용어를 가져오는 중 오류가 발생했습니다.", duplicates: [] }
    }

    // Get all approved terms
    const { data: approvedTerms, error: approvedError } = await supabase
      .from("glossary_terms")
      .select("*")
      .eq("status", "approved")

    if (approvedError) {
      console.error("Error fetching approved terms:", approvedError)
      return { success: false, message: "승인된 용어를 가져오는 중 오류가 발생했습니다.", duplicates: [] }
    }

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

  // Delete all pending terms
  const { error } = await supabase.from("glossary_terms").delete().eq("status", "pending")

  if (error) {
    console.error("Error rejecting all terms:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true, message: `${pendingTerms.length}개의 용어가 모두 거부되었습니다.` }
}

// Add a new debug function to check database state
export async function debugDatabaseState() {
  const supabase = createClient()

  try {
    const { data: allTerms, error } = await supabase
      .from("glossary_terms")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all terms for debug:", error)
      return { success: false, terms: [] }
    }

    console.log("DEBUG: All terms in database:", allTerms)

    const generalTerms = allTerms?.filter((term) => term.discipline === "프로젝트 일반 용어") || []
    console.log("DEBUG: General terms in database:", generalTerms)

    return { success: true, terms: allTerms || [] }
  } catch (error) {
    console.error("Error in debugDatabaseState:", error)
    return { success: false, terms: [] }
  }
}

export async function refreshDatabaseConnection() {
  const supabase = createClient()

  try {
    // Test the connection
    const { data, error } = await supabase.from("glossary_terms").select("count").limit(1)

    if (error) {
      console.error("DEBUG: refreshDatabaseConnection - Connection error:", error)
      return { success: false, message: error.message }
    }

    console.log("DEBUG: refreshDatabaseConnection - Connection successful")
    return { success: true, message: "데이터베이스 연결이 정상입니다." }
  } catch (error) {
    console.error("DEBUG: refreshDatabaseConnection - Unexpected error:", error)
    return { success: false, message: "데이터베이스 연결 중 오류가 발생했습니다." }
  }
}
