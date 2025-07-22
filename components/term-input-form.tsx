"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { type Discipline, type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, CheckCircle, AlertCircle } from "lucide-react"

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
  const [uploadSuccess, setUploadSuccess] = useState<{
    success: boolean
    message: string
    addedCount: number
    duplicateCount: number
    details?: string[]
  } | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const disciplines = Object.keys(disciplineMap) as Discipline[]
  const { toast } = useToast()

  /* ───────────────────────── individual term ──────────────────── */
  const handleAddIndividualTerm = async (e: React.FormEvent) => {
    e.preventDefault()

    // If there's an uploaded file, process it instead
    if (uploadedFile) {
      await handleFileUpload()
      return
    }

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

        // Clear form immediately
        setEnTerm("")
        setKrTerm("")
        setDescription("")
        setSelectedDiscipline(null)

        // Show success state
        setUploadSuccess({
          success: true,
          message: "용어가 성공적으로 추가되었습니다.",
          addedCount: 1,
          duplicateCount: 0,
        })
      } catch (error) {
        console.error("Error adding term:", error)
        setUploadSuccess({
          success: false,
          message: "용어 추가 중 오류가 발생했습니다.",
          addedCount: 0,
          duplicateCount: 0,
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
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setUploadedFileName(file.name)
      // Reset previous results
      setUploadSuccess(null)
      // Reset file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return

    setIsProcessingFile(true)
    setUploadSuccess(null)

    try {
      const text = await uploadedFile.text()
      console.log("File content:", text) // Debug log

      // Split by lines and clean up
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
      console.log("Processed lines:", lines) // Debug log

      const terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] = []
      const errors: string[] = []
      let lineNumber = 0

      for (const line of lines) {
        lineNumber++

        // Skip comment lines or headers
        if (line.startsWith("#") || line.startsWith("//") || line.startsWith("===")) {
          continue
        }

        // Split by semicolon
        const parts = line.split(";").map((part) => part.trim())

        console.log(`Line ${lineNumber} parts:`, parts) // Debug log

        if (parts.length < 3) {
          errors.push(`라인 ${lineNumber}: 최소 3개 항목이 필요합니다 (공종;영어;한국어) - "${line}"`)
          continue
        }

        const [disciplineAbbr, en, kr, description = ""] = parts

        // Find discipline by abbreviation
        const discipline = Object.keys(disciplineMap).find(
          (key) => disciplineMap[key as Discipline].abbreviation.toLowerCase() === disciplineAbbr.trim().toLowerCase(),
        ) as Discipline | undefined

        if (!discipline) {
          errors.push(
            `라인 ${lineNumber}: 알 수 없는 공종 "${disciplineAbbr}" - 사용 가능한 공종: ${Object.values(disciplineMap)
              .map((d) => d.abbreviation)
              .join(", ")}`,
          )
          continue
        }

        if (!en.trim() || !kr.trim()) {
          errors.push(`라인 ${lineNumber}: 영어와 한국어는 필수입니다 - "${line}"`)
          continue
        }

        terms.push({
          en: en.trim(),
          kr: kr.trim(),
          description: description.trim(),
          discipline,
        })
      }

      console.log("Parsed terms:", terms) // Debug log
      console.log("Errors:", errors) // Debug log

      if (terms.length === 0) {
        setUploadSuccess({
          success: false,
          message: "유효한 용어를 찾을 수 없습니다.",
          addedCount: 0,
          duplicateCount: 0,
          details:
            errors.length > 0
              ? errors
              : [
                  "파일 형식을 확인해주세요.",
                  "각 줄은 '공종약어;영어;한국어;설명' 형식이어야 합니다.",
                  "예: Gen;Project Management;프로젝트 관리;프로젝트 전반 관리",
                ],
        })
        return
      }

      // Process terms
      let addedCount = 0
      let duplicateCount = 0
      const processErrors: string[] = []

      for (const term of terms) {
        const isDuplicate = existingGlossary.some(
          (existingTerm) =>
            existingTerm.en.toLowerCase() === term.en.toLowerCase() &&
            existingTerm.kr.toLowerCase() === term.kr.toLowerCase(),
        )

        if (isDuplicate) {
          duplicateCount++
          continue
        }

        try {
          await onAddTerm(term)
          addedCount++
        } catch (error) {
          console.error(`Failed to add term ${term.en}:`, error)
          processErrors.push(`"${term.en}" 추가 실패`)
        }
      }

      // Set upload success state
      setUploadSuccess({
        success: addedCount > 0,
        message: addedCount > 0 ? `${addedCount}개 용어가 성공적으로 업로드되었습니다.` : "업로드된 용어가 없습니다.",
        addedCount,
        duplicateCount,
        details: [
          ...errors,
          ...processErrors,
          ...(duplicateCount > 0 ? [`${duplicateCount}개 용어는 이미 존재하여 건너뛰었습니다.`] : []),
        ],
      })

      // Clear the uploaded file
      setUploadedFile(null)
      setUploadedFileName("")
    } catch (error) {
      console.error("File processing error:", error)
      setUploadSuccess({
        success: false,
        message: "파일을 처리할 수 없습니다.",
        addedCount: 0,
        duplicateCount: 0,
        details: [
          "파일 읽기 오류가 발생했습니다.",
          "텍스트 파일(.txt)인지 확인해주세요.",
          "파일 인코딩이 UTF-8인지 확인해주세요.",
        ],
      })
    } finally {
      setIsProcessingFile(false)
    }
  }

  const downloadTemplate = () => {
    const templateContent = [
      "# SAMOO 하이테크 1본부 - 한영 기술용어집 업로드 템플릿",
      "",
      "# 📋 사용법:",
      "# 1. 각 줄에 하나의 용어를 입력하세요",
      "# 2. 형식: 공종약어;영어용어;한국어용어;설명",
      "# 3. 설명은 생략 가능합니다",
      "# 4. #으로 시작하는 줄은 무시됩니다",
      "# 5. 세미콜론(;)으로 구분합니다",
      "",
      "# 🏷️ 공종 약어 목록:",
      "# Gen = 프로젝트 일반 용어",
      "# Arch = Architecture (건축)",
      "# Elec = Electrical (전기)",
      "# Piping = Piping (배관)",
      "# Civil = Civil (토목)",
      "# I&C = Instrument & Control (제어)",
      "# FP = Fire Protection (소방)",
      "# HVAC = HVAC (공조)",
      "# Struct = Structure (구조)",
      "# Cell = Cell (배터리)",
      "",
      "# ✅ 올바른 형식 예시:",
      "# Gen;Project Management;프로젝트 관리;프로젝트 전반적인 관리 업무",
      "# Arch;Floor Plan;평면도;건물의 각 층별 공간 배치를 나타낸 도면",
      "# Elec;Circuit Breaker;차단기;전기 회로의 과부하나 단락을 차단하는 보호 장치",
      "# Piping;Pipeline;배관;유체를 운반하는 관로 시스템",
      "# Civil;Foundation;기초;건물의 하중을 지반에 전달하는 구조물",
      "",
      "# ❌ 잘못된 형식:",
      "# Project Management/프로젝트 관리  ← 공종 없음, 슬래시 사용",
      "# Gen,Project Management,프로젝트 관리  ← 쉼표 사용",
      "# XYZ;Project Management;프로젝트 관리  ← 잘못된 공종 약어",
      "",
      "# 아래에 용어를 입력하세요:",
      "",
    ].join("\n")

    const blob = new Blob([templateContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "SAMOO_용어집_업로드_템플릿.txt"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  // Determine button state and styling
  const getButtonState = () => {
    if (isSubmitting || isProcessingFile) {
      return {
        text: uploadedFile ? "처리 중..." : "추가 중...",
        className: "bg-samoo-blue text-white animate-pulse",
        disabled: true,
      }
    }

    if (uploadedFile) {
      return {
        text: "파일 업로드",
        className: "bg-orange-600 text-white hover:bg-orange-700 animate-pulse",
        disabled: false,
      }
    }

    return {
      text: "추가",
      className: "bg-samoo-blue text-white hover:bg-samoo-blue-dark",
      disabled: false,
    }
  }

  const buttonState = getButtonState()

  return (
    <div className="p-4 max-h-[75vh] overflow-y-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-samoo-blue">용어 추가</h3>
      </div>

      {/* Upload Success/Error Message */}
      {uploadSuccess && (
        <div
          className={cn(
            "mb-4 p-3 rounded-lg border",
            uploadSuccess.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800",
          )}
        >
          <div className="flex items-start gap-2">
            {uploadSuccess.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{uploadSuccess.message}</p>
              {uploadSuccess.success && (
                <div className="text-xs mt-1 space-y-1">
                  <p>• 추가된 용어: {uploadSuccess.addedCount}개</p>
                  {uploadSuccess.duplicateCount > 0 && <p>• 중복으로 건너뛴 용어: {uploadSuccess.duplicateCount}개</p>}
                  <p className="text-green-700 font-medium">관리자 승인 후 용어집에 표시됩니다.</p>
                </div>
              )}
              {uploadSuccess.details && uploadSuccess.details.length > 0 && (
                <div className="mt-2 text-xs">
                  <p className="font-medium mb-1">상세 정보:</p>
                  <ul className="list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                    {uploadSuccess.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Term Form */}
      <form onSubmit={handleAddIndividualTerm} className="space-y-3">
        {/* English & Korean Input */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="en-term" className="text-xs font-medium text-samoo-gray mb-1 block">
              English
            </Label>
            <Input
              id="en-term"
              value={enTerm}
              onChange={(e) => setEnTerm(e.target.value)}
              className="h-8 text-sm border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
              placeholder="영어 용어"
              disabled={isSubmitting || isProcessingFile}
            />
          </div>
          <div>
            <Label htmlFor="kr-term" className="text-xs font-medium text-samoo-gray mb-1 block">
              한국어
            </Label>
            <Input
              id="kr-term"
              value={krTerm}
              onChange={(e) => setKrTerm(e.target.value)}
              className="h-8 text-sm border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
              placeholder="한국어 용어"
              disabled={isSubmitting || isProcessingFile}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-xs font-medium text-samoo-gray mb-1 block">
            설명 (선택사항)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="용어 설명을 입력하세요"
            className="h-8 text-sm border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
            disabled={isSubmitting || isProcessingFile}
          />
        </div>

        {/* Discipline Selection - Ultra Compact with 5 columns */}
        <div>
          <Label className="text-xs font-medium text-samoo-gray mb-1 block">공종 선택</Label>
          <div className="grid grid-cols-5 gap-1">
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
                type="button"
                onClick={() => setSelectedDiscipline(selectedDiscipline === discipline ? null : discipline)}
                disabled={isSubmitting || isProcessingFile}
                className={cn(
                  "h-6 px-1 py-0 text-xs font-medium rounded transition-all duration-200 border",
                  selectedDiscipline === discipline
                    ? "bg-samoo-blue text-white border-samoo-blue"
                    : "bg-white text-samoo-gray border-samoo-gray-light hover:border-samoo-blue hover:bg-samoo-blue/5",
                )}
              >
                <span className="truncate">{disciplineMap[discipline].koreanName}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Submit Button - Changes color when file is uploaded */}
        <Button
          type="submit"
          disabled={buttonState.disabled}
          className={cn("w-full h-9 text-sm font-medium transition-colors rounded-lg", buttonState.className)}
        >
          {(isSubmitting || isProcessingFile) && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {buttonState.text}
        </Button>
      </form>

      {/* File Upload Section */}
      <div className="border-t border-samoo-gray-light pt-3 mt-3">
        <Label className="text-xs font-medium text-samoo-gray mb-2 block">📁 파일 업로드 (대량 추가)</Label>

        {/* Processing indicator */}
        {isProcessingFile && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-blue-800 font-medium">파일을 처리하고 있습니다...</span>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
            </div>
          </div>
        )}

        <div className="flex gap-1">
          <div className="flex-1 relative">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              disabled={isProcessingFile || isSubmitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isProcessingFile || isSubmitting}
              className="w-full h-8 text-xs border-samoo-gray-medium text-samoo-gray hover:bg-samoo-gray-light/20 bg-white"
              asChild
            >
              <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center">
                <Upload className="w-3 h-3 mr-1" />
                파일 선택
              </label>
            </Button>
          </div>
          <Button
            type="button"
            onClick={downloadTemplate}
            disabled={isProcessingFile || isSubmitting}
            variant="outline"
            className="h-8 px-2 text-xs bg-samoo-blue text-white hover:bg-samoo-blue-dark border-samoo-blue font-medium"
          >
            <Download className="w-3 h-3 mr-1" />
            템플릿
          </Button>
        </div>

        {uploadedFileName && (
          <div className="mt-2 text-xs text-samoo-blue">
            선택된 파일: {uploadedFileName}
            <div className="text-orange-600 font-medium mt-1">⬆️ 위의 "파일 업로드" 버튼을 클릭하여 처리하세요</div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
          <p className="text-xs text-blue-800">
            💡 <strong>사용법:</strong> 템플릿 다운로드 → 파일 작성 → 파일 선택 → 파일 업로드
          </p>
        </div>
      </div>
    </div>
  )
}
