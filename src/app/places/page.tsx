"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LocaleContext";
import { slugToCityKey } from "@/i18n/translations";

const destinationSlugs = [
  { slug: "bangkok", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80" },
  { slug: "chiang-mai", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80" },
  { slug: "pattaya", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "krabi", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "samut-songkhram", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80" },
];

export default function PlacesPage() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8">
            {t("navPlacesTop")}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {destinationSlugs.map((d) => {
              const name = slugToCityKey[d.slug] ? t(slugToCityKey[d.slug]) : d.slug;
              return (
                <Link
                  key={d.slug}
                  href={`/destination/${d.slug}`}
                  className="group block rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                    <Image
                      src={d.image}
                      alt={name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="p-4 text-base font-semibold text-slate-800 group-hover:text-primary transition-colors">
                    {name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
