import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `คุณคือ "น้องแวนเดอร์" ผู้ช่วย AI ของ Route Wander แพลตฟอร์มจองทริปท่องเที่ยวในประเทศไทย

หน้าที่ของคุณ:
1. แนะนำสถานที่ท่องเที่ยว ทริป และกิจกรรมในประเทศไทย
2. ช่วยตอบคำถามเกี่ยวกับการจองทริป
3. ให้ข้อมูลเกี่ยวกับไกด์ท้องถิ่นและไกด์ทั่วไป
4. แนะนำทริปตามงบประมาณและความสนใจ

ข้อมูลเกี่ยวกับ Route Wander:
- มีทริปในหลายจังหวัด: กรุงเทพ, เชียงใหม่, พัทยา, กระบี่, ภูเก็ต, สมุทรสงคราม
- มีไกด์ 2 ประเภท: ไกด์ท้องถิ่น (Local Guide - สีเขียว) และ ไกด์ทั่วไป (General Guide - สีส้ม)
- หมวดหมู่ทริป: สถานที่เที่ยว, ร้านอาหาร, อาหาร & เครื่องดื่ม, วัฒนธรรม & ประวัติศาสตร์, เรียนทำอาหาร, เดย์ทริป, ทัวร์พร้อมไกด์, กิจกรรมทางน้ำ

ทริปยอดนิยม:
- วัดพระแก้วและวัดสำคัญ กรุงเทพ (ราคาเริ่มต้น 1,290 บาท)
- ตลาดน้ำอัมพวา (ราคาเริ่มต้น 1,590 บาท)
- ดอยอินทนนท์ เดย์ทริป (ราคาเริ่มต้น 1,890 บาท)
- เกาะพีพี ดำน้ำ (ราคาเริ่มต้น 2,490 บาท)

กฎสำคัญ:
- ตอบเป็นภาษาไทยเป็นหลัก แต่สลับภาษาอังกฤษได้ถ้าผู้ใช้ถาม
- ตอบสั้นกระชับ ไม่เกิน 3-4 ประโยค
- ใช้อิโมจิได้เล็กน้อยเพื่อความเป็นกันเอง
- ถ้าไม่แน่ใจ ให้แนะนำติดต่อทีมงานหรือดูข้อมูลในเว็บไซต์`;

const FALLBACK_RESPONSES: Record<string, string> = {
  "แนะนำทริปยอดนิยม": `ทริปยอดนิยมของเราครับ 🌟

1. **วัดพระแก้วและวัดสำคัญ กรุงเทพ** - เริ่มต้น ฿1,290
   ชมความงามของวัดพระศรีรัตนศาสดาราม พร้อมไกด์ท้องถิ่น

2. **ตลาดน้ำอัมพวา** - เริ่มต้น ฿1,590  
   ล่องเรือชมหิ่งห้อย ช้อปของกิน บรรยากาศสุดชิล

3. **ดอยอินทนนท์ เดย์ทริป** - เริ่มต้น ฿1,890
   สัมผัสอากาศเย็นสบาย ชมวิวทะเลหมอก

4. **เกาะพีพี ดำน้ำ** - เริ่มต้น ฿2,490
   ดำน้ำชมปะการัง น้ำใสราวกับกระจก

สนใจทริปไหนเป็นพิเศษไหมครับ? 😊`,

  "ทริปงบ 1,000": `ทริปงบประหยัดไม่เกิน ฿1,000 ครับ 💰

1. **ทัวร์ร้านอาหารย่านเยาวราช** - ฿990
   ชิมอาหารจีนต้นตำรับ 3 ชั่วโมง กับไกด์ท้องถิ่น

2. **วัดโพธิ์ Walking Tour** - ฿890
   เดินชมวัดโพธิ์ เรียนรู้ประวัติศาสตร์ 2 ชั่วโมง

3. **ตลาดนัดจตุจักร** - ฿750
   พาช้อปปิ้ง แนะนำร้านเด็ด 3 ชั่วโมง

ทุกทริปรวมไกด์และค่าเข้าชมแล้วครับ สนใจจองได้เลย! 🛒`,

  "ไกด์ท้องถิ่น": `ไกด์ท้องถิ่น (Local Guide) ของเราครับ 🏠

**ไกด์ท้องถิ่น** คือคนในพื้นที่จริงๆ ที่รู้จักสถานที่อย่างลึกซึ้ง

✅ ข้อดี:
- รู้จักร้านลับๆ ที่คนท้องถิ่นไป
- เล่าเรื่องราวจากประสบการณ์จริง  
- พูดภาษาท้องถิ่นได้
- แนะนำมุมถ่ายรูปสวยๆ

🏷️ สังเกตจากป้าย **สีเขียว** ในหน้าทริป

ไกด์ท้องถิ่นยอดนิยม:
- คุณสมชาย ใจดี (กรุงเทพ) ⭐ 4.9
- คุณวิชัย ภูเขา (เชียงใหม่) ⭐ 4.9

ต้องการดูไกด์เพิ่มเติมไหมครับ?`,

  "default": `สวัสดีครับ! ผมน้องแวนเดอร์ยินดีช่วยเหลือครับ 😊

ผมช่วยเรื่องเหล่านี้ได้:
- 🗺️ แนะนำทริปท่องเที่ยวในไทย
- 💰 หาทริปตามงบประมาณ  
- 👨‍🏫 แนะนำไกด์ท้องถิ่น/ไกด์ทั่วไป
- 📅 ข้อมูลการจองทริป

ลองถามมาได้เลยครับ หรือกดปุ่มด่วนด้านล่างก็ได้นะครับ!`
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("ยอดนิยม") || lowerMessage.includes("แนะนำ") || lowerMessage.includes("popular")) {
    return FALLBACK_RESPONSES["แนะนำทริปยอดนิยม"];
  }
  if (lowerMessage.includes("งบ") || lowerMessage.includes("1000") || lowerMessage.includes("1,000") || lowerMessage.includes("ถูก") || lowerMessage.includes("ประหยัด")) {
    return FALLBACK_RESPONSES["ทริปงบ 1,000"];
  }
  if (lowerMessage.includes("ไกด์ท้องถิ่น") || lowerMessage.includes("local")) {
    return FALLBACK_RESPONSES["ไกด์ท้องถิ่น"];
  }
  
  return FALLBACK_RESPONSES["default"];
}

async function tryGroqAPI(message: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        console.log("Groq API success");
        return text;
      }
    }
    console.log("Groq API failed:", response.status);
  } catch (error) {
    console.log("Groq API error:", error);
  }
  return null;
}

async function tryGeminiAPI(message: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nผู้ใช้: ${message}` }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log("Gemini API success");
        return text;
      }
    }
    console.log("Gemini API failed:", response.status);
  } catch (error) {
    console.log("Gemini API error:", error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Try Groq API first (free tier is generous)
    const groqResponse = await tryGroqAPI(lastMessage);
    if (groqResponse) {
      return NextResponse.json({ message: groqResponse });
    }

    // Try Gemini API
    const geminiResponse = await tryGeminiAPI(lastMessage);
    if (geminiResponse) {
      return NextResponse.json({ message: geminiResponse });
    }

    // Fallback to template responses
    console.log("Using fallback response");
    const fallbackResponse = getFallbackResponse(lastMessage);
    return NextResponse.json({ message: fallbackResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    const fallbackResponse = getFallbackResponse("");
    return NextResponse.json({ message: fallbackResponse });
  }
}
