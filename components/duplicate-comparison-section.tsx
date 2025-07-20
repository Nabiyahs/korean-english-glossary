"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { type GlossaryTerm, type Discipline, disciplineMap } from "@/lib/data"
import { AlertTriangle, Check, Edit, Trash2, RefreshCw } from "lucide-react"
import { detectDuplicateTerms, approveGlossaryTerm, updateGlossaryTerm, rejectGlossaryTerm } from "@/app/actions"
import type { DuplicatePair } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface DuplicateComparisonSectionProps {
  onDuplicatesChange: (hasDuplicates: boolean) => void
}

export function DuplicateComparisonSection({ onDuplicatesChange }: DuplicateComparisonSectionProps) {
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    en: string
    kr: string
    description: string
    discipline: Discipline
  } | null>(null)
  const { toast } = useToast()

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  const checkForDuplicates = async () => {
    setIsLoading(true)
    try {
      const result = await detectDuplicateTerms()
      if (result.success) {
        setDuplicates(result.duplicates)
        onDuplicatesChange(result.duplicates.length > 0)
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error checking duplicates:", error)
      toast({ title: "오류", description: "중복 검사 중 오류가 발생했습니다.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkForDuplicates()
  }, [])

  const handleApprove = async (pendingTerm: GlossaryTerm) => {
    const result = await approveGlossaryTerm(pendingTerm.id)
    if (result.success) {
      toast({ title: "성공", description: result.message })
      await checkForDuplicates() // Refresh duplicates
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  const handleDelete = async (pendingTerm: GlossaryTerm) => {
    if (confirm(`"${pendingTerm.en}" 용어를 삭제하시겠습니까?`)) {
      const result = await rejectGlossaryTerm(pendingTerm.id)
      if (result.success) {
        toast({ title: "성공", description: result.message })
        await checkForDuplicates() // Refresh duplicates
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" })
      }
    }
  }

  const handleEdit = (pendingTerm: GlossaryTerm) => {
    setEditingId(pendingTerm.id)
    setEditForm({
      en: pendingTerm.en,
      kr: pendingTerm.kr,
      description: pendingTerm.description || "",
      discipline: pendingTerm.discipline,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return

    const result = await updateGlossaryTerm(editingId, editForm)
    if (result.success) {
      toast({ title: "성공", description: result.message })
      setEditingId(null)
      setEditForm(null)
      await checkForDuplicates() // Refresh duplicates
    } else {
      toast({ title: "오류", description: result.message, variant: "destructive" })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  if (isLoading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          <span>중복 용어 검사 중...</span>
        </div>
      </Card>
    )
  }

  if (duplicates.length === 0) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-green-800 font-medium">중복된 용어가 없습니다.</span>
          </div>
          <Button onClick={checkForDuplicates} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 검사
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-700">중복 용어 발견 ({duplicates.length}개)</h3>
        </div>
        <Button onClick={checkForDuplicates} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 검사
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-amber-800 text-sm">
          ⚠️ 중복 용어가 있는 동안에는 "모두 승인" 및 "모두 거부" 기능이 비활성화됩니다. 각 중복 용어를 개별적으로
          처리해주세요.
        </p>
      </div>

      <div className="space-y-6">
        {duplicates.map((duplicate, index) => (
          <div key={duplicate.pendingTerm.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50/30">
            <h4 className="text-md font-semibold text-samoo-gray mb-4">중복 용어 {index + 1}</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Term (Left) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-blue-700">대기 중인 용어</h5>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(duplicate.pendingTerm)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={editingId === duplicate.pendingTerm.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      승인
                    </Button>
                    <Button
                      onClick={() => handleEdit(duplicate.pendingTerm)}
                      size="sm"
                      variant="outline"
                      disabled={editingId === duplicate.pendingTerm.id}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      onClick={() => handleDelete(duplicate.pendingTerm)}
                      size="sm"
                      variant="destructive"
                      disabled={editingId === duplicate.pendingTerm.id}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>

                {editingId === duplicate.pendingTerm.id && editForm ? (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div>
                      <Label className="text-sm font-medium">English</Label>
                      <Input
                        value={editForm.en}
                        onChange={(e) => setEditForm({ ...editForm, en: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">한국어</Label>
                      <Input
                        value={editForm.kr}
                        onChange={(e) => setEditForm({ ...editForm, kr: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">설명</Label>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">공종</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {disciplines.map((discipline) => (
                          <Button
                            key={discipline}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, discipline })}
                            className={cn(
                              "px-2 py-1 text-xs font-medium rounded-md transition-colors h-auto min-h-[2rem] text-center",
                              editForm.discipline === discipline
                                ? "bg-samoo-blue text-white hover:bg-samoo-blue-dark"
                                : "bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20 border border-samoo-gray-medium",
                            )}
                          >
                            <span className="block">{disciplineMap[discipline].koreanName}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        저장
                      </Button>
                      <Button onClick={handleCancelEdit} size="sm" variant="outline">
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div>
                      <span className="text-xs font-medium text-blue-700">공종:</span>
                      <div className="mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {disciplineMap[duplicate.pendingTerm.discipline].abbreviation}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">English:</span>
                      <div className="mt-1 font-medium">{duplicate.pendingTerm.en}</div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">한국어:</span>
                      <div className="mt-1 font-medium">{duplicate.pendingTerm.kr}</div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">설명:</span>
                      <div className="mt-1 text-sm">{duplicate.pendingTerm.description || "설명 없음"}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Term (Right) */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">기존 승인된 용어</h5>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <span className="text-xs font-medium text-gray-700">공종:</span>
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                        {disciplineMap[duplicate.existingTerm.discipline].abbreviation}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700">English:</span>
                    <div className="mt-1 font-medium">{duplicate.existingTerm.en}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700">한국어:</span>
                    <div className="mt-1 font-medium">{duplicate.existingTerm.kr}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700">설명:</span>
                    <div className="mt-1 text-sm">{duplicate.existingTerm.description || "설명 없음"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
