import ActivityCard from "./ActivityCard";

const culturalActivities = [
  {
    id: "1",
    title: "Grand Palace & Temple of the Emerald Buddha Tour",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "Grand Palace Bangkok",
    rating: 4.9,
    reviewCount: 2341,
    duration: "4 hours",
    priceFrom: 1290,
    badge: "Bestseller",
    features: ["Free cancellation", "Skip-the-line"],
  },
  {
    id: "2",
    title: "Floating Markets & Railway Market Day Trip",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "Floating market",
    rating: 4.7,
    reviewCount: 892,
    duration: "6 hours",
    priceFrom: 1590,
    badge: "Popular",
    features: ["Free cancellation"],
  },
  {
    id: "3",
    title: "Doi Inthanon National Park & Hill Tribe Village",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "Doi Inthanon",
    rating: 4.8,
    reviewCount: 1556,
    duration: "8 hours",
    priceFrom: 1890,
    features: ["Free cancellation", "Hotel pickup"],
  },
];

const dayTrips = [
  {
    id: "4",
    title: "Phi Phi Islands Speedboat Tour with Snorkeling",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "Phi Phi islands",
    rating: 4.6,
    reviewCount: 3102,
    duration: "7 hours",
    priceFrom: 2190,
    badge: "Bestseller",
    features: ["Free cancellation", "Reserve now, pay later"],
  },
  {
    id: "5",
    title: "Khao Yai National Park Wildlife Safari",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    imageAlt: "Khao Yai",
    rating: 4.9,
    reviewCount: 445,
    duration: "10 hours",
    priceFrom: 2490,
    features: ["Free cancellation"],
  },
  {
    id: "6",
    title: "Traditional Thai Cooking Class in Bangkok",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "Thai cooking class",
    rating: 4.9,
    reviewCount: 678,
    duration: "3 hours",
    priceFrom: 1490,
    badge: "Top rated",
    features: ["Free cancellation"],
  },
];

export default function SectionActivities() {
  return (
    <>
      <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Unforgettable cultural experiences
          </h2>
          <p className="text-slate-600 mb-8">
            Discover Thailand&apos;s heritage with local Thai guides
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
            {culturalActivities.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Top things to do in Thailand</h2>
          <p className="text-slate-600 mb-8">Must-see attractions and experiences</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
            {dayTrips.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}