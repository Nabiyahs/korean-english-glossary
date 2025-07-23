"use client"

import { InternalFooter } from "./internal-footer"

export function InternalFooterPreview() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mock content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0047AB] mb-4">한영 기술용어집</h1>
          <p className="text-gray-600 mb-8">Bold and professional SAMOO CI footer with official branding</p>
          <div className="space-y-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-[#0047AB] mb-2">Technical Term {i + 1}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">English:</span>
                    <span className="ml-2 text-gray-600">Sample Technical Term</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">한국어:</span>
                    <span className="ml-2 text-gray-600">샘플 기술 용어</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Sample glossary content demonstrating the bold and professional SAMOO footer design.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bold Professional Footer */}
      <InternalFooter />
    </div>
  )
}
