"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { type GlossaryTerm, disciplineMap } from "@/lib/data"
import { Search, AlertTriangle, RefreshCw } from "lucide-react"
import { detectDuplicateTerms } from "@/app/actions"

export function DuplicateTermsSection() {
  const [duplicates, setDuplicates] = useState<GlossaryTerm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  const checkForDuplicates = async () => {
    setIsLoading(true)
    try {
      const result = await detectDuplicateTerms()
      if (result.success) {
        setDuplicates(result.duplicates)
        setHasChecked(true)
      }
    } catch (error) {
      console.error("Error checking duplicates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-check on component mount
    checkForDuplicates()
  }, [])

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-samoo-gray flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          중복 용어 검사
        </h3>
        <Button
          onClick={checkForDuplicates}
          disabled={isLoading}
          size="sm"
          className="px-3 py-2 text-sm bg-samoo-blue text-white hover:bg-samoo-blue-dark"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              검사 중...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              다시 검사
            </>
          )}
        </Button>
      </div>

      {hasChecked && (
        <div className="mb-4">
          {duplicates.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm font-medium">✅ 중복된 용어가 발견되지 않았습니다.</p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium mb-3">
                ⚠️ {duplicates.length}개의 중복 용어가 발견되었습니다.
              </p>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-amber-100">
                    <tr>
                      <th className="p-2 text-xs font-medium text-amber-800">공종</th>
                      <th className="p-2 text-xs font-medium text-amber-800">English</th>
                      <th className="p-2 text-xs font-medium text-amber-800">한국어</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicates.map((term) => (
                      <tr key={term.id} className="border-b border-amber-200/50">
                        <td className="p-2 text-xs">
                          <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded text-xs">
                            {disciplineMap[term.discipline].abbreviation}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-amber-800">{term.en}</td>
                        <td className="p-2 text-xs text-amber-800">{term.kr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-samoo-gray-medium">
        💡 <strong>팁:</strong> "모두 승인" 버튼을 클릭하면 중복 용어가 있을 경우 자동으로 확인 창이 표시됩니다.
      </p>
    </Card>
  )
}
