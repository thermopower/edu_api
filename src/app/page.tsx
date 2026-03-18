import Link from "next/link";
import { ArrowRight, Database, CloudRain } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Educational API Practice
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            데이터 수집 및 정제 처리, API 활용법을 실습하기 위해 구축된 교육용 플랫폼입니다. 
            전력거래소(KPX) 및 기상청(KMA) 데이터를 원본과 유사한 스펙으로 모의 호출해 볼 수 있습니다.
          </p>
          <div className="pt-8">
            <Link 
              href="/api-docs" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Swagger UI 열기 <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Available APIs */}
      <section className="max-w-5xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          지원하는 API 목록
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* KPX Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">전력거래소 (KPX)</h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              제주 및 육지 계통한계가격(SMP)과 예상되는 전력수요 예측 데이터를 조회합니다.
            </p>
            <code className="text-xs bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md break-all">
              GET /openapi/kpx/smp-demand
            </code>
          </div>

          {/* KMA Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <CloudRain size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">기상청 (KMA)</h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              국내 지상 기상관측망(ASOS)의 관측 자료(온도, 강수량, 풍속 등)를 조회합니다.
            </p>
            <code className="text-xs bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md break-all">
              GET /openapi/kma/observation
            </code>
          </div>


        </div>
      </section>
    </main>
  );
}
