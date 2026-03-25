"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { THAILAND_PROVINCES } from "@/data/thailand-provinces";

const STEPS = [
  { key: "personal", label: "Personal", labelTh: "ข้อมูลส่วนตัว" },
  { key: "verification", label: "Verification", labelTh: "ยืนยันตัวตน" },
  { key: "payout", label: "Payout Info", labelTh: "ข้อมูลการจ่ายเงิน" },
] as const;

const BANKS = [
  "Kasikorn Bank (KBank)",
  "Siam Commercial Bank (SCB)",
  "Bangkok Bank",
  "Krung Thai Bank",
  "Government Savings Bank",
];

type GuideType = "general" | "local";

const GUIDE_TYPE_OPTIONS: { value: GuideType; label: string }[] = [
  { value: "general", label: "ไกด์ทั่วไป (General)" },
  { value: "local", label: "ไกด์ท้องถิ่น (Local)" },
];

export default function RegisterGuideFormPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [phone, setPhone] = useState("");
  const [locationSlug, setLocationSlug] = useState("");
  const [guideType, setGuideType] = useState<GuideType>("general");
  const [nationalId, setNationalId] = useState("");
  const [bank, setBank] = useState(BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [idCardFrontFile, setIdCardFrontFile] = useState<File | null>(null);
  const [bankBookFile, setBankBookFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ต้องล็อกอินด้วย Google ก่อน — ไม่มี session ให้กลับไปหน้าเลือกลงชื่อ
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/register-guide");
      return;
    }
  }, [status, router]);

  // เติมชื่อจาก Google เมื่อมี session
  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  }, [session?.user?.name, name]);

  // ตรวจสอบว่าเคยลงทะเบียนแล้วหรือยัง — ถ้าแล้วไป guide-manager
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/guides/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.registered === true) router.replace("/guide-manager");
      })
      .catch(() => {});
  }, [status, router]);

  const goNext = () => {
    setSubmitError("");
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };
  const goBack = () => {
    setSubmitError("");
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }

    if (!locationSlug) {
      setSubmitError("กรุณาเลือกจังหวัดที่ให้บริการ");
      return;
    }
    const displayName = (name.trim() || session?.user?.name) ?? "";
    if (!displayName) {
      setSubmitError("กรุณากรอกชื่อที่แสดงต่อนักท่องเที่ยว");
      return;
    }
    const displayNameEn = nameEn.trim();

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/guides/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          locationSlug,
          name: displayName,
          nameEn: displayNameEn || undefined,
          phone: phone.trim() || undefined,
          guideType,
          nationalId: nationalId.trim() || undefined,
          bankName: bank || undefined,
          accountNumber: accountNumber.trim() || undefined,
          accountHolder: accountHolder.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitting(false);
        setSubmitError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
        return;
      }

      router.replace("/guide-manager");
    } catch {
      setSubmitting(false);
      setSubmitError("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่");
    }
  };

  // กำลังโหลด session หรือยังไม่ล็อกอิน — แสดง loading หรือ redirect แล้ว
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-slate-800 flex flex-col items-center justify-center">
        <div className="text-slate-500 text-sm">
          {status === "loading" ? "กำลังตรวจสอบการเข้าสู่ระบบ..." : "กำลังนำคุณไปหน้าลงชื่อ..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48" className="w-full h-full">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M24 18.42L42 11.48V34.37c0 .41-.25.78-.64.93L24 42V18.42Z"
                  clipRule="evenodd"
                />
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M24 8.19L33.41 11.57L24 15.21L14.59 11.57 24 8.19ZM9 15.85l12 4.63v17.15L9 32.99V15.85Zm27 0v17.15L39 32.99V15.85L27 20.48v17.14ZM25.35 2.3C24.48 1.98 23.52 1.98 22.65 2.3L4.98 8.65C3.79 9.08 3 10.21 3 11.48V34.37c0 1.65 1.02 3.13 2.56 3.73l17.36 6.7c.7.27 1.46.27 2.16 0l17.36-6.7C43.98 37.5 45 36.02 45 34.37V11.48c0-1.27-.8-2.4-2.02-2.83L25.35 2.3Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-lg font-bold">
              Route Wander <span className="text-sm font-medium text-slate-400 ml-1">Guide Portal</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors py-2 px-4 rounded-lg border border-transparent hover:border-slate-200"
          >
            ออกจากหน้าสมัคร
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Step indicator */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={s.key} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-center w-full flex-1">
                    {i > 0 && (
                      <div className={`h-0.5 flex-1 min-w-[8px] ${step > stepNum ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 ${
                        isCompleted
                          ? "border-emerald-600 text-emerald-600 bg-emerald-50"
                          : isActive
                            ? "border-primary text-primary bg-primary/5 ring-4 ring-primary/10"
                            : "border-slate-200 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 min-w-[8px] ${step > stepNum ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCompleted ? "text-emerald-600" : isActive ? "text-primary" : "text-slate-400"
                    }`}
                  >
                    {s.labelTh}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-10 lg:p-12">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                สมัครเป็นไกด์ Route Wander
              </h1>
              <p className="text-slate-500 text-sm">
                กรอกข้อมูลเพื่อยืนยันตัวตนและตั้งค่าการรับเงิน
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <span className="text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    ข้อมูลส่วนตัว
                  </h3>
                  <p className="text-slate-500 text-sm">
                    ข้อมูลจาก Google ของคุณจะถูกใช้เป็นข้อมูลเริ่มต้น คุณสามารถแก้ไขได้ในโปรไฟล์ภายหลัง
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ชื่อที่แสดงต่อนักท่องเที่ยว"
                      className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                    />
                    {session?.user?.name && (
                      <p className="text-xs text-slate-500">เติมจากบัญชี Google แล้ว แก้ไขได้</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">ชื่อไกด์ (ภาษาอังกฤษ)</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="Guide name in English"
                      className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                    />
                    <p className="text-xs text-slate-500">ใช้แสดงผลเมื่อภาษาเป็นอังกฤษ</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">เบอร์โทรติดต่อ</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0XX-XXX-XXXX"
                      className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">จังหวัดที่ให้บริการ *</label>
                    <select
                      value={locationSlug}
                      onChange={(e) => setLocationSlug(e.target.value)}
                      className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {THAILAND_PROVINCES.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">ประเภทไกด์</label>
                    <select
                      value={guideType}
                      onChange={(e) => setGuideType(e.target.value as GuideType)}
                      className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                    >
                      {GUIDE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      ไกด์ทั่วไป: มีประสบการณ์นำทัวร์หลากหลาย · ไกด์ท้องถิ่น: เกิด/อยู่พื้นที่นั้น รู้จักเส้นทางและวิถีชีวิตท้องถิ่น
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Verification */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <span className="text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    ยืนยันตัวตน
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">เลขบัตรประชาชน (13 หลัก)</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="X-XXXX-XXXXX-XX-X"
                      className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">บัตรประชาชน (ด้านหน้า)</label>
                    <input
                      id="id-card-front-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setIdCardFrontFile(null);
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          setSubmitError("ไฟล์ใหญ่เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า");
                          setIdCardFrontFile(null);
                          return;
                        }
                        setSubmitError("");
                        setIdCardFrontFile(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("id-card-front-input")?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 rounded-xl p-8 transition-colors cursor-pointer text-center group"
                    >
                      <svg className="w-10 h-10 mx-auto text-slate-400 group-hover:text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs font-medium text-slate-600">
                        {idCardFrontFile
                          ? `เลือกแล้ว: ${idCardFrontFile.name}`
                          : <>ลากวางหรือ <span className="text-primary">เลือกไฟล์</span></>}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">JPG, PNG ไม่เกิน 5MB</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payout */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <span className="text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2m2 4h10m-8 0V7a2 2 0 012-2h2a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h2a2 2 0 012 2v4" />
                      </svg>
                    </span>
                    ข้อมูลการรับเงิน
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">เลือกธนาคาร</label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                      >
                        {BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">เลขบัญชี</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="XXX-X-XXXXX-X"
                        className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">ชื่อบัญชี (ตามสมุดบัญชี)</label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="ชื่อที่ปรากฏในสมุดบัญชี"
                        className="rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 px-4 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">รูปสมุดบัญชี (หน้าชื่อและเลขบัญชี)</label>
                    <input
                      id="bank-book-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setBankBookFile(null);
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          setSubmitError("ไฟล์สมุดบัญชีใหญ่เกิน 5MB กรุณาเลือกไฟล์ที่เล็กกว่า");
                          setBankBookFile(null);
                          return;
                        }
                        setSubmitError("");
                        setBankBookFile(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("bank-book-input")?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 rounded-xl p-10 transition-colors cursor-pointer flex flex-col items-center group"
                    >
                      <svg className="w-10 h-10 text-slate-400 group-hover:text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-600">
                        {bankBookFile ? `เลือกแล้ว: ${bankBookFile.name}` : "อัปโหลดรูปหน้าสมุดบัญชี"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">ต้องเห็นเลขบัญชีและชื่อชัดเจน (JPG, PNG ไม่เกิน 5MB)</p>
                      <span className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold group-hover:bg-slate-100 transition-colors">
                        เลือกไฟล์
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{submitError}</p>
              )}
              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={submitting}
                  className="text-slate-500 font-bold hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white font-bold h-12 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "กำลังส่ง..." : step === 3 ? "ส่งคำสมัคร" : "ถัดไป"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            ข้อมูลของคุณจะถูกเข้ารหัสและใช้เพื่อการยืนยันตัวตนเท่านั้น
          </p>
        </div>
      </main>
    </div>
  );
}
