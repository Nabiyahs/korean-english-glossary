"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type GlossaryTerm, type Discipline, disciplineMap } from "@/lib/data"
import { AlertTriangle, Check, Edit, Trash2, RefreshCw, X, Save } from "lucide-react"
import { detectDuplicateTerms, approveGlossaryTerm, updateGlossaryTerm, rejectGlossaryTerm } from "@/app/actions"
import type { DuplicatePair } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

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
      <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-4">
        <div className="flex items-center">
          <RefreshCw className="w-3 h-3 mr-2 animate-spin text-amber-600" />
          <span className="text-xs text-amber-800">중복 검사 중...</span>
        </div>
      </div>
    )
  }

  if (duplicates.length === 0) {
    return null // Don't show anything when no duplicates
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
          <span className="text-xs font-medium text-amber-800">중복 용어 {duplicates.length}개</span>
        </div>
        <Button onClick={checkForDuplicates} size="sm" variant="ghost" className="text-xs px-1 py-0 h-5">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Ultra compact row layout */}
      <div className="space-y-1">
        {duplicates.map((duplicate) => (
          <div key={duplicate.pendingTerm.id} className="flex items-center gap-2 text-xs bg-white/50 rounded px-2 py-1">
            {editingId === duplicate.pendingTerm.id && editForm ? (
              <>
                <div className="flex-1 grid grid-cols-4 gap-1">
                  <Input
                    value={editForm.en}
                    onChange={(e) => setEditForm({ ...editForm, en: e.target.value })}
                    className="text-xs h-5 px-1"
                    placeholder="EN"
                  />
                  <Input
                    value={editForm.kr}
                    onChange={(e) => setEditForm({ ...editForm, kr: e.target.value })}
                    className="text-xs h-5 px-1"
                    placeholder="KR"
                  />
                  <Input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="text-xs h-5 px-1"
                    placeholder="설명"
                  />
                  <select
                    value={editForm.discipline}
                    onChange={(e) => setEditForm({ ...editForm, discipline: e.target.value as Discipline })}
                    className="text-xs h-5 px-1 border rounded"
                  >
                    {disciplines.map((discipline) => (
                      <option key={discipline} value={discipline}>
                        {disciplineMap[discipline].abbreviation}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-0.5">
                  <Button onClick={handleSaveEdit} size="sm" className="h-5 w-5 p-0 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button onClick={handleCancelEdit} size="sm" variant="outline" className="h-5 w-5 p-0 bg-transparent">
                    <X className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {disciplineMap[duplicate.pendingTerm.discipline].abbreviation}
                </span>
                <span className="font-medium">{duplicate.pendingTerm.en}</span>
                <span className="font-medium">{duplicate.pendingTerm.kr}</span>
                <span className="text-gray-600 flex-1 truncate">{duplicate.pendingTerm.description || "설명없음"}</span>
                <span className="text-gray-500">vs</span>
                <span className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                  {disciplineMap[duplicate.existingTerm.discipline].abbreviation}
                </span>
                <span className="text-gray-600">{duplicate.existingTerm.en}</span>
                <div className="flex gap-0.5 ml-2">
                  <Button
                    onClick={() => handleApprove(duplicate.pendingTerm)}
                    size="sm"
                    className="h-5 w-5 p-0 bg-green-600 hover:bg-green-700"
                    disabled={editingId === duplicate.pendingTerm.id}
                    title="승인"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => handleEdit(duplicate.pendingTerm)}
                    size="sm"
                    variant="outline"
                    className="h-5 w-5 p-0"
                    disabled={editingId === duplicate.pendingTerm.id}
                    title="수정"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(duplicate.pendingTerm)}
                    size="sm"
                    variant="destructive"
                    className="h-5 w-5 p-0"
                    disabled={editingId === duplicate.pendingTerm.id}
                    title="삭제"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-amber-700 mt-2">💡 중복 용어가 있어도 "모두 승인/거부" 사용 가능합니다.</p>
    </div>
  )
}
