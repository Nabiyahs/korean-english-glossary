import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, List, Table, BookOpen, Plus, Download, Upload, MousePointer, CheckCircle } from "lucide-react"

export function UserManualContent() {
  return (
    <div className="p-4">
      <DialogTitle className="text-xl font-bold text-samoo-blue mb-2">사용 설명서</DialogTitle>
      <DialogDescription className="text-sm text-samoo-gray-medium mb-6">
        주요 기능을 간단히 안내합니다.
      </DialogDescription>

      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-start gap-3 p-3 bg-samoo-gray-light/30 rounded-lg border border-samoo-gray-light">
          <div className="w-8 h-8 bg-samoo-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-samoo-blue text-sm mb-1">용어 검색</h3>
            <div className="flex items-center gap-2 text-xs text-samoo-gray">
              <span>검색창에 입력</span>
              <MousePointer className="w-3 h-3 text-samoo-gray-medium" />
              <span>결과 클릭하여 이동</span>
            </div>
          </div>
        </div>

        {/* View Modes */}
        <div className="flex items-start gap-3 p-3 bg-samoo-gray-light/30 rounded-lg border border-samoo-gray-light">
          <div className="w-8 h-8 bg-samoo-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <List className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-samoo-blue text-sm mb-2">보기 모드</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs text-samoo-gray bg-white px-2 py-1 rounded border border-samoo-gray-medium/30">
                <List className="w-3 h-3 text-samoo-blue" />
                <span>공종별</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-samoo-gray bg-white px-2 py-1 rounded border border-samoo-gray-medium/30">
                <Table className="w-3 h-3 text-samoo-blue" />
                <span>전체</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulary Mode */}
        <div className="flex items-start gap-3 p-3 bg-samoo-gray-light/30 rounded-lg border border-samoo-gray-light">
          <div className="w-8 h-8 bg-samoo-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-samoo-blue text-sm mb-2">단어장 생성</h3>
            <div className="flex items-center gap-2 text-xs text-samoo-gray">
              <span>토글 ON</span>
              <CheckCircle className="w-3 h-3 text-samoo-blue" />
              <span>용어 선택</span>
              <Download className="w-3 h-3 text-samoo-blue" />
              <span>Excel 다운로드</span>
            </div>
          </div>
        </div>

        {/* Add Terms */}
        <div className="flex items-start gap-3 p-3 bg-samoo-gray-light/30 rounded-lg border border-samoo-gray-light">
          <div className="w-8 h-8 bg-samoo-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-samoo-blue text-sm mb-2">용어 추가</h3>
            <div className="flex gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-samoo-gray bg-white px-2 py-1 rounded border border-samoo-gray-medium/30">
                <Plus className="w-3 h-3 text-samoo-blue" />
                <span>직접 입력</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-samoo-gray bg-white px-2 py-1 rounded border border-samoo-gray-medium/30">
                <Upload className="w-3 h-3 text-samoo-blue" />
                <span>파일 업로드</span>
              </div>
            </div>
            <div className="text-xs text-samoo-gray font-medium">💡 관리자 승인 후 표시</div>
          </div>
        </div>
      </div>
    </div>
  )
}
