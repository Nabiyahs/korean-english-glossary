import { Card } from "@/components/ui/card"
import { Mail } from "lucide-react"

export function DisclaimerContact() {
  return (
    <Card className="mb-8 border-none shadow-sm bg-samoo-gray-light/50 rounded-lg p-4">
      <div className="border-l-4 border-samoo-blue pl-4 pb-2">
        <p className="text-base text-samoo-gray leading-relaxed">
          이 용어집은 SAMOO 하이테크 1본부에서 해외 설계사 및 건설사와의 프로젝트 회의 통역 및 번역 업무를 통해 축적된
          실무 용어집을 기반으로 작성되었습니다. 각 용어는 관련성과 실무 활용도에 따라 해당 공종으로 분류하였으며, 여러
          공종에 공통으로 사용되는 용어의 경우 주요 적용 분야를 기준으로 배치하였습니다. 보다 정확하고 완성도 높은
          용어집 구축을 위해 피드백과 수정 제안을 환영합니다.
        </p>
      </div>
      <div className="flex items-center text-sm font-medium text-samoo-blue pt-2 border-t border-samoo-gray-light">
        <Mail className="w-4 h-4 mr-2" />
        <span className="mr-1">하이테크 1본부</span>
        <span>조희수 프로</span>
      </div>
    </Card>
  )
}
