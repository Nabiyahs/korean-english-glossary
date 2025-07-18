"use client"

import { useState, useEffect } from "react"
import { type GlossaryTerm, type Discipline, disciplineMap, disciplineOrder } from "@/lib/data"
import { DisclaimerContact } from "@/components/disclaimer-contact"
import { GlossaryHeader } from "@/components/glossary-header"
import { DisciplineShortcuts } from "@/components/discipline-shortcuts"
import { GlossaryTable } from "@/components/glossary-table"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserManualContent } from "@/components/user-manual"
import { HelpCircle } from "lucide-react"
import { getGlossaryTerms, deleteGlossaryTerm, addGlossaryTerm } from "./actions"
import { useToast } from "@/hooks/use-toast"
// import { useRouter } from "next/navigation" // No longer redirecting unauthenticated users from main page

export default function Home() {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([])
  const [currentView, setCurrentView] = useState<"discipline" | "all">("discipline")
  const [isVocabularyMode, setIsVocabularyMode] = useState(false)
  const [selectedTerms, setSelectedTerms] = new Set<string>()
  const [highlightedTermId, setHighlightedTermId] = useState<string | null>(null)
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [activeDisciplineForScroll, setActiveDisciplineForScroll] = useState<Discipline | null>(null)
  const [isAdmin, setIsAdmin] = useState(true) // Always true since anyone can be admin now
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Always true
  const { toast } = useToast()
  // const router = useRouter() // No longer needed for redirect

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Remove session checks - just fetch all terms for admin view
        const fetchedTerms = await getGlossaryTerms(undefined, true) // Get all terms
        setGlossary(sortGlossaryTerms(fetchedTerms, true)) // Always use admin view
      } catch (error) {
        console.error("Error fetching initial data:", error)
        setGlossary([])
        toast({
          title: "데이터 로딩 오류",
          description: "용어집 데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    }
    fetchInitialData()
  }, [])

  const sortGlossaryTerms = (terms: GlossaryTerm[], isAdminView: boolean) => {
    if (isAdminView) {
      const pendingTerms = terms.filter((term) => term.status === "pending")
      const approvedTerms = terms.filter((term) => term.status === "approved")

      // Sort pending terms alphabetically by English term
      pendingTerms.sort((a, b) => a.en.localeCompare(b.en))

      // Sort approved terms by discipline then alphabetically by English term
      approvedTerms.sort((a, b) => {
        const disciplineAIndex = disciplineOrder.indexOf(a.discipline)
        const disciplineBIndex = disciplineOrder.indexOf(b.discipline)

        if (disciplineAIndex !== disciplineBIndex) {
          return disciplineAIndex - disciplineBIndex
        }
        return a.en.localeCompare(b.en)
      })

      return [...pendingTerms, ...approvedTerms]
    } else {
      // For non-admin view, just sort approved terms by discipline then English term
      return terms.sort((a, b) => {
        const disciplineAIndex = disciplineOrder.indexOf(a.discipline)
        const disciplineBIndex = disciplineOrder.indexOf(b.discipline)

        if (disciplineAIndex !== disciplineBIndex) {
          return disciplineAIndex - disciplineBIndex
        }
        return a.en.localeCompare(b.en)
      })
    }
  }

  const handleAddTerm = async (
    newTerm: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">,
  ) => {
    const result = await addGlossaryTerm(newTerm)
    if (result.success) {
      toast({
        title: "성공",
        description: result.message,
      })
      // No need to update local state immediately, revalidatePath will handle it
      // For pending terms, they won't appear until approved by admin
    } else {
      toast({
        title: "오류",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleAddTermsFromText = async (
    newTerms: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">[],
  ) => {
    let addedCount = 0
    let duplicateCount = 0
    for (const term of newTerms) {
      const isDuplicate = glossary.some(
        (existingTerm) =>
          existingTerm.en.toLowerCase() === term.en.toLowerCase() &&
          existingTerm.kr.toLowerCase() === term.kr.toLowerCase(),
      )

      if (isDuplicate) {
        duplicateCount++
        continue
      }

      const result = await addGlossaryTerm(term)
      if (result.success) {
        addedCount++
      } else {
        console.error(`Failed to add term ${term.en}: ${result.message}`)
      }
    }

    if (addedCount > 0) {
      toast({
        title: "업로드 완료",
        description: `${addedCount}개의 용어가 추가되었습니다. 관리자 승인 후 표시됩니다.`,
      })
    }
    if (duplicateCount > 0) {
      toast({
        title: "알림",
        description: `${duplicateCount}개의 중복 용어는 건너뛰었습니다.`,
        variant: "default",
      })
    }
    if (addedCount === 0 && duplicateCount === 0) {
      toast({
        title: "알림",
        description: "가져올 유효한 용어가 없습니다.",
        variant: "default",
      })
    }
  }

  const handleDeleteTerm = async (id: string) => {
    const result = await deleteGlossaryTerm(id)
    if (result.success) {
      toast({
        title: "성공",
        description: result.message,
      })
      setGlossary((prev) => prev.filter((term) => term.id !== id))
      setSelectedTerms((prev) => {
        const newSelection = new Set(prev)
        newSelection.delete(id)
        return newSelection
      })
    } else {
      toast({
        title: "오류",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleToggleTermSelection = (id: string, checked: boolean) => {
    setSelectedTerms((prev) => {
      const newSelection = new Set(prev)
      if (checked) {
        newSelection.add(id)
      } else {
        newSelection.delete(id)
      }
      return newSelection
    })
  }

  const handleScrollToDiscipline = (discipline: Discipline) => {
    setActiveDisciplineForScroll(discipline)
    let element: HTMLElement | null = null
    if (currentView === "discipline") {
      element = document.getElementById(`discipline-${discipline}`)
    } else {
      element = document.getElementById(`term-discipline-${disciplineMap[discipline].abbreviation}`)
    }

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleScrollToTerm = (id: string) => {
    setHighlightedTermId(id)
  }

  const disciplines = Object.keys(disciplineMap) as Discipline[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-10 relative">
        <h1 className="text-4xl font-extrabold text-center text-samoo-blue leading-tight tracking-tight">
          English-Korean Technical Glossary
          <br />
          <span className="text-3xl font-semibold text-samoo-gray-medium mt-1 block">한영 기술용어집</span>
        </h1>
        <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-samoo-gray-light text-samoo-gray hover:bg-samoo-gray-medium/20 border-samoo-gray-medium"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              사용 설명서
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <UserManualContent />
          </DialogContent>
        </Dialog>
      </div>

      <DisclaimerContact />

      <GlossaryHeader
        glossary={glossary}
        onViewChange={setCurrentView}
        currentView={currentView}
        onToggleVocabularyMode={setIsVocabularyMode}
        isVocabularyMode={isVocabularyMode}
        selectedTerms={selectedTerms}
        onScrollToTerm={handleScrollToTerm}
        onAddTerm={handleAddTerm}
        onAddTermsFromText={handleAddTermsFromText}
        existingGlossary={glossary}
        // isAuthenticated={isAuthenticated} // Removed this prop
      />

      <DisciplineShortcuts
        disciplines={disciplines}
        onScrollToDiscipline={handleScrollToDiscipline}
        currentView={currentView}
        activeDisciplineForScroll={activeDisciplineForScroll}
      />

      <GlossaryTable
        glossary={glossary}
        currentView={currentView}
        isVocabularyMode={isVocabularyMode}
        selectedTerms={selectedTerms}
        onToggleTermSelection={handleToggleTermSelection}
        highlightedTermId={highlightedTermId}
        onDeleteTerm={handleDeleteTerm}
        isAdmin={isAdmin}
      />

      <ScrollToTopButton />
    </div>
  )
}
