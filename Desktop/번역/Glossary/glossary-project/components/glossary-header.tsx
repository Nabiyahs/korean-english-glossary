"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Search, List, Table, BookOpen, Download, X, Plus } from "lucide-react"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"
import { downloadWorkbook } from "@/lib/xlsx-download"
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
  // isAuthenticated: boolean // Removed this prop
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
  // isAuthenticated, // Removed this prop
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
    const termsToDownload = glossary.filter((term) => selectedTerms.has(term.id))
    const data = termsToDownload.map((term) => ({
      공종: disciplineMap[term.discipline].abbreviation,
      EN: term.en,
      KR: term.kr,
      설명: term.description,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "선택 용어")
    downloadWorkbook(wb, "선택_용어집.xlsx")
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <div className="relative flex-grow max-w-md">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="용어 검색..."
              className="pl-10 pr-4 py-2 rounded-md border border-samoo-gray-medium focus:ring-samoo-blue focus:border-samoo-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-samoo-gray-medium" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-samoo-gray-medium hover:bg-samoo-gray-light"
                onClick={() => {
                  setSearchTerm("")
                  setSearchResults([])
                  if (searchInputRef.current) {
                    searchInputRef.current.focus()
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Always render "용어 추가" button */}
          <Dialog open={isAddTermModalOpen} onOpenChange={setIsAddTermModalOpen}>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 text-sm font-medium bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                용어 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-6">
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
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex rounded-md overflow-hidden border border-samoo-blue">
          <Button
            onClick={() => onViewChange("discipline")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              currentView === "discipline"
                ? "bg-samoo-blue text-white"
                : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
            )}
          >
            <List className="w-4 h-4 mr-2" />
            공종별 보기
          </Button>
          <Button
            onClick={() => onViewChange("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              currentView === "all" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
            )}
          >
            <Table className="w-4 h-4 mr-2" />
            전체 보기
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Toggle
            pressed={isVocabularyMode}
            onPressedChange={onToggleVocabularyMode}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isVocabularyMode
                ? "bg-samoo-blue-light text-white hover:bg-samoo-blue-dark"
                : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20",
            )}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            단어장 생성
          </Toggle>
          {isVocabularyMode && (
            <Button
              onClick={handleDownloadSelected}
              className="px-4 py-2 text-sm font-medium bg-samoo-blue text-white hover:bg-samoo-blue-dark transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          )}
        </div>
      </div>

      {searchTerm.trim() !== "" && searchResults.length > 0 && (
        <div className="mb-8 p-4 border border-samoo-gray-light rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-samoo-blue mb-4">검색 결과</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-samoo-gray-light/50">
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[15%]">구분</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[20%]">EN</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[20%]">KR</th>
                  <th className="p-3 text-sm font-medium text-samoo-gray w-[45%] rounded-tr-lg">설명</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((term) => (
                  <tr
                    key={term.id}
                    className="border-b border-samoo-gray-light last:border-b-0 hover:bg-samoo-gray-light/30 cursor-pointer"
                    onClick={() => onScrollToTerm(term.id)}
                  >
                    <td className="p-3 text-sm text-samoo-gray">{disciplineMap[term.discipline].abbreviation}</td>
                    <td className="p-3 text-sm text-samoo-gray">{term.en}</td>
                    <td className="p-3 text-sm text-samoo-gray">{term.kr}</td>
                    <td className="p-3 text-sm text-samoo-gray">{term.description}</td>
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
