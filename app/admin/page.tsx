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
import { disciplineMap, type Discipline, disciplineOrder } from "@/lib/data"
import { AdminActionButtons } from "@/components/admin-action-buttons"
import { AdminBulkActions } from "@/components/admin-bulk-actions"
import { AdminTermsTable } from "@/components/admin-terms-table"
import { DuplicateComparisonSection } from "@/components/duplicate-comparison-section"
import { DebugInfo } from "@/components/debug-info"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { List, Table } from 'lucide-react'
import type { GlossaryTerm } from "@/lib/data"

export default function AdminPage() {
  const [pendingTerms, setPendingTerms] = useState<GlossaryTerm[]>([])
  const [allTerms, setAllTerms] = useState<GlossaryTerm[]>([])
  const [hasDuplicates, setHasDuplicates] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"discipline" | "all">("all")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [pending, all] = await Promise.all([getGlossaryTerms("pending"), getGlossaryTerms(undefined, true)])
      setPendingTerms(pending)
      setAllTerms(all)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  const renderPendingTermsTable = (terms: GlossaryTerm[], discipline?: Discipline) => (
    <div className="rounded-lg border border-samoo-gray-light shadow-sm bg-white">
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-yellow-50 z-10">
            <tr className="border-b-2 border-yellow-200">
              <th className="p-4 text-sm font-semibold text-samoo-gray">
                #
                <span className="text-xs font-normal text-samoo-gray-medium ml-1">
                  (총 {terms.length}개)
                </span>
              </th>
              {currentView === "all" && (
                <th className="p-4 text-sm font-semibold text-samoo-gray">공종</th>
              )}
              <th className="p-4 text-sm font-semibold text-samoo-gray">English</th>
              <th className="p-4 text-sm font-semibold text-samoo-gray">한국어</th>
              <th className="p-4 text-sm font-semibold text-samoo-gray">설명</th>
              <th className="p-4 text-sm font-semibold text-samoo-gray text-center">작업</th>
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
                {currentView === "all" && (
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 bg-samoo-blue/10 text-samoo-blue rounded text-xs font-medium">
                      {disciplineMap[term.discipline].abbreviation}
                    </span>
                  </td>
                )}
                <td className="p-4 text-sm font-medium text-samoo-gray">{term.en}</td>
                <td className="p-4 text-sm font-medium text-samoo-gray">{term.kr}</td>
                <td className="p-4 text-sm text-samoo-gray-medium max-w-xs truncate" title={term.description}>
                  {term.description || "설명 없음"}
                </td>
                <td className="p-4 text-center">
                  <div className="flex gap-2 justify-center">
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

      {/* Debug Info - Admin Only */}
      <DebugInfo />

      {/* Duplicate Comparison Section - Now ultra compact */}
      <DuplicateComparisonSection onDuplicatesChange={handleDuplicatesChange} />

      {/* Pending Terms Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-samoo-gray">
              승인 대기 용어 ({pendingTerms.length}개)
            </h2>
            {/* View Toggle for Pending Terms */}
            <div className="flex rounded-md overflow-hidden border border-samoo-blue">
              <Button
                onClick={() => setCurrentView("discipline")}
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
                onClick={() => setCurrentView("all")}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  currentView === "all" ? "bg-samoo-blue text-white" : "bg-white text-samoo-blue hover:bg-samoo-blue/10",
                )}
              >
                <Table className="w-4 h-4 mr-2" />
                전체 보기
              </Button>
            </div>
          </div>
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

            {/* Render based on view mode */}
            {currentView === "all" ? (
              renderPendingTermsTable(pendingTerms)
            ) : (
              <div className="space-y-6">
                {disciplines.map((discipline) => {
                  const termsInDiscipline = pendingTerms.filter((term) => term.discipline === discipline)
                  if (termsInDiscipline.length === 0) return null

                  const { koreanName, englishName } = disciplineMap[discipline]

                  return (
                    <div key={discipline}>
                      <h3 className="text-lg font-bold text-samoo-blue mb-3 flex items-baseline gap-2">
                        <span>{koreanName}</span>
                        <span className="text-base font-medium text-samoo-gray-medium">{englishName}</span>
                        <span className="text-sm font-normal text-samoo-gray-medium">
                          ({termsInDiscipline.length}개)
                        </span>
                      </h3>
                      {renderPendingTermsTable(termsInDiscipline, discipline)}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* All Terms Management Section */}
      <section>
        <h2 className="text-2xl font-semibold text-samoo-gray mb-4">전체 용어 관리 ({allTerms.length}개)</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>새로운 기능:</strong> 체크박스로 여러 용어를 선택하여 일괄 삭제하거나, 개별 용어를 수정할 수
            있습니다. 연필 아이콘을 클릭하면 용어를 수정할 수 있습니다.
          </p>
        </div>

        <AdminTermsTable
          terms={allTerms}
          onDeleteTerm={deleteGlossaryTerm}
          onDeleteMultiple={deleteMultipleTerms}
          onDeleteAll={deleteAllTerms}
          onUpdateTerm={updateGlossaryTerm}
        />
      </section>
    </div>
  )
}
