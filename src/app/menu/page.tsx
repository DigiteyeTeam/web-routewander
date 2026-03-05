"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* แถบหัวเมนู */}
      <header className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold">เมนู</span>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-500/60"
            aria-label="ปิดเมนู"
            onClick={() => router.back()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* เนื้อหาเมนู */}
      <section className="max-w-7xl mx-auto px-4 py-4 space-y-6 text-sm">
        {/* เมนูหลัก */}
        <div className="space-y-2">
          {/* Places to see */}
          <Link
            href="/destination/bangkok"
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 10.5C19 16 12 21 12 21S5 16 5 10.5a7 7 0 1114 0z"
                  />
                </svg>
              </span>
              <span className="font-medium">Places to see</span>
            </span>
            <span className="text-slate-400">›</span>
          </Link>

          {/* Things to do */}
          <Link
            href="/activity/1"
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3l1.5 3.5L10 8l-3.5 1.5L5 13l-1.5-3.5L0 8l3.5-1.5L5 3zM19 9l1 2.5 2.5 1L20 14l-1 2.5L18 14l-2.5-1.5L18 11l1-2zM13 3l1.5 3L18 7.5 14.5 9 13 12l-1.5-3L8 7.5 11.5 6 13 3z"
                  />
                </svg>
              </span>
              <span className="font-medium">Things to do</span>
            </span>
            <span className="text-slate-400">›</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"
                  />
                </svg>
              </span>
              <span className="font-medium">รายการที่อยากได้</span>
            </span>
            <span className="text-slate-400">›</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l3-6H6.4M7 13L5.4 5M7 13l-2 6h14m-9 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
                  />
                </svg>
              </span>
              <span className="font-medium">รถเข็น</span>
            </span>
            <span className="text-slate-400">›</span>
          </Link>
        </div>

        {/* TH / THB & Profile */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          {/* TH / THB */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                TH
              </span>
              <span className="font-medium">TH / THB</span>
            </span>
            <span className="text-slate-400">›</span>
          </button>

          {/* Profile */}
          <Link
            href="/profile"
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 1116 0"
                  />
                </svg>
              </span>
              <span className="font-medium">Profile</span>
            </span>
            <span className="text-slate-400">›</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

