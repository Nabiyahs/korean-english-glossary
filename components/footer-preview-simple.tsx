"use client"

import { SimpleFooter } from "./simple-footer"

export function SimpleFooterPreview() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mock content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">한영 기술용어집</h1>
          <p className="text-gray-600 mb-8">Simple footer preview - scroll down to see the footer</p>
          <div className="space-y-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold">Sample Content {i + 1}</h3>
                <p className="text-gray-600">This is sample content to demonstrate the simple footer.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <SimpleFooter />
    </div>
  )
}
