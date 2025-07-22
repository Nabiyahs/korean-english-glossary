export type Discipline =
  | "General"
  | "Architecture"
  | "Electrical"
  | "Piping"
  | "Civil"
  | "Instrument & Control"
  | "Fire Protection"
  | "HVAC"
  | "Structure"
  | "Cell"

export interface GlossaryTerm {
  id: string
  en: string
  kr: string
  description: string
  discipline: Discipline
  abbreviation: string
  status: "pending" | "approved"
  created_at: string
  created_by: string
}

export const disciplineMap: Record<
  Discipline,
  { abbreviation: string; color: string; koreanName: string; englishName: string }
> = {
  General: {
    abbreviation: "Gen",
    color: "bg-discipline-general",
    koreanName: "일반",
    englishName: "General",
  },
  Architecture: {
    abbreviation: "Arch",
    color: "bg-discipline-arch",
    koreanName: "건축",
    englishName: "Architecture",
  },
  Electrical: {
    abbreviation: "Elec",
    color: "bg-discipline-elec",
    koreanName: "전기",
    englishName: "Electrical",
  },
  Piping: {
    abbreviation: "Piping",
    color: "bg-discipline-piping",
    koreanName: "배관",
    englishName: "Piping",
  },
  Civil: {
    abbreviation: "Civil",
    color: "bg-discipline-civil",
    koreanName: "토목",
    englishName: "Civil",
  },
  "Instrument & Control": {
    abbreviation: "I&C",
    color: "bg-discipline-ic",
    koreanName: "제어",
    englishName: "Instrument & Control",
  },
  "Fire Protection": {
    abbreviation: "FP",
    color: "bg-discipline-fp",
    koreanName: "소방",
    englishName: "Fire Protection",
  },
  HVAC: {
    abbreviation: "HVAC",
    color: "bg-discipline-hvac",
    koreanName: "공조",
    englishName: "HVAC",
  },
  Structure: {
    abbreviation: "Struct",
    color: "bg-discipline-struct",
    koreanName: "구조",
    englishName: "Structure",
  },
  Cell: {
    abbreviation: "Cell",
    color: "bg-discipline-cell",
    koreanName: "배터리",
    englishName: "Cell",
  },
}

// Helper function to find discipline by abbreviation (for file uploads)
export function getDisciplineByAbbreviation(abbreviation: string): Discipline | null {
  const discipline = Object.keys(disciplineMap).find(
    (key) => disciplineMap[key as Discipline].abbreviation.toLowerCase() === abbreviation.toLowerCase(),
  ) as Discipline | undefined

  return discipline || null
}

// A fixed order used for consistent sorting throughout the app
export const disciplineOrder: Discipline[] = [
  "General",
  "Architecture",
  "Electrical",
  "Piping",
  "Civil",
  "Instrument & Control",
  "Fire Protection",
  "HVAC",
  "Structure",
  "Cell",
]

export const initialGlossary: GlossaryTerm[] = []
