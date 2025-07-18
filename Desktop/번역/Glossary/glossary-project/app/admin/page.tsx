import {
  getSession,
  getUserRole,
  getGlossaryTerms,
  approveGlossaryTerm,
  rejectGlossaryTerm,
  deleteGlossaryTerm,
} from "../actions"
import { redirect } from "next/navigation"
import { disciplineMap } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

export default async function AdminPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const userRole = await getUserRole(session.user.id)
  if (userRole !== "admin") {
    redirect("/") // Redirect non-admins
  }

  const pendingTerms = await getGlossaryTerms("pending")

  const handleApprove = async (id: string) => {
    "use server"
    const result = await approveGlossaryTerm(id)
    if (result.success) {
      toast({ title: "성공", description: result.message })
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  const handleReject = async (id: string) => {
    "use server"
    const result = await rejectGlossaryTerm(id)
    if (result.success) {
      toast({ title: "성공", description: result.message })
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    "use server"
    const result = await deleteGlossaryTerm(id)
    if (result.success) {
      toast({ title: "성공", description: result.message })
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-samoo-blue mb-6">관리자 대시보드</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-samoo-gray mb-4">승인 대기 용어</h2>
        {pendingTerms.length === 0 ? (
          <p className="text-samoo-gray-medium italic">승인 대기 중인 용어가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-samoo-gray-light shadow-sm bg-white">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-samoo-gray-light/50">
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[10%]">공종</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[20%]">EN</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[20%]">KR</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[30%]">설명</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[20%] text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {pendingTerms.map((term) => (
                  <tr
                    key={term.id}
                    className="border-b border-samoo-gray-light last:border-b-0 hover:bg-samoo-gray-light/30"
                  >
                    <td className="p-3 text-sm text-samoo-gray">{disciplineMap[term.discipline].abbreviation}</td>
                    <td className="p-3 text-sm text-samoo-gray">{term.en}</td>
                    <td className="p-3 text-sm text-samoo-gray">{term.kr}</td>
                    <td className="p-3 text-sm text-samoo-gray">{term.description}</td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <form action={handleApprove}>
                        <input type="hidden" name="id" value={term.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-100"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">승인</span>
                        </Button>
                      </form>
                      <form action={handleReject}>
                        <input type="hidden" name="id" value={term.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">거부</span>
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-samoo-gray mb-4">전체 용어 관리 (관리자 전용)</h2>
        <p className="text-samoo-gray-medium mb-4">여기서는 모든 용어를 삭제할 수 있습니다.</p>
        {/* This section could list all terms with a delete button, similar to GlossaryTable but always visible for admins */}
        {/* For simplicity, we'll just show a message here, as the main GlossaryTable already has delete functionality for admins */}
        <p className="text-samoo-gray-medium italic">
          메인 용어집 페이지에서 "단어장 생성" 모드를 활성화하여 용어를 삭제할 수 있습니다.
        </p>
      </section>
      <Toaster />
    </div>
  )
}
