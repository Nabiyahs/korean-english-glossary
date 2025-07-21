"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { type Discipline, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Briefcase,
  Building,
  Zap,
  PipetteIcon as Pipe,
  Mountain,
  Gauge,
  FireExtinguisher,
  Fan,
  Columns,
  BatteryCharging,
} from "lucide-react"

interface DisciplineShortcutsProps {
  disciplines: Discipline[]
  onScrollToDiscipline: (discipline: Discipline) => void
  currentView: "discipline" | "all"
  activeDisciplineForScroll: Discipline | null
}

const disciplineIcons: Record<Discipline, React.ElementType> = {
  "프로젝트 일반 용어": Briefcase,
  Architecture: Building,
  Electrical: Zap,
  Piping: Pipe,
  Civil: Mountain,
  "Instrument & Control": Gauge,
  "Fire Protection": FireExtinguisher,
  HVAC: Fan,
  Structure: Columns,
  Cell: BatteryCharging,
}

export function DisciplineShortcuts({
  disciplines,
  onScrollToDiscipline,
  currentView,
  activeDisciplineForScroll,
}: DisciplineShortcutsProps) {
  const handleDisciplineClick = (discipline: Discipline) => {
    // Toggle functionality: if already active, deactivate it
    if (activeDisciplineForScroll === discipline) {
      // Scroll to top of page to "unselect"
      window.scrollTo({ top: 0, behavior: "smooth" })
      // The parent component should handle setting activeDisciplineForScroll to null
      onScrollToDiscipline(discipline) // This will trigger the parent to handle the toggle
    } else {
      onScrollToDiscipline(discipline)
    }
  }

  return (
    <div className="mb-4 sm:mb-6">
      {/* Mobile: Horizontal scroll with more compact sizing */}
      <div className="sm:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide px-1">
          {disciplines.map((discipline) => {
            const Icon = disciplineIcons[discipline]
            const koreanName = disciplineMap[discipline].koreanName
            const isActive = activeDisciplineForScroll === discipline

            return (
              <Button
                key={discipline}
                onClick={() => handleDisciplineClick(discipline)}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 min-w-fit border",
                  isActive
                    ? "bg-samoo-blue text-white border-samoo-blue hover:bg-samoo-blue-dark shadow-sm"
                    : "bg-white text-samoo-gray border-samoo-gray-light hover:bg-samoo-blue/5 hover:border-samoo-blue/30",
                )}
              >
                <Icon className="w-3 h-3" />
                {koreanName}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Improved flex wrap with better spacing */}
      <div className="hidden sm:flex flex-wrap gap-2 justify-center">
        {disciplines.map((discipline) => {
          const Icon = disciplineIcons[discipline]
          const koreanName = disciplineMap[discipline].koreanName
          const isActive = activeDisciplineForScroll === discipline

          return (
            <Button
              key={discipline}
              onClick={() => handleDisciplineClick(discipline)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 border shadow-sm hover:shadow-md",
                isActive
                  ? "bg-samoo-blue text-white border-samoo-blue hover:bg-samoo-blue-dark transform scale-105"
                  : "bg-white text-samoo-gray border-samoo-gray-light hover:bg-samoo-blue/5 hover:border-samoo-blue/30 hover:text-samoo-blue",
              )}
            >
              <Icon className="w-4 h-4" />
              {koreanName}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
