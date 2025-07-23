"use client"

export function SamooFooterMinimal() {
  return (
    <footer className="bg-white border-t border-gray-50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-center space-x-6">
          {/* SAMOO A&E - Compact Version */}
          <div className="text-xl font-bold tracking-wide" style={{ color: "#0047AB" }}>
            SAMOO A&E
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          {/* Department */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">하이테크 1본부</span>
            <span className="mx-2 text-gray-400">·</span>
            <span>한영 기술용어집</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
