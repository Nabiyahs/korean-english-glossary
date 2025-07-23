"use client"

import { useState } from "react"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Trash2,
  Search,
  X,
  Edit,
  Trash,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EditTermForm } from "./edit-term-form"
import { cn } from "@/lib/utils"

interface AdminTermsTableProps {
  terms: GlossaryTerm[]
  onDeleteTerm: (id: string) => Promise<{ success: boolean; message: string }>
  onDeleteMultiple: (ids: string[]) => Promise<{ success: boolean; message: string }>
  onDeleteAll: () => Promise<{ success: boolean; message: string }>
  onUpdateTerm: (
    id: string,
    updates: Partial<Pick<GlossaryTerm, "en" | "kr" | "description" | "discipline">>,
  ) => Promise<{ success: boolean; message: string }>
}

const ITEMS_PER_PAGE = 100

export function AdminTermsTable({
  terms,
  onDeleteTerm,
  onDeleteMultiple,
  onDeleteAll,
  onUpdateTerm,
}: AdminTermsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTerms, setFilteredTerms] = useState(terms)
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set())
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  // Update filtered terms when terms prop changes
  useState(() => {
    handleSearch(searchTerm)
  })

  // Filter terms based on search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
    if (value.trim() === "") {
      setFilteredTerms(terms)
    } else {
      const lowerCaseSearch = value.toLowerCase()
      const filtered = terms.filter(
        (term) =>
          term.en.toLowerCase().includes(lowerCaseSearch) ||
          term.kr.toLowerCase().includes(lowerCaseSearch) ||
          term.description.toLowerCase().includes(lowerCaseSearch) ||
          disciplineMap[term.discipline].abbreviation.toLowerCase().includes(lowerCaseSearch),
      )
      setFilteredTerms(filtered)
    }
  }

  const handleDelete = async (id: string, termName: string) => {
    if (confirm(`"${termName}" 용어를 삭제하시겠습니까?`)) {
      const result = await onDeleteTerm(id)
      if (result.success) {
        toast({ title: "성공", description: result.message })
        // Remove from local state
        setFilteredTerms((prev) => prev.filter((term) => term.id !== id))
        setSelectedTerms((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" })
      }
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTerms.size === 0) {
      toast({ title: "알림", description: "삭제할 용어를 선택해주세요.", variant: "default" })
      return
    }

    if (confirm(`선택된 ${selectedTerms.size}개의 용어를 삭제하시겠습니까?`)) {
      const result = await onDeleteMultiple(Array.from(selectedTerms))
      if (result.success) {
        toast({ title: "성공", description: result.message })
        // Remove from local state
        setFilteredTerms((prev) => prev.filter((term) => !selectedTerms.has(term.id)))
        setSelectedTerms(new Set())
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" })
      }
    }
  }

  const handleDeleteAll = async () => {
    if (terms.length === 0) {
      toast({ title: "알림", description: "삭제할 용어가 없습니다.", variant: "default" })
      return
    }

    if (confirm(`모든 용어 (${terms.length}개)를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      const result = await onDeleteAll()
      if (result.success) {
        toast({ title: "성공", description: result.message })
        setFilteredTerms([])
        setSelectedTerms(new Set())
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" })
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTerms(new Set(paginatedTerms.map((term) => term.id)))
    } else {
      setSelectedTerms(new Set())
    }
  }

  const handleSelectTerm = (termId: string, checked: boolean) => {
    setSelectedTerms((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(termId)
      } else {
        newSet.delete(termId)
      }
      return newSet
    })
  }

  const handleEdit = async (updates: Partial<Pick<GlossaryTerm, "en" | "kr" | "description" | "discipline">>) => {
    if (!editingTerm) return

    const result = await onUpdateTerm(editingTerm.id, updates)
    if (result.success) {
      toast({ title: "성공", description: result.message })
      // Update local state
      setFilteredTerms((prev) =>
        prev.map((term) =>
          term.id === editingTerm.id
            ? {
                ...term,
                ...updates,
                abbreviation: updates.discipline ? disciplineMap[updates.discipline].abbreviation : term.abbreviation,
              }
            : term,
        ),
      )
      setEditingTerm(null)
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  // Pagination logic
  const totalItems = filteredTerms.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTerms = filteredTerms.slice(startIndex, endIndex)

  const renderPagination = () => {
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
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm border-samoo-gray-medium hover:bg-samoo-blue hover:text-white disabled:opacity-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
            onClick={() => typeof page === "number" && setCurrentPage(page)}
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
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-sm border-samoo-gray-medium hover:bg-samoo-blue hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
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

  const isAllSelected = paginatedTerms.length > 0 && paginatedTerms.every((term) => selectedTerms.has(term.id))
  const isSomeSelected = paginatedTerms.some((term) => selectedTerms.has(term.id))

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="용어 검색..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-samoo-gray-medium" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleDeleteSelected}
            disabled={selectedTerms.size === 0}
            variant="destructive"
            className="px-3 py-2 text-sm"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            선택 삭제 ({selectedTerms.size})
          </Button>
          <Button onClick={handleDeleteAll} variant="destructive" className="px-3 py-2 text-sm">
            <Trash className="w-4 h-4 mr-2" />
            전체 삭제
          </Button>
        </div>
      </div>

      {/* Terms Table */}
      <div className="overflow-x-auto rounded-lg border border-samoo-gray-light shadow-sm bg-white max-h-96">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white">
            <tr className="bg-samoo-gray-light/50 border-b">
              <th className="p-3 text-xs font-medium text-samoo-gray text-center w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isSomeSelected && !isAllSelected ? "data-[state=indeterminate]:bg-samoo-blue" : ""}
                />
              </th>
              <th className="p-3 text-xs font-medium text-samoo-gray">상태</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">공종</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">English</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">한국어</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">설명</th>
              <th className="p-3 text-xs font-medium text-samoo-gray text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTerms.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-samoo-gray-medium italic">
                  {searchTerm ? "검색 결과가 없습니다." : "등록된 용어가 없습니다."}
                </td>
              </tr>
            ) : (
              paginatedTerms.map((term) => (
                <tr
                  key={term.id}
                  className={`border-b border-samoo-gray-light/50 hover:bg-samoo-gray-light/20 ${
                    term.status === "pending" ? "bg-yellow-50/50" : ""
                  } ${selectedTerms.has(term.id) ? "bg-blue-50/50" : ""}`}
                >
                  <td className="p-3 text-center">
                    <Checkbox
                      checked={selectedTerms.has(term.id)}
                      onCheckedChange={(checked) => handleSelectTerm(term.id, !!checked)}
                    />
                  </td>
                  <td className="p-3 text-xs">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        term.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {term.status === "pending" ? "대기" : "승인"}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="px-2 py-1 bg-samoo-blue/10 text-samoo-blue rounded text-xs">
                      {disciplineMap[term.discipline]?.abbreviation || term.discipline || "Unknown"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-samoo-gray font-medium">{term.en}</td>
                  <td className="p-3 text-xs text-samoo-gray font-medium">{term.kr}</td>
                  <td className="p-3 text-xs text-samoo-gray-medium">{term.description || "설명 없음"}</td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-blue-500 hover:bg-blue-100"
                            onClick={() => setEditingTerm(term)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">용어 수정</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          {editingTerm && (
                            <EditTermForm
                              term={editingTerm}
                              onSave={handleEdit}
                              onCancel={() => setEditingTerm(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-100"
                        onClick={() => handleDelete(term.id, term.en)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">용어 삭제</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {searchTerm && (
        <p className="text-sm text-samoo-gray-medium mt-2">
          총 {terms.length}개 중 {filteredTerms.length}개 표시
          {selectedTerms.size > 0 && ` (${selectedTerms.size}개 선택됨)`}
        </p>
      )}
    </div>
  )
}
