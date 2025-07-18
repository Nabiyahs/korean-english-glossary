"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { type Discipline, type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TermInputFormProps {
  onAddTerm: (term: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">) => Promise<void>
  onAddTermsFromText: (
    terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[],
  ) => Promise<void>
  onClose?: () => void
  existingGlossary: GlossaryTerm[]
}

export function TermInputForm({ onAddTerm, onClose, existingGlossary }: TermInputFormProps) {
  /* ─────────────────────────── state ─────────────────────────── */
  const [enTerm, setEnTerm] = useState("")
  const [krTerm, setKrTerm] = useState("")
  const [description, setDescription] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)

  const disciplines = Object.keys(disciplineMap) as Discipline[]
  const { toast } = useToast()

  /* ───────────────────────── individual term ──────────────────── */
  const handleAddIndividualTerm = async () => {
    if (enTerm && krTerm && selectedDiscipline) {
      const lowerCaseEn = enTerm.toLowerCase()
      const lowerCaseKr = krTerm.toLowerCase()

      // Check for duplicate term
      const isDuplicate = existingGlossary.some(
        (term) => term.en.toLowerCase() === lowerCaseEn && term.kr.toLowerCase() === lowerCaseKr,
      )

      if (isDuplicate) {
        toast({
          title: "알림",
          description: "입력하신 용어는 이미 용어집에 있습니다.",
          variant: "default",
        })
        return
      }

      await onAddTerm({
        en: enTerm,
        kr: krTerm,
        description: description.trim(),
        discipline: selectedDiscipline,
      })
      setEnTerm("")
      setKrTerm("")
      setDescription("")
      setSelectedDiscipline(null)
      onClose?.()
    } else {
      alert("모든 필수 필드를 채워주세요 (English, 한국어, 공종).")
    }
  }

  /* ─────────────────────────── JSX ─────────────────────────── */
  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-xl font-bold text-samoo-blue mb-4">용어 추가</h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="en-term" className="text-sm font-medium text-samoo-gray">
            English
          </Label>
          <Input
            id="en-term"
            value={enTerm}
            onChange={(e) => setEnTerm(e.target.value)}
            className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue h-10"
            placeholder="영어 용어를 입력하세요"
          />
        </div>

        <div>
          <Label htmlFor="kr-term" className="text-sm font-medium text-samoo-gray">
            한국어
          </Label>
          <Input
            id="kr-term"
            value={krTerm}
            onChange={(e) => setKrTerm(e.target.value)}
            className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue h-10"
            placeholder="한국어 용어를 입력하세요"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-samoo-gray">
            설명(선택)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명을 입력하세요"
            className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue h-10"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-samoo-gray mb-3 block">공종</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
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

        <div className="flex justify-end mt-6 pt-4 border-t border-samoo-gray-light">
          <Button
            onClick={handleAddIndividualTerm}
            className="px-6 py-2 bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors h-10 w-full sm:w-auto"
          >
            용어 추가
          </Button>
        </div>
      </div>
    </div>
  )
}
