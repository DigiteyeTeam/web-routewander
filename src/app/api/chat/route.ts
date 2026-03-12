import { NextRequest, NextResponse } from "next/server";
import { getAllActivities, type ActivityItem } from "@/data/activities";
import { guides, type Guide } from "@/data/guides";

type ChatResponse = {
  reply: string;
  suggested_items: {
    id: string;
    name: string;
    category: string;
    price: number;
    reason: string;
  }[];
  ui_action: {
    type: "none" | "show_detail";
    targetId?: string;
  };
  follow_up_questions: string[];
};

const DESTINATION_MAP: Record<string, { th: string; en: string; keywords: string[] }> = {
  "bangkok": { th: "กรุงเทพ", en: "Bangkok", keywords: ["bangkok", "กรุงเทพ", "bkk", "กทม"] },
  "chiang-mai": { th: "เชียงใหม่", en: "Chiang Mai", keywords: ["chiang mai", "chiangmai", "เชียงใหม่", "เชียงใหม", "cm"] },
  "phuket": { th: "ภูเก็ต", en: "Phuket", keywords: ["phuket", "ภูเก็ต"] },
  "krabi": { th: "กระบี่", en: "Krabi", keywords: ["krabi", "กระบี่"] },
  "pattaya": { th: "พัทยา", en: "Pattaya", keywords: ["pattaya", "พัทยา"] },
  "samut-songkhram": { th: "สมุทรสงคราม", en: "Samut Songkhram", keywords: ["samut songkhram", "สมุทรสงคราม", "อัมพวา", "amphawa", "แม่กลอง", "maeklong"] },
};

function getSystemPrompt(locale: string, activities: ActivityItem[], guidesList: Guide[]): string {
  const activitiesData = activities.slice(0, 50).map(a => {
    const dest = DESTINATION_MAP[a.slug];
    return {
      id: a.id,
      title: locale === "en" ? (a.titleEn || a.title) : a.title,
      category: a.category,
      categoryKey: a.categoryKey,
      price: a.priceFrom,
      rating: a.rating,
      reviewCount: a.reviewCount,
      duration: locale === "en" ? (a.durationEn || a.duration) : a.duration,
      guideType: a.guideType,
      tripCode: a.tripCode,
      destination: a.slug,
      destinationTh: dest?.th || a.slug,
      destinationEn: dest?.en || a.slug,
    };
  });

  const guidesData = guidesList.slice(0, 10).map(g => ({
    id: g.id,
    name: g.nameKey,
    guideType: g.guideType,
    location: g.locationKey,
    rating: g.rating,
    reviewCount: g.reviewCount,
  }));

  return `คุณคือ "Ivy" (ไอวี่) ผู้ช่วย AI สาวน่ารักของ Route Wander แพลตฟอร์มจองทริปท่องเที่ยวในประเทศไทย

## บุคลิกของคุณ
- เป็นผู้หญิง พูดจาน่ารัก สุภาพ ใช้ค่ะ/คะ
- กระตือรือร้นในการช่วยเหลือ อบอุ่น เป็นกันเอง
- รู้จักสถานที่ท่องเที่ยวในไทยเป็นอย่างดี
- ใช้อิโมจิได้เล็กน้อยเพื่อความน่ารัก เช่น 😊 🌿 ✨

## จังหวัดที่ให้บริการ
- กรุงเทพ (Bangkok) - slug: "bangkok"
- เชียงใหม่ (Chiang Mai) - slug: "chiang-mai"
- พัทยา (Pattaya) - slug: "pattaya"
- กระบี่ (Krabi) - slug: "krabi"
- ภูเก็ต (Phuket) - slug: "phuket"
- สมุทรสงคราม/อัมพวา (Samut Songkhram/Amphawa) - slug: "samut-songkhram"

## ข้อมูลทริปที่มีในระบบ
${JSON.stringify(activitiesData, null, 2)}

## ข้อมูลไกด์
${JSON.stringify(guidesData, null, 2)}

## ประเภทไกด์
- ไกด์ท้องถิ่น (Local Guide - guideType: "local"): คนในพื้นที่จริง รู้จักสถานที่ลึกซึ้ง ป้ายสีเขียว
- ไกด์ทั่วไป (General Guide - guideType: "general"): ไกด์มืออาชีพ ประสบการณ์หลากหลาย ป้ายสีส้ม

## วิธีการตอบ
1. **ทักทาย**: ถ้าผู้ใช้ทักทาย (สวัสดี, hello, หวัดดี) ให้ทักทายกลับอย่างเป็นกันเอง ไม่ต้องแนะนำทริปทันที ให้ suggested_items เป็น [] และถามว่าต้องการความช่วยเหลืออะไร

2. **ถามเรื่องจังหวัดเฉพาะ**: เช่น "ที่เที่ยวเชียงใหม่" หรือ "ทริปกระบี่" ให้กรองเฉพาะทริปที่มี destination/destinationTh ตรงกับจังหวัดนั้น

3. **ถามเรื่องประเภท**: เช่น "ทริปอาหาร" "วัด" ให้กรองตาม categoryKey

4. **ถามเรื่องไกด์**: ถ้าถามเรื่องไกด์ท้องถิ่น/local guide ให้กรองทริปที่มี guideType: "local"

5. **ถามงบ**: ถ้าถามงบประมาณ ให้กรองตามราคา

6. **คำถามทั่วไปเกี่ยวกับการท่องเที่ยว**: ตอบด้วยความรู้ทั่วไป แนะนำทริปที่เหมาะสม

## OUTPUT FORMAT (ต้อง return เป็น JSON เท่านั้น)
{
  "reply": "ข้อความตอบกลับผู้ใช้",
  "suggested_items": [
    {
      "id": "ID ของทริปจากข้อมูลด้านบน (ต้องตรงกับ id จริง)",
      "name": "ชื่อทริป",
      "category": "หมวดหมู่",
      "price": 1290,
      "reason": "เหตุผลสั้นๆ ที่แนะนำทริปนี้ (เกี่ยวข้องกับคำถาม)"
    }
  ],
  "ui_action": { "type": "none" },
  "follow_up_questions": ["คำถามที่เกี่ยวข้อง 1", "คำถามที่เกี่ยวข้อง 2"]
}

## RULES สำคัญมาก
1. **ห้ามสร้างข้อมูลทริปขึ้นมาเอง** - ใช้เฉพาะทริปที่มีในข้อมูลด้านบน
2. **suggested_items ต้องมี id ที่ตรงกับทริปจริง** - ถ้าไม่มีทริปที่เหมาะสม ให้ส่ง []
3. **ถ้าผู้ใช้ถามเรื่องจังหวัด ต้องกรองให้ถูกต้อง** - เช่น ถามเชียงใหม่ ต้องแนะนำทริปที่ destination เป็น "chiang-mai" เท่านั้น
4. **ถ้าแค่ทักทาย อย่าแนะนำทริป** - ให้ suggested_items เป็น []
5. แนะนำทริป 2-4 รายการต่อครั้ง (เมื่อเหมาะสม)
6. ตอบเป็นภาษา${locale === "en" ? "อังกฤษ" : "ไทย"}
7. follow_up_questions ให้แนะนำ 2-3 คำถามที่เกี่ยวข้องกับบทสนทนา`;
}

function detectIntent(message: string): { 
  type: "greeting" | "destination" | "category" | "guide_type" | "budget" | "popular" | "general";
  destination?: string;
  category?: string;
  guideType?: string;
  maxBudget?: number;
} {
  const lower = message.toLowerCase();
  
  // Greeting patterns
  const greetings = ["สวัสดี", "หวัดดี", "hello", "hi", "hey", "ดีครับ", "ดีค่ะ", "ว่าไง", "sawadee", "sawasdee"];
  if (greetings.some(g => lower.includes(g)) && lower.length < 30) {
    return { type: "greeting" };
  }

  // Destination detection
  for (const [slug, info] of Object.entries(DESTINATION_MAP)) {
    if (info.keywords.some(kw => lower.includes(kw))) {
      return { type: "destination", destination: slug };
    }
  }

  // Guide type detection
  if (lower.includes("ไกด์ท้องถิ่น") || lower.includes("local guide") || lower.includes("ถิ่น")) {
    return { type: "guide_type", guideType: "local" };
  }
  if (lower.includes("ไกด์ทั่วไป") || lower.includes("general guide")) {
    return { type: "guide_type", guideType: "general" };
  }

  // Category detection
  const categoryMap: Record<string, string[]> = {
    "food": ["อาหาร", "food", "กิน", "ชิม", "ร้านอาหาร", "street food"],
    "food-drink": ["เครื่องดื่ม", "drink", "คาเฟ่", "cafe", "coffee"],
    "attraction": ["สถานที่", "attraction", "เที่ยว", "ที่เที่ยว", "ท่องเที่ยว"],
    "culture": ["วัฒนธรรม", "culture", "วัด", "temple", "ประวัติศาสตร์", "history"],
    "nature": ["ธรรมชาติ", "nature", "ภูเขา", "mountain", "ทะเล", "beach", "เกาะ", "island"],
    "day-trip": ["day trip", "เดย์ทริป", "ไปเช้าเย็นกลับ"],
  };
  
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return { type: "category", category: cat };
    }
  }

  // Budget detection
  const budgetMatch = lower.match(/(\d{3,5})\s*(บาท|baht)?/);
  if (budgetMatch || lower.includes("งบ") || lower.includes("budget") || lower.includes("ถูก") || lower.includes("ประหยัด")) {
    const amount = budgetMatch ? parseInt(budgetMatch[1]) : 1500;
    return { type: "budget", maxBudget: amount };
  }

  // Popular detection
  if (lower.includes("ยอดนิยม") || lower.includes("popular") || lower.includes("แนะนำ") || lower.includes("ดีที่สุด") || lower.includes("best")) {
    return { type: "popular" };
  }

  return { type: "general" };
}

function getFallbackResponse(message: string, locale: string): ChatResponse {
  const activities = getAllActivities();
  const intent = detectIntent(message);
  
  let suggestedItems: ChatResponse["suggested_items"] = [];
  let reply = "";
  let followUpQuestions: string[] = [];
  
  switch (intent.type) {
    case "greeting":
      reply = locale === "en"
        ? "Hello! 👋 I'm Ivy, your Route Wander travel assistant. How can I help you plan your Thailand adventure today? 😊"
        : "สวัสดีค่ะ! 👋 หนูชื่อ Ivy ผู้ช่วยวางแผนเที่ยวไทยของคุณค่ะ วันนี้อยากไปเที่ยวที่ไหนดีคะ? 😊";
      followUpQuestions = locale === "en"
        ? ["What trips are available in Chiang Mai?", "Show me popular trips", "Any budget-friendly options?"]
        : ["มีทริปเชียงใหม่อะไรบ้าง?", "แนะนำทริปยอดนิยม", "มีทริปราคาประหยัดไหม?"];
      break;

    case "destination":
      const destTrips = activities.filter(a => a.slug === intent.destination).slice(0, 4);
      const destInfo = DESTINATION_MAP[intent.destination!];
      const destName = locale === "en" ? destInfo?.en : destInfo?.th;
      
      if (destTrips.length > 0) {
        suggestedItems = destTrips.map(a => ({
          id: a.id,
          name: locale === "en" ? (a.titleEn || a.title) : a.title,
          category: a.category,
          price: a.priceFrom,
          reason: locale === "en" ? `Experience ${destName}` : `สัมผัส${destName}`
        }));
        reply = locale === "en"
          ? `Here are the trips we have in ${destName}! 🗺️ Each offers a unique experience with our guides.`
          : `นี่คือทริป${destName}ค่ะ! 🗺️ แต่ละทริปมีประสบการณ์พิเศษกับไกด์ของเราเลยนะคะ ✨`;
        followUpQuestions = locale === "en"
          ? [`Local guide trips in ${destName}?`, `Budget options in ${destName}?`, "What about other cities?"]
          : [`ทริป${destName}กับไกด์ท้องถิ่น?`, `ทริป${destName}ราคาประหยัด?`, "จังหวัดอื่นมีอะไรบ้าง?"];
      } else {
        reply = locale === "en"
          ? `Sorry, we don't have trips in ${destName} yet. Would you like to see trips in other cities?`
          : `ขออภัยค่ะ ตอนนี้ยังไม่มีทริป${destName} ต้องการดูทริปจังหวัดอื่นไหมคะ? 🙏`;
        followUpQuestions = locale === "en"
          ? ["Show me Bangkok trips", "What about Chiang Mai?", "Any Phuket trips?"]
          : ["ดูทริปกรุงเทพ", "เชียงใหม่มีอะไรบ้าง?", "ทริปภูเก็ตมีไหม?"];
      }
      break;

    case "guide_type":
      const guideTrips = activities.filter(a => a.guideType === intent.guideType).slice(0, 4);
      const guideTypeName = intent.guideType === "local" 
        ? (locale === "en" ? "local guides" : "ไกด์ท้องถิ่น")
        : (locale === "en" ? "general guides" : "ไกด์ทั่วไป");
      
      suggestedItems = guideTrips.map(a => ({
        id: a.id,
        name: locale === "en" ? (a.titleEn || a.title) : a.title,
        category: a.category,
        price: a.priceFrom,
        reason: locale === "en" ? `Led by ${guideTypeName}` : `นำโดย${guideTypeName}`
      }));
      reply = locale === "en"
        ? `Here are trips with ${guideTypeName}! ${intent.guideType === "local" ? "🏠 They know hidden gems that tourists usually miss." : "🎯 Professional guides with diverse experience."}`
        : `ทริปกับ${guideTypeName}ค่ะ! ${intent.guideType === "local" ? "🏠 พวกเขารู้จักที่เที่ยวลับๆ ที่นักท่องเที่ยวทั่วไปไม่รู้นะคะ" : "🎯 ไกด์มืออาชีพประสบการณ์หลากหลายค่ะ"}`;
      followUpQuestions = locale === "en"
        ? ["What's the difference between guide types?", "Local food tours?", "Bangkok local guide trips"]
        : ["ไกด์แต่ละประเภทต่างกันยังไง?", "มีทัวร์ชิมอาหารไหม?", "ไกด์ท้องถิ่นกรุงเทพ"];
      break;

    case "category":
      const catTrips = activities.filter(a => 
        a.categoryKey === intent.category || 
        (intent.category === "food" && a.categoryKey === "food-drink")
      ).slice(0, 4);
      
      suggestedItems = catTrips.map(a => ({
        id: a.id,
        name: locale === "en" ? (a.titleEn || a.title) : a.title,
        category: a.category,
        price: a.priceFrom,
        reason: locale === "en" ? "Matches your interest" : "ตรงกับความสนใจ"
      }));
      reply = locale === "en"
        ? "Here are trips matching your interest! 🎯"
        : "ทริปที่ตรงกับความสนใจของคุณค่ะ! 🎯";
      followUpQuestions = locale === "en"
        ? ["Show me other categories", "Any in Chiang Mai?", "Budget-friendly options?"]
        : ["ดูหมวดอื่น", "มีที่เชียงใหม่ไหม?", "ราคาประหยัดมีไหม?"];
      break;

    case "budget":
      const budgetTrips = activities.filter(a => a.priceFrom <= (intent.maxBudget || 1500)).slice(0, 4);
      suggestedItems = budgetTrips.map(a => ({
        id: a.id,
        name: locale === "en" ? (a.titleEn || a.title) : a.title,
        category: a.category,
        price: a.priceFrom,
        reason: locale === "en" ? "Great value" : "คุ้มค่า"
      }));
      reply = locale === "en"
        ? `Here are budget-friendly trips under ฿${intent.maxBudget?.toLocaleString() || "1,500"}! 💰 All include guide services.`
        : `ทริปราคาไม่เกิน ฿${intent.maxBudget?.toLocaleString() || "1,500"} ค่ะ! 💰 ทุกทริปรวมไกด์แล้วนะคะ`;
      followUpQuestions = locale === "en"
        ? ["Show me premium trips", "What's included?", "Local guide trips?"]
        : ["ทริปพรีเมียมมีไหม?", "ราคานี้รวมอะไรบ้าง?", "ไกด์ท้องถิ่นมีไหม?"];
      break;

    case "popular":
      const popularTrips = activities.filter(a => 
        a.badgeKey === "popular" || a.badgeKey === "likelyToSellOut" || a.rating >= 4.8
      ).slice(0, 4);
      suggestedItems = popularTrips.map(a => ({
        id: a.id,
        name: locale === "en" ? (a.titleEn || a.title) : a.title,
        category: a.category,
        price: a.priceFrom,
        reason: locale === "en" ? "Highly rated" : "ได้รับความนิยมสูง"
      }));
      reply = locale === "en"
        ? "Here are our most popular trips! 🌟 These are loved by travelers."
        : "ทริปยอดนิยมของเราค่ะ! 🌟 นักท่องเที่ยวชื่นชอบกันมากเลยนะคะ";
      followUpQuestions = locale === "en"
        ? ["Budget-friendly options?", "Local guide trips?", "Trips in Chiang Mai?"]
        : ["ทริปราคาประหยัด?", "ทริปกับไกด์ท้องถิ่น?", "ทริปเชียงใหม่มีไหม?"];
      break;

    default:
      reply = locale === "en"
        ? "I can help you find the perfect trip in Thailand! 🇹🇭 What are you interested in? You can ask about specific cities, trip types, or budget."
        : "หนูช่วยหาทริปเที่ยวไทยที่ใช่ให้คุณได้ค่ะ! 🇹🇭 สนใจอะไรเป็นพิเศษไหมคะ? ถามเรื่องจังหวัด ประเภททริป หรืองบประมาณได้เลยนะคะ 😊";
      followUpQuestions = locale === "en"
        ? ["What trips are in Bangkok?", "Show me popular trips", "Local guide trips?"]
        : ["ทริปกรุงเทพมีอะไรบ้าง?", "แนะนำทริปยอดนิยม", "ทริปไกด์ท้องถิ่นมีไหม?"];
      break;
  }
  
  return {
    reply,
    suggested_items: suggestedItems,
    ui_action: { type: "none" },
    follow_up_questions: followUpQuestions,
  };
}

async function tryGeminiAPI(
  messages: { role: string; content: string }[],
  locale: string
): Promise<ChatResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY found");
    return null;
  }

  const activities = getAllActivities();
  const systemPrompt = getSystemPrompt(locale, activities, guides);
  
  const chatHistory = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  try {
    console.log("Calling Gemini API with key:", apiKey.substring(0, 10) + "...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "เข้าใจค่ะ หนูพร้อมช่วยเหลือแล้วนะคะ 😊" }] },
            ...chatHistory.slice(-10),
          ],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        try {
          const parsed = JSON.parse(text) as ChatResponse;
          console.log("Gemini API success - parsed JSON response");
          return parsed;
        } catch {
          console.log("Gemini returned non-JSON, wrapping...");
          return {
            reply: text,
            suggested_items: [],
            ui_action: { type: "none" },
            follow_up_questions: [],
          };
        }
      }
    } else {
      const errorText = await response.text();
      console.log("Gemini API failed:", response.status, errorText);
    }
  } catch (error) {
    console.log("Gemini API error:", error);
  }
  return null;
}

async function tryGroqAPI(
  messages: { role: string; content: string }[],
  locale: string
): Promise<ChatResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log("No GROQ_API_KEY found");
    return null;
  }

  const activities = getAllActivities();
  const systemPrompt = getSystemPrompt(locale, activities, guides);

  try {
    console.log("Calling Groq API...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        try {
          const parsed = JSON.parse(text) as ChatResponse;
          console.log("Groq API success - parsed JSON response");
          return parsed;
        } catch {
          console.log("Groq returned non-JSON, wrapping...");
          return {
            reply: text,
            suggested_items: [],
            ui_action: { type: "none" },
            follow_up_questions: [],
          };
        }
      }
    } else {
      const errorText = await response.text();
      console.log("Groq API failed:", response.status, errorText);
    }
  } catch (error) {
    console.log("Groq API error:", error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, locale = "th" } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    console.log("=== Chat API Request ===");
    console.log("Message:", lastMessage);
    console.log("Locale:", locale);

    // Try Groq API first (usually faster and more reliable)
    const groqResponse = await tryGroqAPI(messages, locale);
    if (groqResponse) {
      console.log("Using Groq response");
      return NextResponse.json(groqResponse);
    }

    // Try Gemini API
    const geminiResponse = await tryGeminiAPI(messages, locale);
    if (geminiResponse) {
      console.log("Using Gemini response");
      return NextResponse.json(geminiResponse);
    }

    // Fallback to smart template responses
    console.log("Using fallback response");
    const fallbackResponse = getFallbackResponse(lastMessage, locale);
    return NextResponse.json(fallbackResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    const fallbackResponse = getFallbackResponse("", "th");
    return NextResponse.json(fallbackResponse);
  }
}
