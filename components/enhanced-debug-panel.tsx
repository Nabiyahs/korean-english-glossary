"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getGlossaryTerms, approveGlossaryTerm, debugDatabaseState } from "@/app/actions"
import { Bug, Play, CheckCircle, XCircle } from "lucide-react"

export function EnhancedDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTestResults([])
    const results: any[] = []

    // Test 1: Check if we can fetch General terms
    try {
      results.push({ test: "Fetching General terms", status: "running", details: "Testing..." })
      setTestResults([...results])

      const allTerms = await getGlossaryTerms(undefined, true)
      const generalTerms = allTerms.filter((term) => term.discipline === "프로젝트 일반 용어")
      const pendingGeneral = generalTerms.filter((term) => term.status === "pending")

      results[results.length - 1] = {
        test: "Fetching General terms",
        status: "success",
        details: `Found ${generalTerms.length} total General terms, ${pendingGeneral.length} pending`,
      }
      setTestResults([...results])

      // Test 2: Try to approve one General term if available
      if (pendingGeneral.length > 0) {
        const testTerm = pendingGeneral[0]
        results.push({
          test: "Approving single General term",
          status: "running",
          details: `Testing with: ${testTerm.en}`,
        })
        setTestResults([...results])

        const approveResult = await approveGlossaryTerm(testTerm.id)
        results[results.length - 1] = {
          test: "Approving single General term",
          status: approveResult.success ? "success" : "error",
          details: approveResult.message,
          termId: testTerm.id,
          termName: testTerm.en,
        }
        setTestResults([...results])
      } else {
        results.push({
          test: "Approving single General term",
          status: "skipped",
          details: "No pending General terms found",
        })
        setTestResults([...results])
      }
    } catch (error) {
      results[results.length - 1] = {
        test: "Fetching General terms",
        status: "error",
        details: `Error: ${error}`,
      }
      setTestResults([...results])
    }

    // Test 3: Check database state
    try {
      results.push({ test: "Database state check", status: "running", details: "Checking..." })
      setTestResults([...results])

      const dbState = await debugDatabaseState()
      results[results.length - 1] = {
        test: "Database state check",
        status: dbState.success ? "success" : "error",
        details: `Database accessible: ${dbState.success}, Terms found: ${dbState.terms.length}`,
      }
      setTestResults([...results])
    } catch (error) {
      results[results.length - 1] = {
        test: "Database state check",
        status: "error",
        details: `Error: ${error}`,
      }
      setTestResults([...results])
    }

    // Test 4: Check browser console for errors
    results.push({
      test: "Browser console check",
      status: "info",
      details: "Check F12 Console for 'DEBUG:' messages and any red errors",
    })
    setTestResults([...results])

    setIsRunning(false)
  }

  if (!isVisible) {
    return (
      <Card className="p-3 mb-4 bg-red-50 border-red-200">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="text-xs text-red-700 border-red-300"
        >
          <Bug className="w-3 h-3 mr-1" />🚨 General 용어 승인 문제 진단
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4 mb-4 bg-red-50 border-red-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-red-800">🚨 General 용어 승인 문제 진단</h3>
        <div className="flex gap-2">
          <Button onClick={runDiagnostics} size="sm" disabled={isRunning} className="bg-red-600 text-white">
            <Play className={`w-3 h-3 mr-1 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "진단 중..." : "진단 실행"}
          </Button>
          <Button onClick={() => setIsVisible(false)} size="sm" variant="ghost">
            ✕
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white border rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                {result.status === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
                {result.status === "error" && <XCircle className="w-4 h-4 text-red-600" />}
                {result.status === "running" && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                {result.status === "skipped" && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                {result.status === "info" && <div className="w-4 h-4 bg-blue-400 rounded-full" />}
                <span className="font-medium text-sm">{result.test}</span>
              </div>
              <p className="text-xs text-gray-700 ml-6">{result.details}</p>
              {result.termId && <p className="text-xs text-blue-600 ml-6 mt-1">Term ID: {result.termId}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Manual Debug Instructions */}
      <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded p-3">
        <p className="font-medium text-yellow-800 mb-2">🔍 수동 디버깅 단계:</p>
        <ol className="text-yellow-700 space-y-1 text-xs list-decimal list-inside">
          <li>
            <strong>F12 Console 확인:</strong> 페이지 새로고침 후 Console 탭에서 "DEBUG:" 메시지 찾기
          </li>
          <li>
            <strong>Network 탭 확인:</strong> 승인 버튼 클릭 시 API 요청이 실제로 전송되는지 확인
          </li>
          <li>
            <strong>Supabase 직접 확인:</strong> Supabase 대시보드 → Table Editor → glossary_terms 테이블에서 General
            용어 상태 확인
          </li>
          <li>
            <strong>RLS 정책 확인:</strong> Supabase → Authentication → Policies에서 glossary_terms 정책 확인
          </li>
          <li>
            <strong>브라우저 캐시 삭제:</strong> Ctrl+Shift+Delete로 캐시 삭제 후 재시도
          </li>
        </ol>
      </div>

      {/* Specific Error Patterns */}
      <div className="mt-3 bg-orange-50 border border-orange-300 rounded p-3">
        <p className="font-medium text-orange-800 mb-2">🎯 일반적인 문제 패턴:</p>
        <ul className="text-orange-700 space-y-1 text-xs">
          <li>
            <strong>"Content unavailable" 오류:</strong> 브라우저 캐시 문제 또는 네트워크 연결 문제
          </li>
          <li>
            <strong>승인 버튼 클릭 후 변화 없음:</strong> RLS 정책 문제 또는 권한 부족
          </li>
          <li>
            <strong>일부 공종만 승인 안됨:</strong> 데이터 타입 불일치 또는 특정 조건 문제
          </li>
          <li>
            <strong>콘솔에 빨간 오류:</strong> JavaScript 실행 오류 또는 API 호출 실패
          </li>
        </ul>
      </div>
    </Card>
  )
}
