"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { type GlossaryTerm, disciplineMap } from "@/lib/data" // Import disciplineMap

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
  const { data, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user role:", error)
    return null
  }
  return data.role
}

export async function getGlossaryTerms(statusFilter?: "pending" | "approved", forAdmin = false) {
  const supabase = createClient()

  try {
    let query = supabase.from("glossary_terms").select("*")

    if (!forAdmin && statusFilter) {
      query = query.eq("status", statusFilter)
    } else if (!forAdmin) {
      // Default for non-admins: only approved terms
      query = query.eq("status", "approved")
    }
    // If forAdmin is true, no status filter is applied, fetching all terms.

    const { data, error } = await query.order("discipline", { ascending: true }).order("en", { ascending: true })

    if (error) throw error

    return (data ?? []) as GlossaryTerm[]
  } catch (err: any) {
    if (err?.code === "42P01") {
      console.warn(
        "⚠️  glossary_terms table not found – returning empty list. " + "Run the provided SQL schema to create it.",
      )
      return []
    }

    console.error("Error fetching glossary terms:", err)
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

  // Removed the authentication check here.
  // The RLS policy on the database will now handle who can insert.

  const abbreviation = disciplineMap[term.discipline].abbreviation

  const { error } = await supabase.from("glossary_terms").insert({
    en: term.en,
    kr: term.kr,
    description: term.description,
    discipline: term.discipline,
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

export async function deleteGlossaryTerm(id: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated." }
  }

  const userRole = await getUserRole(user.id)
  if (userRole !== "admin") {
    return { success: false, message: "권한이 없습니다." }
  }

  const { error } = await supabase.from("glossary_terms").delete().eq("id", id)

  if (error) {
    console.error("Error deleting glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: "용어가 성공적으로 삭제되었습니다." }
}

export async function approveGlossaryTerm(id: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated." }
  }

  const userRole = await getUserRole(user.id)
  if (userRole !== "admin") {
    return { success: false, message: "권한이 없습니다." }
  }

  const { error } = await supabase.from("glossary_terms").update({ status: "approved" }).eq("id", id)

  if (error) {
    console.error("Error approving glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true, message: "용어가 성공적으로 승인되었습니다." }
}

export async function rejectGlossaryTerm(id: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated." }
  }

  const userRole = await getUserRole(user.id)
  if (userRole !== "admin") {
    return { success: false, message: "권한이 없습니다." }
  }

  // For rejection, we'll just delete the term
  const { error } = await supabase.from("glossary_terms").delete().eq("id", id)

  if (error) {
    console.error("Error rejecting glossary term:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin")
  return { success: true, message: "용어가 성공적으로 거부되었습니다." }
}
