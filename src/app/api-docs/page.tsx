import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./ReactSwagger";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container mx-auto p-4">
      <div className="mb-4 px-4 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:shadow-md"
        >
          <ArrowLeft size={18} />
          홈으로 돌아가기
        </Link>
      </div>
      <ReactSwagger spec={spec} />
    </section>
  );
}
