"use client"

import { Building2 } from "lucide-react"

export function SimpleFooter() {
  return (
    <footer className="bg-slate-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
          {/* Company Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-center md:text-left">
              <div className="text-sm font-semibold text-white">SAMOO Architects & Engineers</div>
              <div className="text-xs text-gray-300">삼우종합건축사사무소</div>
            </div>
          </div>

          {/* Copyright & Attribution */}
          <div className="text-center md:text-right">
            <div className="text-xs text-gray-400">© 2024 SAMOO. All rights reserved.</div>
            <div className="text-xs text-blue-300">하이테크 1본부 · 한영 기술용어집</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
