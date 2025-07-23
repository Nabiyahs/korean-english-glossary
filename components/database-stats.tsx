"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getGlossaryTerms } from "@/app/actions"
import { disciplineMap, type Discipline } from "@/lib/data"
import { RefreshCw, Database, AlertTriangle, CheckCircle } from "lucide-react"

export function DatabaseStats() {
  const [stats, setStats] = useState<{
    total: number
    approved: number
    pending: number
    byDiscipline: Record<string, number>
    isLoading: boolean
    lastUpdated: Date | null
  }>({
    total: 0,
    approved: 0,
    pending: 0,
    byDiscipline: {},
    isLoading: true,
    lastUpdated: null,
  })

  const fetchStats = async () => {
    setStats((prev) => ({ ...prev, isLoading: true }))

    try {
      const [allTerms, approvedTerms, pendingTerms] = await Promise.all([
        getGlossaryTerms(undefined, true), // All terms for admin
        getGlossaryTerms("approved", false),
        getGlossaryTerms("pending", false),
      ])

      // Count by discipline
      const byDiscipline: Record<string, number> = {}
      allTerms.forEach((term) => {
        const disciplineName = disciplineMap[term.discipline as Discipline]?.koreanName || term.discipline
        byDiscipline[disciplineName] = (byDiscipline[disciplineName] || 0) + 1
      })

      setStats({
        total: allTerms.length,
        approved: approvedTerms.length,
        pending: pendingTerms.length,
        byDiscipline,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error("Error fetching database stats:", error)
      setStats((prev) => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const { total, approved, pending, byDiscipline, isLoading, lastUpdated } = stats

  return (
    <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">데이터베이스 통계</h3>
        </div>
        <Button
          onClick={fetchStats}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-300 hover:bg-blue-100 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 용어</p>
              <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
            </div>
            {total > 1000 ? (
              <AlertTriangle className="w-6 h-6 text-amber-500" title="1000개 초과 - 페이지네이션 적용됨" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-500" title="1000개 이하" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div>
            <p className="text-sm text-green-600">승인됨</p>
            <p className="text-2xl font-bold text-green-700">{approved.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-yellow-200">
          <div>
            <p className="text-sm text-yellow-600">대기중</p>
            <p className="text-2xl font-bold text-yellow-700">{pending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Discipline Breakdown */}
      <div className="bg-white rounded-lg p-3 border border-blue-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">공종별 분포</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {Object.entries(byDiscipline)
            .sort(([, a], [, b]) => b - a)
            .map(([discipline, count]) => (
              <div key={discipline} className="flex justify-between items-center bg-gray-50 rounded px-2 py-1">
                <span className="text-gray-600 truncate">{discipline}</span>
                <span className="font-medium text-gray-900 ml-1">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-4 space-y-2">
        {total > 1000 && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded p-2">
            <AlertTriangle className="w-4 h-4" />
            <span>
              <strong>알림:</strong> 총 {total.toLocaleString()}개 용어가 있습니다. Supabase 기본 제한(1,000개)을
              초과하여 배치 처리로 모든 데이터를 가져옵니다.
            </span>
          </div>
        )}

        {total <= 1000 && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded p-2">
            <CheckCircle className="w-4 h-4" />
            <span>모든 용어가 단일 쿼리로 로드됩니다 ({total.toLocaleString()}개 ≤ 1,000개).</span>
          </div>
        )}

        {lastUpdated && <p className="text-xs text-gray-500">마지막 업데이트: {lastUpdated.toLocaleString("ko-KR")}</p>}
      </div>
    </Card>
  )
}
