"use client";

import { useState, useTransition } from "react";
import { collectKmaDataAction, collectKpxDataAction, collectKmaMidFcstDataAction } from "../actions/data-collection";
import { Database, CloudRain, Loader2, CheckCircle2 } from "lucide-react";

export function DataCollectionMenu() {
  const [isPendingKma, startTransitionKma] = useTransition();
  const [isPendingKpx, startTransitionKpx] = useTransition();
  const [isPendingKmaMid, startTransitionKmaMid] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleKmaCollection = () => {
    setMessage(null);
    startTransitionKma(async () => {
      try {
        const result = await collectKmaDataAction();
        if (result.success) {
          setMessage({ type: "success", text: `[KMA] 기상청 데이터 ${result.count}건이 새롭게 수집되었습니다.` });
        } else {
          setMessage({ type: "error", text: `[KMA] 수집 실패: ${result.error || "알 수 없는 에러"}` });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessage({ type: "error", text: `[KMA] 요청 중 에러 발생: ${msg}` });
      }
    });
  };

  const handleKpxCollection = () => {
    setMessage(null);
    startTransitionKpx(async () => {
      try {
        const result = await collectKpxDataAction();
        if (result.success) {
          setMessage({ type: "success", text: `[KPX] 전력거래소 데이터 ${result.count}건이 새롭게 수집되었습니다.` });
        } else {
          setMessage({ type: "error", text: `[KPX] 수집 실패: ${result.error || "알 수 없는 에러"}` });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessage({ type: "error", text: `[KPX] 요청 중 에러 발생: ${msg}` });
      }
    });
  };

  const handleKmaMidCollection = () => {
    setMessage(null);
    startTransitionKmaMid(async () => {
      try {
        const result = await collectKmaMidFcstDataAction();
        if (result.success) {
          setMessage({ type: "success", text: `[KMA 중기예보] 기상청 중기예보 데이터 ${result.count}건이 새롭게 수집되었습니다.` });
        } else {
          setMessage({ type: "error", text: `[KMA 중기예보] 수집 실패: ${result.error || "알 수 없는 에러"}` });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessage({ type: "error", text: `[KMA 중기예보] 요청 중 에러 발생: ${msg}` });
      }
    });
  };

  return (
    <section className="max-w-5xl mx-auto py-12 px-6">
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">데이터 수집 관리 (Data Collection)</h2>
          <p className="text-slate-300 mb-8 max-w-2xl text-lg">
            기상청(KMA)과 전력거래소(KPX)의 오픈 API를 주기적으로 호출하여 데이터베이스에 최신 관측 및 예측 데이터를 적재합니다.
          </p>

          {message && (
            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}>
              <CheckCircle2 size={24} className={message.type === 'success' ? 'text-emerald-400' : 'text-red-400'} />
              <p className="font-medium text-lg">{message.text}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* KMA Collection Card */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col items-start justify-between rounded-2xl group hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CloudRain size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">기상청 (KMA) 데이터 수집</h3>
                <p className="text-slate-400 text-sm mb-6">
                  서울, 반월/안산, 구미, 동해, 영양 지점의 최신 관측 데이터를 즉시 가져와 DB에 삽입합니다.
                </p>
              </div>
              <button
                onClick={handleKmaCollection}
                disabled={isPendingKma}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {isPendingKma ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    수집 처리 중...
                  </>
                ) : (
                  "KMA 수집 실행"
                )}
              </button>
            </div>

            {/* KPX Collection Card */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col items-start justify-between rounded-2xl group hover:border-orange-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">전력거래소 (KPX) 데이터 수집</h3>
                <p className="text-slate-400 text-sm mb-6">
                  육지 및 제주 지역의 계통한계가격(SMP)과 시간별 예측수요 데이터를 즉시 가져와 DB에 삽입합니다.
                </p>
              </div>
              <button
                onClick={handleKpxCollection}
                disabled={isPendingKpx}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {isPendingKpx ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    수집 처리 중...
                  </>
                ) : (
                  "KPX 수집 실행"
                )}
              </button>
            </div>

            {/* KMA Mid Forecast Collection Card */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col items-start justify-between rounded-2xl group hover:border-indigo-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CloudRain size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">기상청 (KMA) 중기예보 수집</h3>
                <p className="text-slate-400 text-sm mb-6">
                  전국(108) 및 서울, 인천, 경기도(109) 지역의 중기예보 기상전망 데이터를 즉시 가져와 DB에 삽입합니다.
                </p>
              </div>
              <button
                onClick={handleKmaMidCollection}
                disabled={isPendingKmaMid}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {isPendingKmaMid ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    수집 처리 중...
                  </>
                ) : (
                  "KMA 중기예보 수집 실행"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
