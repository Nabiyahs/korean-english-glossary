"use client"

import { useState } from "react"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminTermsTableProps {
  terms: GlossaryTerm[]
  onDeleteTerm: (id: string) => Promise<{ success: boolean; message: string }>
}

export function AdminTermsTable({ terms, onDeleteTerm }: AdminTermsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTerms, setFilteredTerms] = useState(terms)
  const { toast } = useToast()

  // Filter terms based on search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
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
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" })
      }
    }
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mb-4 max-w-md">
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

      {/* Terms Table */}
      <div className="overflow-x-auto rounded-lg border border-samoo-gray-light shadow-sm bg-white max-h-96">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white">
            <tr className="bg-samoo-gray-light/50 border-b">
              <th className="p-3 text-xs font-medium text-samoo-gray">상태</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">공종</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">English</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">한국어</th>
              <th className="p-3 text-xs font-medium text-samoo-gray">설명</th>
              <th className="p-3 text-xs font-medium text-samoo-gray text-center">삭제</th>
            </tr>
          </thead>
          <tbody>
            {filteredTerms.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-samoo-gray-medium italic">
                  {searchTerm ? "검색 결과가 없습니다." : "등록된 용어가 없습니다."}
                </td>
              </tr>
            ) : (
              filteredTerms.map((term) => (
                <tr
                  key={term.id}
                  className={`border-b border-samoo-gray-light/50 hover:bg-samoo-gray-light/20 ${
                    term.status === "pending" ? "bg-yellow-50/50" : ""
                  }`}
                >
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
                      {disciplineMap[term.discipline].abbreviation}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-samoo-gray font-medium">{term.en}</td>
                  <td className="p-3 text-xs text-samoo-gray font-medium">{term.kr}</td>
                  <td className="p-3 text-xs text-samoo-gray-medium">{term.description || "설명 없음"}</td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:bg-red-100"
                      onClick={() => handleDelete(term.id, term.en)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">용어 삭제</span>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {searchTerm && (
        <p className="text-sm text-samoo-gray-medium mt-2">
          총 {terms.length}개 중 {filteredTerms.length}개 표시
        </p>
      )}
    </div>
  )
}
