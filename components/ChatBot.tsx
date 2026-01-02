import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Loader2, Phone } from 'lucide-react';
import { useAppStore } from '../store';
import { Message } from '../types';

export const ChatBot: React.FC<{ isCartOpen?: boolean }> = ({ isCartOpen = false }) => {
  const { products, settings, isChatOpen, toggleChat } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `هلا والله! نورت ${settings.shopName} ☕✨\n\nأنا الباريستا الذكي، آمرني وش خاطرك فيه اليوم؟ قهوة تعدل المزاج ولا حلى يروق عليك؟ 😋`,
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

  // Auto-popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isChatOpen) {
        setShowAutoPopup(true);
        // Hide after 8 seconds
        setTimeout(() => setShowAutoPopup(false), 8000);
      }
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [isChatOpen]);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare System Instruction
    const systemInstruction = `
      أنت "باريستا" ذكي ومرح في كافيه "${settings.shopName}".
      تتحدث باللهجة السعودية الودودة (عامية بيضاء).
      
      البيانات الحالية للمنيو:
      ${products.map(p => `- ${p.name} (${p.price} ريال): ${p.description}`).join('\n')}
      
      أسلوبك:
      - مرح، خفيف دم، وصديق للزبون (استخدم: يا غالي، هلا والله، أبشر، وش رايك، لا يفوتك).
      - لا تسرد المنيو كأنه قائمة، بل اقترح بذكاء بناءً على طلب الزبون.
      - اقترح دائماً إضافات (Cross-sell) بطريقة لطيفة (مثل: "جربت الحلى مع القهوة؟ تراه دمار 🔥😍").
      - استخدم الإيموجي المناسب ☕🍪✨.
      - خلي ردودك قصيرة ومفيدة (لا تزيد عن 3-4 جمل).
    `;

    try {
      let responseText = '';

      // PRIORITY 1: Check for Groq API (Llama 3)
      if (settings.groqApiKey) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemInstruction },
              ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
              { role: 'user', content: userMessage.text }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 300
          })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          responseText = data.choices[0].message.content;
        } else {
          throw new Error(data.error?.message || 'Groq API Error');
        }

      }
      // PRIORITY 2: Fallback to Gemini API
      else if (settings.geminiApiKey) {
        const genAI = new GoogleGenAI({ apiKey: settings.geminiApiKey });
        const response = await genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: userMessage.text,
          config: {
            systemInstruction: systemInstruction,
          }
        });

        responseText = response.text || 'عذراً، لم أفهم طلبك.';
      } else {
        responseText = "المعذرة، لم يتم تفعيل خدمة الرد الذكي 🤖. يرجى من المسؤول إضافة مفتاح API في الإعدادات.";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "آسف، صار عندي لخبطة بسيطة في النظام 😵‍💫. ممكن تعيد اللي قلته؟",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const constraintsRef = useRef(null);

  return createPortal(
    <>
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-[2147483646]" />

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden flex flex-col max-h-[500px]"
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
                    className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${msg.sender === 'user'
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
                          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold transition-all shadow-sm ${action.type === 'primary'
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

      {/* Auto-popup tooltip */}
      <AnimatePresence>
        {showAutoPopup && !isChatOpen && !isCartOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9998] max-w-[200px]"
          >
            <p className="text-sm font-bold">👋 ممكن أساعدك؟</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">اضغط للتحدث معي!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -5, 0],
          rotate: [0, -5, 5, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut"
        }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[2147483647] flex items-center justify-center group relative"
      >
        {isChatOpen ? (
          <div
            className="p-4 rounded-full shadow-2xl text-white ring-4 ring-white"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <X size={24} />
          </div>
        ) : (
          <div className="relative">
            {/* Robot Head Container */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transform transition-transform"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Bot size={32} className="text-white" strokeWidth={1.5} />

              {/* Eyes Animation Wrapper (simple effect) */}
              <div className="absolute top-1/3 w-full flex justify-center gap-3 opacity-0">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="w-1 h-1 bg-white rounded-full animate-ping delay-75" />
              </div>
            </div>

            {/* "Online" Indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />

            {/* Speech Bubble Label */}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-1.5 rounded-xl rounded-tr-none text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform translate-x-2 group-hover:translate-x-0">
              <span className="text-lg align-middle mr-1">🤖</span>
              مساعدك الشخصي
            </span>
          </div>
        )}
      </motion.button>

    </>,
    document.body
  );
};