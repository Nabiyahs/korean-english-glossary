/**
 * Formats English text with proper capitalization
 * First letter uppercase, rest lowercase, except for abbreviations
 */
export function formatEnglishTerm(text: string): string {
  if (!text) return text

  // Split by spaces to handle multiple words
  const words = text.trim().split(/\s+/)

  return words
    .map((word) => {
      // Check if word looks like an abbreviation (all caps, or mixed with periods/hyphens)
      const isAbbreviation =
        /^[A-Z]{2,}$/.test(word) || /^[A-Z]+[.\-&/][A-Z]+/.test(word) || /^[A-Z][a-z]*[A-Z]/.test(word) // CamelCase

      if (isAbbreviation) {
        // For abbreviations, keep original case or make each letter after separator uppercase
        return word.replace(/([.\-&/])([a-z])/g, (match, separator, letter) => separator + letter.toUpperCase())
      } else {
        // For regular words, capitalize first letter and lowercase the rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
    })
    .join(" ")
}

/**
 * Formats Korean text (basic cleanup)
 */
export function formatKoreanTerm(text: string): string {
  return text.trim()
}

/**
 * Formats description text
 */
export function formatDescription(text: string): string {
  return text.trim()
}
