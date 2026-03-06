"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LocaleContext";
import { slugToCityKey } from "@/i18n/translations";

const destinationSlugs = [
  { slug: "bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80" },
  { slug: "chiang-mai", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80" },
  { slug: "pattaya", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "krabi", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80" },
  { slug: "phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "samut-songkhram", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80" },
];

export default function SectionDestinationsScroll() {
  const { t } = useTranslation();
  return (
    <section className="py-10 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">
          {t("activitiesWhereYouGo")}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth -mx-1 px-1">
          {destinationSlugs.map((d) => {
            const name = slugToCityKey[d.slug] ? t(slugToCityKey[d.slug]) : d.slug;
            return (
              <Link
                key={d.slug}
                href={`/destination/${d.slug}`}
                className="group shrink-0 w-[160px] sm:w-[180px]"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-200 mb-2">
                  <Image
                    src={d.image}
                    alt={name}
                    width={180}
                    height={180}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-sm font-medium text-slate-800 text-center">{name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
