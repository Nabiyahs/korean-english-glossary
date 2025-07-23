"use client"

import { useRef, useEffect, useState } from "react"
import { type GlossaryTerm, type Discipline, disciplineMap } from "@/lib/data"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadWorkbook, createBeautifulWorkbook } from "@/lib/xlsx-download"

interface GlossaryTableProps {
  glossary: GlossaryTerm[]
  currentView: "discipline" | "all"
  isVocabularyMode: boolean
  selectedTerms: Set<string>
  onToggleTermSelection: (id: string, checked: boolean) => void
  highlightedTermId: string | null
  onDeleteTerm: (id: string) => Promise<void>
  isAdmin: boolean
  selectedDiscipline: Discipline | null
  onDisciplineChange: (discipline: Discipline | null) => void
}

const ITEMS_PER_PAGE = 100

export function GlossaryTable({
  glossary,
  currentView,
  isVocabularyMode,
  selectedTerms,
  onToggleTermSelection,
  highlightedTermId,
  onDeleteTerm,
  isAdmin,
  selectedDiscipline,
  onDisciplineChange,
}: GlossaryTableProps) {
  const disciplineRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [disciplineCurrentPage, setDisciplineCurrentPage] = useState(1)

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  // Reset to page 1 when view changes or discipline changes
  useEffect(() => {
    setCurrentPage(1)
    setDisciplineCurrentPage(1)
  }, [currentView, selectedDiscipline])

  const handleDownloadDiscipline = (discipline: Discipline) => {
    const termsToDownload = glossary.filter((term) => term.discipline === discipline)
    const data = termsToDownload.map((term) => ({
      공종: disciplineMap[term.discipline].abbreviation,
      EN: term.en,
      KR: term.kr,
      설명: term.description,
    }))

    const wb = createBeautifulWorkbook(
      data,
      `${disciplineMap[discipline].koreanName} 용어`,
      `SAMOO 하이테크 1본부 - ${disciplineMap[discipline].koreanName} 용어집`,
    )
    downloadWorkbook(
      wb,
      `${disciplineMap[discipline].koreanName}_용어집_${new Date().toISOString().split("T")[0]}.xlsx`,
    )
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
      <table className="w-full text-left border-collapse table-fixed">
        {/* HEADER ROW */}
        <thead>
          <tr className="bg-samoo-gray-light/50">
            {isVocabularyMode && (
              <th className="p-2 sm:p-3 w-[40px] sm:w-[5%] text-center rounded-tl-lg">
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
            <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray w-[25%] sm:w-[20%]">EN</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray w-[25%] sm:w-[20%]">KR</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray hidden sm:table-cell w-[35%]">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          {terms.length === 0 ? (
            <tr>
              <td
                colSpan={isVocabularyMode ? (currentView === "all" ? 5 : 4) : currentView === "all" ? 4 : 3}
                className="p-4 sm:p-6 text-center text-samoo-gray-medium italic text-sm"
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
                  const abbreviation = disciplineMap[term.discipline]?.abbreviation || term.discipline || "unknown"
                  termIdForScroll = `term-discipline-${abbreviation}`
                }
              }

              return (
                <tr
                  key={term.id}
                  id={termIdForScroll || `term-${term.id}`}
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
                        {disciplineMap[term.discipline]?.abbreviation || term.discipline || "Unknown"}
                      </span>
                    </td>
                  )}
                  <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray font-medium">{term.en}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray font-medium">{term.kr}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray hidden sm:table-cell">
                    {term.description}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )

  const renderPagination = (totalItems: number, currentPage: number, onPageChange: (page: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

    if (totalPages <= 1) return null

    const getVisiblePages = () => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...")
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages)
      } else {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots
    }

    const visiblePages = getVisiblePages()

    return (
      <div className="flex items-center justify-center gap-2 mt-6 py-4">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm border-samoo-gray-medium hover:bg-samoo-blue hover:text-white disabled:opacity-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm border-samoo-gray-medium hover:bg-samoo-blue hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={cn(
              "px-3 py-1 text-sm min-w-[2rem]",
              page === currentPage
                ? "bg-samoo-blue text-white border-samoo-blue"
                : "border-samoo-gray-medium hover:bg-samoo-blue hover:text-white",
              page === "..." && "cursor-default hover:bg-transparent hover:text-current",
            )}
          >
            {page}
          </Button>
        ))}

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-sm border-samoo-gray-medium hover:bg-samoo-blue hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-sm border-samoo-gray-medium hover:bg-samoo-blue hover:text-white disabled:opacity-50"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>

        {/* Page info */}
        <div className="ml-4 text-sm text-samoo-gray-medium">
          {currentPage} / {totalPages} 페이지 (총 {totalItems}개)
        </div>
      </div>
    )
  }

  if (currentView === "discipline") {
    // Show only selected discipline or default to "General" with pagination
    const displayDiscipline = selectedDiscipline || "General"
    const termsInDiscipline = glossary.filter((term) => term.discipline === displayDiscipline)
    const { koreanName, englishName, color } = disciplineMap[displayDiscipline]

    // Pagination for discipline view
    const totalDisciplineItems = termsInDiscipline.length
    const disciplineStartIndex = (disciplineCurrentPage - 1) * ITEMS_PER_PAGE
    const disciplineEndIndex = disciplineStartIndex + ITEMS_PER_PAGE
    const paginatedDisciplineTerms = termsInDiscipline.slice(disciplineStartIndex, disciplineEndIndex)

    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-samoo-blue flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span>{koreanName}</span>
            <span className="text-sm sm:text-base font-medium text-samoo-gray-medium">{englishName}</span>
            <span className="text-xs sm:text-sm font-normal text-samoo-gray-medium">
              ({termsInDiscipline.length}개)
            </span>
          </h2>
          <Button
            onClick={() => handleDownloadDiscipline(displayDiscipline)}
            size="sm"
            className={cn(
              "px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-md transition-colors flex items-center gap-1 self-start sm:self-auto",
              "bg-samoo-blue text-white hover:bg-samoo-blue-dark",
            )}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            Excel
          </Button>
        </div>
        {renderTable(paginatedDisciplineTerms, displayDiscipline)}
        {renderPagination(totalDisciplineItems, disciplineCurrentPage, setDisciplineCurrentPage)}
      </div>
    )
  }

  // "전체 보기" mode with pagination
  const totalItems = glossary.length
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTerms = glossary.slice(startIndex, endIndex)

  return (
    <div>
      {renderTable(paginatedTerms)}
      {renderPagination(totalItems, currentPage, setCurrentPage)}
    </div>
  )
}
