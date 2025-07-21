"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { type Discipline, type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, CheckCircle, AlertTriangle } from "lucide-react"

interface TermInputFormProps {
  onAddTerm: (term: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">) => Promise<void>
  onAddTermsFromText: (
    terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[],
  ) => Promise<void>
  onClose?: () => void
  existingGlossary: GlossaryTerm[]
}

interface FileProcessingResult {
  success: boolean
  message: string
  addedCount: number
  duplicateCount: number
  skippedCount: number
  skippedReasons: string[]
  totalProcessed: number
}

export function TermInputForm({ onAddTerm, onAddTermsFromText, onClose, existingGlossary }: TermInputFormProps) {
  const [enTerm, setEnTerm] = useState("")
  const [krTerm, setKrTerm] = useState("")
  const [description, setDescription] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileUploadResult, setFileUploadResult] = useState<FileProcessingResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const disciplines = Object.keys(disciplineMap) as Discipline[]
  const { toast } = useToast()

  // Length limits for validation
  const MAX_EN_LENGTH = 500
  const MAX_KR_LENGTH = 500
  const MAX_DESCRIPTION_LENGTH = 1000

  /* ───────────────────────── individual term ──────────────────── */
  const handleAddIndividualTerm = async (e: React.FormEvent) => {
    e.preventDefault()

    // If there's an uploaded file, process it instead
    if (uploadedFile) {
      await handleFileUpload()
      return
    }

    if (enTerm && krTerm && selectedDiscipline) {
      // Check length limits
      if (enTerm.length > MAX_EN_LENGTH) {
        toast({
          title: "입력 오류",
          description: `영어 용어가 너무 깁니다. (최대 ${MAX_EN_LENGTH}자)`,
          variant: "destructive",
        })
        return
      }

      if (krTerm.length > MAX_KR_LENGTH) {
        toast({
          title: "입력 오류",
          description: `한국어 용어가 너무 깁니다. (최대 ${MAX_KR_LENGTH}자)`,
          variant: "destructive",
        })
        return
      }

      if (description.length > MAX_DESCRIPTION_LENGTH) {
        toast({
          title: "입력 오류",
          description: `설명이 너무 깁니다. (최대 ${MAX_DESCRIPTION_LENGTH}자)`,
          variant: "destructive",
        })
        return
      }

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

        // Show success toast only (no form message for individual terms)
        toast({
          title: "용어 업로드 완료",
          description: "용어가 성공적으로 업로드되었습니다. 관리자 승인 후 용어집에 추가됩니다.",
        })
      } catch (error) {
        console.error("Error adding term:", error)
        toast({
          title: "업로드 오류",
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
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setUploadedFileName(file.name)
      // Clear any previous file upload result
      setFileUploadResult(null)
      // Reset file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const validateTerm = (en: string, kr: string, description: string, lineNumber: number) => {
    const issues: string[] = []

    if (en.length > MAX_EN_LENGTH) {
      issues.push(`라인 ${lineNumber}: 영어 용어 길이 초과 (${en.length}/${MAX_EN_LENGTH}자)`)
    }

    if (kr.length > MAX_KR_LENGTH) {
      issues.push(`라인 ${lineNumber}: 한국어 용어 길이 초과 (${kr.length}/${MAX_KR_LENGTH}자)`)
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      issues.push(`라인 ${lineNumber}: 설명 길이 초과 (${description.length}/${MAX_DESCRIPTION_LENGTH}자)`)
    }

    return issues
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return

    setIsProcessingFile(true)
    setFileUploadResult(null) // Clear previous messages

    try {
      const text = await uploadedFile.text()
      const lines = text.split("\n").filter((line) => line.trim() !== "" && !line.includes("==="))

      const terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[] = []
      const skippedReasons: string[] = []
      let totalProcessed = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1
        totalProcessed++

        console.log(`Processing line ${lineNumber}: ${line}`) // Debug log

        const parts = line.split(";").map((part) => part.trim())

        if (parts.length < 3) {
          skippedReasons.push(`라인 ${lineNumber}: 형식 오류 (최소 3개 부분 필요: 공종;영어;한국어)`)
          continue
        }

        const [disciplineAbbr, en, kr, description = ""] = parts

        // Check if discipline exists
        const discipline = Object.keys(disciplineMap).find(
          (key) => disciplineMap[key as Discipline].abbreviation === disciplineAbbr.trim(),
        ) as Discipline | undefined

        if (!discipline) {
          skippedReasons.push(`라인 ${lineNumber}: 알 수 없는 공종 약어 "${disciplineAbbr}"`)
          continue
        }

        if (!en.trim()) {
          skippedReasons.push(`라인 ${lineNumber}: 영어 용어가 비어있음`)
          continue
        }

        if (!kr.trim()) {
          skippedReasons.push(`라인 ${lineNumber}: 한국어 용어가 비어있음`)
          continue
        }

        // Validate term lengths
        const validationIssues = validateTerm(en.trim(), kr.trim(), description.trim(), lineNumber)
        if (validationIssues.length > 0) {
          skippedReasons.push(...validationIssues)
          continue
        }

        // Check for duplicates in existing glossary
        const isDuplicate = existingGlossary.some(
          (existingTerm) =>
            existingTerm.en.toLowerCase() === en.trim().toLowerCase() &&
            existingTerm.kr.toLowerCase() === kr.trim().toLowerCase(),
        )

        if (isDuplicate) {
          skippedReasons.push(`라인 ${lineNumber}: 중복 용어 "${en.trim()}" ; "${kr.trim()}"`)
          continue
        }

        // If we get here, the term is valid
        terms.push({
          en: en.trim(),
          kr: kr.trim(),
          description: description.trim(),
          discipline,
        })

        console.log(`Added term: ${en.trim()} ; ${kr.trim()}`) // Debug log
      }

      console.log(`Total valid terms to upload: ${terms.length}`) // Debug log

      if (terms.length > 0) {
        let addedCount = 0

        for (const term of terms) {
          try {
            await onAddTerm(term)
            addedCount++
          } catch (error) {
            console.error(`Failed to add term ${term.en}:`, error)
            skippedReasons.push(`업로드 실패: "${term.en}" ; "${term.kr}" - ${error}`)
          }
        }

        // Set file upload result state (shown at top of popup)
        setFileUploadResult({
          success: true,
          message: `파일 처리 완료: ${addedCount}개 용어가 성공적으로 업로드되었습니다.`,
          addedCount,
          duplicateCount: 0, // We count duplicates in skipped reasons now
          skippedCount: totalProcessed - terms.length,
          skippedReasons,
          totalProcessed,
        })

        // Clear the uploaded file
        setUploadedFile(null)
        setUploadedFileName("")
      } else {
        setFileUploadResult({
          success: false,
          message: "유효한 용어를 찾을 수 없습니다.",
          addedCount: 0,
          duplicateCount: 0,
          skippedCount: totalProcessed,
          skippedReasons,
          totalProcessed,
        })
      }
    } catch (error) {
      console.error("File processing error:", error)
      setFileUploadResult({
        success: false,
        message: "파일을 처리할 수 없습니다.",
        addedCount: 0,
        duplicateCount: 0,
        skippedCount: 0,
        skippedReasons: [`파일 처리 오류: ${error}`],
        totalProcessed: 0,
      })
    } finally {
      setIsProcessingFile(false)
    }
  }

  const downloadTemplate = () => {
    const templateContent = [
      "=== SAMOO 용어집 템플릿 ===",
      "",
      "Gen;Project Management;프로젝트 관리;프로젝트 전반 관리",
      "Arch;Building Design;건물 설계;건축물 설계",
      "Elec;Power System;전력 시스템;전력 공급 시스템",
      "Piping;Pipeline;배관;유체 운반 관로",
      "Civil;Foundation;기초;건물 하중 지지 구조물",
      "I&C;Sensor;센서;물리량 감지 장치",
      "FP;Fire Alarm;화재 경보;화재 감지 및 경보 시스템",
      "HVAC;Ventilation;환기;실내외 공기 교환",
      "Struct;Beam;보;수평 하중 지지 구조 부재",
      "Cell;Battery Cell;배터리 셀;전기 에너지 저장 단위",
      "",
      "=== 형식: 공종약어;영어;한국어;설명 ===",
      "=== 길이 제한: 영어/한국어 최대 500자, 설명 최대 1000자 ===",
      "=== 구분자: 세미콜론(;) 사용 ===",
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
        text: "추가",
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

      {/* File Upload Result Message - Only shown at top for template uploads */}
      {fileUploadResult && (
        <div
          className={cn(
            "mb-4 p-3 rounded-lg border",
            fileUploadResult.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800",
          )}
        >
          <div className="flex items-center gap-2">
            {fileUploadResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{fileUploadResult.message}</p>
              <div className="text-xs mt-2 space-y-1">
                <p>• 처리된 라인: {fileUploadResult.totalProcessed}개</p>
                <p>• 추가된 용어: {fileUploadResult.addedCount}개</p>
                {fileUploadResult.skippedCount > 0 && <p>• 건너뛴 용어: {fileUploadResult.skippedCount}개</p>}
                {fileUploadResult.success && fileUploadResult.addedCount > 0 && (
                  <p className="text-green-700 font-medium">✅ 관리자 승인 후 용어집에 표시됩니다.</p>
                )}
              </div>

              {/* Show detailed skip reasons */}
              {fileUploadResult.skippedReasons.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs font-medium cursor-pointer hover:underline">
                    건너뛴 이유 보기 ({fileUploadResult.skippedReasons.length}개)
                  </summary>
                  <div className="mt-1 max-h-32 overflow-y-auto bg-white/50 rounded p-2">
                    {fileUploadResult.skippedReasons.map((reason, index) => (
                      <p key={index} className="text-xs text-gray-700 mb-1">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </details>
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
              English ({enTerm.length}/{MAX_EN_LENGTH})
            </Label>
            <Input
              id="en-term"
              value={enTerm}
              onChange={(e) => setEnTerm(e.target.value)}
              className={cn(
                "h-8 text-sm border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue",
                enTerm.length > MAX_EN_LENGTH && "border-red-500 focus:border-red-500",
              )}
              placeholder="영어 용어"
              disabled={isSubmitting || isProcessingFile}
              maxLength={MAX_EN_LENGTH + 50} // Allow some overflow for warning
            />
          </div>
          <div>
            <Label htmlFor="kr-term" className="text-xs font-medium text-samoo-gray mb-1 block">
              한국어 ({krTerm.length}/{MAX_KR_LENGTH})
            </Label>
            <Input
              id="kr-term"
              value={krTerm}
              onChange={(e) => setKrTerm(e.target.value)}
              className={cn(
                "h-8 text-sm border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue",
                krTerm.length > MAX_KR_LENGTH && "border-red-500 focus:border-red-500",
              )}
              placeholder="한국어 용어"
              disabled={isSubmitting || isProcessingFile}
              maxLength={MAX_KR_LENGTH + 50} // Allow some overflow for warning
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-xs font-medium text-samoo-gray mb-1 block">
            설명 (선택사항) ({description.length}/{MAX_DESCRIPTION_LENGTH})
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="용어 설명을 입력하세요"
            className={cn(
              "h-8 text-sm border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue",
              description.length > MAX_DESCRIPTION_LENGTH && "border-red-500 focus:border-red-500",
            )}
            disabled={isSubmitting || isProcessingFile}
            maxLength={MAX_DESCRIPTION_LENGTH + 50} // Allow some overflow for warning
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
        <Label className="text-xs font-medium text-samoo-gray mb-2 block">파일 업로드</Label>

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
            <div className="text-green-600 font-medium mt-1">⬆️ 위의 "추가" 버튼을 클릭하여 파일을 업로드하세요</div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
          <p className="text-xs text-blue-800">
            💡 <strong>템플릿을 다운로드</strong>하여 형식에 맞게 작성한 후 업로드하세요.
          </p>
          <p className="text-xs text-blue-700 mt-1">
            📏 <strong>길이 제한:</strong> 영어/한국어 최대 500자, 설명 최대 1000자
          </p>
          <p className="text-xs text-blue-700 mt-1">
            🔗 <strong>구분자:</strong> 세미콜론(;)을 사용하여 구분
          </p>
        </div>
      </div>
    </div>
  )
}
