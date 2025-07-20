"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCheck, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminBulkActionsProps {
  pendingCount: number
  hasDuplicates: boolean
  onApproveAll: () => Promise<{ success: boolean; message: string }>
  onRejectAll: () => Promise<{ success: boolean; message: string }>
}

export function AdminBulkActions({ pendingCount, hasDuplicates, onApproveAll, onRejectAll }: AdminBulkActionsProps) {
  const { toast } = useToast()

  // useActionState for approve all
  const [approveAllState, approveAllAction, isApprovingAll] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await onApproveAll()
    },
    null, // initial state
  )

  // useActionState for reject all
  const [rejectAllState, rejectAllAction, isRejectingAll] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await onRejectAll()
    },
    null, // initial state
  )

  // Effect to show toast messages for approve all action
  useEffect(() => {
    if (approveAllState) {
      if (approveAllState.success) {
        toast({ title: "성공", description: approveAllState.message })
      } else {
        toast({ title: "오류", description: approveAllState.message, variant: "destructive" })
      }
    }
  }, [approveAllState, toast])

  // Effect to show toast messages for reject all action
  useEffect(() => {
    if (rejectAllState) {
      if (rejectAllState.success) {
        toast({ title: "성공", description: rejectAllState.message })
      } else {
        toast({ title: "오류", description: rejectAllState.message, variant: "destructive" })
      }
    }
  }, [rejectAllState, toast])

  const isDisabled = hasDuplicates || isApprovingAll || isRejectingAll

  return (
    <div className="flex gap-3">
      <form action={approveAllAction}>
        <Button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
          disabled={isDisabled}
          title={hasDuplicates ? "중복 용어가 있어 비활성화됨" : ""}
        >
          <CheckCheck className="w-4 h-4" />
          모두 승인 ({pendingCount}개)
        </Button>
      </form>
      <form action={rejectAllAction}>
        <Button
          type="submit"
          variant="destructive"
          className="px-4 py-2 text-sm font-medium flex items-center gap-2"
          disabled={isDisabled}
          title={hasDuplicates ? "중복 용어가 있어 비활성화됨" : ""}
        >
          <XCircle className="w-4 h-4" />
          모두 거부 ({pendingCount}개)
        </Button>
      </form>
    </div>
  )
}
