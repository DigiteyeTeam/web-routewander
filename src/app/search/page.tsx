import SearchPageClient from "./SearchPageClient";

export default function SearchPage({ searchParams }: any) {
  const qParam = searchParams?.q ?? "";
  const q = Array.isArray(qParam) ? qParam[0] : qParam;
  
  const guideTypeParam = searchParams?.guideType ?? "";
  const guideType = Array.isArray(guideTypeParam) ? guideTypeParam[0] : guideTypeParam;

  const viewParam = searchParams?.view ?? "";
  const view = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  
  return <SearchPageClient initialQuery={q || ""} initialGuideType={guideType || ""} initialView={view || "list"} />;
}
