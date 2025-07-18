"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminActionButtonsProps {
  termId: string
  onApprove: (id: string) => Promise<{ success: boolean; message: string }>
  onReject: (id: string) => Promise<{ success: boolean; message: string }>
}

export function AdminActionButtons({ termId, onApprove, onReject }: AdminActionButtonsProps) {
  const { toast } = useToast()

  // useActionState for approve
  const [approveState, approveAction, isApproving] = useActionState(
    async (prevState: any, formData: FormData) => {
      const id = formData.get("id") as string
      return await onApprove(id)
    },
    null, // initial state
  )

  // useActionState for reject
  const [rejectState, rejectAction, isRejecting] = useActionState(
    async (prevState: any, formData: FormData) => {
      const id = formData.get("id") as string
      return await onReject(id)
    },
    null, // initial state
  )

  // Effect to show toast messages for approve action
  useEffect(() => {
    if (approveState) {
      if (approveState.success) {
        toast({ title: "성공", description: approveState.message })
      } else {
        toast({ title: "오류", description: approveState.message, variant: "destructive" })
      }
    }
  }, [approveState, toast])

  // Effect to show toast messages for reject action
  useEffect(() => {
    if (rejectState) {
      if (rejectState.success) {
        toast({ title: "성공", description: rejectState.message })
      } else {
        toast({ title: "오류", description: rejectState.message, variant: "destructive" })
      }
    }
  }, [rejectState, toast])

  return (
    <>
      <form action={approveAction}>
        <input type="hidden" name="id" value={termId} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:bg-green-100"
          disabled={isApproving || isRejecting} // Disable if any action is pending
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">승인</span>
        </Button>
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="id" value={termId} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:bg-red-100"
          disabled={isApproving || isRejecting} // Disable if any action is pending
        >
          <X className="h-4 w-4" />
          <span className="sr-only">거부</span>
        </Button>
      </form>
    </>
  )
}
