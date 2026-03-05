import ActivityCard from "./ActivityCard";

const experiences = [
  {
    id: "1",
    title: "กรุงเทพ: ทัวร์วัดพระแก้ว และวัดสำคัญ",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "วัดพระแก้ว",
    rating: 5.0,
    reviewCount: 4944,
    duration: "4 ชั่วโมง",
    priceFrom: 1290,
    priceOriginal: 1590,
    category: "ทัวร์พร้อมไกด์",
    banner: "ได้รับการรับรองโดย Route Wander",
    features: ["ไม่ต้องต่อแถว"],
  },
  {
    id: "2",
    title: "ตลาดน้ำอัมพวา เดย์ทริป",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.9,
    reviewCount: 892,
    duration: "6 ชั่วโมง",
    priceFrom: 1590,
    category: "เดย์ทริป",
    banner: "Originals by Route Wander",
    features: ["ฟรียกเลิก"],
  },
  {
    id: "3",
    title: "เชียงใหม่: ดอยอินทนนท์ และหมู่บ้านกะเหรี่ยง",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "ดอยอินทนนท์",
    rating: 4.8,
    reviewCount: 1556,
    duration: "8 ชั่วโมง",
    priceFrom: 1890,
    category: "การผจญภัย",
    features: ["มีบริการไปรับ"],
  },
  {
    id: "4",
    title: "พีพี Islands สปีดโบ๊ท และดำน้ำ",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "พีพี",
    rating: 4.6,
    reviewCount: 3102,
    duration: "7 ชั่วโมง",
    priceFrom: 2190,
    priceOriginal: 2690,
    category: "กิจกรรมทางน้ำ",
    features: ["ฟรียกเลิก"],
  },
  {
    id: "5",
    title: "เขาใหญ่ ซาฟารีและธรรมชาติ",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    imageAlt: "เขาใหญ่",
    rating: 4.9,
    reviewCount: 445,
    duration: "10 ชั่วโมง",
    priceFrom: 2490,
    category: "เดย์ทริป",
    features: ["ฟรียกเลิก"],
  },
  {
    id: "6",
    title: "คลาสทำอาหารไทย กรุงเทพ",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "ทำอาหาร",
    rating: 4.9,
    reviewCount: 678,
    duration: "3 ชั่วโมง",
    priceFrom: 1490,
    category: "ทัวร์พร้อมไกด์",
    banner: "ได้รับการรับรองโดย Route Wander",
    features: ["ฟรียกเลิก"],
  },
  {
    id: "7",
    title: "อยุธยา วัดและโบราณสถาน",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "อยุธยา",
    rating: 4.8,
    reviewCount: 1203,
    duration: "8 ชั่วโมง",
    priceFrom: 1790,
    category: "เดย์ทริป",
    features: ["ไม่ต้องต่อแถว"],
  },
  {
    id: "8",
    title: "พักผ่อนที่ sanctuary ช้าง เชียงใหม่",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "ช้าง",
    rating: 4.9,
    reviewCount: 556,
    duration: "6 ชั่วโมง",
    priceFrom: 2190,
    category: "การผจญภัย",
    features: ["มีบริการไปรับ"],
  },
];

export default function SectionExperiences() {
  return (
    <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8">
          ประสบการณ์เดินทางที่น่าจดจำ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
          {experiences.map((a) => (
            <ActivityCard key={a.id} {...a} />
          ))}
        </div>
      </div>
    </section>
  );
}
