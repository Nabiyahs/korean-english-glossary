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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const disciplines = Object.keys(disciplineMap) as Discipline[]
  const { toast } = useToast()

  /* ───────────────────────── individual term ──────────────────── */
  const handleAddIndividualTerm = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent form submission

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
      // Modal will be closed by parent component after successful addition
    } else {
      alert("모든 필수 필드를 채워주세요 (English, 한국어, 공종).")
    }
  }

  /* ───────────────────────── file upload ──────────────────── */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsProcessingFile(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim() !== "" && !line.includes("==="))

      const terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] = []

      for (const line of lines) {
        // Split by "/" and trim whitespace from each part
        const parts = line.split("/").map((part) => part.trim())
        if (parts.length >= 3) {
          const [disciplineAbbr, en, kr, description = ""] = parts

          // Map abbreviation to full discipline name
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
          title: "업로드 완료",
          description: "업로드가 성공적으로 완료되었습니다.",
        })
        // Close modal after successful upload
        setTimeout(() => {
          onClose?.()
        }, 1000) // Small delay to show the success message
      } else {
        toast({
          title: "업로드 실패",
          description: "유효한 용어를 찾을 수 없습니다. 파일 형식을 확인해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("File processing error:", error)
      toast({
        title: "파일 처리 오류",
        description: "파일을 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingFile(false)
      setUploadedFile(null)
      // Reset file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const downloadTemplate = () => {
    const templateContent = [
      "=== SAMOO 하이테크 1본부 - 한영 기술용어집 템플릿 ===",
      "=== 이 헤더 부분은 그대로 두세요 (자동으로 무시됩니다) ===",
      "",
      "Gen / Project Management / 프로젝트 관리 / 프로젝트 전반적인 관리 업무",
      "Arch / Building Design / 건물 설계 / 건축물의 전반적인 설계",
      "Elec / Power Distribution / 전력 분배 / 전력을 각 구역으로 분배하는 시스템",
      "Piping / Pipeline / 배관 / 유체를 운반하는 관로 시스템",
      "Civil / Foundation / 기초 / 건물의 하중을 지반에 전달하는 구조물",
      "I&C / Sensor / 센서 / 물리적 변화를 감지하는 장치",
      "FP / Fire Alarm / 화재 경보 / 화재를 감지하고 알리는 시스템",
      "HVAC / Air Conditioning / 냉방 / 실내 온도를 낮추는 시스템",
      "Struct / Beam / 보 / 수평 하중을 지지하는 구조 요소",
      "Cell / Battery Cell / 배터리 셀 / 전기 에너지를 저장하는 기본 단위",
      "",
      "=== 사용 방법 (이 부분도 그대로 두세요) ===",
      "",
      "✅ 올바른 형식:",
      "공종약어 / 영어용어 / 한국어용어 / 설명",
      "",
      "✅ 공종 약어 목록 (정확히 입력하세요):",
      "Gen = 프로젝트 일반 용어",
      "Arch = Architecture (건축)",
      "Elec = Electrical (전기)",
      "Piping = Piping (배관)",
      "Civil = Civil (토목)",
      "I&C = Instrument & Control (제어)",
      "FP = Fire Protection (소방)",
      "HVAC = HVAC (공조)",
      "Struct = Structure (구조)",
      "Cell = Cell (배터리)",
      "",
      "✅ 입력 규칙:",
      "1. 슬래시(/) 앞뒤 공백은 자동으로 제거됩니다",
      "2. 영어와 한국어는 필수, 설명은 선택사항입니다",
      "3. 설명을 생략하려면: Gen / Term / 용어",
      "4. === 로 시작하는 줄은 자동으로 무시됩니다",
      "",
      "✅ 예시 (모두 동일하게 처리됩니다):",
      "Gen/Project/프로젝트/설명",
      "Gen / Project / 프로젝트 / 설명",
      "Gen / Project / 프로젝트",
      "",
      "❌ 잘못된 형식:",
      "Project / 프로젝트 (공종 약어 누락)",
      "Gen Project 프로젝트 (슬래시 누락)",
      "GENERAL / Project / 프로젝트 (잘못된 공종 약어)",
      "",
      "💡 팁:",
      "- 이 템플릿의 예시 용어들을 참고하여 작성하세요",
      "- 헤더와 설명 부분은 그대로 두고 용어만 추가/수정하세요",
      "- 파일을 저장할 때 .txt 형식으로 저장하세요",
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
    <div className="p-4 sm:p-6">
      <h3 className="text-xl font-bold text-samoo-blue mb-4">용어 추가</h3>

      {/* Individual Term Form */}
      <form onSubmit={handleAddIndividualTerm} className="grid grid-cols-1 gap-4">
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

        {/* File Upload Section - Outside of form */}
        <div className="border-t border-samoo-gray-light pt-4 mt-4">
          <Label className="text-sm font-medium text-samoo-gray mb-3 block">텍스트 파일 업로드</Label>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={downloadTemplate}
                className="px-4 py-2 text-sm bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20 border border-samoo-gray-medium"
              >
                템플릿 다운로드
              </Button>
              <div className="flex-1">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="block w-full text-sm text-samoo-gray file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-samoo-blue file:text-white hover:file:bg-samoo-blue-dark file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>
            {isProcessingFile && <p className="text-sm text-samoo-blue">파일을 처리하는 중...</p>}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">📝 파일 업로드 가이드:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 템플릿을 다운로드하여 참고하세요</li>
                <li>• 헤더 부분(=== 로 시작하는 줄)은 그대로 두세요</li>
                <li>• 형식: 공종약어 / 영어 / 한국어 / 설명</li>
                <li>• 슬래시 앞뒤 공백은 자동으로 제거됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-samoo-gray-light">
          <Button
            type="submit"
            className="px-6 py-2 bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors h-10 w-full sm:w-auto"
          >
            용어 추가
          </Button>
        </div>
      </form>
    </div>
  )
}
