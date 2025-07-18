import { AuthForm } from "@/components/auth-form"
import { getSession } from "../actions"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">로그인</h2>
        <AuthForm />
      </div>
    </div>
  )
}
