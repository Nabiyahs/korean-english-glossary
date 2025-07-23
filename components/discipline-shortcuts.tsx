"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { type Discipline, disciplineMap } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  FileText,
  Building,
  Zap,
  Wrench,
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
  selectedDiscipline: Discipline | null
  onDisciplineSelect: (discipline: Discipline) => void
}

const disciplineIcons: Record<Discipline, React.ElementType> = {
  General: FileText, // Changed to FileText for document/office context
  Architecture: Building,
  Electrical: Zap,
  Piping: Wrench,
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
  selectedDiscipline,
  onDisciplineSelect,
}: DisciplineShortcutsProps) {
  const handleDisciplineClick = (discipline: Discipline) => {
    if (currentView === "discipline") {
      // In discipline view, select the discipline to display
      onDisciplineSelect(discipline)
    } else {
      // In all view, scroll to discipline
      if (activeDisciplineForScroll === discipline) {
        window.scrollTo({ top: 0, behavior: "smooth" })
        onScrollToDiscipline(discipline)
      } else {
        const abbreviation = disciplineMap[discipline]?.abbreviation || discipline
        onScrollToDiscipline(discipline)
      }
    }
  }

  const getActiveState = (discipline: Discipline) => {
    if (currentView === "discipline") {
      return selectedDiscipline === discipline
    } else {
      return activeDisciplineForScroll === discipline
    }
  }

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Horizontal scroll with compact sizing */}
      <div className="sm:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {disciplines.map((discipline) => {
            const Icon = disciplineIcons[discipline]
            const koreanName = disciplineMap[discipline].koreanName
            const isActive = getActiveState(discipline)

            return (
              <Button
                key={discipline}
                onClick={() => handleDisciplineClick(discipline)}
                className={cn(
                  "px-2 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 min-w-fit",
                  isActive
                    ? "bg-samoo-blue text-white border-samoo-blue hover:bg-samoo-blue-dark"
                    : "bg-samoo-gray-button-default text-samoo-gray-medium border-samoo-gray-light hover:bg-samoo-gray-button-hover",
                )}
              >
                <Icon className="w-3 h-3" />
                {koreanName}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Flex wrap */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {disciplines.map((discipline) => {
          const Icon = disciplineIcons[discipline]
          const koreanName = disciplineMap[discipline].koreanName
          const isActive = getActiveState(discipline)

          return (
            <Button
              key={discipline}
              onClick={() => handleDisciplineClick(discipline)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-2",
                isActive
                  ? "bg-samoo-blue text-white border-samoo-blue hover:bg-samoo-blue-dark"
                  : "bg-samoo-gray-button-default text-samoo-gray-medium border-samoo-gray-light hover:bg-samoo-gray-button-hover",
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
