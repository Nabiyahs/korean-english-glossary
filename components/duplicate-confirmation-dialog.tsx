"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { AlertTriangle, CheckCheck, XCircle } from "lucide-react"

interface DuplicateConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  duplicates: GlossaryTerm[]
  totalPendingCount: number
  onApproveAll: () => Promise<void>
  onApproveExcludingDuplicates: () => Promise<void>
}

export function DuplicateConfirmationDialog({
  isOpen,
  onClose,
  duplicates,
  totalPendingCount,
  onApproveAll,
  onApproveExcludingDuplicates,
}: DuplicateConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApproveAll = async () => {
    setIsProcessing(true)
    try {
      await onApproveAll()
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveExcludingDuplicates = async () => {
    setIsProcessing(true)
    try {
      await onApproveExcludingDuplicates()
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const nonDuplicateCount = totalPendingCount - duplicates.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <DialogTitle className="text-xl font-bold text-amber-600 mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            중복 용어 발견
          </DialogTitle>
          <DialogDescription className="text-samoo-gray-medium mb-6">
            승인 대기 중인 용어 중 이미 승인된 용어와 중복되는 항목이 발견되었습니다.
          </DialogDescription>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-samoo-gray">전체 대기 용어:</span>
                <span className="ml-2 text-samoo-blue font-semibold">{totalPendingCount}개</span>
              </div>
              <div>
                <span className="font-medium text-samoo-gray">중복 용어:</span>
                <span className="ml-2 text-amber-600 font-semibold">{duplicates.length}개</span>
              </div>
              <div>
                <span className="font-medium text-samoo-gray">승인 가능:</span>
                <span className="ml-2 text-green-600 font-semibold">{nonDuplicateCount}개</span>
              </div>
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-samoo-gray mb-3">중복 용어 목록</h4>
              <div className="max-h-60 overflow-y-auto border border-samoo-gray-light rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-samoo-gray-light/50">
                    <tr>
                      <th className="p-3 text-xs font-medium text-samoo-gray">공종</th>
                      <th className="p-3 text-xs font-medium text-samoo-gray">English</th>
                      <th className="p-3 text-xs font-medium text-samoo-gray">한국어</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicates.map((term) => (
                      <tr key={term.id} className="border-b border-samoo-gray-light/50 hover:bg-amber-50/50">
                        <td className="p-3 text-xs">
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                            {disciplineMap[term.discipline].abbreviation}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-medium text-samoo-gray">{term.en}</td>
                        <td className="p-3 text-xs font-medium text-samoo-gray">{term.kr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
              className="px-4 py-2 text-sm bg-transparent"
            >
              취소
            </Button>
            <Button
              onClick={handleApproveAll}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              모두 승인 ({totalPendingCount}개)
            </Button>
            <Button
              onClick={handleApproveExcludingDuplicates}
              disabled={isProcessing || nonDuplicateCount === 0}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              중복 제외 ({nonDuplicateCount}개)
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-4 text-center">
              <p className="text-sm text-samoo-blue">처리 중...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
