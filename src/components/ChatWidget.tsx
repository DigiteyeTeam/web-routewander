
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MapPin, Sparkles, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { places } from '../data/mockData';
import ImageWithFallback from './ImageWithFallback';

import ivyChatIcon from '../images/Ivy8.png';
import ivyHeaderIcon from '../images/Ivy7.png';

// --- TYPES ---
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  suggestedPlaces?: SuggestedPlace[];
}

interface SuggestedPlace {
  placeId: string;
  name: string;
  province: string;
  category: string;
  shortReason: string;
}

interface AIResponse {
  reply: string;
  suggested_places: SuggestedPlace[];
  ui_action: {
    type: "none" | "open_place_picker" | "open_map_to_place";
    province: string | null;
    placeId: string | null;
  };
  follow_up_questions: string[];
}

// --- SYSTEM INSTRUCTION (locale injected at runtime) ---
const getSystemInstruction = (locale: 'en' | 'th') => `
You are "Ivy", a cute and friendly travel assistant.
Your tone should be warm, helpful, and use emojis occasionally (e.g., 😊, 🌿, ✨).
You must only recommend places that exist in our internal dataset provided to you.
When the user asks for travel recommendations, first ask clarifying questions only if needed (province, vibe, time).
Always return results in the required JSON schema so the website can trigger UI actions.

INTERNAL DATASET (PLACES):
${JSON.stringify(places.map(p => ({ id: p.placeId, name: p.nameTH, province: p.province, category: p.category, description: p.shortDescriptionTH })))}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "reply": "string",
  "suggested_places": [
    {
      "placeId": "string",
      "name": "string",
      "province": "string",
      "category": "string",
      "shortReason": "string"
    }
  ],
  "ui_action": {
    "type": "none | open_place_picker | open_map_to_place",
    "province": "string|null",
    "placeId": "string|null"
  },
  "follow_up_questions": ["string"]
}

RULES:
1) Data constraint: Never invent places. Only use places provided above.
2) Recommendation behavior:
   - If user asks for province/region recommendations -> ui_action.type = "open_place_picker", province = that province.
   - Return 3-5 places.
3) Selection behavior:
   - If user chooses a place -> ui_action.type = "open_map_to_place", placeId = chosen id.
4) Tone: Friendly, concise, helpful. Respond in ${locale === 'th' ? 'Thai' : 'English'} only.
`;

const ChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, navigateToMapAndSelectPlace, chatDraft, clearChatDraft } = useAppContext();
  const { locale, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const QUICK_SUGGESTIONS = [t('chat.suggestChiangMai'), t('chat.suggestNature'), t('chat.suggestTemples'), t('chat.suggestNearby')];

  // API key: Vite injects via vite.config define from GEMINI_API_KEY in .env
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const hasValidKey = !!apiKey && String(apiKey) !== 'undefined';
  const ai = hasValidKey ? new GoogleGenAI({ apiKey }) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isChatOpen]);

  // Initial Greeting (locale-dependent)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init',
          role: 'model',
          content: t('chat.greeting'),
        }
      ]);
    }
    // Auto-hide tooltip after 3 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [t]);

  // Update greeting when locale changes and only init message is present
  useEffect(() => {
    setMessages(prev => {
      if (prev.length !== 1 || prev[0].id !== 'init' || prev[0].role !== 'model') return prev;
      return [{ ...prev[0], content: t('chat.greeting') }];
    });
  }, [locale, t]);

  // Handle pre-filled draft
  useEffect(() => {
    if (isChatOpen && chatDraft) {
      setInput(chatDraft);
      clearChatDraft();
    }
  }, [isChatOpen, chatDraft, clearChatDraft]);

  const handleSendMessage = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!hasValidKey || !ai) {
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: t('chat.noApiKey')
      }]);
      return;
    }

    try {
      // Create chat history for context
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Add current message
      history.push({ role: 'user', parts: [{ text: userMessage.content }] });

      const model = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history.map(h => ({ role: h.role, parts: h.parts })),
        config: {
          systemInstruction: getSystemInstruction(locale),
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const result = await model;
      const responseText = result?.text ?? null;
      
      if (!responseText) throw new Error("Empty response");

      const aiData: AIResponse = JSON.parse(responseText);

      // Handle UI Actions
      if (aiData.ui_action?.type === 'open_map_to_place' && aiData.ui_action.placeId) {
        navigateToMapAndSelectPlace(aiData.ui_action.placeId);
      }

      // Add Model Response
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiData.reply ?? '',
        suggestedPlaces: aiData.suggested_places ?? []
      };

      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      const err = error as { message?: string; status?: number; error?: { code?: number; status?: string } };
      const is429 = err?.error?.code === 429 || (typeof err?.message === 'string' && err.message.includes('429'));
      const msg = is429 ? t('chat.quotaExceeded') : t('chat.error');
      console.error("Chat AI Error:", err?.message ?? err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: msg
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePlaceClick = (place: SuggestedPlace) => {
    handleSendMessage(t('chat.interestedIn').replace('{name}', place.name));
  };

  const resetChat = () => {
    setMessages([{
      id: 'init',
      role: 'model',
      content: t('chat.greeting'),
    }]);
  };

  // Helper to get image for suggestion card
  const getPlaceImage = (placeId: string) => {
    const found = places.find(p => p.placeId === placeId);
    return found ? found.thumbnailUrl : null;
  };

  return (
    <>
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .msg-pop-in {
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* ไอคอน Ivy ขยับนิดหน่อย: ลอยขึ้นลง + scale เบาๆ */
        @keyframes mascot-float {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03) translateY(-5px); }
        }

        .mascot-pulse {
          animation: mascot-float 2.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
        .animate-blink {
          animation: blink 4s infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Main Container */}
      <div className={`
        fixed z-50 flex flex-col items-end gap-3
        right-4 bottom-4
        md:right-6 md:bottom-6 
        lg:right-8 lg:bottom-8
        transition-all duration-300
      `}>
        
        {/* CHAT PANEL */}
        {isChatOpen && (
          <div className="
            w-[calc(100vw-32px)] md:w-[380px] 
            h-[60vh] md:h-[600px] 
            bg-white dark:bg-[#221810] rounded-[24px] shadow-2xl border border-soft-border dark:border-[#3d2b1d] 
            flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right mb-2
          ">
            
            {/* Header */}
            <div className="bg-theme-gradient px-6 py-5 flex items-center justify-between shrink-0 rounded-t-[24px]">
              <div className="flex items-center gap-3">
                {/* Ivy avatar (หัวแชท) - กรอบวงกลม */}
                <div className="size-10 rounded-full overflow-hidden border-2 border-white/30 shrink-0 flex items-center justify-center bg-white/10">
                  <img src={ivyHeaderIcon} alt="Ivy" className="w-full h-full object-cover object-center scale-[1.69]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-1">
                    Ivy <Sparkles size={14} className="text-yellow-200" />
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full border border-white/20 animate-pulse"></span>
                    <p className="text-white/90 text-xs font-medium">Online • {t('chat.subtitle')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetChat} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Start Over">
                  <RefreshCw size={18} />
                </button>
                <button onClick={() => setIsChatOpen(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#FAFAFA] dark:bg-[#1a120b]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col msg-pop-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Avatar for AI */}
                  {msg.role === 'model' && (
                     <div className="flex items-end gap-2 mb-1 w-full">
                        <div className="size-8 rounded-full overflow-hidden shrink-0 mb-2 border-2 border-primary/20 dark:border-primary/30 flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                           <img src={ivyHeaderIcon} alt="Ivy" className="w-full h-full object-cover object-center scale-[1.69]" />
                        </div>
                        <div className={`
                          relative max-w-[85%] rounded-2xl rounded-bl-none px-4 py-3 text-sm leading-relaxed shadow-sm
                          bg-white dark:bg-[#2d1f14] text-[#181411] dark:text-white border border-slate-100 dark:border-[#3d2b1d]
                        `}>
                          {msg.content}
                        </div>
                     </div>
                  )}

                  {/* User Bubble */}
                  {msg.role === 'user' && (
                    <div className={`
                      max-w-[85%] rounded-2xl rounded-br-none px-4 py-3 text-sm leading-relaxed shadow-md
                      bg-primary text-white
                    `}>
                      {msg.content}
                    </div>
                  )}

                  {/* Suggested Places Cards */}
                  {msg.suggestedPlaces && msg.suggestedPlaces.length > 0 && (
                    <div className="pl-10 mt-3 space-y-3 w-full max-w-[95%]">
                      {msg.suggestedPlaces.map(place => {
                        const img = getPlaceImage(place.placeId);
                        return (
                          <div 
                            key={place.placeId}
                            className="bg-white dark:bg-[#2d1f14] rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-[#3d2b1d] hover:shadow-md transition-all group animate-in zoom-in-95 duration-300"
                          >
                            <div className="flex h-24">
                              {img && (
                                <div className="w-24 h-full shrink-0">
                                  <ImageWithFallback src={img} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                              )}
                              <div className="flex-1 p-3 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-[#181411] dark:text-white line-clamp-1">{place.name}</h4>
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{place.category}</span>
                                  </div>
                                  <p className="text-xs text-[#897261] dark:text-white/60 line-clamp-1 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} /> {place.province}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => handlePlaceClick(place)}
                                  className="self-end bg-primary hover:bg-primary-warm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                                >
                                  {t('chat.select')} <ChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                 <div className="flex items-end gap-2 w-full msg-pop-in">
                    <div className="size-8 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 dark:border-primary/30 flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                       <img src={ivyHeaderIcon} alt="Ivy" className="w-full h-full object-cover object-center scale-[1.69]" />
                    </div>
                    <div className="bg-white dark:bg-[#2d1f14] px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-[#3d2b1d] shadow-sm flex gap-1.5 items-center h-10">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions & Input */}
            <div className="bg-white dark:bg-[#221810] border-t border-soft-border dark:border-[#3d2b1d] flex flex-col">
              
              {/* Quick Chips */}
              {!isLoading && (
                <div className="px-4 pt-3 pb-1 overflow-x-auto no-scrollbar flex gap-2">
                  {QUICK_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 pb-4">
                <div className="flex items-center gap-2 bg-[#F4F2F0] dark:bg-white/5 rounded-full px-1.5 py-1.5 border border-transparent focus-within:border-primary focus-within:bg-white dark:focus-within:bg-white/10 transition-all shadow-inner">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 bg-transparent outline-none text-sm text-[#181411] dark:text-white placeholder:text-[#897261]/60 dark:placeholder:text-white/30 px-4 h-9"
                    disabled={isLoading}
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="size-9 bg-primary text-white rounded-full hover:bg-primary-warm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md active:scale-95"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING BUTTON (Mascot) */}
        <div className={`relative group transition-all duration-300 ${!isChatOpen ? 'mb-20 md:mb-0' : ''}`}>
           {/* Tooltip */}
           {!isChatOpen && showTooltip && (
             <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3 py-1.5 bg-white dark:bg-[#2d1f14] text-[#181411] dark:text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-500 border border-soft-border dark:border-[#3d2b1d] z-50">
               {t('chat.askAI')}
               <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-[#2d1f14] rotate-45 border-t border-r border-soft-border dark:border-[#3d2b1d]"></div>
             </div>
           )}

           <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`
              relative flex items-center justify-center 
              rounded-full hover:scale-[1.02] active:scale-95 transition-all duration-300 z-50
              ${isChatOpen 
                ? 'w-10 h-10 md:w-12 md:h-12 bg-serene-green rotate-90' 
                : 'w-[34px] h-[34px] md:w-16 md:h-16 lg:w-[88px] lg:h-[88px] mascot-pulse shadow-lg'
              }
            `}
            aria-label={isChatOpen ? "Close Chat" : "Open Chat with AI Assistant"}
          >
            {isChatOpen ? (
              <X className="text-white w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <img
                src={ivyChatIcon}
                alt="Chat AI"
                className="w-full h-full rounded-full object-cover object-center"
              />
            )}
          </button>
        </div>
        
      </div>
    </>
  );
};

export default ChatWidget;
