"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LocaleContext";
import { useMockAuth } from "@/context/MockAuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { signInMock } = useMockAuth();
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/";

  const handleGoogleSignIn = () => {
    setLoading(true);
    signInMock();
    setTimeout(() => {
      setLoading(false);
      router.push(callbackUrl);
    }, 300);
  };

  return (
    <>
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-xl font-bold text-slate-800 mb-2 text-center">
              {t("loginTitle")}
            </h1>
            <p className="text-sm text-slate-500 mb-8 text-center">
              {t("loginOrRegister")}
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
              {loading ? "..." : t("signInWithGoogle")}
            </button>

            <p className="mt-6 text-xs text-slate-500 text-center">
              <Link href="/" className="text-primary hover:underline">
                {t("backToHome")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="pt-24 pb-16 min-h-screen bg-slate-50 flex items-center justify-center"><span className="text-slate-500">...</span></div>}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
