"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { AlertTriangle, CheckCheck, XCircle, Edit } from "lucide-react"
import type { DuplicateInfo } from "@/app/actions"

interface DuplicateConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  duplicates: GlossaryTerm[]
  duplicateInfo: DuplicateInfo[]
  totalPendingCount: number
  onApproveAll: () => Promise<void>
  onApproveExcludingDuplicates: () => Promise<void>
  onModifyDuplicates: (duplicateInfo: DuplicateInfo[]) => void
}

export function DuplicateConfirmationDialog({
  isOpen,
  onClose,
  duplicates,
  duplicateInfo,
  totalPendingCount,
  onApproveAll,
  onApproveExcludingDuplicates,
  onModifyDuplicates,
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

  const handleModifyDuplicates = () => {
    onModifyDuplicates(duplicateInfo)
    onClose()
  }

  const nonDuplicateCount = totalPendingCount - duplicates.length

  const renderDifference = (pendingValue: string, existingValue: string, isDifferent: boolean) => {
    if (!isDifferent) {
      return <span className="text-samoo-gray">{pendingValue}</span>
    }

    return (
      <div className="space-y-1">
        <div className="text-xs text-samoo-gray-medium">대기 중:</div>
        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{pendingValue}</div>
        <div className="text-xs text-samoo-gray-medium">기존:</div>
        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{existingValue}</div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
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

          {duplicateInfo.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-samoo-gray mb-3">중복 용어 상세 비교</h4>
              <div className="max-h-80 overflow-y-auto border border-samoo-gray-light rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-samoo-gray-light/50">
                    <tr>
                      <th className="p-3 text-xs font-medium text-samoo-gray">공종</th>
                      <th className="p-3 text-xs font-medium text-samoo-gray">English</th>
                      <th className="p-3 text-xs font-medium text-samoo-gray">한국어</th>
                      <th className="p-3 text-xs font-medium text-samoo-gray">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicateInfo.map((info, index) => (
                      <tr
                        key={info.pendingTerm.id}
                        className="border-b border-samoo-gray-light/50 hover:bg-amber-50/50"
                      >
                        <td className="p-3 text-xs">
                          {info.differences.discipline ? (
                            renderDifference(
                              disciplineMap[info.pendingTerm.discipline].abbreviation,
                              disciplineMap[info.existingTerm.discipline].abbreviation,
                              true,
                            )
                          ) : (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                              {disciplineMap[info.pendingTerm.discipline].abbreviation}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-xs">
                          {renderDifference(info.pendingTerm.en, info.existingTerm.en, info.differences.en)}
                        </td>
                        <td className="p-3 text-xs">
                          {renderDifference(info.pendingTerm.kr, info.existingTerm.kr, info.differences.kr)}
                        </td>
                        <td className="p-3 text-xs">
                          {renderDifference(
                            info.pendingTerm.description || "설명 없음",
                            info.existingTerm.description || "설명 없음",
                            info.differences.description,
                          )}
                        </td>
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
              onClick={handleModifyDuplicates}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              중복 용어 수정
            </Button>
            <Button
              onClick={handleApproveExcludingDuplicates}
              disabled={isProcessing || nonDuplicateCount === 0}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              중복 제외 ({nonDuplicateCount}개)
            </Button>
            <Button
              onClick={handleApproveAll}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              모두 승인 ({totalPendingCount}개)
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
