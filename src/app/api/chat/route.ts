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

function getSystemPrompt(locale: string, activities: ActivityItem[], guidesList: Guide[]): string {
  const activitiesData = activities.slice(0, 50).map(a => ({
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
  }));

  const guidesData = guidesList.slice(0, 10).map(g => ({
    id: g.id,
    name: locale === "en" ? g.nameKey : g.nameKey,
    guideType: g.guideType,
    location: g.locationKey,
    rating: g.rating,
    reviewCount: g.reviewCount,
  }));

  return `คุณคือ "น้องแวนเดอร์" (Wander) ผู้ช่วย AI ของ Route Wander แพลตฟอร์มจองทริปท่องเที่ยวในประเทศไทย

## บุคลิกของคุณ
- เป็นกันเอง พูดจาสุภาพ ใช้ครับ/ค่ะ
- กระตือรือร้นในการช่วยเหลือ
- รู้จักสถานที่ท่องเที่ยวในไทยเป็นอย่างดี
- ใช้อิโมจิได้เล็กน้อยเพื่อความเป็นกันเอง

## ข้อมูลทริปที่มีในระบบ (ใช้ข้อมูลนี้ในการแนะนำเท่านั้น)
${JSON.stringify(activitiesData, null, 2)}

## ข้อมูลไกด์
${JSON.stringify(guidesData, null, 2)}

## ข้อมูลเพิ่มเติม
- ไกด์ท้องถิ่น (Local Guide - ป้ายสีเขียว): คนในพื้นที่จริง รู้จักสถานที่ลึกซึ้ง
- ไกด์ทั่วไป (General Guide - ป้ายสีส้ม): ไกด์มืออาชีพ ประสบการณ์หลากหลาย
- จังหวัดที่ให้บริการ: กรุงเทพ, เชียงใหม่, พัทยา, กระบี่, ภูเก็ต, สมุทรสงคราม

## OUTPUT FORMAT (ต้อง return เป็น JSON เท่านั้น)
{
  "reply": "ข้อความตอบกลับผู้ใช้ ใช้ markdown ได้ เช่น **bold** หรือ bullet points",
  "suggested_items": [
    {
      "id": "ID ของทริปจากข้อมูลด้านบน",
      "name": "ชื่อทริป",
      "category": "หมวดหมู่",
      "price": 1290,
      "reason": "เหตุผลสั้นๆ ที่แนะนำทริปนี้"
    }
  ],
  "ui_action": {
    "type": "none หรือ show_detail",
    "targetId": "ID ของทริปที่ต้องการแสดง (ถ้า type เป็น show_detail)"
  },
  "follow_up_questions": [
    "คำถามที่ผู้ใช้อาจสนใจถามต่อ 1",
    "คำถามที่ผู้ใช้อาจสนใจถามต่อ 2"
  ]
}

## RULES
1. ห้ามสร้างข้อมูลทริปขึ้นมาเอง ใช้เฉพาะข้อมูลที่ให้ไว้ด้านบนเท่านั้น
2. suggested_items ต้องมี id ที่ตรงกับทริปจริงในระบบ ถ้าไม่มีทริปที่เหมาะสม ให้ส่ง array ว่าง []
3. แนะนำทริป 2-4 รายการต่อครั้ง
4. ตอบเป็นภาษา${locale === "en" ? "อังกฤษ" : "ไทย"}
5. ถ้าผู้ใช้ถามนอกเรื่องท่องเที่ยว ให้ตอบสุภาพว่าช่วยได้เฉพาะเรื่องท่องเที่ยว
6. follow_up_questions ให้แนะนำ 2-3 คำถามที่เกี่ยวข้อง`;
}

function getFallbackResponse(message: string, locale: string): ChatResponse {
  const lowerMessage = message.toLowerCase();
  const activities = getAllActivities();
  
  let suggestedItems: ChatResponse["suggested_items"] = [];
  let reply = "";
  let followUpQuestions: string[] = [];
  
  if (lowerMessage.includes("ยอดนิยม") || lowerMessage.includes("แนะนำ") || lowerMessage.includes("popular")) {
    const popularTrips = activities.filter(a => a.badgeKey === "popular" || a.badgeKey === "likelyToSellOut").slice(0, 4);
    suggestedItems = popularTrips.map(a => ({
      id: a.id,
      name: locale === "en" ? (a.titleEn || a.title) : a.title,
      category: a.category,
      price: a.priceFrom,
      reason: locale === "en" ? "Highly rated by travelers" : "ได้รับความนิยมสูง"
    }));
    reply = locale === "en" 
      ? "Here are our most popular trips! 🌟 Each one offers unique experiences with our professional guides."
      : "ทริปยอดนิยมของเราครับ! 🌟 แต่ละทริปมีประสบการณ์พิเศษกับไกด์มืออาชีพของเรา";
    followUpQuestions = locale === "en"
      ? ["Show me budget-friendly trips", "Tell me about local guides", "What about Chiang Mai trips?"]
      : ["มีทริปราคาประหยัดไหม", "อยากรู้เกี่ยวกับไกด์ท้องถิ่น", "ทริปเชียงใหม่มีอะไรบ้าง"];
  } else if (lowerMessage.includes("งบ") || lowerMessage.includes("budget") || lowerMessage.includes("ถูก") || lowerMessage.includes("ประหยัด")) {
    const budgetTrips = activities.filter(a => a.priceFrom <= 1500).slice(0, 4);
    suggestedItems = budgetTrips.map(a => ({
      id: a.id,
      name: locale === "en" ? (a.titleEn || a.title) : a.title,
      category: a.category,
      price: a.priceFrom,
      reason: locale === "en" ? "Great value for money" : "คุ้มค่าคุ้มราคา"
    }));
    reply = locale === "en"
      ? "Here are budget-friendly trips under ฿1,500! 💰 All include guide services."
      : "ทริปราคาประหยัดไม่เกิน ฿1,500 ครับ! 💰 ทุกทริปรวมไกด์แล้ว";
    followUpQuestions = locale === "en"
      ? ["Show me premium trips", "What's included in the price?", "Local guides available?"]
      : ["มีทริปพรีเมียมไหม", "ราคานี้รวมอะไรบ้าง", "มีไกด์ท้องถิ่นไหม"];
  } else if (lowerMessage.includes("ไกด์ท้องถิ่น") || lowerMessage.includes("local guide")) {
    const localTrips = activities.filter(a => a.guideType === "local").slice(0, 4);
    suggestedItems = localTrips.map(a => ({
      id: a.id,
      name: locale === "en" ? (a.titleEn || a.title) : a.title,
      category: a.category,
      price: a.priceFrom,
      reason: locale === "en" ? "Led by local guide" : "นำโดยไกด์ท้องถิ่น"
    }));
    reply = locale === "en"
      ? "Here are trips with local guides! 🏠 They know hidden spots that tourists usually miss."
      : "ทริปกับไกด์ท้องถิ่นครับ! 🏠 พวกเขารู้จักที่เที่ยวลับๆ ที่นักท่องเที่ยวทั่วไปไม่รู้";
    followUpQuestions = locale === "en"
      ? ["What's the difference with general guides?", "Local food tours?", "Bangkok local guide trips"]
      : ["ต่างจากไกด์ทั่วไปยังไง", "มีทัวร์ชิมอาหารไหม", "ไกด์ท้องถิ่นกรุงเทพ"];
  } else {
    const randomTrips = activities.slice(0, 4);
    suggestedItems = randomTrips.map(a => ({
      id: a.id,
      name: locale === "en" ? (a.titleEn || a.title) : a.title,
      category: a.category,
      price: a.priceFrom,
      reason: locale === "en" ? "Recommended trip" : "แนะนำ"
    }));
    reply = locale === "en"
      ? "Hi! I'm Wander, your Route Wander assistant! 😊 I can help you find perfect trips in Thailand. Here are some recommendations:"
      : "สวัสดีครับ! ผมน้องแวนเดอร์ ผู้ช่วย Route Wander ครับ! 😊 ผมช่วยหาทริปเที่ยวไทยให้ได้ครับ นี่คือทริปแนะนำ:";
    followUpQuestions = locale === "en"
      ? ["Show me popular trips", "Budget trips under 1,500 baht", "What are local guides?"]
      : ["แนะนำทริปยอดนิยม", "ทริปงบ 1,500 บาท", "ไกด์ท้องถิ่นคืออะไร"];
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
  if (!apiKey) return null;

  const activities = getAllActivities();
  const systemPrompt = getSystemPrompt(locale, activities, guides);
  
  const chatHistory = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "เข้าใจครับ ผมพร้อมช่วยเหลือแล้ว" }] },
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
          console.log("Gemini API success (JSON)");
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
    }
    console.log("Gemini API failed:", response.status);
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
  if (!apiKey) return null;

  const activities = getAllActivities();
  const systemPrompt = getSystemPrompt(locale, activities, guides);
  const lastMessage = messages[messages.length - 1]?.content || "";

  try {
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
          console.log("Groq API success (JSON)");
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
    }
    console.log("Groq API failed:", response.status);
  } catch (error) {
    console.log("Groq API error:", error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, locale = "th" } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Try Groq API first
    const groqResponse = await tryGroqAPI(messages, locale);
    if (groqResponse) {
      return NextResponse.json(groqResponse);
    }

    // Try Gemini API
    const geminiResponse = await tryGeminiAPI(messages, locale);
    if (geminiResponse) {
      return NextResponse.json(geminiResponse);
    }

    // Fallback to template responses
    console.log("Using fallback response");
    const fallbackResponse = getFallbackResponse(lastMessage, locale);
    return NextResponse.json(fallbackResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    const fallbackResponse = getFallbackResponse("", "th");
    return NextResponse.json(fallbackResponse);
  }
}
