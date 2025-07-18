"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Search, List, Table, BookOpen, Download, X, Plus } from "lucide-react"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import { downloadWorkbook, createBeautifulWorkbook } from "@/lib/xlsx-download"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { TermInputForm } from "./term-input-form"

interface GlossaryHeaderProps {
  glossary: GlossaryTerm[]
  onViewChange: (view: "discipline" | "all") => void
  currentView: "discipline" | "all"
  onToggleVocabularyMode: (enabled: boolean) => void
  isVocabularyMode: boolean
  selectedTerms: Set<string>
  onScrollToTerm: (id: string) => void
  onAddTerm: (term: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">) => Promise<void>
  onAddTermsFromText: (
    terms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[],
  ) => Promise<void>
  existingGlossary: GlossaryTerm[]
}

export function GlossaryHeader({
  glossary,
  onViewChange,
  currentView,
  onToggleVocabularyMode,
  isVocabularyMode,
  selectedTerms,
  onScrollToTerm,
  onAddTerm,
  onAddTermsFromText,
  existingGlossary,
}: GlossaryHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<GlossaryTerm[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isAddTermModalOpen, setIsAddTermModalOpen] = useState(false)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      return
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const results = glossary.filter(
      (term) =>
        term.en.toLowerCase().includes(lowerCaseSearchTerm) ||
        term.kr.toLowerCase().includes(lowerCaseSearchTerm) ||
        term.description.toLowerCase().includes(lowerCaseSearchTerm),
    )
    setSearchResults(results)
  }, [searchTerm, glossary])

  const handleDownloadSelected = () => {
    // Check if no terms are selected
    if (selectedTerms.size === 0) {
      // Show popup dialog instead of toast
      alert("선택된 단어가 없습니다.")
      return
    }

    const termsToDownload = glossary.filter((term) => selectedTerms.has(term.id))
    const data = termsToDownload.map((term) => ({
      공종: disciplineMap[term.discipline].abbreviation,
      EN: term.en,
      KR: term.kr,
      설명: term.description,
    }))

    const wb = createBeautifulWorkbook(data, "선택 용어", "SAMOO 하이테크 1본부 - 선택된 용어집")
    downloadWorkbook(wb, `선택_용어집_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <div className="mb-4 sm:mb-8">
      {/* Mobile-first search and add term */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-6">
        {/* Search bar - compact on mobile */}
        <div className="relative w-full">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="용어 검색..."
            className="pl-8 pr-8 py-2 sm:pl-10 sm:pr-10 text-sm sm:text-base rounded-md border border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-samoo-gray-medium" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-samoo-gray-medium hover:bg-samoo-gray-light"
              onClick={() => {
                setSearchTerm("")
                setSearchResults([])
                if (searchInputRef.current) {
                  searchInputRef.current.focus()
                }
              }}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>

        {/* Add Term Button - compact on mobile */}
        <Dialog open={isAddTermModalOpen} onOpenChange={setIsAddTermModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto px-3 py-2 text-sm font-medium bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              용어 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-y-auto">
            <TermInputForm
              onAddTerm={async (term) => {
                await onAddTerm(term)
                setIsAddTermModalOpen(false)
              }}
              onAddTermsFromText={async (terms) => {
                await onAddTermsFromText(terms)
                setIsAddTermModalOpen(false)
              }}
              existingGlossary={existingGlossary}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls - Mobile optimized with compact sizing */}
      <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* View Toggle - Compact on mobile */}
        <div className="flex rounded-md overflow-hidden border border-samoo-blue w-full sm:w-auto">
          <Button
            onClick={() => onViewChange("discipline")}
            className={cn(
              "flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
              currentView === "discipline"
                ? "bg-samoo-blue text-white"
                : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
            )}
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">공종별 보기</span>
            <span className="sm:hidden">공종별</span>
          </Button>
          <Button
            onClick={() => onViewChange("all")}
            className={cn(
              "flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
              currentView === "all" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
            )}
          >
            <Table className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">전체 보기</span>
            <span className="sm:hidden">전체</span>
          </Button>
        </div>

        {/* Vocabulary Mode and Download - Compact on mobile */}
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          <Toggle
            pressed={isVocabularyMode}
            onPressedChange={onToggleVocabularyMode}
            className={cn(
              "flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors justify-center",
              isVocabularyMode
                ? "bg-samoo-blue-light text-white hover:bg-samoo-blue-dark"
                : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20",
            )}
          >
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">단어장 생성</span>
            <span className="sm:hidden">단어장</span>
          </Toggle>
          {isVocabularyMode && (
            <Button
              onClick={handleDownloadSelected}
              className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Excel
            </Button>
          )}
        </div>
      </div>

      {/* Search Results - Compact on mobile */}
      {searchTerm.trim() !== "" && searchResults.length > 0 && (
        <div className="mt-3 sm:mt-6 p-3 sm:p-4 border border-samoo-gray-light rounded-lg bg-white shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-samoo-blue mb-3 sm:mb-4">검색 결과</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-samoo-gray-light/50">
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray">구분</th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray">EN</th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray">KR</th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-samoo-gray hidden sm:table-cell">
                    설명
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((term) => (
                  <tr
                    key={term.id}
                    className="border-b border-samoo-gray-light last:border-b-0 hover:bg-samoo-gray-light/30 cursor-pointer"
                    onClick={() => onScrollToTerm(term.id)}
                  >
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray">
                      {disciplineMap[term.discipline].abbreviation}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray">{term.en}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray">{term.kr}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-samoo-gray hidden sm:table-cell">
                      {term.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
