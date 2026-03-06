"use client";

import Link from "next/link";
import logo from "@/images/apple-touch-icon.png";
import { useTranslation } from "@/context/LocaleContext";

const footerLinkKeys = [
  { key: "aboutUs" as const, href: "/about" },
  { key: "contact" as const, href: "/contact" },
  { key: "helpCenter" as const, href: "/help" },
  { key: "terms" as const, href: "/terms" },
  { key: "privacy" as const, href: "/privacy" },
];

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-800 text-slate-300 py-12 px-4 sm:px-5 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <Link href="/" className="block shrink-0" aria-label="Route Wander">
            <span
              className="block h-[115px] w-auto shrink-0"
              style={{
                aspectRatio: `${logo.width} / ${logo.height}`,
                backgroundColor: "#0066FF",
                WebkitMaskImage: `url(${logo.src})`,
                maskImage: `url(${logo.src})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          </Link>
          <nav className="flex flex-wrap gap-6">
            {footerLinkKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors text-sm"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-slate-500 text-sm">
          {t("footerTagline")}
        </p>
        <p className="text-slate-600 text-xs mt-2">© {new Date().getFullYear()} Route Wander</p>
      </div>
    </footer>
  );
}