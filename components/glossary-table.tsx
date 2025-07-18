"use client"

import { useRef, useEffect } from "react"
import { type GlossaryTerm, type Discipline, disciplineMap } from "@/lib/data"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"
import { downloadWorkbook } from "@/lib/xlsx-download"

interface GlossaryTableProps {
  glossary: GlossaryTerm[]
  currentView: "discipline" | "all"
  isVocabularyMode: boolean
  selectedTerms: Set<string>
  onToggleTermSelection: (id: string, checked: boolean) => void
  highlightedTermId: string | null
  onDeleteTerm: (id: string) => Promise<void>
  isAdmin: boolean
}

export function GlossaryTable({
  glossary,
  currentView,
  isVocabularyMode,
  selectedTerms,
  onToggleTermSelection,
  highlightedTermId,
  onDeleteTerm,
  isAdmin,
}: GlossaryTableProps) {
  const disciplineRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  const handleDownloadDiscipline = (discipline: Discipline) => {
    const termsToDownload = glossary.filter((term) => term.discipline === discipline)
    const data = termsToDownload.map((term) => ({
      공종: disciplineMap[term.discipline].abbreviation,
      EN: term.en,
      KR: term.kr,
      설명: term.description,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${disciplineMap[discipline].koreanName} 용어`)
    downloadWorkbook(wb, `${disciplineMap[discipline].koreanName}_용어집.xlsx`)
  }

  const handleSelectAll = (discipline: Discipline, checked: boolean) => {
    const termsInDiscipline = glossary.filter((term) => term.discipline === discipline)
    termsInDiscipline.forEach((term) => onToggleTermSelection(term.id, checked))
  }

  const isAllSelectedInDiscipline = (discipline: Discipline) => {
    const termsInDiscipline = glossary.filter((term) => term.discipline === discipline)
    return termsInDiscipline.length > 0 && termsInDiscipline.every((term) => selectedTerms.has(term.id))
  }

  useEffect(() => {
    if (highlightedTermId) {
      const element = document.getElementById(`term-${highlightedTermId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("highlight-animation")
        const timer = setTimeout(() => {
          element.classList.remove("highlight-animation")
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [highlightedTermId])

  const renderTable = (terms: GlossaryTerm[], discipline?: Discipline) => (
    <div className="overflow-x-auto rounded-lg border border-samoo-gray-light shadow-sm bg-white">
      <table className="w-full text-left border-collapse">
        {/* HEADER ROW */}
        <thead>
          <tr className="bg-samoo-gray-light/50">
            {isVocabularyMode && (
              <th className="p-2 sm:p-3 w-[40px] sm:w-[5%] text-center">
                {discipline && (
                  <Checkbox
                    checked={isAllSelectedInDiscipline(discipline)}
                    onCheckedChange={(checked) => handleSelectAll(discipline, !!checked)}
                    className="border-samoo-blue data-[state=checked]:bg-samoo-blue data-[state=checked]:text-white"
                  />
                )}
              </th>
            )}
            {currentView === "all" && (
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray w-[60px] sm:w-[15%]">구분</th>
            )}
            <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray">EN</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray">KR</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray hidden sm:table-cell">설명</th>
            {isVocabularyMode && isAdmin && <th className="p-2 sm:p-3 w-[40px] sm:w-[5%] text-center" />}
          </tr>
        </thead>
        <tbody>
          {terms.length === 0 ? (
            <tr>
              <td
                colSpan={isVocabularyMode && isAdmin ? (currentView === "all" ? 6 : 5) : currentView === "all" ? 4 : 3}
                className="p-6 text-center text-samoo-gray-medium italic"
              >
                등록된 용어가 없습니다.
              </td>
            </tr>
          ) : (
            terms.map((term, index) => {
              let termIdForScroll: string | undefined
              if (currentView === "all") {
                const prevTerm = terms[index - 1]
                if (index === 0 || prevTerm.discipline !== term.discipline) {
                  termIdForScroll = `term-discipline-${disciplineMap[term.discipline].abbreviation}`
                }
              }

              return (
                <tr
                  key={term.id}
                  id={termIdForScroll}
                  className={cn(
                    "border-b border-samoo-gray-light last:border-b-0",
                    highlightedTermId === term.id ? "bg-yellow-100" : "hover:bg-samoo-gray-light/30",
                  )}
                  style={{ backgroundColor: discipline ? disciplineMap[discipline].color : undefined }}
                >
                  {isVocabularyMode && (
                    <td className="p-2 sm:p-3 text-center">
                      <Checkbox
                        checked={selectedTerms.has(term.id)}
                        onCheckedChange={(checked) => onToggleTermSelection(term.id, !!checked)}
                        className="border-samoo-blue data-[state=checked]:bg-samoo-blue data-[state=checked]:text-white"
                      />
                    </td>
                  )}
                  {currentView === "all" && (
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray">
                      <span className="px-1 py-0.5 bg-samoo-blue/10 text-samoo-blue rounded text-xs">
                        {disciplineMap[term.discipline].abbreviation}
                      </span>
                    </td>
                  )}
                  <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray font-medium">{term.en}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray font-medium">{term.kr}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray hidden sm:table-cell">
                    {term.description}
                  </td>
                  {isVocabularyMode && isAdmin && (
                    <td className="p-2 sm:p-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-100"
                        onClick={() => onDeleteTerm(term.id)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">용어 삭제</span>
                      </Button>
                    </td>
                  )}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )

  if (currentView === "all") {
    return renderTable(glossary, undefined)
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {disciplines.map((discipline) => {
        const termsInDiscipline = glossary.filter((term) => term.discipline === discipline)
        const { koreanName, englishName, color } = disciplineMap[discipline]

        return (
          <div key={discipline} id={`discipline-${discipline}`} ref={(el) => (disciplineRefs.current[discipline] = el)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-samoo-blue flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span>{koreanName}</span>
                <span className="text-sm sm:text-base font-medium text-samoo-gray-medium">{englishName}</span>
              </h2>
              <Button
                onClick={() => handleDownloadDiscipline(discipline)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 self-start sm:self-auto",
                  "bg-samoo-blue text-white hover:bg-samoo-blue-dark",
                )}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                Excel
              </Button>
            </div>
            {renderTable(termsInDiscipline, discipline)}
          </div>
        )
      })}
    </div>
  )
}
