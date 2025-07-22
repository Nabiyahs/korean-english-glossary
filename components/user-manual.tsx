import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, List, BookOpen, Plus } from "lucide-react"

export function UserManualContent() {
  return (
    <div className="p-4">
      <DialogTitle className="text-2xl font-bold text-samoo-blue mb-4">사용 설명서</DialogTitle>
      <DialogDescription className="text-samoo-gray-medium mb-6">
        한영 기술용어집의 주요 기능을 간략하게 안내해 드립니다.
      </DialogDescription>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-samoo-gray-light/50 p-4 rounded-lg border border-samoo-gray-light">
          <h3 className="text-lg font-semibold text-samoo-blue mb-3 flex items-center">
            <Search className="w-5 h-5 mr-2" /> 용어 검색
          </h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>상단 검색창에 영어, 한국어, 또는 설명의 일부를 입력하여 용어를 검색합니다.</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>검색 결과를 클릭하면 해당 용어가 표에서 강조됩니다.</span>
            </div>
          </div>
        </div>

        <div className="bg-samoo-gray-light/50 p-4 rounded-lg border border-samoo-gray-light">
          <h3 className="text-lg font-semibold text-samoo-blue mb-3 flex items-center">
            <List className="w-5 h-5 mr-2" /> 보기 모드
          </h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <span className="font-medium">공종별:</span> 용어를 공종별로 분류하여 표시
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <span className="font-medium">전체:</span> 모든 용어를 하나의 표에 표시
              </span>
            </div>
          </div>
        </div>

        <div className="bg-samoo-gray-light/50 p-4 rounded-lg border border-samoo-gray-light">
          <h3 className="text-lg font-semibold text-samoo-blue mb-3 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" /> 단어장 생성
          </h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>
                "단어장 생성" 토글을 켜면 체크박스가 나타나며, 원하는 용어를 선택하여 Excel로 다운로드할 수 있습니다.
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>공종별 보기에서는 각 공종의 "Excel" 버튼으로 해당 공종 전체를 다운로드할 수 있습니다.</span>
            </div>
          </div>
        </div>

        <div className="bg-samoo-gray-light/50 p-4 rounded-lg border border-samoo-gray-light">
          <h3 className="text-lg font-semibold text-samoo-blue mb-3 flex items-center">
            <Plus className="w-5 h-5 mr-2" /> 용어 추가
          </h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <span className="font-medium">직접 입력:</span> 영어, 한국어, 공종을 선택하여 개별 용어 추가
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-samoo-gray">
              <div className="w-1.5 h-1.5 bg-samoo-blue rounded-full mt-1.5 flex-shrink-0" />
              <span>
                <span className="font-medium">파일 업로드:</span> 템플릿을 다운로드하여 여러 용어를 한 번에 추가
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
