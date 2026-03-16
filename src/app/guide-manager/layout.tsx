"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, PlusCircle, ArrowLeft, User } from "lucide-react";
import logo from "@/images/apple-touch-icon.png";

export default function GuideManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCreate = pathname === "/guide-manager/create";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Image src={logo} alt="" width={28} height={28} className="rounded-lg" />
          </div>
          <div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight">Route Wander</h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mt-0.5">Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          <Link
            href="/guide-manager"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              !isCreate ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={2} />
            ภาพรวม / ทริปของฉัน
          </Link>
          <Link
            href="/guide-manager/create"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              isCreate ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <PlusCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
            สร้างทริปใหม่
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            กลับเว็บหลัก
          </Link>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">ไกด์ (Mock)</p>
              <p className="text-[11px] text-slate-500 truncate">Guide Portal</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
