import Link from "next/link";
import Image from "next/image";

const destinations = [
  { name: "Bangkok", slug: "bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80" },
  { name: "Chiang Mai", slug: "chiang-mai", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80" },
  { name: "Phuket", slug: "phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { name: "Krabi", slug: "krabi", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80" },
];

export default function PopularDestinations() {
  return (
    <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Popular destinations in Thailand</h2>
        <p className="text-slate-600 mb-8">Explore tours and activities by region</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destination/${d.slug}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden block"
            >
              <Image
                src={d.image}
                alt={d.name}
                width={400}
                height={300}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 text-white font-semibold text-lg drop-shadow">
                {d.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}