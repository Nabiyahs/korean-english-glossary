"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { type Discipline, type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload } from "lucide-react"

interface TermInputFormProps {
  onAddTerm: (term: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">) => Promise<void>
  onAddTermsFromText: (
    terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[],
  ) => Promise<void>
  onClose?: () => void
  existingGlossary: GlossaryTerm[]
}

export function TermInputForm({ onAddTerm, onAddTermsFromText, onClose, existingGlossary }: TermInputFormProps) {
  const [enTerm, setEnTerm] = useState("")
  const [krTerm, setKrTerm] = useState("")
  const [description, setDescription] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const disciplines = Object.keys(disciplineMap) as Discipline[]
  const { toast } = useToast()

  /* ───────────────────────── individual term ──────────────────── */
  const handleAddIndividualTerm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (enTerm && krTerm && selectedDiscipline) {
      const lowerCaseEn = enTerm.toLowerCase()
      const lowerCaseKr = krTerm.toLowerCase()

      const isDuplicate = existingGlossary.some(
        (term) => term.en.toLowerCase() === lowerCaseEn && term.kr.toLowerCase() === lowerCaseKr,
      )

      if (isDuplicate) {
        toast({
          title: "중복 용어",
          description: "입력하신 용어는 이미 용어집에 있습니다.",
          variant: "default",
        })
        return
      }

      setIsSubmitting(true)
      try {
        await onAddTerm({
          en: enTerm,
          kr: krTerm,
          description: description.trim(),
          discipline: selectedDiscipline,
        })

        toast({
          title: "✅ 용어 추가 완료",
          description: "용어가 성공적으로 추가되었습니다. 관리자의 승인 후 등록됩니다.",
        })

        // Clear form
        setEnTerm("")
        setKrTerm("")
        setDescription("")
        setSelectedDiscipline(null)

        // Close popup only after successful submission
        onClose?.()
      } catch (error) {
        console.error("Error adding term:", error)
        toast({
          title: "❌ 추가 실패",
          description: "용어 추가 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      toast({
        title: "입력 확인",
        description: "영어, 한국어, 공종을 모두 입력해주세요.",
        variant: "destructive",
      })
    }
  }

  /* ───────────────────────── file upload ──────────────────── */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setIsSubmitting(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim() !== "" && !line.includes("==="))

      const terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] = []

      for (const line of lines) {
        const parts = line.split("/").map((part) => part.trim())
        if (parts.length >= 3) {
          const [disciplineAbbr, en, kr, description = ""] = parts

          const discipline = Object.keys(disciplineMap).find(
            (key) => disciplineMap[key as Discipline].abbreviation === disciplineAbbr.trim(),
          ) as Discipline | undefined

          if (discipline && en.trim() && kr.trim()) {
            terms.push({
              en: en.trim(),
              kr: kr.trim(),
              description: description.trim(),
              discipline,
            })
          }
        }
      }

      if (terms.length > 0) {
        await onAddTermsFromText(terms)

        toast({
          title: "✅ 파일 업로드 완료",
          description: `${terms.length}개 용어가 성공적으로 업로드되었습니다. 관리자의 승인 후 등록됩니다.`,
        })

        // Close popup only after successful upload
        onClose?.()
      } else {
        toast({
          title: "❌ 업로드 실패",
          description: "유효한 용어를 찾을 수 없습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("File processing error:", error)
      toast({
        title: "❌ 파일 오류",
        description: "파일을 처리할 수 없습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }

    // Reset file input
    if (event.target) {
      event.target.value = ""
    }
  }

  const downloadTemplate = () => {
    const templateContent = [
      "=== SAMOO 용어집 템플릿 ===",
      "",
      "Gen / Project Management / 프로젝트 관리 / 프로젝트 전반 관리",
      "Arch / Building Design / 건물 설계 / 건축물 설계",
      "Elec / Power System / 전력 시스템 / 전력 공급 시스템",
      "Piping / Pipeline / 배관 / 유체 운반 관로",
      "",
      "=== 형식: 공종약어 / 영어 / 한국어 / 설명 ===",
    ].join("\n")

    const blob = new Blob([templateContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "SAMOO_용어집_템플릿.txt"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-h-[75vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-samoo-blue">용어 추가</h3>
      </div>

      {/* Individual Term Form */}
      <form onSubmit={handleAddIndividualTerm} className="space-y-4">
        {/* English & Korean Input */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="en-term" className="text-sm font-medium text-samoo-gray mb-2 block">
              English
            </Label>
            <Input
              id="en-term"
              value={enTerm}
              onChange={(e) => setEnTerm(e.target.value)}
              className="h-9 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
              placeholder="영어 용어"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="kr-term" className="text-sm font-medium text-samoo-gray mb-2 block">
              한국어
            </Label>
            <Input
              id="kr-term"
              value={krTerm}
              onChange={(e) => setKrTerm(e.target.value)}
              className="h-9 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
              placeholder="한국어 용어"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-samoo-gray mb-2 block">
            설명 (선택사항)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="용어 설명을 입력하세요"
            className="h-9 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
            disabled={isSubmitting}
          />
        </div>

        {/* Discipline Selection - Smaller Grid */}
        <div>
          <Label className="text-sm font-medium text-samoo-gray mb-2 block">공종 선택</Label>
          <div className="grid grid-cols-2 gap-2">
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
                type="button"
                onClick={() => setSelectedDiscipline(selectedDiscipline === discipline ? null : discipline)}
                disabled={isSubmitting}
                className={cn(
                  "h-8 text-xs font-medium rounded-md transition-all duration-200 border",
                  selectedDiscipline === discipline
                    ? "bg-samoo-blue text-white border-samoo-blue shadow-sm"
                    : "bg-white text-samoo-gray border-samoo-gray-light hover:border-samoo-blue hover:bg-samoo-blue/5",
                )}
              >
                <span className="block truncate">{disciplineMap[discipline].koreanName}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 text-sm font-medium bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors rounded-lg"
        >
          {isSubmitting ? "추가 중..." : "추가"}
        </Button>
      </form>

      {/* File Upload Section */}
      <div className="border-t border-samoo-gray-light pt-5 mt-5">
        <Label className="text-sm font-medium text-samoo-gray mb-3 block">파일 업로드</Label>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={isSubmitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="w-full h-10 border-samoo-gray-medium text-samoo-gray hover:bg-samoo-gray-light/20 bg-white"
              asChild
            >
              <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" />
                {isSubmitting ? "업로드 중..." : "파일 선택"}
              </label>
            </Button>
          </div>
          <Button
            type="button"
            onClick={downloadTemplate}
            disabled={isSubmitting}
            variant="outline"
            className="h-10 px-3 border-samoo-gray-medium text-samoo-gray hover:bg-samoo-gray-light/20 bg-white"
          >
            <Download className="w-4 h-4 mr-1" />
            템플릿
          </Button>
        </div>

        {uploadedFileName && <div className="mt-2 text-sm text-samoo-blue">선택된 파일: {uploadedFileName}</div>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-800">
            💡 <strong>템플릿을 다운로드</strong>하여 형식에 맞게 작성한 후 업로드하세요.
          </p>
        </div>
      </div>
    </div>
  )
}
