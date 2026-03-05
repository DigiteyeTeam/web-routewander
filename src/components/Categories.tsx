import Link from "next/link";

const iconCulture = (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const iconFood = (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const iconNature = (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const iconAdventure = (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const categories = [
  { label: "Culture", href: "/search?category=culture", icon: iconCulture },
  { label: "Food", href: "/search?category=food", icon: iconFood },
  { label: "Nature", href: "/search?category=nature", icon: iconNature },
  { label: "Adventure", href: "/search?category=adventure", icon: iconAdventure },
];

export default function Categories() {
  return (
    <section className="py-10 px-4 sm:px-5 md:px-6 lg:px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-50 hover:bg-primary-light border border-slate-100 hover:border-primary/30 text-slate-600 hover:text-primary transition-colors group"
            >
              <span className="text-primary group-hover:text-primary">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
