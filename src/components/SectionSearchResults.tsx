import ActivityCard from "./ActivityCard";

const searchActivities = [
  {
    id: "1",
    title: "วัดพระศรีรัตนศาสดาราม และวัดสำคัญในกรุงเทพ",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "วัดพระแก้ว",
    rating: 4.9,
    reviewCount: 2341,
    duration: "4 ชั่วโมง",
    priceFrom: 1290,
    category: "ทัวร์พร้อมไกด์",
    badge: "มีแนวโน้มขายหมด",
    badgeRed: true,
    features: ["ไม่ต้องต่อแถว"],
  },
  {
    id: "2",
    title: "ตลาดน้ำอัมพวา และเรือชมวิว",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.7,
    reviewCount: 892,
    duration: "6 ชั่วโมง",
    priceFrom: 1590,
    category: "เดย์ทริป",
    features: ["ฟรียกเลิก"],
  },
  {
    id: "3",
    title: "ดอยอินทนนท์ และหมู่บ้านกะเหรี่ยง",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "ดอยอินทนนท์",
    rating: 4.8,
    reviewCount: 1556,
    duration: "8 ชั่วโมง",
    priceFrom: 1890,
    category: "ทัวร์พร้อมไกด์",
    features: ["มีบริการไปรับ"],
  },
  {
    id: "4",
    title: "เกาะพีพี สปีดโบ๊ท และดำน้ำดูปะการัง",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "พีพี",
    rating: 4.6,
    reviewCount: 3102,
    duration: "7 ชั่วโมง",
    priceFrom: 2190,
    category: "กิจกรรมทางน้ำ",
    badge: "ยอดนิยม",
    features: ["ฟรียกเลิก"],
  },
];

export default function SectionSearchResults() {
  return (
    <section className="py-10 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">
          ขึ้นอยู่กับการค้นหาของคุณใน กรุงเทพ
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
          {searchActivities.map((a) => (
            <ActivityCard key={a.id} {...a} className="shrink-0 w-[280px] sm:w-[300px]" />
          ))}
        </div>
      </div>
    </section>
  );
}
