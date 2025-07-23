"use client"

import Image from "next/image"

export function InternalFooter() {
  return (
    <footer className="bg-white border-t-4 border-[#0047AB] mt-12">
      {/* Main Footer Content */}
      <div className="bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* SAMOO CI Logo */}
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src="/images/samoo-ci-horizontal.png"
                  alt="SAMOO Architects & Engineers"
                  width={280}
                  height={60}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
            </div>

            {/* Department Information - Balanced Korean Typography */}
            <div className="text-center lg:text-right space-y-0.5">
              <div
                className="text-base font-bold text-[#0047AB] tracking-wide"
                style={{
                  fontFamily: "'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                하이테크설계사업부
              </div>
              <div
                className="text-sm font-medium text-[#0047AB]/75 tracking-wide"
                style={{
                  fontFamily: "'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                하이테크 1본부
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
