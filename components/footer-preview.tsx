"use client"

import { Building2, Phone, MapPin } from "lucide-react"

export function FooterPreview() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mock content to show footer in context */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">한영 기술용어집</h1>
          <p className="text-gray-600 mb-8">Footer preview - scroll down to see the footer</p>
          <div className="space-y-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold">Sample Content {i + 1}</h3>
                <p className="text-gray-600">This is sample content to demonstrate the footer placement.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SAMOO Footer - Concise Internal Version */}
      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Company Identity */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">SAMOO</h3>
                <p className="text-blue-300 text-sm">Architects & Engineers</p>
              </div>
            </div>

            {/* Department & Contact */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end space-x-4 mb-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-blue-300" />
                  <span>강남파이낸스센터 27층</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Phone className="w-4 h-4 text-blue-300" />
                  <span>02-3430-8888</span>
                </div>
              </div>
              <div className="text-blue-300 font-medium">하이테크 1본부</div>
              <div className="text-xs text-gray-400">한영 기술용어집 · 내부용</div>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-0.5 bg-gradient-to-r from-blue-600 to-blue-500"></div>
      </footer>
    </div>
  )
}
