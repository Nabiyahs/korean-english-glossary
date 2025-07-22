"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getGlossaryTerms, approveGlossaryTerm, debugGeneralTermsIssue } from "@/app/actions"
import { Bug, Play, CheckCircle, XCircle } from "lucide-react"

export function EnhancedDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTestResults([])
    const results: any[] = []

    // Test 1: Check exact discipline name matching
    try {
      results.push({ test: "Checking discipline name matching", status: "running", details: "Testing..." })
      setTestResults([...results])

      const allTerms = await getGlossaryTerms(undefined, true)
      console.log("DEBUG: All terms fetched:", allTerms.length)

      // Check all unique discipline names
      const uniqueDisciplines = [...new Set(allTerms.map((term) => term.discipline))]
      console.log("DEBUG: Unique disciplines found:", uniqueDisciplines)

      // Check for General terms with different possible names
      const possibleGeneralNames = [
        "프로젝트 일반 용어",
        "프로젝트일반용어",
        "일반용어",
        "General",
        "프로젝트 일반용어",
      ]

      const generalTermsFound = []
      for (const name of possibleGeneralNames) {
        const terms = allTerms.filter((term) => term.discipline === name)
        if (terms.length > 0) {
          generalTermsFound.push({ name, count: terms.length, terms: terms.slice(0, 3) })
        }
      }

      results[results.length - 1] = {
        test: "Checking discipline name matching",
        status: "success",
        details: `Found disciplines: ${uniqueDisciplines.join(", ")}. General terms: ${JSON.stringify(generalTermsFound)}`,
      }
      setTestResults([...results])

      // Test 2: Check pending terms specifically
      results.push({ test: "Checking pending terms by discipline", status: "running", details: "Testing..." })
      setTestResults([...results])

      const pendingTerms = allTerms.filter((term) => term.status === "pending")
      const pendingByDiscipline = pendingTerms.reduce(
        (acc, term) => {
          acc[term.discipline] = (acc[term.discipline] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      results[results.length - 1] = {
        test: "Checking pending terms by discipline",
        status: "success",
        details: `Pending by discipline: ${JSON.stringify(pendingByDiscipline, null, 2)}`,
      }
      setTestResults([...results])

      // Test 3: Try to find and approve a General term with exact matching
      results.push({ test: "Finding and testing General term approval", status: "running", details: "Testing..." })
      setTestResults([...results])

      let testTerm = null
      for (const name of possibleGeneralNames) {
        const terms = allTerms.filter((term) => term.discipline === name && term.status === "pending")
        if (terms.length > 0) {
          testTerm = terms[0]
          break
        }
      }

      if (testTerm) {
        console.log("DEBUG: Found test term:", testTerm)
        const approveResult = await approveGlossaryTerm(testTerm.id)
        results[results.length - 1] = {
          test: "Finding and testing General term approval",
          status: approveResult.success ? "success" : "error",
          details: `Term: "${testTerm.en}" (${testTerm.discipline}) - ${approveResult.message}`,
          termId: testTerm.id,
          termName: testTerm.en,
          termDiscipline: testTerm.discipline,
        }
      } else {
        results[results.length - 1] = {
          test: "Finding and testing General term approval",
          status: "error",
          details: "No pending General terms found with any expected discipline name",
        }
      }
      setTestResults([...results])
    } catch (error) {
      results[results.length - 1] = {
        test: "Checking discipline name matching",
        status: "error",
        details: `Error: ${error}`,
      }
      setTestResults([...results])
    }

    // Test 4: Run comprehensive General terms debug
    try {
      results.push({ test: "Comprehensive General terms analysis", status: "running", details: "Analyzing..." })
      setTestResults([...results])

      const debugResult = await debugGeneralTermsIssue()
      results[results.length - 1] = {
        test: "Comprehensive General terms analysis",
        status: debugResult.success ? "success" : "error",
        details: debugResult.success
          ? `Found ${debugResult.data?.allGeneralTerms?.length || 0} total General terms, ${debugResult.data?.pendingGeneral?.length || 0} pending`
          : debugResult.message,
        rawData: debugResult.data,
      }
      setTestResults([...results])
    } catch (error) {
      results[results.length - 1] = {
        test: "Comprehensive General terms analysis",
        status: "error",
        details: `Error: ${error}`,
      }
      setTestResults([...results])
    }

    // Test 5: Check browser console for errors
    results.push({
      test: "Browser console check",
      status: "info",
      details:
        "Check F12 Console for 'DEBUG:' messages and any red errors. Look for RLS policy errors or permission denied messages.",
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
          <Bug className="w-3 h-3 mr-1" />🚨 General 용어 승인 문제 진단 (31개 대기 중)
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
              <p className="text-xs text-gray-700 ml-6 whitespace-pre-wrap">{result.details}</p>
              {result.termId && <p className="text-xs text-blue-600 ml-6 mt-1">Term ID: {result.termId}</p>}
              {result.termDiscipline && (
                <p className="text-xs text-purple-600 ml-6">Discipline: {result.termDiscipline}</p>
              )}
              {result.rawData && (
                <details className="ml-6 mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">Raw Data</summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(result.rawData, null, 2)}
                  </pre>
                </details>
              )}
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
            <strong>Discipline 이름 불일치:</strong> "프로젝트 일반 용어" vs "프로젝트일반용어" 등 공백/특수문자 차이
          </li>
          <li>
            <strong>RLS 정책 문제:</strong> 특정 discipline에 대한 권한 제한
          </li>
          <li>
            <strong>데이터 타입 문제:</strong> discipline 필드의 인코딩 또는 형식 문제
          </li>
          <li>
            <strong>캐싱 문제:</strong> 브라우저나 서버 측 캐싱으로 인한 데이터 불일치
          </li>
        </ul>
      </div>
    </Card>
  )
}
