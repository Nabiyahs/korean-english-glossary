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

    return (data ?? []) as GlossaryTerm[]
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

  // Update all pending terms to approved
  const { error } = await supabase.from("glossary_terms").update({ status: "approved" }).eq("status", "pending")

  if (error) {
    console.error("Error approving all terms:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: `${pendingTerms.length}개의 용어가 모두 승인되었습니다.` }
}

export async function detectDuplicateTerms() {
  const supabase = createClient()

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

  // Find duplicates
  const duplicates = pendingTerms.filter((pendingTerm) =>
    approvedTerms.some(
      (approvedTerm) =>
        pendingTerm.en.toLowerCase() === approvedTerm.en.toLowerCase() &&
        pendingTerm.kr.toLowerCase() === approvedTerm.kr.toLowerCase(),
    ),
  )

  return {
    success: true,
    message: `${duplicates.length}개의 중복 용어를 발견했습니다.`,
    duplicates: duplicates as GlossaryTerm[],
    pendingTerms: pendingTerms as GlossaryTerm[],
  }
}

export async function approveAllTermsExcludingDuplicates() {
  const supabase = createClient()

  // First detect duplicates
  const duplicateResult = await detectDuplicateTerms()
  if (!duplicateResult.success) {
    return duplicateResult
  }

  const { duplicates, pendingTerms } = duplicateResult

  if (!pendingTerms || pendingTerms.length === 0) {
    return { success: false, message: "승인할 대기 중인 용어가 없습니다." }
  }

  // Get IDs of non-duplicate terms
  const duplicateIds = new Set(duplicates.map((d) => d.id))
  const nonDuplicateTerms = pendingTerms.filter((term) => !duplicateIds.has(term.id))

  if (nonDuplicateTerms.length === 0) {
    return { success: false, message: "중복을 제외하면 승인할 용어가 없습니다." }
  }

  // Approve only non-duplicate terms
  const { error } = await supabase
    .from("glossary_terms")
    .update({ status: "approved" })
    .in(
      "id",
      nonDuplicateTerms.map((term) => term.id),
    )

  if (error) {
    console.error("Error approving non-duplicate terms:", error)
    return { success: false, message: error.message }
  }

  // Delete duplicate terms
  if (duplicates.length > 0) {
    const { error: deleteError } = await supabase
      .from("glossary_terms")
      .delete()
      .in(
        "id",
        duplicates.map((d) => d.id),
      )

    if (deleteError) {
      console.error("Error deleting duplicate terms:", deleteError)
      // Don't fail the whole operation if deletion fails
    }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return {
    success: true,
    message: `${nonDuplicateTerms.length}개의 용어가 승인되었습니다. ${duplicates.length}개의 중복 용어는 제외되었습니다.`,
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
