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
import { disciplineMap } from "@/lib/data"
import { AdminActionButtons } from "@/components/admin-action-buttons"
import { AdminBulkActions } from "@/components/admin-bulk-actions"
import { AdminTermsTable } from "@/components/admin-terms-table"
import { DuplicateComparisonSection } from "@/components/duplicate-comparison-section"
import type { GlossaryTerm } from "@/lib/data"

export default function AdminPage() {
  const [pendingTerms, setPendingTerms] = useState<GlossaryTerm[]>([])
  const [allTerms, setAllTerms] = useState<GlossaryTerm[]>([])
  const [hasDuplicates, setHasDuplicates] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
          <div className="overflow-x-auto rounded-lg border border-samoo-gray-light shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-yellow-50 border-b-2 border-yellow-200">
                  <th className="p-4 text-sm font-semibold text-samoo-gray">공종</th>
                  <th className="p-4 text-sm font-semibold text-samoo-gray">English</th>
                  <th className="p-4 text-sm font-semibold text-samoo-gray">한국어</th>
                  <th className="p-4 text-sm font-semibold text-samoo-gray">설명</th>
                  <th className="p-4 text-sm font-semibold text-samoo-gray text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {pendingTerms.map((term) => (
                  <tr key={term.id} className="border-b border-samoo-gray-light hover:bg-yellow-50/50">
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-samoo-blue/10 text-samoo-blue rounded text-xs font-medium">
                        {disciplineMap[term.discipline].abbreviation}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-samoo-gray">{term.en}</td>
                    <td className="p-4 text-sm font-medium text-samoo-gray">{term.kr}</td>
                    <td className="p-4 text-sm text-samoo-gray-medium">{term.description || "설명 없음"}</td>
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
