"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "@/images/apple-touch-icon.png";

const placesCategories = [
  { label: "Top destinations", href: "/places", active: true },
  { label: "Bangkok & Central", href: "/places?region=central" },
  { label: "North Thailand", href: "/places?region=north" },
  { label: "South Thailand", href: "/places?region=south" },
  { label: "Islands", href: "/places?region=islands" },
];

const placesList = [
  { name: "Grand Palace", location: "Bangkok", href: "/places/bangkok/grand-palace", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80" },
  { name: "Wat Arun", location: "Bangkok", href: "/places/bangkok/wat-arun", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=100&q=80" },
  { name: "Doi Inthanon", location: "Chiang Mai", href: "/places/chiang-mai/doi-inthanon", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
  { name: "Phi Phi Islands", location: "Krabi", href: "/places/krabi/phi-phi", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&q=80" },
  { name: "Wat Pho", location: "Bangkok", href: "/places/bangkok/wat-pho", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=100&q=80" },
  { name: "Floating Markets", location: "Samut Songkhram", href: "/places/floating-markets", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=100&q=80" },
  { name: "Khao Yai National Park", location: "Nakhon Ratchasima", href: "/places/khao-yai", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80" },
  { name: "Chiang Mai Old City", location: "Chiang Mai", href: "/places/chiang-mai/old-city", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=100&q=80" },
  { name: "James Bond Island", location: "Phang Nga", href: "/places/phang-nga/james-bond", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&q=80" },
];

const thingsCategories = [
  { label: "Top experiences", href: "/things-to-do", active: true },
  { label: "Culture & history", href: "/things-to-do?category=culture" },
  { label: "Food & drinks", href: "/things-to-do?category=food" },
  { label: "Nature & adventure", href: "/things-to-do?category=nature" },
  { label: "Day trips", href: "/things-to-do?category=day-trips" },
  { label: "Tours & activities", href: "/things-to-do?category=tours" },
];

const thingsList = [
  { name: "Bangkok Grand Palace & temples tour", href: "/activity/1", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80" },
  { name: "Floating market & railway market day trip", href: "/activity/2", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=100&q=80" },
  { name: "Chiang Mai Doi Inthanon day trip", href: "/activity/3", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
  { name: "Phi Phi Islands speedboat & snorkeling", href: "/activity/4", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&q=80" },
  { name: "Khao Yai National Park safari", href: "/activity/5", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80" },
  { name: "Thai cooking class Bangkok", href: "/activity/6", image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=100&q=80" },
  { name: "Bangkok street food tour", href: "/activity/7", image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=100&q=80" },
  { name: "Ayutthaya temples day trip", href: "/activity/8", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80" },
  { name: "Elephant sanctuary Chiang Mai", href: "/activity/9", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
];

export default function Header() {
  const [placesOpen, setPlacesOpen] = useState(false);
  const [thingsOpen, setThingsOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent text-white md:bg-white md:bg-none md:text-slate-800 md:border-b md:border-slate-200">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-5 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center shrink-0" aria-label="Route Wander">
            <span
              className="block h-[84px] sm:h-[133px] w-auto shrink-0"
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
          <nav className="hidden md:flex items-center gap-6 text-slate-100 md:text-slate-700">
          <div
            className="relative"
            onMouseEnter={() => { setPlacesOpen(true); setThingsOpen(false); }}
            onMouseLeave={() => setPlacesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setPlacesOpen((v) => !v)}
              className={`flex items-center gap-1 font-medium text-sm transition-colors ${
                placesOpen ? "text-primary border-b-2 border-primary pb-0.5 -mb-px" : "text-slate-700 hover:text-primary"
              }`}
              aria-expanded={placesOpen}
              aria-haspopup="true"
            >
              Places to see
              <svg
                className={`w-4 h-4 transition-transform ${placesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {placesOpen && (
              <div className="absolute left-0 top-full pt-1 z-50">
                <div className="w-[720px] max-w-[min(720px,calc(100vw-2rem))] bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-200 overflow-hidden">
                  <div className="flex">
                    <div className="w-52 shrink-0 py-4 pl-4 pr-2 border-r border-slate-100">
                      {placesCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-colors ${
                            cat.active
                              ? "text-primary font-semibold bg-primary-light"
                              : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                          }`}
                        >
                          {cat.active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          {!cat.active && <span className="w-1.5 shrink-0" />}
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                    <div className="flex-1 py-4 px-4 grid grid-cols-3 gap-x-4 gap-y-3">
                      {placesList.map((place) => (
                        <Link
                          key={place.href}
                          href={place.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-200">
                            <Image
                              src={place.image}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                              {place.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              Attraction in {place.location}, Thailand
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => { setThingsOpen(true); setPlacesOpen(false); }}
            onMouseLeave={() => setThingsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setThingsOpen((v) => !v)}
              className={`flex items-center gap-1 font-medium text-sm transition-colors ${
                thingsOpen ? "text-primary border-b-2 border-primary pb-0.5 -mb-px" : "text-slate-700 hover:text-primary"
              }`}
              aria-expanded={thingsOpen}
              aria-haspopup="true"
            >
              Things to do
              <svg
                className={`w-4 h-4 transition-transform ${thingsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {thingsOpen && (
              <div className="absolute left-0 top-full pt-1 z-50">
                <div className="w-[720px] max-w-[min(720px,calc(100vw-2rem))] bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-200 overflow-hidden">
                  <div className="flex">
                    <div className="w-52 shrink-0 py-4 pl-4 pr-2 border-r border-slate-100">
                      {thingsCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-colors ${
                            cat.active
                              ? "text-primary font-semibold bg-primary-light"
                              : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                          }`}
                        >
                          {cat.active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          {!cat.active && <span className="w-1.5 shrink-0" />}
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                    <div className="flex-1 py-4 px-4 grid grid-cols-3 gap-x-4 gap-y-3">
                      {thingsList.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-200">
                            <Image
                              src={item.image}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                              {item.name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-slate-100 md:text-slate-600">
          <Link
            href="/wishlist"
            className="flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[32px] text-xs md:text-[11px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="hidden md:block text-[11px]">ที่อยากได้</span>
          </Link>
          <Link
            href="/cart"
            className="flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[32px] text-xs md:text-[11px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l3-6H6.4M7 13L5.4 5M7 13l-2 6h14m-9 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span className="hidden md:block text-[11px]">รถเข็น</span>
          </Link>
          <button
            type="button"
            className="hidden sm:flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[40px] text-xs"
            aria-label="Language and currency"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="text-[11px]">TH / THB</span>
          </button>
          <Link
            href="/profile"
            className="hidden sm:flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[40px] text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 1116 0" />
            </svg>
            <span className="text-[11px]">โปรไฟล์</span>
          </Link>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-100/60 bg-slate-900/40 hover:bg-slate-900/70"
            aria-label="เปิดเมนู"
            onClick={() => router.push("/menu")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
