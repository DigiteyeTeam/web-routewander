"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CALLBACK_URL = "/register-guide/form";

export default function RegisterGuidePage() {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  // ถ้าล็อกอินอยู่แล้ว เข้าหน้านี้ให้เด้งไปฟอร์มทันที ไม่ต้องกด Google ซ้ำ
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(CALLBACK_URL);
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn("google", { callbackUrl: CALLBACK_URL });
    // NextAuth will redirect; keep loading until navigation
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen bg-[#fcfbf9]">
        {status === "authenticated" && (
          <div className="max-w-lg mx-auto px-6 py-16 text-center text-slate-500">
            กำลังนำคุณไปหน้ากรอกข้อมูลไกด์...
          </div>
        )}
        <div className="max-w-lg mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                สมัครเป็นไกด์
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                เข้าร่วมชุมชน Route Wander เป็นไกด์นำเที่ยว บริการนักท่องเที่ยวจากทั่วโลก
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "กำลังเข้าสู่ระบบ..." : "ลงชื่อด้วย Google"}
              </button>

              <p className="mt-6 text-xs text-slate-400">
                หลังลงชื่อแล้ว จะนำคุณไปกรอกข้อมูลไกด์และยืนยันตัวตน
              </p>
            </div>
          </div>

          <p className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-primary transition-colors"
            >
              ← กลับหน้าแรก
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
