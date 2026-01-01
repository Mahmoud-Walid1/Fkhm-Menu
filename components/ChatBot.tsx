import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Loader2, Phone } from 'lucide-react';
import { useAppStore } from '../store';
import { Message } from '../types';

export const ChatBot: React.FC = () => {
  const { products, settings, isChatOpen, toggleChat } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `مرحباً بك في ${settings.shopName}! ☕\nأنا مساعدك الذكي، كيف أقدر أساعدك اليوم بخصوص المنيو؟`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Define Function Tool
  const contactToolDeclaration: FunctionDeclaration = {
    name: 'showContactOptions',
    description: 'Show contact buttons ONLY for delivery driver (Delegate) or administration. Do NOT use for social media requests.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING, description: 'The reason why contact is needed' }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!process.env.API_KEY) {
        const errorMsg: Message = {
            id: Date.now().toString(),
            text: 'عذراً، لم يتم إعداد مفتاح الربط (API Key). يرجى التأكد من الإعدادات.',
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const menuContext = products.map(p => 
        `- ${p.name}: ${p.price} SAR (${p.description || ''})`
      ).join('\n');

      const systemInstruction = `
        You are a smart assistant for "${settings.shopName}".
        Menu: ${menuContext}
        
        Social Media Links:
        - Snapchat: ${settings.snapchatUrl || 'Not available'}
        - Instagram: ${settings.instagramUrl || 'Not available'}
        - TikTok: ${settings.tiktokUrl || 'Not available'}

        Rules:
        1. Answer questions about coffee/menu.
        2. If user asks for social media (Snapchat, Instagram, etc), provide the LINK directly in the text response. DO NOT call the contact function.
        3. If user asks for contact, "Mandoob" (Delegate), complaint, or admin, CALL the function "showContactOptions".
        4. Be brief and use Arabic.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [contactToolDeclaration] }],
        }
      });

      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
         const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: 'تفضل، يمكنك التواصل مباشرة عبر الأزرار التالية:',
            sender: 'bot',
            timestamp: new Date(),
            actions: [
                { label: 'تواصل مع مندوب التوصيل', url: `https://wa.me/${settings.deliveryNumber}`, type: 'primary' },
                { label: 'تواصل مع الإدارة', url: `https://wa.me/${settings.adminNumber}`, type: 'secondary' }
            ]
         };
         setMessages(prev => [...prev, botMsg]);
      } else {
         const text = response.text || 'عذراً، لم أفهم طلبك.';
         const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: text,
            sender: 'bot',
            timestamp: new Date()
         };
         setMessages(prev => [...prev, botMsg]);
      }

    } catch (error) {
      console.error('Chat Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'آسف، حدث خطأ في الاتصال. حاول مرة أخرى.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div 
              className="p-4 text-white flex justify-between items-center shadow-md"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <div className="flex items-center gap-2">
                <Bot size={24} className="animate-bounce" />
                <span className="font-bold">مساعد {settings.shopName}</span>
              </div>
              <button onClick={toggleChat} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 h-80">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-gray-800 text-white rounded-tl-none' 
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {msg.actions && (
                      <div className="flex flex-col gap-2 mt-2 w-full max-w-[85%]">
                          {msg.actions.map((action, idx) => (
                              <a
                                key={idx}
                                href={action.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold transition-all shadow-sm ${
                                    action.type === 'primary' 
                                    ? 'text-white hover:opacity-90' 
                                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                                }`}
                                style={action.type === 'primary' ? { backgroundColor: settings.primaryColor } : {}}
                              >
                                <Phone size={14} />
                                {action.label}
                              </a>
                          ))}
                      </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-2">
                     <Loader2 size={16} className="animate-spin text-gray-400" />
                     <span className="text-xs text-gray-400">جاري الرد...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t flex gap-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسألني عن القهوة..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ '--tw-ring-color': settings.primaryColor } as React.CSSProperties}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-full text-white disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl text-white z-[100] flex items-center justify-center group"
        style={{ backgroundColor: settings.primaryColor }}
      >
        {isChatOpen ? <X size={24} /> : (
            <>
               <MessageCircle size={28} />
               <span className="absolute right-full mr-3 bg-white text-gray-800 px-2 py-1 rounded-md text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  محادثة
               </span>
            </>
        )}
      </motion.button>
    </>
  );
};