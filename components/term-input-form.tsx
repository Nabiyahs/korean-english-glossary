"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { type Discipline, type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import { FileText, Upload, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Add this import

interface TermInputFormProps {
  onAddTerm: (term: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">) => Promise<void>
  onAddTermsFromText: (
    terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[],
  ) => Promise<void>
  onClose?: () => void
  existingGlossary: GlossaryTerm[] // Add this line
}

export function TermInputForm({ onAddTerm, onAddTermsFromText, onClose, existingGlossary }: TermInputFormProps) {
  /* ─────────────────────────── state ─────────────────────────── */
  const [inputMode, setInputMode] = useState<"individual" | "textfile">("individual")
  const [enTerm, setEnTerm] = useState("")
  const [krTerm, setKrTerm] = useState("")
  const [description, setDescription] = useState("") // No default value here
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const disciplines = Object.keys(disciplineMap) as Discipline[]
  const { toast } = useToast() // Add this line

  /* ─────────────────────── helper functions ───────────────────── */
  const safeString = (v: unknown) => String(v ?? "").trim()

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

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
          variant: "default", // Use default variant for a kind message
        })
        return // Stop execution if duplicate
      }

      await onAddTerm({
        en: enTerm,
        kr: krTerm,
        description: description.trim(), // Use trimmed description, can be empty
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

  /* ───────────────────────── Text file upload ─────────────────────── */
  const handleTextUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = async () => {
      const textContent = reader.result as string
      if (!textContent || textContent.trim() === "") {
        alert("선택한 파일이 비어 있거나 읽을 수 없습니다.")
        resetFileInput()
        return
      }

      try {
        const lines = textContent
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line !== "")

        const expectedHeader = "공종/EN/KR/설명"
        let dataLines: string[]
        const headerIndex = lines.indexOf(expectedHeader)

        if (headerIndex !== -1) {
          dataLines = lines.slice(headerIndex + 1) // Start from the line after the header
        } else {
          // If header not found, assume all lines are data, but warn the user
          console.warn(
            "Header '공종/EN/KR/설명' not found in the uploaded file. Attempting to parse all lines as data.",
          )
          dataLines = lines
        }

        const termsToProcess: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] =
          dataLines
            .map((line) => {
              const parts = line.split("/").map((p) => p.trim()) // Split by forward slash and trim parts
              if (parts.length < 3) {
                // Minimum: abbreviation, EN, KR
                console.warn(`Skipping malformed line (less than 3 parts): ${line}`)
                return null
              }

              const abbr = parts[0]
              const en = parts[1]
              const kr = parts[2]
              const description = parts[3] || "" // Description remains blank if no input

              if (!en || !kr) {
                // Ensure EN and KR are not empty
                console.warn(`Skipping line with empty EN or KR: ${line}`)
                return null
              }

              const discipline =
                (Object.keys(disciplineMap) as Discipline[]).find((d) => disciplineMap[d].abbreviation === abbr) ??
                "프로젝트 일반 용어" // Default to General if abbreviation is not found

              return {
                en,
                kr,
                description,
                discipline,
              }
            })
            .filter(Boolean) as Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] // Filter out any nulls from malformed lines

        if (termsToProcess.length === 0) {
          alert("가져올 유효한 용어가 없습니다. 템플릿을 확인해 주세요.")
          resetFileInput()
          return
        }

        await onAddTermsFromText(termsToProcess)
        onClose?.()
      } catch (err) {
        console.error("텍스트 파일 파싱 오류:", err)
        alert(
          "텍스트 파일을 해석할 수 없습니다. 다음을 확인해 주세요:\n" +
            "1) 각 용어가 새 줄에 있는지 확인\n" +
            "2) 공종/EN/KR/설명 형식으로 슬래시(/)로 구분되어 있는지 확인\n" +
            "3) 공종 약어가 정확한지 확인 (예: Gen, Arch, Elec 등)",
        )
      } finally {
        resetFileInput()
      }
    }

    reader.onerror = () => {
      alert("파일을 읽는 중 오류가 발생했습니다.")
      resetFileInput()
    }

    reader.readAsText(file) // Read as text for Notepad files
  }

  /* ───────────────────────── template DL ──────────────────────── */
  const handleDownloadTemplate = () => {
    const templateContent = `# 이 파일은 용어집 업로드 템플릿입니다.
# 각 용어는 새 줄에 입력하고, '공종/EN/KR/설명' 형식으로 슬래시(/)로 구분해야 합니다.
# '설명' 필드는 선택 사항이며, 비워둘 수 있습니다.
# '공종'은 다음 약어 중 하나를 사용해야 합니다: Gen, Arch, Elec, Piping, Civil, I&C, FP, HVAC, Struct, Cell

공종/EN/KR/설명
Gen/Example Term/예시 용어/이것은 일반 용어의 예시입니다.
Arch/Building Plan/건축 계획/건물의 설계 및 배치 계획.
Elec/Circuit Breaker/회로 차단기/전기 회로를 보호하는 장치.
Piping/Valve/밸브/유체의 흐름을 제어하는 장치.
Civil/Excavation/굴착/땅을 파는 작업.
I&C/Sensor/센서/물리량을 감지하여 신호로 변환하는 장치.
FP/Sprinkler/스프링클러/화재 시 물을 분사하는 소화 장치.
HVAC/Air Duct/공기 덕트/공기를 운반하는 통로.
Struct/Beam/보/수평 하중을 지지하는 구조 부재.
Cell/Anode/음극/배터리에서 전자가 방출되는 전극.
`
    const blob = new Blob([templateContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "용어집_업로드_템플릿.txt"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  /* ─────────────────────────── JSX ─────────────────────────── */
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-samoo-blue mb-4">용어 추가</h3>
      <div className="flex mb-4 rounded-md overflow-hidden border border-samoo-blue">
        <Button
          onClick={() => setInputMode("individual")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            inputMode === "individual" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
          )}
        >
          직접 입력
        </Button>
        <Button
          onClick={() => setInputMode("textfile")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            inputMode === "textfile" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
          )}
        >
          텍스트 파일 업로드
        </Button>
      </div>
      {inputMode === "individual" ? (
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="en-term" className="text-sm font-medium text-samoo-gray">
              English
            </Label>
            <Input
              id="en-term"
              value={enTerm}
              onChange={(e) => setEnTerm(e.target.value)}
              className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue h-9"
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
              className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue h-9"
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
              placeholder="설명을 입력하세요." // Removed specific placeholder
              className="mt-1 border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue h-9"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-samoo-gray mb-2 block">공종</Label> {/* Changed label */}
            <div className="flex flex-wrap gap-2">
              {disciplines.map((discipline) => (
                <Button
                  key={discipline}
                  onClick={() => setSelectedDiscipline(discipline)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full transition-colors h-auto",
                    selectedDiscipline === discipline
                      ? "text-white"
                      : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20",
                  )}
                  style={{
                    backgroundColor:
                      selectedDiscipline === discipline
                        ? disciplineMap[discipline].color.replace("bg-", "#")
                        : undefined,
                    color: selectedDiscipline === discipline ? "white" : undefined,
                  }}
                >
                  {disciplineMap[discipline].koreanName}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddIndividualTerm}
              className="px-5 py-2 bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors h-9"
            >
              용어 추가
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-samoo-gray-light rounded-lg bg-samoo-gray-light/30 h-[200px]">
          <Upload className="w-10 h-10 text-samoo-blue mb-3" />
          <p className="text-samoo-gray-medium mb-3 text-center text-sm">
            텍스트 파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요.
          </p>
          <Input type="file" accept=".txt" onChange={handleTextUpload} className="hidden" ref={fileInputRef} />
          <div className="flex gap-2 mt-3">
            {/* Swapped button positions */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors h-9"
            >
              <FileText className="w-4 h-4 mr-2" />
              파일 선택
            </Button>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="px-5 py-2 border-samoo-blue text-samoo-blue hover:bg-samoo-blue/10 transition-colors h-9 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              템플릿 다운로드
            </Button>
          </div>
          <p className="text-xs text-samoo-gray-medium mt-3">(지원 형식: 공종/EN/KR/설명 형식의 텍스트 파일)</p>
        </div>
      )}
    </div>
  )
}
