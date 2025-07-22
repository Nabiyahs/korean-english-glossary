"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getGlossaryTerms, debugDatabaseState, refreshDatabaseConnection } from "@/app/actions"
import type { GlossaryTerm } from "@/lib/data"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

export function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false)
  const [debugData, setDebugData] = useState<{
    pendingTerms: GlossaryTerm[]
    approvedTerms: GlossaryTerm[]
    allTerms: GlossaryTerm[]
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("")

  const testDatabaseConnection = async () => {
    try {
      const result = await refreshDatabaseConnection()
      setConnectionStatus(result.success ? "✅ 연결 정상" : `❌ 연결 오류: ${result.message}`)
    } catch (error) {
      setConnectionStatus(`❌ 연결 실패: ${error}`)
    }
  }

  const fetchDebugData = async () => {
    setIsLoading(true)
    setConnectionStatus("🔄 연결 테스트 중...")

    try {
      // Test connection first
      await testDatabaseConnection()

      const [pending, approved, all] = await Promise.all([
        getGlossaryTerms("pending", false),
        getGlossaryTerms("approved", false),
        getGlossaryTerms(undefined, true), // Admin view - all terms
      ])

      // Also call the debug function to log database state
      await debugDatabaseState()

      console.log("DEBUG: fetchDebugData - Raw data:", {
        pending: pending.length,
        approved: approved.length,
        all: all.length,
      })

      setDebugData({
        pendingTerms: pending,
        approvedTerms: approved,
        allTerms: all,
      })
    } catch (error) {
      console.error("DEBUG: fetchDebugData - Error:", error)
      setDebugData({
        pendingTerms: [],
        approvedTerms: [],
        allTerms: [],
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <Card className="p-3 mb-4 bg-blue-50 border-blue-200">
        <Button
          onClick={() => {
            setIsVisible(true)
            fetchDebugData()
          }}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          디버그 정보 보기 (데이터베이스 상태 확인)
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-blue-800">🔍 데이터베이스 상태 확인</h3>
        <div className="flex gap-2">
          <Button onClick={fetchDebugData} size="sm" disabled={isLoading}>
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <Button onClick={() => setIsVisible(false)} size="sm" variant="ghost">
            <EyeOff className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div className="mb-3 p-2 bg-white rounded border">
          <p className="text-xs font-medium">데이터베이스 연결: {connectionStatus}</p>
        </div>
      )}

      {debugData && (
        <div className="space-y-3 text-xs">
          {debugData.error ? (
            <div className="bg-red-100 border border-red-300 rounded p-2">
              <p className="text-red-800 font-medium">❌ 데이터베이스 연결 오류:</p>
              <p className="text-red-700">{debugData.error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                  <p className="font-medium text-yellow-800">⏳ 승인 대기 중:</p>
                  <p className="text-yellow-700 text-lg font-bold">{debugData.pendingTerms.length}개</p>
                  {debugData.pendingTerms.length > 0 && <p className="text-yellow-600 mt-1">→ 관리자 승인 필요</p>}
                </div>

                <div className="bg-green-100 border border-green-300 rounded p-2">
                  <p className="font-medium text-green-800">✅ 승인 완료:</p>
                  <p className="text-green-700 text-lg font-bold">{debugData.approvedTerms.length}개</p>
                  <p className="text-green-600 mt-1">→ 메인 페이지 표시</p>
                </div>

                <div className="bg-blue-100 border border-blue-300 rounded p-2">
                  <p className="font-medium text-blue-800">📊 전체:</p>
                  <p className="text-blue-700 text-lg font-bold">{debugData.allTerms.length}개</p>
                  <p className="text-blue-600 mt-1">→ 데이터베이스 총합</p>
                </div>
              </div>

              {/* Database Operation Test */}
              <div className="bg-orange-50 border border-orange-300 rounded p-3">
                <p className="font-medium text-orange-800 mb-2">🔧 데이터베이스 작업 상태:</p>
                <div className="space-y-1">
                  <p className="text-orange-700">
                    • 총 용어 수가 1,000개로 고정되어 있다면 → 데이터베이스 제한 또는 캐싱 문제
                  </p>
                  <p className="text-orange-700">• 승인 후에도 pending 상태라면 → 업데이트 쿼리 실패</p>
                  <p className="text-orange-700">• 업로드 후 용어가 추가되지 않는다면 → 삽입 쿼리 실패</p>
                </div>
              </div>

              {/* Show recent operations */}
              <div className="bg-gray-50 border border-gray-300 rounded p-3">
                <p className="font-medium text-gray-800 mb-2">📝 최근 추가된 용어 (최근 10개):</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {debugData.allTerms
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((term) => (
                      <div key={term.id} className="text-gray-700 bg-white/50 rounded px-2 py-1">
                        <span className="font-medium">{term.en}</span> / <span className="font-medium">{term.kr}</span>
                        <span
                          className={`ml-2 text-xs px-1 rounded ${
                            term.status === "pending" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"
                          }`}
                        >
                          {term.status}
                        </span>
                        <span className="text-gray-600 ml-2 text-xs">{new Date(term.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white border border-blue-300 rounded p-3">
                <p className="font-medium text-blue-800 mb-2">💡 문제 해결 단계:</p>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                  <li>브라우저 콘솔(F12)에서 "DEBUG:" 메시지 확인</li>
                  <li>Supabase 대시보드에서 직접 데이터베이스 확인</li>
                  <li>RLS(Row Level Security) 정책 확인</li>
                  <li>네트워크 탭에서 API 요청/응답 확인</li>
                  <li>페이지 강제 새로고침 (Ctrl+F5)</li>
                </ol>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
