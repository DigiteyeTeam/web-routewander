"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[520px] flex items-center justify-center pt-24 pb-16 px-4 sm:px-5 md:px-6 lg:px-8">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&q=80"
          alt="Thailand - Grand Palace Bangkok"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/55" />
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-8">
          Discover & book tours in Thailand
        </h1>

        <form
          onSubmit={handleSearch}
          className="flex bg-white rounded-full shadow-xl max-w-xl mx-auto overflow-hidden border border-slate-200/80 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-shadow"
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหา..."
            className="flex-1 min-w-0 px-5 py-3.5 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 text-sm sm:text-base"
            aria-label="Search"
          />
          <button
            type="submit"
            className="px-6 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm sm:text-base transition-colors shrink-0"
          >
            ค้นหา
          </button>
        </form>
      </div>
    </section>
  );
}
