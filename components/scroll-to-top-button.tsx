"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  return (
    <Button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-opacity duration-300",
        "bg-samoo-blue text-white hover:bg-samoo-blue-dark",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      size="icon"
    >
      <ArrowUp className="w-5 h-5" />
      <span className="sr-only">맨 위로 스크롤</span>
    </Button>
  )
}
