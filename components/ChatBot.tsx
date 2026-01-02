import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Loader2, Phone } from 'lucide-react';
import { useAppStore } from '../store';
import { Message, MessageAction } from '../types';

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

  // Order State
  interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);


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
      تتحدث باللهجة السعودية الودودة والمحترفة (عامية بيضاء).
      
      البيانات الحالية للمنيو:
      ${products.map(p => `- ${p.name} (${p.price} ريال): ${p.description}`).join('\n')}
      
      معلومات التواصل:
      - رقم التوصيل/الطلبات: ${settings.deliveryNumber}
      - رقم الإدارة: ${settings.adminNumber}
      
      **أسلوبك:**
      - مرح وودود لكن في نفس الوقت محترف ورسمي.
      - استخدم كلمات لطيفة (يا غالي، هلا والله، أبشر، وش رايك، لا يفوتك، يشرفنا).
      - لا تسرد المنيو كأنه قائمة، بل اقترح بذكاء بناءً على طلب الزبون.
      - اقترح دائماً إضافات (Cross-sell) بطريقة لطيفة ومهذبة.
      - استخدم الإيموجي المناسب ☕🍪✨ لكن باعتدال.
      - خلي ردودك قصيرة ومفيدة (لا تزيد عن 3-4 جمل).
      
      **قدراتك في استلام الطلبات:**
      - تقدر تستلم طلبات من الزبائن وتأكدها معاهم.
      - لما الزبون يطلب منتج، أكد معاه اسم المنتج والكمية.
      - لو طلب أكتر من منتج، اسأله: "تمام! في حاجة تانية؟"
      - لما يخلص طلبه، راجع معاه الطلب كامل مع الأسعار والإجمالي.
      - بعد المراجعة، اسأله: "تمام كده؟ لو موافق قولي 'أكد الطلب' وأجهزلك رسالة واتساب جاهزة للمندوب 😊"
      - لما يؤكد الطلب، قوله: "تمام! جهزتلك رسالة الطلب ✅ اضغط على الزر اللي تحت عشان تبعت الطلب للمندوب على واتساب"
      - **مهم**: وضّح للزبون أنك بس بتساعده يكتب الطلب، وإنه لازم يضغط على زر "إرسال الطلب للتوصيل" عشان الطلب يروح فعلاً للمندوب
      
      **تنسيق مراجعة الطلب (مهم جداً - اتبع هذا التنسيق بالضبط):**
      عند مراجعة الطلب، اعرضه بالشكل ده:
      "خلني أراجع معاك الطلب:
      
      📋 طلبك:
      • [اسم المنتج] × [الكمية] = [السعر] ريال
      • [اسم المنتج] × [الكمية] = [السعر] ريال
      
      💰 الإجمالي: [المجموع] ريال
      
      تمام كده؟ لو موافق قولي 'أكد الطلب' 😊"
      
      **مثال على تنسيق صحيح:**
      • قهوة اليوم × 2 = 32 ريال
      • سان سباستيان × 1 = 32 ريال
      
      الإجمالي: 64 ريال
      
      **حدودك وصلاحياتك (مهم جداً):**
      - أنت مساعد افتراضي وليس لك صلاحية الموافقة على أي خصومات أو تخفيضات.
      - لا تستطيع تغيير المنيو أو الأسعار أو إضافة منتجات جديدة.
      - لا تستطيع الموافقة على طلبات إضافات خاصة للمنتجات (مثل: إضافة نكهة إضافية، تغيير المكونات).
      - إذا طلب الزبون خصم أو تغيير في المنيو أو إضافة خاصة، قل له بأدب:
        "يا غالي، للأسف هذا الموضوع مش من صلاحياتي 😊 لكن ممكن تتواصل مع الإدارة وهم بيساعدونك. رقم الإدارة: ${settings.adminNumber}"
      - كن مهذباً ومحترماً دائماً حتى لو رفضت الطلب.
      
      **مهم جداً (تنسيق الرد):**
      - عند طلب رقم التوصيل، قل: "تفضل رقم التوصيل: ${settings.deliveryNumber}" (بدون رموز أو علامات غريبة).
      - عند طلب رقم الإدارة أو رفض طلب، قل: "رقم الإدارة: ${settings.adminNumber}".
      - لا تضيف رموز برمجية أو علامات غريبة في وسط الكلام.
      - اكتب بعربية واضحة بدون أي رموز JSON أو Markdown.
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

      // Detect if response contains contact numbers and add action buttons
      const actions: MessageAction[] = [];

      // Check if this is an order confirmation
      const isOrderConfirmation = responseText.includes('طلبك جاهز') ||
        responseText.includes('تم تأكيد') ||
        responseText.includes('أكد الطلب') ||
        (responseText.includes('📋') && responseText.includes('💰'));

      if (isOrderConfirmation) {
        // Extract order details from the ENTIRE conversation
        const orderLines: string[] = [];
        let totalAmount = 0;

        // Look through all bot messages to find order review
        for (const msg of messages) {
          if (msg.sender === 'bot') {
            const lines = msg.text.split('\n');
            for (const line of lines) {
              // Match lines like: • منتج × 2 = 50 ريال
              if ((line.includes('×') || line.includes('x')) && line.includes('ريال')) {
                const cleanLine = line.replace(/•|bullet/g, '').trim();
                orderLines.push(cleanLine);

                // Extract price from line
                const priceMatch = line.match(/=\s*(\d+)\s*ريال/);
                if (priceMatch) {
                  totalAmount += parseInt(priceMatch[1]);
                }
              }
              // Check for total amount line
              if (line.includes('الإجمالي') && line.includes('ريال')) {
                const totalMatch = line.match(/(\d+)\s*ريال/);
                if (totalMatch) {
                  totalAmount = parseInt(totalMatch[1]);
                }
              }
            }
          }
        }

        // Generate WhatsApp message
        let whatsappMessage = `*طلب جديد من ${settings.shopName}*\n\n`;
        whatsappMessage += `*تفاصيل الطلب:*\n`;

        if (orderLines.length > 0) {
          orderLines.forEach(line => {
            whatsappMessage += `- ${line}\n`;
          });
        } else {
          whatsappMessage += `(يرجى ذكر تفاصيل الطلب للمندوب)\n`;
        }

        whatsappMessage += `\n*الإجمالي: ${totalAmount} ريال*\n\n`;
        whatsappMessage += `الوقت: ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}\n`;
        whatsappMessage += `\nشكراً!`;

        // Add delivery button with pre-filled message
        actions.push({
          label: `إرسال الطلب للتوصيل`,
          url: `https://wa.me/${settings.deliveryNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`,
          type: 'primary'
        });
      }
      // Regular contact buttons
      else if (responseText.includes(settings.deliveryNumber) || responseText.includes('توصيل') || responseText.includes('طلب')) {
        actions.push({
          label: `📞 تواصل واتساب للتوصيل`,
          url: `https://wa.me/${settings.deliveryNumber.replace(/\D/g, '')}`,
          type: 'primary'
        });
      }

      if (responseText.includes(settings.adminNumber) || responseText.includes('إدارة') || responseText.includes('صلاحيات') || responseText.includes('خصم')) {
        actions.push({
          label: `💼 تواصل مع الإدارة`,
          url: `https://wa.me/${settings.adminNumber.replace(/\D/g, '')}`,
          type: 'secondary'
        });
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined
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
            className="fixed bottom-24 right-2 left-2 md:left-auto md:right-4 w-auto md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden flex flex-col max-h-[500px]"
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
                    <div className="flex flex-col gap-3 mt-3 w-full max-w-[90%]">
                      {msg.actions.map((action, idx) => (
                        <a
                          key={idx}
                          href={action.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-xl transform hover:scale-105 ${action.type === 'primary'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                            }`}
                        >
                          <span className="text-lg">{action.label.split(' ')[0]}</span>
                          <span>{action.label.split(' ').slice(1).join(' ')}</span>
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[2147483647] flex items-center gap-3 group"
      >
        {isChatOpen ? (
          <div
            className="p-4 rounded-full shadow-2xl text-white ring-4 ring-white"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <X size={28} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Visible Text Label */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="bg-white text-gray-800 px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-xl font-bold text-xs md:text-sm border-2 border-purple-100 hidden sm:flex items-center"
            >
              <span className="text-base md:text-lg align-middle ml-1">🤖</span>
              تحدث معنا
            </motion.div>

            <div className="relative">
              {/* Robot Head Container - Responsive Size */}
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-2xl border-2 md:border-4 border-white relative"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <Bot size={28} className="text-white md:w-8 md:h-8" strokeWidth={1.5} />
              </div>

              {/* "Online/Offline" Indicator */}
              <div
                className={`absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 ${settings.groqApiKey || settings.geminiApiKey ? 'bg-green-400' : 'bg-red-400'
                  } border-2 md:border-3 border-white rounded-full shadow-lg animate-pulse`}
              />
            </div>
          </div>
        )}
      </motion.button>

    </>,
    document.body
  );
};