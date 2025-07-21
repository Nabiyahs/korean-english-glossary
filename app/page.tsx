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
import { formatEnglishTerm, formatKoreanTerm, formatDescription } from "@/lib/text-formatting"

export default function Home() {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([])
  const [currentView, setCurrentView] = useState<"discipline" | "all">("discipline")
  const [isVocabularyMode, setIsVocabularyMode] = useState(false)
  const [selectedTerms, setSelectedTerms] = useState(new Set<string>()) // Fixed: use useState instead of direct assignment
  const [highlightedTermId, setHighlightedTermId] = useState<string | null>(null)
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [activeDisciplineForScroll, setActiveDisciplineForScroll] = useState<Discipline | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Only fetch approved terms for regular users
        const fetchedTerms = await getGlossaryTerms("approved", false)
        setGlossary(sortGlossaryTermsForUsers(fetchedTerms))
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
  }, [toast]) // Add toast to dependencies

  const sortGlossaryTermsForUsers = (terms: GlossaryTerm[]) => {
    // For regular users, just sort by discipline then English term
    return terms.sort((a, b) => {
      const disciplineAIndex = disciplineOrder.indexOf(a.discipline)
      const disciplineBIndex = disciplineOrder.indexOf(b.discipline)

      if (disciplineAIndex !== disciplineBIndex) {
        return disciplineAIndex - disciplineBIndex
      }
      return a.en.localeCompare(b.en)
    })
  }

  const handleAddTerm = async (
    newTerm: Omit<GlossaryTerm, "id" | "abbreviation" | "status" | "created_at" | "created_by">,
  ) => {
    // Format the term before adding
    const formattedTerm = {
      ...newTerm,
      en: formatEnglishTerm(newTerm.en),
      kr: formatKoreanTerm(newTerm.kr),
      description: formatDescription(newTerm.description),
    }

    const result = await addGlossaryTerm(formattedTerm)
    // Remove toast notification - let the form handle the success message
    return result
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

      // Format the term before adding
      const formattedTerm = {
        ...term,
        en: formatEnglishTerm(term.en),
        kr: formatKoreanTerm(term.kr),
        description: formatDescription(term.description),
      }

      const result = await addGlossaryTerm(formattedTerm)
      if (result.success) {
        addedCount++
      } else {
        console.error(`Failed to add term ${term.en}: ${result.message}`)
      }
    }

    // Remove all toast notifications - let the form handle the success message
    return { addedCount, duplicateCount }
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
    // Toggle functionality: if clicking the same discipline, unselect it
    if (activeDisciplineForScroll === discipline) {
      setActiveDisciplineForScroll(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Mobile-optimized title section with relocated help button */}
      <div className="mb-4 sm:mb-8 relative">
        <div className="text-center mb-3 sm:mb-0">
          <h1 className="text-xl sm:text-4xl font-bold sm:font-extrabold text-samoo-blue leading-tight tracking-tight">
            English-Korean Technical Glossary
            <br />
            <span className="text-lg sm:text-3xl font-medium sm:font-semibold text-samoo-gray-medium mt-1 block">
              한영 기술용어집
            </span>
          </h1>
        </div>
        {/* Help button - positioned in top right corner on desktop, centered below title on mobile */}
        <div className="flex justify-center sm:absolute sm:top-0 sm:right-0">
          <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm bg-white/80 backdrop-blur-sm text-samoo-blue hover:bg-samoo-blue/10 border-samoo-blue/30 shadow-sm"
              >
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                사용 설명서
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <UserManualContent />
            </DialogContent>
          </Dialog>
        </div>
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
        isAdmin={false} // Regular users are not admin
      />

      <ScrollToTopButton />
    </div>
  )
}
