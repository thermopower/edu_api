import { DataCollectionMenu } from "../components/DataCollectionMenu";

export const metadata = {
  title: "데이터 수집 관리 - Educational API Practice",
  description: "기상청(KMA) 및 전력거래소(KPX) 외부 데이터를 수동으로 수집하고 관리하는 페이지입니다.",
};

export default function DataCollectionPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full">
        <DataCollectionMenu />
      </div>
    </main>
  );
}
