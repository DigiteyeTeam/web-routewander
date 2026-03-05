 "use client";

import { useState } from "react";
import Link from "next/link";

const attractions = [
  { name: "วัดโพธิ์", count: 176 },
  { name: "วัดพระแก้ว", count: 89 },
  { name: "ตลาดน้ำอัมพวา", count: 42 },
  { name: "ดอยอินทนนท์", count: 34 },
  { name: "เกาะพีพี", count: 128 },
  { name: "เขาใหญ่", count: 28 },
];

const destinations = [
  { name: "กรุงเทพ", count: 312 },
  { name: "เชียงใหม่", count: 156 },
  { name: "พัทยา", count: 98 },
  { name: "ภูเก็ต", count: 187 },
  { name: "กระบี่", count: 134 },
  { name: "สมุทรสงคราม", count: 45 },
];

const categories = [
  { name: "ทัวร์พร้อมไกด์", count: 420 },
  { name: "เดย์ทริป", count: 198 },
  { name: "ตั๋วเข้าชม", count: 276 },
  { name: "กิจกรรมทางน้ำ", count: 89 },
  { name: "คลาสและเวิร์กช็อป", count: 56 },
];

const PANELS = [
  { key: "attractions", title: "สถานที่ท่องเที่ยวยอดนิยมในไทย" },
  { key: "destinations", title: "จุดหมายปลายทางยอดนิยม" },
  { key: "countries", title: "ประเทศยอดนิยม" },
  { key: "categories", title: "หมวดหมู่สถานที่ท่องเที่ยวยอดนิยม" },
] as const;

export default function BodyFooterLinks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePanel = PANELS[activeIndex];

  return (
    <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        {/* มือถือ: แสดงทีละช่วง พร้อมลูกศรซ้ายขวา */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              {activePanel.title}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                className={`w-8 h-8 rounded-full border text-sm flex items-center justify-center ${
                  activeIndex === 0
                    ? "border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
                aria-label="ก่อนหน้า"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={activeIndex === PANELS.length - 1}
                onClick={() =>
                  setActiveIndex((i) => Math.min(PANELS.length - 1, i + 1))
                }
                className={`w-8 h-8 rounded-full border text-sm flex items-center justify-center ${
                  activeIndex === PANELS.length - 1
                    ? "border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
                aria-label="ถัดไป"
              >
                ›
              </button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-4">
            {activePanel.key === "attractions" && (
              <ul className="space-y-2">
                {attractions.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/places?q=${encodeURIComponent(item.name)}`}
                      className="text-slate-600 hover:text-primary text-sm"
                    >
                      {item.name}
                    </Link>
                    <span className="text-slate-400 text-sm ml-1">
                      · {item.count} ทัวร์ & กิจกรรม
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activePanel.key === "destinations" && (
              <ul className="space-y-2">
                {destinations.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/destination/${item.name
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                      className="text-slate-600 hover:text-primary text-sm"
                    >
                      {item.name}
                    </Link>
                    <span className="text-slate-400 text-sm ml-1">
                      · {item.count} ทัวร์ & กิจกรรม
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activePanel.key === "countries" && (
              <p className="text-slate-600 text-sm">
                <Link href="/" className="hover:text-primary">
                  ไทย
                </Link>
                <span className="text-slate-400 ml-1">
                  · ทัวร์ & กิจกรรมในประเทศไทย
                </span>
              </p>
            )}

            {activePanel.key === "categories" && (
              <ul className="space-y-2">
                {categories.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/things-to-do?category=${encodeURIComponent(
                        item.name,
                      )}`}
                      className="text-slate-600 hover:text-primary text-sm"
                    >
                      {item.name}
                    </Link>
                    <span className="text-slate-400 text-sm ml-1">
                      · {item.count} ทัวร์ & กิจกรรม
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* จอใหญ่: กริด 4 คอลัมน์เหมือนเดิม */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              สถานที่ท่องเที่ยวยอดนิยมในไทย
            </h3>
            <ul className="space-y-2">
              {attractions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/places?q=${encodeURIComponent(item.name)}`}
                    className="text-slate-600 hover:text-primary text-sm"
                  >
                    {item.name}
                  </Link>
                  <span className="text-slate-400 text-sm ml-1">
                    · {item.count} ทัวร์ & กิจกรรม
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              จุดหมายปลายทางยอดนิยม
            </h3>
            <ul className="space-y-2">
              {destinations.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/destination/${item.name
                      .toLowerCase()
                      .replace(/\s/g, "-")}`}
                    className="text-slate-600 hover:text-primary text-sm"
                  >
                    {item.name}
                  </Link>
                  <span className="text-slate-400 text-sm ml-1">
                    · {item.count} ทัวร์ & กิจกรรม
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              ประเทศยอดนิยม
            </h3>
            <p className="text-slate-600 text-sm">
              <Link href="/" className="hover:text-primary">
                ไทย
              </Link>
              <span className="text-slate-400 ml-1">
                · ทัวร์ & กิจกรรมในประเทศไทย
              </span>
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              หมวดหมู่สถานที่ท่องเที่ยวยอดนิยม
            </h3>
            <ul className="space-y-2">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/things-to-do?category=${encodeURIComponent(
                      item.name,
                    )}`}
                    className="text-slate-600 hover:text-primary text-sm"
                  >
                    {item.name}
                  </Link>
                  <span className="text-slate-400 text-sm ml-1">
                    · {item.count} ทัวร์ & กิจกรรม
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
