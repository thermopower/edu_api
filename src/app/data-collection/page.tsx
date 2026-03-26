import { DataCollectionMenu } from "../components/DataCollectionMenu";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "데이터 수집 관리 - Educational API Practice",
  description: "기상청(KMA) 및 전력거래소(KPX) 외부 데이터를 수동으로 수집하고 관리하는 페이지입니다.",
};

export default function DataCollectionPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pt-8">
      <div className="max-w-5xl mx-auto w-full px-6 md:px-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:shadow-md"
        >
          <ArrowLeft size={18} />
          홈으로 돌아가기
        </Link>
      </div>
      <div className="w-full flex-grow flex items-center justify-center pb-8">
        <div className="w-full">
          <DataCollectionMenu />
        </div>
      </div>
    </main>
  );
}
