"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { type GlossaryTerm, type Discipline, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"

interface EditTermFormProps {
  term: GlossaryTerm
  onSave: (updates: Partial<Pick<GlossaryTerm, "en" | "kr" | "description" | "discipline">>) => Promise<void>
  onCancel: () => void
}

export function EditTermForm({ term, onSave, onCancel }: EditTermFormProps) {
  const [enTerm, setEnTerm] = useState(term.en)
  const [krTerm, setKrTerm] = useState(term.kr)
  const [description, setDescription] = useState(term.description || "")
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>(term.discipline)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enTerm.trim() || !krTerm.trim()) {
      alert("영어와 한국어 용어는 필수입니다.")
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        en: enTerm.trim(),
        kr: krTerm.trim(),
        description: description.trim(),
        discipline: selectedDiscipline,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges =
    enTerm !== term.en ||
    krTerm !== term.kr ||
    description !== (term.description || "") ||
    selectedDiscipline !== term.discipline

  return (
    <div className="p-6">
      <DialogTitle className="text-xl font-bold text-samoo-blue mb-2">용어 수정</DialogTitle>
      <DialogDescription className="text-samoo-gray-medium mb-6">용어 정보를 수정하고 저장하세요.</DialogDescription>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-en-term" className="text-sm font-medium text-samoo-gray">
            English *
          </Label>
          <Input
            id="edit-en-term"
            value={enTerm}
            onChange={(e) => setEnTerm(e.target.value)}
            className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
            placeholder="영어 용어를 입력하세요"
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-kr-term" className="text-sm font-medium text-samoo-gray">
            한국어 *
          </Label>
          <Input
            id="edit-kr-term"
            value={krTerm}
            onChange={(e) => setKrTerm(e.target.value)}
            className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
            placeholder="한국어 용어를 입력하세요"
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-description" className="text-sm font-medium text-samoo-gray">
            설명
          </Label>
          <Input
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명을 입력하세요"
            className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-samoo-gray mb-3 block">공종 *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
                type="button"
                onClick={() => setSelectedDiscipline(discipline)}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-md transition-colors h-auto min-h-[2.5rem] text-center",
                  selectedDiscipline === discipline
                    ? "bg-samoo-blue text-white hover:bg-samoo-blue-dark"
                    : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20 border border-samoo-gray-medium",
                )}
              >
                <span className="block">{disciplineMap[discipline].koreanName}</span>
                <span className="block text-xs opacity-75">{disciplineMap[discipline].abbreviation}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-samoo-gray-light">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="bg-samoo-blue text-white hover:bg-samoo-blue-dark"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  )
}
