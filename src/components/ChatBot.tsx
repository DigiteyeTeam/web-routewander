"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/context/LocaleContext";

type SuggestedItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  reason: string;
};

type ChatResponse = {
  reply: string;
  suggested_items: SuggestedItem[];
  ui_action: {
    type: "none" | "show_detail";
    targetId?: string;
  };
  follow_up_questions: string[];
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedItems?: SuggestedItem[];
  followUpQuestions?: string[];
};

export default function ChatBot() {
  const router = useRouter();
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const INITIAL_MESSAGE: Message = {
    id: "welcome",
    role: "assistant",
    content: locale === "en" 
      ? "Hello! 👋 I'm Wander, your Route Wander assistant. I can help you find the perfect trip in Thailand. What are you looking for?"
      : "สวัสดีครับ! 👋 ผมคือน้องแวนเดอร์ ผู้ช่วยของ Route Wander ยินดีช่วยแนะนำทริปท่องเที่ยวในไทยครับ มีอะไรให้ช่วยไหมครับ?",
    followUpQuestions: locale === "en"
      ? ["Show me popular trips", "Budget-friendly options", "What are local guides?"]
      : ["แนะนำทริปยอดนิยม", "ทริปงบประหยัด", "ไกด์ท้องถิ่นคืออะไร"],
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([INITIAL_MESSAGE]);
    }
  }, [locale]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.id !== "welcome"), userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      // Handle UI action
      if (data.ui_action?.type === "show_detail" && data.ui_action.targetId) {
        router.push(`/activity/${data.ui_action.targetId}`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || (locale === "en" ? "Sorry, something went wrong. Please try again." : "ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"),
        suggestedItems: data.suggested_items,
        followUpQuestions: data.follow_up_questions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: locale === "en" 
          ? "Sorry, I can't connect right now. Please try again. 🙏"
          : "ขออภัยครับ ไม่สามารถเชื่อมต่อได้ในขณะนี้ กรุณาลองใหม่อีกครั้งนะครับ 🙏",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const quickSuggestions = locale === "en"
    ? ["Popular trips", "Budget ฿1,500", "Local guides"]
    : ["ทริปยอดนิยม", "งบ ฿1,500", "ไกด์ท้องถิ่น"];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {locale === "en" ? "Wander" : "น้องแวนเดอร์"}
                </h3>
                <p className="text-white/80 text-xs">
                  {locale === "en" ? "Route Wander Assistant" : "ผู้ช่วย Route Wander"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={locale === "en" ? "Clear chat" : "ล้างแชท"}
              >
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>

                {/* Suggested Items Cards */}
                {message.suggestedItems && message.suggestedItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestedItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/activity/${item.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group"
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {item.category}
                            </span>
                            <span className="text-xs text-slate-500">{item.reason}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-primary">฿{item.price.toLocaleString()}</p>
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Follow-up Questions */}
                {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.followUpQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(question)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0">
            {quickSuggestions.map((text) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                disabled={isLoading}
                className="shrink-0 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={locale === "en" ? "Type a message..." : "พิมพ์ข้อความ..."}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-slate-600 hover:bg-slate-700 rotate-0"
            : "bg-gradient-to-r from-primary to-indigo-600 hover:shadow-xl hover:scale-105"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        
        {/* Notification dot */}
        {!isOpen && hasNewMessage && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">1</span>
          </span>
        )}
      </button>
    </>
  );
}
