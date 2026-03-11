export type Coordinates = {
  lat: number;
  lng: number;
};

export type LocationData = {
  slug: string;
  name: string;
  nameEn: string;
  coordinates: Coordinates;
  zoom: number;
};

export const DESTINATION_COORDINATES: LocationData[] = [
  {
    slug: "bangkok",
    name: "กรุงเทพ",
    nameEn: "Bangkok",
    coordinates: { lat: 13.7563, lng: 100.5018 },
    zoom: 12,
  },
  {
    slug: "chiang-mai",
    name: "เชียงใหม่",
    nameEn: "Chiang Mai",
    coordinates: { lat: 18.7883, lng: 98.9853 },
    zoom: 12,
  },
  {
    slug: "pattaya",
    name: "พัทยา",
    nameEn: "Pattaya",
    coordinates: { lat: 12.9236, lng: 100.8825 },
    zoom: 13,
  },
  {
    slug: "krabi",
    name: "กระบี่",
    nameEn: "Krabi",
    coordinates: { lat: 8.0863, lng: 98.9063 },
    zoom: 11,
  },
  {
    slug: "phuket",
    name: "ภูเก็ต",
    nameEn: "Phuket",
    coordinates: { lat: 7.8804, lng: 98.3923 },
    zoom: 11,
  },
  {
    slug: "samut-songkhram",
    name: "สมุทรสงคราม",
    nameEn: "Samut Songkhram",
    coordinates: { lat: 13.4097, lng: 99.9995 },
    zoom: 13,
  },
];

export type ActivityLocation = {
  id: string;
  coordinates: Coordinates;
  locationName: string;
  locationNameEn: string;
};

export const ACTIVITY_LOCATIONS: ActivityLocation[] = [
  { id: "1", coordinates: { lat: 13.7510, lng: 100.4927 }, locationName: "วัดพระแก้ว", locationNameEn: "Grand Palace" },
  { id: "2", coordinates: { lat: 13.4264, lng: 99.9525 }, locationName: "ตลาดน้ำอัมพวา", locationNameEn: "Amphawa Floating Market" },
  { id: "3", coordinates: { lat: 13.7429, lng: 100.5097 }, locationName: "ย่านเยาวราช", locationNameEn: "Yaowarat Chinatown" },
  { id: "4", coordinates: { lat: 13.7465, lng: 100.4930 }, locationName: "วัดโพธิ์", locationNameEn: "Wat Pho" },
  { id: "5", coordinates: { lat: 13.7444, lng: 100.5120 }, locationName: "เยาวราช", locationNameEn: "Yaowarat" },
  { id: "6", coordinates: { lat: 13.7516, lng: 100.4917 }, locationName: "พระบรมมหาราชวัง", locationNameEn: "Grand Palace" },
  { id: "7", coordinates: { lat: 18.5206, lng: 98.6014 }, locationName: "ดอยอินทนนท์", locationNameEn: "Doi Inthanon" },
  { id: "8", coordinates: { lat: 18.7875, lng: 98.9935 }, locationName: "เมืองเก่าเชียงใหม่", locationNameEn: "Chiang Mai Old City" },
  { id: "9", coordinates: { lat: 7.6807, lng: 98.7665 }, locationName: "เกาะพีพี", locationNameEn: "Phi Phi Islands" },
  { id: "10", coordinates: { lat: 7.8910, lng: 98.3004 }, locationName: "ภูเก็ต", locationNameEn: "Phuket" },
  { id: "11", coordinates: { lat: 12.9235, lng: 100.8788 }, locationName: "เกาะล้าน", locationNameEn: "Koh Larn" },
  { id: "12", coordinates: { lat: 13.4082, lng: 99.9966 }, locationName: "สมุทรสงคราม", locationNameEn: "Samut Songkhram" },
  { id: "13", coordinates: { lat: 13.7437, lng: 100.4890 }, locationName: "วัดอรุณ", locationNameEn: "Wat Arun" },
  { id: "14", coordinates: { lat: 13.7437, lng: 100.4890 }, locationName: "วัดอรุณ", locationNameEn: "Wat Arun" },
  { id: "15", coordinates: { lat: 13.7437, lng: 100.4890 }, locationName: "วัดอรุณ", locationNameEn: "Wat Arun" },
  { id: "16", coordinates: { lat: 13.7451, lng: 100.4910 }, locationName: "วัดโพธิ์ & วัดอรุณ", locationNameEn: "Wat Pho & Wat Arun" },
  // ตลาดน้ำดำเนินสะดวก - 3 ไกด์
  { id: "17", coordinates: { lat: 13.5190, lng: 99.9587 }, locationName: "ตลาดน้ำดำเนินสะดวก", locationNameEn: "Damnoen Saduak Floating Market" },
  { id: "18", coordinates: { lat: 13.5190, lng: 99.9587 }, locationName: "ตลาดน้ำดำเนินสะดวก", locationNameEn: "Damnoen Saduak Floating Market" },
  { id: "19", coordinates: { lat: 13.5190, lng: 99.9587 }, locationName: "ตลาดน้ำดำเนินสะดวก", locationNameEn: "Damnoen Saduak Floating Market" },
  // ถนนข้าวสาร - 2 ไกด์
  { id: "20", coordinates: { lat: 13.7587, lng: 100.4968 }, locationName: "ถนนข้าวสาร", locationNameEn: "Khao San Road" },
  { id: "21", coordinates: { lat: 13.7587, lng: 100.4968 }, locationName: "ถนนข้าวสาร", locationNameEn: "Khao San Road" },
  // จตุจักร - 2 ไกด์
  { id: "22", coordinates: { lat: 13.7999, lng: 100.5501 }, locationName: "ตลาดนัดจตุจักร", locationNameEn: "Chatuchak Market" },
  { id: "23", coordinates: { lat: 13.7999, lng: 100.5501 }, locationName: "ตลาดนัดจตุจักร", locationNameEn: "Chatuchak Market" },
  // ดอยอินทนนท์ - 2 ไกด์
  { id: "24", coordinates: { lat: 18.5878, lng: 98.4862 }, locationName: "ดอยอินทนนท์", locationNameEn: "Doi Inthanon" },
  { id: "25", coordinates: { lat: 18.5878, lng: 98.4862 }, locationName: "ดอยอินทนนท์", locationNameEn: "Doi Inthanon" },
  // ดอยสุเทพ - 2 ไกด์
  { id: "26", coordinates: { lat: 18.8048, lng: 98.9215 }, locationName: "วัดพระธาตุดอยสุเทพ", locationNameEn: "Doi Suthep Temple" },
  { id: "27", coordinates: { lat: 18.8048, lng: 98.9215 }, locationName: "วัดพระธาตุดอยสุเทพ", locationNameEn: "Doi Suthep Temple" },
  // คลาสทำอาหาร เชียงใหม่ - 2 ไกด์
  { id: "28", coordinates: { lat: 18.7953, lng: 98.9678 }, locationName: "คลาสทำอาหาร เชียงใหม่", locationNameEn: "Chiang Mai Cooking School" },
  { id: "29", coordinates: { lat: 18.7953, lng: 98.9678 }, locationName: "คลาสทำอาหาร เชียงใหม่", locationNameEn: "Chiang Mai Cooking School" },
  // เกาะพีพี กระบี่/ภูเก็ต - 4 ไกด์
  { id: "30", coordinates: { lat: 7.7407, lng: 98.7784 }, locationName: "เกาะพีพี", locationNameEn: "Phi Phi Islands" },
  { id: "31", coordinates: { lat: 7.7407, lng: 98.7784 }, locationName: "เกาะพีพี", locationNameEn: "Phi Phi Islands" },
  { id: "32", coordinates: { lat: 7.7407, lng: 98.7784 }, locationName: "เกาะพีพี", locationNameEn: "Phi Phi Islands" },
  { id: "33", coordinates: { lat: 7.7407, lng: 98.7784 }, locationName: "เกาะพีพี", locationNameEn: "Phi Phi Islands" },
  // เกาะล้าน พัทยา - 3 ไกด์
  { id: "34", coordinates: { lat: 12.9156, lng: 100.7847 }, locationName: "เกาะล้าน", locationNameEn: "Koh Larn" },
  { id: "35", coordinates: { lat: 12.9156, lng: 100.7847 }, locationName: "เกาะล้าน", locationNameEn: "Koh Larn" },
  { id: "36", coordinates: { lat: 12.9156, lng: 100.7847 }, locationName: "เกาะล้าน", locationNameEn: "Koh Larn" },
  // อัมพวา & ตลาดร่มหุบ - 3 ไกด์
  { id: "37", coordinates: { lat: 13.4264, lng: 99.9525 }, locationName: "ตลาดน้ำอัมพวา", locationNameEn: "Amphawa Floating Market" },
  { id: "38", coordinates: { lat: 13.4097, lng: 99.9877 }, locationName: "ตลาดร่มหุบ", locationNameEn: "Maeklong Railway Market" },
  { id: "39", coordinates: { lat: 13.4180, lng: 99.9701 }, locationName: "อัมพวา & ตลาดร่มหุบ", locationNameEn: "Amphawa & Railway Market" },
  // ไอคอนสยาม
  { id: "40", coordinates: { lat: 13.7266, lng: 100.5108 }, locationName: "ไอคอนสยาม", locationNameEn: "ICONSIAM" },
];

export function getDestinationBySlug(slug: string): LocationData | undefined {
  return DESTINATION_COORDINATES.find((d) => d.slug === slug);
}

export function getActivityLocation(activityId: string): ActivityLocation | undefined {
  return ACTIVITY_LOCATIONS.find((a) => a.id === activityId);
}

export const THAILAND_CENTER: Coordinates = { lat: 13.0, lng: 101.0 };
export const THAILAND_ZOOM = 6;
