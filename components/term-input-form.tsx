"use client"
import { useState } from "react"
import type React from "react"

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

export function TermInputForm({ onAddTerm, onAddTermsFromText, onClose, existingGlossary }: TermInputFormProps) {
  /* ─────────────────────────── state ─────────────────────────── */
  const [enTerm, setEnTerm] = useState("")
  const [krTerm, setKrTerm] = useState("")
  const [description, setDescription] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [fileProcessingStatus, setFileProcessingStatus] = useState<string>("")

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
          title: "알림",
          description: "입력하신 용어는 이미 용어집에 있습니다.",
          variant: "default",
        })
        return
      }

      try {
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
      } catch (error) {
        console.error("Error adding term:", error)
        toast({
          title: "오류",
          description: "용어 추가 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "입력 오류",
        description: "영어, 한국어, 공종을 모두 입력해주세요.",
        variant: "destructive",
      })
    }
  }

  /* ───────────────────────── file upload ──────────────────── */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("File upload started:", file.name)
    setIsProcessingFile(true)
    setFileProcessingStatus("파일을 읽는 중...")

    try {
      const text = await file.text()
      console.log("File content read, length:", text.length)
      setFileProcessingStatus("용어를 분석하는 중...")

      const lines = text.split("\n").filter((line) => line.trim() !== "" && !line.includes("==="))
      console.log("Filtered lines:", lines.length)

      const terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] = []
      let processedLines = 0

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
            processedLines++
          }
        }
      }

      console.log("Terms processed:", terms.length)
      setFileProcessingStatus(`${terms.length}개 용어를 업로드하는 중...`)

      if (terms.length > 0) {
        await onAddTermsFromText(terms)
        console.log("Terms uploaded successfully")

        setFileProcessingStatus("업로드 완료!")
        toast({
          title: "✅ 업로드 성공",
          description: `${terms.length}개 용어가 성공적으로 업로드되었습니다. 관리자 승인 후 표시됩니다.`,
        })

        // Close modal after showing success
        setTimeout(() => {
          setIsProcessingFile(false)
          setFileProcessingStatus("")
          onClose?.()
        }, 2000)
      } else {
        console.log("No valid terms found")
        setFileProcessingStatus("")
        toast({
          title: "❌ 업로드 실패",
          description: "유효한 용어를 찾을 수 없습니다. 파일 형식을 확인해주세요.",
          variant: "destructive",
        })
        setIsProcessingFile(false)
      }
    } catch (error) {
      console.error("File processing error:", error)
      setFileProcessingStatus("")
      toast({
        title: "❌ 파일 오류",
        description: "파일을 처리할 수 없습니다. 파일 형식을 확인해주세요.",
        variant: "destructive",
      })
      setIsProcessingFile(false)
    }

    // Reset file input
    if (event.target) {
      event.target.value = ""
    }
  }

  const downloadTemplate = () => {
    const templateContent = [
      "=== SAMOO 용어집 템플릿 (이 헤더는 삭제하지 마세요) ===",
      "",
      "Gen / Project Management / 프로젝트 관리 / 프로젝트 전반 관리",
      "Arch / Building Design / 건물 설계 / 건축물 설계",
      "Elec / Power System / 전력 시스템 / 전력 공급 시스템",
      "Piping / Pipeline / 배관 / 유체 운반 관로",
      "",
      "=== 아래에 용어를 추가하세요 ===",
      "=== 형식: 공종약어 / 영어 / 한국어 / 설명(선택) ===",
      "",
      "// 여기에 새로운 용어를 추가하세요",
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

  /* ─────────────────────────── JSX ─────────────────────────── */
  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-bold text-samoo-blue mb-3">용어 추가</h3>

      {/* Individual Term Form - More Compact */}
      <form onSubmit={handleAddIndividualTerm} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="en-term" className="text-xs font-medium text-samoo-gray">
              English *
            </Label>
            <Input
              id="en-term"
              value={enTerm}
              onChange={(e) => setEnTerm(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="영어 용어"
            />
          </div>
          <div>
            <Label htmlFor="kr-term" className="text-xs font-medium text-samoo-gray">
              한국어 *
            </Label>
            <Input
              id="kr-term"
              value={krTerm}
              onChange={(e) => setKrTerm(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="한국어 용어"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-xs font-medium text-samoo-gray">
            설명 (선택)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명을 입력하세요"
            className="mt-1 h-8 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-samoo-gray mb-2 block">공종 *</Label>
          <div className="grid grid-cols-5 gap-1">
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
                type="button"
                onClick={() => setSelectedDiscipline(discipline)}
                className={cn(
                  "px-1 py-1 text-xs font-medium rounded transition-colors h-8 text-center",
                  selectedDiscipline === discipline
                    ? "bg-samoo-blue text-white hover:bg-samoo-blue-dark"
                    : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20 border border-samoo-gray-medium",
                )}
              >
                <div className="text-xs">{disciplineMap[discipline].abbreviation}</div>
              </Button>
            ))}
          </div>
          <p className="text-xs text-samoo-gray-medium mt-1">
            Gen=일반, Arch=건축, Elec=전기, Piping=배관, Civil=토목, I&C=제어, FP=소방, HVAC=공조, Struct=구조,
            Cell=배터리
          </p>
        </div>

        <Button type="submit" className="w-full h-8 text-sm bg-samoo-blue text-white hover:bg-samoo-blue-dark">
          용어 추가
        </Button>
      </form>

      {/* File Upload Section - Compact */}
      <div className="border-t border-samoo-gray-light pt-3 mt-4">
        <Label className="text-xs font-medium text-samoo-gray mb-2 block">파일 업로드</Label>

        {/* Guide Message */}
        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
          <p className="text-xs text-amber-800 font-medium">📋 파일 업로드 가이드:</p>
          <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
            <li>• 템플릿을 다운로드하여 사용하세요</li>
            <li>
              • <strong>헤더 부분(=== 줄)은 절대 삭제하지 마세요</strong>
            </li>
            <li>• 헤더 아래에 새로운 용어를 추가하세요</li>
            <li>• 형식: 공종약어 / 영어 / 한국어 / 설명</li>
          </ul>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            onClick={downloadTemplate}
            size="sm"
            className="text-xs bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20"
          >
            템플릿 다운로드
          </Button>
          <div className="flex-1">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={isProcessingFile}
              className="block w-full text-xs text-samoo-gray file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-samoo-blue file:text-white hover:file:bg-samoo-blue-dark file:cursor-pointer cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>

        {isProcessingFile && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-xs text-blue-800 font-medium">{fileProcessingStatus}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
