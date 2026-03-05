import SearchPageClient from "./SearchPageClient";

export default function SearchPage({ searchParams }: any) {
  const qParam = searchParams?.q ?? "";
  const q = Array.isArray(qParam) ? qParam[0] : qParam;
  return <SearchPageClient initialQuery={q || ""} />;
}
