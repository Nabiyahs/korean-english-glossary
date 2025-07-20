"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCheck, XCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GlossaryTerm } from "@/lib/data"
import { DuplicateConfirmationDialog } from "./duplicate-confirmation-dialog"
import { detectDuplicateTerms, approveAllTermsExcludingDuplicates } from "@/app/actions"

interface AdminBulkActionsProps {
  pendingCount: number
  onApproveAll: () => Promise<{ success: boolean; message: string }>
  onRejectAll: () => Promise<{ success: boolean; message: string }>
}

export function AdminBulkActions({ pendingCount, onApproveAll, onRejectAll }: AdminBulkActionsProps) {
  const { toast } = useToast()
  const [duplicates, setDuplicates] = useState<GlossaryTerm[]>([])
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  // useActionState for reject all
  const [rejectAllState, rejectAllAction, isRejectingAll] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await onRejectAll()
    },
    null, // initial state
  )

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

  const handleApproveAllClick = async () => {
    setIsCheckingDuplicates(true)
    try {
      const result = await detectDuplicateTerms()
      if (result.success && result.duplicates.length > 0) {
        setDuplicates(result.duplicates)
        setShowDuplicateDialog(true)
      } else {
        // No duplicates, proceed with normal approval
        const approveResult = await onApproveAll()
        if (approveResult.success) {
          toast({ title: "성공", description: approveResult.message })
        } else {
          toast({ title: "오류", description: approveResult.message, variant: "destructive" })
        }
      }
    } catch (error) {
      console.error("Error checking duplicates:", error)
      toast({ title: "오류", description: "중복 검사 중 오류가 발생했습니다.", variant: "destructive" })
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  const handleApproveAllWithDuplicates = async () => {
    const result = await onApproveAll()
    if (result.success) {
      toast({ title: "성공", description: result.message })
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  const handleApproveExcludingDuplicates = async () => {
    const result = await approveAllTermsExcludingDuplicates()
    if (result.success) {
      toast({ title: "성공", description: result.message })
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={handleApproveAllClick}
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
          disabled={isCheckingDuplicates || isRejectingAll}
        >
          {isCheckingDuplicates ? (
            <>
              <Search className="w-4 h-4 animate-spin" />
              중복 검사 중...
            </>
          ) : (
            <>
              <CheckCheck className="w-4 h-4" />
              모두 승인 ({pendingCount}개)
            </>
          )}
        </Button>
        <form action={rejectAllAction}>
          <Button
            type="submit"
            variant="destructive"
            className="px-4 py-2 text-sm font-medium flex items-center gap-2"
            disabled={isCheckingDuplicates || isRejectingAll}
          >
            <XCircle className="w-4 h-4" />
            모두 거부 ({pendingCount}개)
          </Button>
        </form>
      </div>

      <DuplicateConfirmationDialog
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        duplicates={duplicates}
        totalPendingCount={pendingCount}
        onApproveAll={handleApproveAllWithDuplicates}
        onApproveExcludingDuplicates={handleApproveExcludingDuplicates}
      />
    </>
  )
}
