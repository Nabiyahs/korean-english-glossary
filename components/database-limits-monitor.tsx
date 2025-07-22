"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { checkDatabaseLimits, getDetailedDatabaseStats } from "@/app/actions"
import { Database, AlertTriangle, RefreshCw } from "lucide-react"

export function DatabaseLimitsMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [limitsData, setLimitsData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkLimits = async () => {
    setIsLoading(true)
    try {
      const [limits, stats] = await Promise.all([checkDatabaseLimits(), getDetailedDatabaseStats()])

      setLimitsData(limits)
      setStatsData(stats)
    } catch (error) {
      console.error("Error checking limits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <Card className="p-3 mb-4 bg-orange-50 border-orange-200">
        <Button
          onClick={() => {
            setIsVisible(true)
            checkLimits()
          }}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          <Database className="w-3 h-3 mr-1" />
          데이터베이스 한계 확인
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-4 bg-orange-50 border-orange-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-orange-800">📊 데이터베이스 사용량 모니터링</h3>
        <div className="flex gap-2">
          <Button onClick={checkLimits} size="sm" disabled={isLoading}>
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <Button onClick={() => setIsVisible(false)} size="sm" variant="ghost">
            ✕
          </Button>
        </div>
      </div>

      {limitsData && statsData && (
        <div className="space-y-3 text-xs">
          {/* Database Size Warning */}
          <div className="bg-white border border-orange-300 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">데이터베이스 상태</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-orange-700">총 용어 수:</p>
                <p className="text-lg font-bold text-orange-800">{statsData.data?.statusCounts?.total || 0}개</p>
                {statsData.data?.statusCounts?.total >= 1000 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 text-xs">한계에 근접</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-orange-700">데이터베이스 크기:</p>
                <p className="text-lg font-bold text-orange-800">{limitsData.data?.databaseSize || "확인 불가"}</p>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white border border-orange-300 rounded p-3">
            <p className="font-medium text-orange-800 mb-2">📈 상태별 분석:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-green-700 font-bold text-lg">{statsData.data?.statusCounts?.approved || 0}</p>
                <p className="text-green-600 text-xs">승인됨</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-700 font-bold text-lg">{statsData.data?.statusCounts?.pending || 0}</p>
                <p className="text-yellow-600 text-xs">대기중</p>
              </div>
              <div className="text-center">
                <p className="text-blue-700 font-bold text-lg">{statsData.data?.statusCounts?.total || 0}</p>
                <p className="text-blue-600 text-xs">전체</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {statsData.data?.recentActivity?.length > 0 && (
            <div className="bg-white border border-orange-300 rounded p-3">
              <p className="font-medium text-orange-800 mb-2">🕒 최근 24시간 활동:</p>
              <p className="text-orange-700">
                {statsData.data.recentActivity.length}개의 새로운 용어가 추가되었습니다.
              </p>
              <div className="mt-2 max-h-20 overflow-y-auto">
                {statsData.data.recentActivity.slice(0, 3).map((term: any) => (
                  <div key={term.id} className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 mb-1">
                    {term.en} / {term.kr} ({term.status})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supabase Free Tier Limits */}
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
            <p className="font-medium text-yellow-800 mb-2">⚠️ Supabase 무료 플랜 한계:</p>
            <ul className="text-yellow-700 space-y-1 text-xs">
              <li>• 데이터베이스 크기: 500MB</li>
              <li>• 월간 활성 사용자: 50,000명</li>
              <li>• API 요청: 월 500MB</li>
              <li>• 실시간 연결: 200개</li>
              <li>• 스토리지: 1GB</li>
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-300 rounded p-3">
            <p className="font-medium text-blue-800 mb-2">💡 권장사항:</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              {statsData.data?.statusCounts?.total >= 800 && (
                <li>• 🚨 용어 수가 많습니다. 불필요한 용어 정리를 고려하세요.</li>
              )}
              {statsData.data?.statusCounts?.pending > 100 && (
                <li>• ⏳ 대기 중인 용어가 많습니다. 정기적으로 승인/거부하세요.</li>
              )}
              <li>• 📊 Supabase 대시보드에서 정확한 사용량을 확인하세요.</li>
              <li>• 🔄 정기적으로 데이터베이스 정리를 수행하세요.</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}
