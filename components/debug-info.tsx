"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getGlossaryTerms, debugDatabaseState } from "@/app/actions"
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

  const fetchDebugData = async () => {
    setIsLoading(true)
    try {
      const [pending, approved, all] = await Promise.all([
        getGlossaryTerms("pending", false),
        getGlossaryTerms("approved", false),
        getGlossaryTerms(undefined, true), // Admin view - all terms
      ])

      // Also call the debug function to log database state
      await debugDatabaseState()

      setDebugData({
        pendingTerms: pending,
        approvedTerms: approved,
        allTerms: all,
      })
    } catch (error) {
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
          디버그 정보 보기 (General 용어 확인)
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-blue-800">🔍 데이터베이스 상태 확인 (General 용어 디버깅)</h3>
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

              {/* General Terms Analysis */}
              <div className="bg-purple-50 border border-purple-300 rounded p-3">
                <p className="font-medium text-purple-800 mb-2">🔍 General 용어 분석:</p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-purple-700">승인된 General 용어:</span>
                    <span className="ml-2 text-purple-600">
                      {debugData.approvedTerms.filter((term) => term.discipline === "프로젝트 일반 용어").length}개
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">대기 중인 General 용어:</span>
                    <span className="ml-2 text-purple-600">
                      {debugData.pendingTerms.filter((term) => term.discipline === "프로젝트 일반 용어").length}개
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">전체 General 용어:</span>
                    <span className="ml-2 text-purple-600">
                      {debugData.allTerms.filter((term) => term.discipline === "프로젝트 일반 용어").length}개
                    </span>
                  </div>
                </div>
              </div>

              {/* Show some General terms if they exist */}
              {debugData.allTerms.filter((term) => term.discipline === "프로젝트 일반 용어").length > 0 && (
                <div className="bg-gray-50 border border-gray-300 rounded p-3">
                  <p className="font-medium text-gray-800 mb-2">📝 General 용어 샘플 (최근 5개):</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {debugData.allTerms
                      .filter((term) => term.discipline === "프로젝트 일반 용어")
                      .slice(0, 5)
                      .map((term) => (
                        <div key={term.id} className="text-gray-700 bg-white/50 rounded px-2 py-1">
                          <span className="font-medium">{term.en}</span> /{" "}
                          <span className="font-medium">{term.kr}</span>
                          <span className="text-gray-600 ml-2 text-xs">
                            ({term.status}) - {new Date(term.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {debugData.pendingTerms.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded p-3">
                  <p className="font-medium text-amber-800 mb-2">🔍 대기 중인 용어들:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {debugData.pendingTerms.slice(0, 10).map((term) => (
                      <div key={term.id} className="text-amber-700 bg-white/50 rounded px-2 py-1">
                        <span className="font-medium">{term.en}</span> / <span className="font-medium">{term.kr}</span>
                        <span className="text-amber-600 ml-2 text-xs">
                          ({term.discipline}) - {new Date(term.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {debugData.pendingTerms.length > 10 && (
                      <p className="text-amber-600 text-center">... 외 {debugData.pendingTerms.length - 10}개 더</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border border-blue-300 rounded p-3">
                <p className="font-medium text-blue-800 mb-2">💡 General 용어 문제 해결:</p>
                <ul className="text-blue-700 space-y-1">
                  {debugData.allTerms.filter((term) => term.discipline === "프로젝트 일반 용어").length === 0 ? (
                    <>
                      <li>❌ General 용어가 데이터베이스에 없습니다.</li>
                      <li>📝 업로드 시 "Gen" 약어를 사용했는지 확인하세요.</li>
                      <li>🔄 용어를 다시 추가해보세요.</li>
                    </>
                  ) : debugData.approvedTerms.filter((term) => term.discipline === "프로젝트 일반 용어").length ===
                    0 ? (
                    <>
                      <li>⏳ General 용어가 승인 대기 중입니다.</li>
                      <li>
                        🔗{" "}
                        <a href="/admin" className="underline text-blue-600">
                          관리자 페이지
                        </a>
                        에서 승인하세요.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>✅ General 용어가 정상적으로 승인되어 있습니다.</li>
                      <li>🔄 페이지를 새로고침해보세요.</li>
                      <li>🖥️ 브라우저 캐시를 지워보세요.</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
