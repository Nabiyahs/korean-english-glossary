"use client"

import { useState, useEffect } from "react"
import {
  getGlossaryTerms,
  approveGlossaryTerm,
  rejectGlossaryTerm,
  approveAllTerms,
  rejectAllTerms,
  deleteGlossaryTerm,
  deleteMultipleTerms,
  deleteAllTerms,
  updateGlossaryTerm,
} from "../actions"
import { disciplineMap, type Discipline } from "@/lib/data"
import { AdminActionButtons } from "@/components/admin-action-buttons"
import { AdminBulkActions } from "@/components/admin-bulk-actions"
import { AdminTermsTable } from "@/components/admin-terms-table"
import { DuplicateComparisonSection } from "@/components/duplicate-comparison-section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { List, Table, Clock, Edit } from "lucide-react"
import type { GlossaryTerm } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { EditTermForm } from "@/components/edit-term-form"

type ViewMode = "discipline" | "date" | "all"

export default function AdminPage() {
  const [pendingTerms, setPendingTerms] = useState<GlossaryTerm[]>([])
  const [allTerms, setAllTerms] = useState<GlossaryTerm[]>([])
  const [hasDuplicates, setHasDuplicates] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("discipline")
  const [editingPendingTerm, setEditingPendingTerm] = useState<GlossaryTerm | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [pending, all] = await Promise.all([getGlossaryTerms("pending"), getGlossaryTerms(undefined, true)])

      // Apply sorting based on viewMode
      const sortedPending = sortTermsByMode(pending, viewMode)
      const sortedAll = sortTermsByMode(all, viewMode)

      setPendingTerms(sortedPending)
      setAllTerms(sortedAll)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortTermsByMode = (terms: GlossaryTerm[], mode: ViewMode): GlossaryTerm[] => {
    switch (mode) {
      case "date":
        return terms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "discipline":
      case "all":
      default:
        return terms.sort((a, b) => {
          const disciplineAIndex = disciplines.indexOf(a.discipline)
          const disciplineBIndex = disciplines.indexOf(b.discipline)
          if (disciplineAIndex !== disciplineBIndex) {
            return disciplineAIndex - disciplineBIndex
          }
          return a.en.localeCompare(b.en)
        })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [viewMode])

  const handleDuplicatesChange = (duplicatesExist: boolean) => {
    setHasDuplicates(duplicatesExist)
  }

  // Refresh data after bulk actions
  const handleApproveAll = async () => {
    const result = await approveAllTerms()
    if (result.success) {
      await fetchData() // Refresh all data
    }
    return result
  }

  const handleRejectAll = async () => {
    const result = await rejectAllTerms()
    if (result.success) {
      await fetchData() // Refresh all data
    }
    return result
  }

  const handleEditPending = async (
    updates: Partial<Pick<GlossaryTerm, "en" | "kr" | "description" | "discipline">>,
  ) => {
    if (!editingPendingTerm) return

    const result = await updateGlossaryTerm(editingPendingTerm.id, updates)
    if (result.success) {
      toast({ title: "성공", description: result.message })
      // Update local state
      setPendingTerms((prev) =>
        prev.map((term) =>
          term.id === editingPendingTerm.id
            ? {
                ...term,
                ...updates,
                abbreviation: updates.discipline ? disciplineMap[updates.discipline].abbreviation : term.abbreviation,
              }
            : term,
        ),
      )
      setEditingPendingTerm(null)
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  const renderPendingTermsTable = (terms: GlossaryTerm[], discipline?: Discipline) => (
    <div className="rounded-lg border border-samoo-gray-light shadow-sm bg-white">
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-yellow-50 z-10">
            <tr className="border-b-2 border-yellow-200">
              <th className="p-4 text-sm font-semibold text-samoo-gray">
                #<span className="text-xs font-normal text-samoo-gray-medium ml-1">(총 {terms.length}개)</span>
              </th>
              <th className="p-4 text-sm font-semibold text-samoo-gray">공종</th>
              <th className="p-4 text-sm font-semibold text-samoo-gray">English</th>
              <th className="p-4 text-sm font-semibold text-samoo-gray">한국어</th>
              <th className="p-4 text-sm font-semibold text-samoo-gray">설명</th>
              {viewMode === "date" && <th className="p-4 text-sm font-semibold text-samoo-gray">등록일</th>}
              <th className="p-4 text-sm font-semibold text-samoo-gray text-center w-24">작업</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term, index) => (
              <tr
                key={term.id}
                className={`border-b border-samoo-gray-light hover:bg-yellow-50/50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
                style={{ backgroundColor: discipline ? disciplineMap[discipline].color : undefined }}
              >
                <td className="p-4 text-sm text-samoo-gray-medium font-mono">{index + 1}</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 bg-samoo-blue/10 text-samoo-blue rounded text-xs font-medium">
                    {disciplineMap[term.discipline]?.abbreviation || term.discipline}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-samoo-gray">{term.en}</td>
                <td className="p-4 text-sm font-medium text-samoo-gray">{term.kr}</td>
                <td className="p-4 text-sm text-samoo-gray-medium max-w-xs truncate" title={term.description}>
                  {term.description || "설명 없음"}
                </td>
                {viewMode === "date" && (
                  <td className="p-4 text-xs text-samoo-gray-medium">
                    {new Date(term.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                )}
                <td className="p-4 text-center">
                  <div className="flex gap-1 justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-blue-500 hover:bg-blue-100"
                          onClick={() => setEditingPendingTerm(term)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">용어 수정</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        {editingPendingTerm && (
                          <EditTermForm
                            term={editingPendingTerm}
                            onSave={handleEditPending}
                            onCancel={() => setEditingPendingTerm(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <AdminActionButtons
                      termId={term.id}
                      onApprove={approveGlossaryTerm}
                      onReject={rejectGlossaryTerm}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with total count */}
      <div className="bg-gray-50 border-t border-samoo-gray-light px-4 py-3">
        <div className="flex justify-between items-center text-sm text-samoo-gray-medium">
          <span>총 {terms.length}개의 용어가 승인을 기다리고 있습니다.</span>
          <span>💡 "모두 승인/거부" 버튼으로 전체 {terms.length}개를 일괄 처리할 수 있습니다.</span>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-samoo-blue mb-2">관리자 페이지</h1>
        <p className="text-samoo-gray-medium">이 페이지에서 용어를 승인하거나 삭제할 수 있습니다.</p>
      </div>

      {/* Enhanced Debug Panel - Now shows the issue */}

      {/* Duplicate Comparison Section - Now ultra compact */}
      <DuplicateComparisonSection onDuplicatesChange={handleDuplicatesChange} />

      {/* Pending Terms Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-samoo-gray">승인 대기 용어 ({pendingTerms.length}개)</h2>
          {pendingTerms.length > 0 && (
            <AdminBulkActions
              pendingCount={pendingTerms.length}
              hasDuplicates={hasDuplicates}
              onApproveAll={handleApproveAll}
              onRejectAll={handleRejectAll}
            />
          )}
        </div>

        {pendingTerms.length === 0 ? (
          <div className="bg-samoo-gray-light/30 rounded-lg p-6 text-center">
            <p className="text-samoo-gray-medium italic">승인 대기 중인 용어가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* Summary card for many terms */}
            {pendingTerms.length > 20 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-800 font-medium">📊 대기 용어 요약</p>
                    <p className="text-amber-700 text-sm">
                      총 {pendingTerms.length}개의 용어가 승인을 기다리고 있습니다. "모두 승인" 또는 "모두 거부"
                      버튼으로 일괄 처리할 수 있습니다.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">{pendingTerms.length}</div>
                    <div className="text-xs text-amber-600">대기 중</div>
                  </div>
                </div>
              </div>
            )}

            {/* Always show as single table for pending terms */}
            {renderPendingTermsTable(pendingTerms)}
          </>
        )}
      </section>

      {/* All Terms Management Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-samoo-gray">전체 용어 관리 ({allTerms.length}개)</h2>
            {/* Three-way Toggle */}
            <div className="flex rounded-md overflow-hidden border border-samoo-blue">
              <Button
                onClick={() => setViewMode("discipline")}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  viewMode === "discipline"
                    ? "bg-samoo-blue text-white"
                    : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
                )}
              >
                <List className="w-4 h-4 mr-2" />
                공종별
              </Button>
              <Button
                onClick={() => setViewMode("date")}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  viewMode === "date" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
                )}
              >
                <Clock className="w-4 h-4 mr-2" />
                최신순
              </Button>
              <Button
                onClick={() => setViewMode("all")}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  viewMode === "all" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
                )}
              >
                <Table className="w-4 h-4 mr-2" />
                전체
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>새로운 기능:</strong> 체크박스로 여러 용어를 선택하여 일괄 삭제하거나, 개별 용어를 수정할 수
            있습니다. 연필 아이콘을 클릭하면 용어를 수정할 수 있습니다.
          </p>
        </div>

        {viewMode === "discipline" ? (
          <div className="space-y-8">
            {disciplines.map((discipline) => {
              const termsInDiscipline = allTerms.filter((term) => term.discipline === discipline)
              const { koreanName, englishName } = disciplineMap[discipline]

              if (termsInDiscipline.length === 0) return null

              return (
                <div key={discipline} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-samoo-blue flex items-baseline gap-2">
                      <span>{koreanName}</span>
                      <span className="text-base font-medium text-samoo-gray-medium">{englishName}</span>
                      <span className="text-sm font-normal text-samoo-gray-medium">({termsInDiscipline.length}개)</span>
                    </h3>
                  </div>

                  <div className="rounded-lg border border-samoo-gray-light shadow-sm bg-white">
                    <div className="max-h-[60vh] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10 border-b-2 border-samoo-gray-light">
                          <tr style={{ backgroundColor: disciplineMap[discipline].color }}>
                            <th className="p-3 text-xs font-medium text-samoo-gray text-center w-[40px]">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  const isChecked = e.target.checked
                                  termsInDiscipline.forEach((term) => {
                                    console.log(`${isChecked ? "Select" : "Deselect"} ${term.id}`)
                                  })
                                }}
                                className="rounded border-samoo-blue"
                              />
                            </th>
                            <th className="p-3 text-xs font-medium text-samoo-gray">상태</th>
                            <th className="p-3 text-xs font-medium text-samoo-gray">English</th>
                            <th className="p-3 text-xs font-medium text-samoo-gray">한국어</th>
                            <th className="p-3 text-xs font-medium text-samoo-gray">설명</th>
                            <th className="p-3 text-xs font-medium text-samoo-gray text-center">작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {termsInDiscipline.map((term, index) => (
                            <tr
                              key={term.id}
                              className={`border-b border-samoo-gray-light/50 hover:bg-samoo-gray-light/20 ${
                                term.status === "pending" ? "bg-yellow-50/50" : ""
                              }`}
                              style={{ backgroundColor: disciplineMap[discipline].color }}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-samoo-blue"
                                  onChange={(e) => {
                                    console.log(`${e.target.checked ? "Select" : "Deselect"} ${term.id}`)
                                  }}
                                />
                              </td>
                              <td className="p-3 text-xs">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    term.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {term.status === "pending" ? "대기" : "승인"}
                                </span>
                              </td>
                              <td className="p-3 text-xs text-samoo-gray font-medium">{term.en}</td>
                              <td className="p-3 text-xs text-samoo-gray font-medium">{term.kr}</td>
                              <td className="p-3 text-xs text-samoo-gray-medium">{term.description || "설명 없음"}</td>
                              <td className="p-3 text-center">
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => console.log(`Edit ${term.id}`)}
                                    className="h-6 w-6 text-blue-500 hover:bg-blue-100 rounded flex items-center justify-center"
                                    title="수정"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`"${term.en}" 용어를 삭제하시겠습니까?`)) {
                                        deleteGlossaryTerm(term.id).then((result) => {
                                          if (result.success) {
                                            fetchData()
                                          }
                                        })
                                      }
                                    }}
                                    className="h-6 w-6 text-red-500 hover:bg-red-100 rounded flex items-center justify-center"
                                    title="삭제"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-gray-50 border-t border-samoo-gray-light px-4 py-2">
                      <div className="flex justify-between items-center text-xs text-samoo-gray-medium">
                        <span>
                          {koreanName} 공종: {termsInDiscipline.length}개 용어
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm(`${koreanName} 공종의 모든 용어를 삭제하시겠습니까?`)) {
                                const disciplineTermIds = termsInDiscipline.map((t) => t.id)
                                deleteMultipleTerms(disciplineTermIds).then((result) => {
                                  if (result.success) {
                                    fetchData()
                                  }
                                })
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            공종 전체 삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <AdminTermsTable
            terms={allTerms}
            onDeleteTerm={deleteGlossaryTerm}
            onDeleteMultiple={deleteMultipleTerms}
            onDeleteAll={deleteAllTerms}
            onUpdateTerm={updateGlossaryTerm}
          />
        )}
      </section>
    </div>
  )
}
