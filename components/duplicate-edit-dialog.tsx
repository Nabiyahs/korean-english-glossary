"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type GlossaryTerm, type Discipline, disciplineMap } from "@/lib/data"
import { Save, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DuplicateInfo } from "@/app/actions"

interface DuplicateEditDialogProps {
  isOpen: boolean
  onClose: () => void
  duplicateInfo: DuplicateInfo[]
  onSave: (modifiedTerms: GlossaryTerm[]) => Promise<void>
}

export function DuplicateEditDialog({ isOpen, onClose, duplicateInfo, onSave }: DuplicateEditDialogProps) {
  const [editedTerms, setEditedTerms] = useState<GlossaryTerm[]>(() =>
    duplicateInfo.map((info) => ({ ...info.pendingTerm })),
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  const updateTerm = (index: number, field: keyof GlossaryTerm, value: string | Discipline) => {
    setEditedTerms((prev) => prev.map((term, i) => (i === index ? { ...term, [field]: value } : term)))
  }

  const handleSave = async () => {
    setIsProcessing(true)
    try {
      await onSave(editedTerms)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const renderFieldComparison = (
    label: string,
    pendingValue: string,
    existingValue: string,
    isDifferent: boolean,
    currentValue: string,
    onChange: (value: string) => void,
    isTextArea = false,
  ) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-samoo-gray">{label}</Label>
        {isDifferent && (
          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
            <div className="mb-1">
              <span className="font-medium text-amber-800">기존 승인된 값:</span>
              <span className="ml-2 text-amber-700">{existingValue}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">대기 중인 값:</span>
              <span className="ml-2 text-blue-700">{pendingValue}</span>
            </div>
          </div>
        )}
        <Input
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue",
            isDifferent && "border-amber-300 bg-amber-50/50",
          )}
          placeholder={`${label}을 입력하세요`}
        />
      </div>
    )
  }

  const renderDisciplineSelector = (
    currentDiscipline: Discipline,
    existingDiscipline: Discipline,
    isDifferent: boolean,
    onChange: (discipline: Discipline) => void,
  ) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-samoo-gray">공종</Label>
        {isDifferent && (
          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
            <div className="mb-1">
              <span className="font-medium text-amber-800">기존:</span>
              <span className="ml-2 text-amber-700">{disciplineMap[existingDiscipline].koreanName}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">대기:</span>
              <span className="ml-2 text-blue-700">{disciplineMap[currentDiscipline].koreanName}</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {disciplines.map((discipline) => (
            <Button
              key={discipline}
              type="button"
              onClick={() => onChange(discipline)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-md transition-colors h-auto min-h-[2.5rem] text-center",
                currentDiscipline === discipline
                  ? "bg-samoo-blue text-white hover:bg-samoo-blue-dark"
                  : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20 border border-samoo-gray-medium",
                isDifferent && currentDiscipline === discipline && "ring-2 ring-amber-300",
              )}
            >
              <span className="block">{disciplineMap[discipline].koreanName}</span>
              <span className="block text-xs opacity-75">{disciplineMap[discipline].abbreviation}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <DialogTitle className="text-xl font-bold text-blue-600 mb-2">중복 용어 수정</DialogTitle>
          <DialogDescription className="text-samoo-gray-medium mb-6">
            중복된 용어들을 수정한 후 승인할 수 있습니다. 차이가 있는 필드는 강조 표시됩니다.
          </DialogDescription>

          <div className="space-y-8">
            {duplicateInfo.map((info, index) => (
              <div key={info.pendingTerm.id} className="border border-samoo-gray-light rounded-lg p-4">
                <h4 className="text-lg font-semibold text-samoo-gray mb-4">
                  용어 {index + 1}: {info.pendingTerm.en} / {info.pendingTerm.kr}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {renderFieldComparison(
                      "English",
                      info.pendingTerm.en,
                      info.existingTerm.en,
                      info.differences.en,
                      editedTerms[index].en,
                      (value) => updateTerm(index, "en", value),
                    )}
                  </div>

                  <div>
                    {renderFieldComparison(
                      "한국어",
                      info.pendingTerm.kr,
                      info.existingTerm.kr,
                      info.differences.kr,
                      editedTerms[index].kr,
                      (value) => updateTerm(index, "kr", value),
                    )}
                  </div>

                  <div className="md:col-span-2">
                    {renderFieldComparison(
                      "설명",
                      info.pendingTerm.description || "",
                      info.existingTerm.description || "",
                      info.differences.description,
                      editedTerms[index].description || "",
                      (value) => updateTerm(index, "description", value),
                      true,
                    )}
                  </div>

                  <div className="md:col-span-2">
                    {renderDisciplineSelector(
                      editedTerms[index].discipline,
                      info.existingTerm.discipline,
                      info.differences.discipline,
                      (discipline) => updateTerm(index, "discipline", discipline),
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-samoo-gray-light">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
              className="px-4 py-2 text-sm bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? "저장 중..." : `수정 후 승인 (${editedTerms.length}개)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
