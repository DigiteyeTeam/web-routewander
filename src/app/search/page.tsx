import SearchPageClient from "./SearchPageClient";

type SearchPageProps = {
  searchParams?: { q?: string | string[] };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const qParam = searchParams?.q ?? "";
  const q = Array.isArray(qParam) ? qParam[0] : qParam;
  return <SearchPageClient initialQuery={q || ""} />;
}

