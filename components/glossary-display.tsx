"use client"

import { useState, useEffect } from "react"
import { getGlossaryTerms } from "@/app/actions"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Eye, EyeOff } from "lucide-react"

export function GlossaryDisplay() {
  const [allTerms, setAllTerms] = useState<GlossaryTerm[]>([])
  const [approvedTerms, setApprovedTerms] = useState<GlossaryTerm[]>([])
  const [pendingTerms, setPendingTerms] = useState<GlossaryTerm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [all, approved, pending] = await Promise.all([
        getGlossaryTerms(undefined, true), // Admin view - all terms
        getGlossaryTerms("approved", false), // Only approved
        getGlossaryTerms("pending", false), // Only pending
      ])
      setAllTerms(all)
      setApprovedTerms(approved)
      setPendingTerms(pending)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          <span>데이터베이스에서 용어를 불러오는 중...</span>
        </div>
      </Card>
    )
  }

  const disciplineStats = Object.keys(disciplineMap)
    .map((discipline) => {
      const approved = approvedTerms.filter((term) => term.discipline === discipline).length
      const pending = pendingTerms.filter((term) => term.discipline === discipline).length
      const total = approved + pending

      return {
        discipline,
        approved,
        pending,
        total,
        name: disciplineMap[discipline as keyof typeof disciplineMap].koreanName,
        abbr: disciplineMap[discipline as keyof typeof disciplineMap].abbreviation,
      }
    })
    .filter((stat) => stat.total > 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{approvedTerms.length}</div>
            <div className="text-sm text-green-600">승인된 용어</div>
            <div className="text-xs text-green-500 mt-1">메인 페이지에 표시</div>
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-700">{pendingTerms.length}</div>
            <div className="text-sm text-yellow-600">승인 대기 중</div>
            <div className="text-xs text-yellow-500 mt-1">관리자 승인 필요</div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{allTerms.length}</div>
            <div className="text-sm text-blue-600">전체 용어</div>
            <div className="text-xs text-blue-500 mt-1">데이터베이스 총합</div>
          </div>
        </Card>
      </div>

      {/* Discipline Breakdown */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-samoo-blue">공종별 용어 현황</h3>
          <div className="flex gap-2">
            <Button onClick={() => setShowDetails(!showDetails)} size="sm" variant="outline">
              {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showDetails ? "간단히 보기" : "상세히 보기"}
            </Button>
            <Button onClick={fetchData} size="sm" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-samoo-gray-light/50 border-b">
                <th className="p-3 text-sm font-medium text-samoo-gray">공종</th>
                <th className="p-3 text-sm font-medium text-samoo-gray text-center">승인됨</th>
                <th className="p-3 text-sm font-medium text-samoo-gray text-center">대기중</th>
                <th className="p-3 text-sm font-medium text-samoo-gray text-center">총합</th>
                <th className="p-3 text-sm font-medium text-samoo-gray text-center">진행률</th>
              </tr>
            </thead>
            <tbody>
              {disciplineStats.map((stat) => (
                <tr key={stat.discipline} className="border-b border-samoo-gray-light/50 hover:bg-samoo-gray-light/20">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-samoo-blue/10 text-samoo-blue rounded text-xs font-medium">
                        {stat.abbr}
                      </span>
                      <span className="font-medium text-samoo-gray">{stat.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      {stat.approved}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                      {stat.pending}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {stat.total}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stat.total > 0 ? (stat.approved / stat.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-samoo-gray-medium min-w-[3rem]">
                        {stat.total > 0 ? Math.round((stat.approved / stat.total) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Terms List */}
      {showDetails && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-samoo-blue mb-4">전체 용어 목록</h3>

          {pendingTerms.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-yellow-700 mb-3">
                승인 대기 중인 용어 ({pendingTerms.length}개)
              </h4>
              <div className="max-h-60 overflow-y-auto border border-yellow-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-yellow-50">
                    <tr>
                      <th className="p-2 text-xs font-medium text-yellow-800">공종</th>
                      <th className="p-2 text-xs font-medium text-yellow-800">English</th>
                      <th className="p-2 text-xs font-medium text-yellow-800">한국어</th>
                      <th className="p-2 text-xs font-medium text-yellow-800">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTerms.map((term) => (
                      <tr key={term.id} className="border-b border-yellow-200/50 hover:bg-yellow-50/50">
                        <td className="p-2 text-xs">
                          <span className="px-1 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
                            {disciplineMap[term.discipline].abbreviation}
                          </span>
                        </td>
                        <td className="p-2 text-xs font-medium text-yellow-800">{term.en}</td>
                        <td className="p-2 text-xs font-medium text-yellow-800">{term.kr}</td>
                        <td className="p-2 text-xs text-yellow-700">{term.description || "설명 없음"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {approvedTerms.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-green-700 mb-3">승인된 용어 ({approvedTerms.length}개)</h4>
              <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-green-50">
                    <tr>
                      <th className="p-2 text-xs font-medium text-green-800">공종</th>
                      <th className="p-2 text-xs font-medium text-green-800">English</th>
                      <th className="p-2 text-xs font-medium text-green-800">한국어</th>
                      <th className="p-2 text-xs font-medium text-green-800">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedTerms.map((term) => (
                      <tr key={term.id} className="border-b border-green-200/50 hover:bg-green-50/50">
                        <td className="p-2 text-xs">
                          <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">
                            {disciplineMap[term.discipline].abbreviation}
                          </span>
                        </td>
                        <td className="p-2 text-xs font-medium text-green-800">{term.en}</td>
                        <td className="p-2 text-xs font-medium text-green-800">{term.kr}</td>
                        <td className="p-2 text-xs text-green-700">{term.description || "설명 없음"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-2">💡 용어 관리 안내:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • <strong>승인된 용어</strong>: 메인 페이지에서 사용자들이 볼 수 있는 용어
            </li>
            <li>
              • <strong>승인 대기 중</strong>: 관리자 승인이 필요한 용어 (관리자 페이지에서 승인/거부 가능)
            </li>
            <li>
              • <strong>진행률</strong>: 해당 공종에서 승인된 용어의 비율
            </li>
            <li>• 새로운 용어를 추가하려면 메인 페이지의 "용어 추가" 버튼을 사용하세요</li>
            <li>
              • 관리자는{" "}
              <a href="/admin" className="underline text-blue-600">
                /admin
              </a>{" "}
              페이지에서 대기 중인 용어를 관리할 수 있습니다
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
