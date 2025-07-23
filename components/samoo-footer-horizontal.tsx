"use client"

export function SamooFooterHorizontal() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* SAMOO CI Logo - Horizontal Layout */}
          <div className="flex items-baseline space-x-3">
            <div className="text-2xl font-bold tracking-wide" style={{ color: "#0047AB" }}>
              SAMOO
            </div>
            <div className="text-sm font-medium tracking-wider" style={{ color: "#0047AB" }}>
              ARCHITECTS & ENGINEERS
            </div>
          </div>

          {/* Department Info */}
          <div className="text-center sm:text-right">
            <div className="text-sm font-medium text-gray-600">하이테크 1본부</div>
            <div className="text-xs text-gray-500">한영 기술용어집</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
