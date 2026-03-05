import Link from "next/link";
import logo from "@/images/apple-touch-icon.png";

const footerLinks = [
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Help Center", href: "/help" },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

export default function Footer() {
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
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-slate-500 text-sm">
          Tours in Thailand for international travelers. Route Wander — local Thai guides.
        </p>
        <p className="text-slate-600 text-xs mt-2">© {new Date().getFullYear()} Route Wander</p>
      </div>
    </footer>
  );
}