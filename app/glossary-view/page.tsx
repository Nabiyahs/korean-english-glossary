import { GlossaryDisplay } from "@/components/glossary-display"

export default function GlossaryViewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-samoo-blue mb-2">용어집 데이터베이스 현황</h1>
        <p className="text-samoo-gray-medium">현재 데이터베이스에 저장된 모든 용어의 상태를 확인할 수 있습니다.</p>
      </div>

      <GlossaryDisplay />
    </div>
  )
}
