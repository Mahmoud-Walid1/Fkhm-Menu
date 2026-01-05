import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Loader2, Phone } from 'lucide-react';
import { useAppStore } from '../store';
import { Message, MessageAction } from '../types';

export const ChatBot: React.FC<{ isCartOpen?: boolean }> = ({ isCartOpen = false }) => {
  const { products, categories, settings, isChatOpen, toggleChat, addToCart } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

    const systemInstruction = `
       **الهوية والدور:**
       أنت "مساعد فخم البن الذكي".
       - **مهمتك:** مساعد افتراضي وظيفته فقط مساعدة العميل في تصفح المنيو، واختيار ما يناسب ذوقه، وتسهيل عملية الطلب عبر الأزرار.
       - **حدودك:** أنت لست نادلاً بشرياً، ولا تقوم بتحضير الطلبات، ولا يمكنك الاتصال بالموظفين نيابة عن العميل.
       - **اللهجة:** سعودية بيضاء، فخمة وودودة (مثال: "حياك، وش بخاطرك اليوم؟", "سم", "أبشر").
       - **اللغة:** الرد بالعربية دائماً وأبداً.

       **القيود الصارمة (Strict Constraints) - هام جداً:**
       1. **صلاحيات الأسعار:**
          - يمنع منعاً باتاً تغيير الأسعار أو تقديم خصومات. الأسعار نهائية.
          - إذا طلب العميل خصماً، رد بلطف مثل: "يا غالي، الأسعار عندنا ثابتة ومدروسة لتقديم أفخم جودة، وتستاهل كل ريال."
       2. **حدود التنفيذ:**
          - **لا تقل** "جاري تحضير طلبك" أو "سأخبر الموظف".
          - بدلاً من ذلك قل: "اختيار كايف! أنا جهزت لك الزر تحت، اضغط 'إضافة للسلة' وأكمل الطلب"، أو استخدم زر الاتصال.
       3. **التواصل:**
          - لا يمكنك الاتصال بأحد. اعرض [SHOW_ADMIN] أو [SHOW_DELIVERY] إذا لزم الأمر.
       4. **الالتزام بالمنيو (هام جداً):**
          - **لا تذكر أي منتج غير موجود في قائمة "بيانات المنيو" أدناه.**
          - إذا سأل العميل عن منتج غير موجود (مثل شاي أخضر، شاي فواكه) وهو غير مدرج في القائمة، قل بوضوح: "المعذرة، هذا الصنف غير متوفر عندنا حالياً."
          - لا تؤلف نكهات أو أنواع من عندك. إجابتك يجب أن تكون مبنية 100% على البيانات المقدمة فقط.

       **نظام الأزرار (استخدم هذه التاجات في نهاية ردك):**
       1. [SHOW_CATEGORIES]: لعرض قائمة الأقسام.
       2. [SHOW_PRODUCTS:جزء_من_اسم_القسم]: لعرض منتجات قسم معين.
       3. [SUGGEST_PRODUCT:ID]: لاقتراح منتج معين ليقوم العميل بإضافته للسلة. (مثال: طلب كورتادو -> ردك يحتوي [SUGGEST_PRODUCT:101]).
       4. [SHOW_DELIVERY]: إذا سأل عن التوصيل.
       5. [SHOW_ADMIN]: إذا طلب محادثة موظف، إدارة، أو شكوى.

       **بيانات المنيو:**
       الأقسام: ${categories.map(c => c.name).join(', ')}
       المنتجات:
       ${products.map(p => {
      const category = categories.find(c => c.id === p.categoryId);
      return `- ${p.name} (ID: ${p.id}, قسم: ${category?.name || p.category}, سعر: ${p.price} ريال, وصف: ${p.description || 'لا يوجد'})`;
    }).join('\n')}
    `;


    // Simple Fallback Logic (No AI) - Used when all APIs fail
    const getFallbackResponse = (userInput: string): string | null => {
      const input = userInput.toLowerCase().trim();

      // Greeting patterns
      if (/^(هلا|السلام|صباح|مساء|مرحبا|هاي|هلو)/.test(input)) {
        return `أهلاً وسهلاً في ${settings.shopName}! 😊\n\nعندنا قائمة فخمة من القهوة والحلويات، تصفح المنيو واضغط على أي منتج يعجبك!`;
      }

      // Menu/Categories request
      if (/منيو|قائمة|أقسام|فئات|عندكم|وش في/.test(input)) {
        return `تفضل! عندنا هالأقسام:\n\n${categories.map(c => `${c.icon || '📂'} ${c.name}`).join('\n')}\n\nاضغط على أي قسم بالأسفل عشان تشوف المنتجات 👇\n[SHOW_CATEGORIES]`;
      }

      // Coffee specific
      if (/قهوة|كوفي|اسبريسو|كابتشينو|لاتيه|كورتادو/.test(input)) {
        const coffeeCategory = categories.find(c => /قهوة|coffee|espresso/i.test(c.name));
        if (coffeeCategory) {
          return `عندنا قهوة فخمة ومحترمة! ☕✨\n\nشوف قسم "${coffeeCategory.name}" بالمنيو، أو اضغط الزر بالأسفل:\n[SHOW_PRODUCTS:${coffeeCategory.name}]`;
        }
        return `عندنا قهوة فخمة! ☕ شوف قسم القهوة بالمنيو واختار اللي يناسبك\n[SHOW_CATEGORIES]`;
      }

      // Desserts
      if (/حلى|حلا|حلويات|كيك|تشيز|تورته/.test(input)) {
        const dessertCategory = categories.find(c => /حلى|حلو|dessert|cake/i.test(c.name));
        if (dessertCategory) {
          return `حلوياتنا تجنن! 🍰✨\n\nشوف قسم "${dessertCategory.name}":\n[SHOW_PRODUCTS:${dessertCategory.name}]`;
        }
        return `عندنا حلويات فاخرة! 🍰 تصفح المنيو\n[SHOW_CATEGORIES]`;
      }

      // Delivery
      if (/توصيل|ديليفري|delivery|يوصل/.test(input)) {
        return `نعم، نوفر خدمة التوصيل! 🚗💨\n\nللطلب، تواصل مع المندوب:\n[SHOW_DELIVERY]`;
      }

      // Contact/Admin
      if (/تواصل|اتصال|كلام|موظف|إدارة|شكوى|مشكلة/.test(input)) {
        return `تقدر تتواصل معنا مباشرة:\n[SHOW_ADMIN]`;
      }

      // Prices
      if (/سعر|كم|price/.test(input)) {
        return `الأسعار موجودة مع كل منتج في المنيو! 💰\n\nتصفح وشوف اللي يناسبك:\n[SHOW_CATEGORIES]`;
      }

      // Default helpful response
      if (input.length > 3) {
        return `أهلاً! للأسف، مساعدي الذكي مشغول حالياً 🤖 لكن تقدر:\n\n🔹 تتصفح المنيو وتختار\n🔹 تسألني عن أقسام معينة (قهوة، حلى، إلخ)\n🔹 أو تواصل معنا مباشرة\n\nوش تحتاج؟ 😊`;
      }

      return null;
    };

    try {
      let responseText = '';
      let usedFallback = false;

      // PRIORITY 1: Try Groq API (Llama 3)
      if (settings.groqApiKey) {
        try {
          // Collect all available Groq keys from separate fields
          const groqKeys = [
            settings.groqApiKey,
            settings.groqApiKey2,
            settings.groqApiKey3
          ].filter(k => k && k.trim());

          const activeGroqKey = groqKeys[Math.floor(Math.random() * groqKeys.length)];

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${activeGroqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: systemInstruction },
                ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
                { role: 'user', content: userMessage.text }
              ],
              model: 'llama3-8b-8192',
              temperature: 0.3,
              max_tokens: 300
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            console.error('Groq API Error Details:', errorData);

            // Check if it's a rate limit error
            if (errorData?.error?.type === 'rate_limit_exceeded' || response.status === 429) {
              console.warn('⚠️ Groq rate limit exceeded, switching to Gemini...');
              throw new Error('RATE_LIMIT'); // Special error to trigger fallback
            }

            throw new Error(`Groq API Error: ${response.status} - ${errorData?.error?.message || response.statusText}`);
          }

          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            responseText = data.choices[0].message.content;
          } else {
            throw new Error('Groq Empty Response');
          }
        } catch (groqError) {
          console.warn('Groq API failed, attempting fallback to Gemini if available...', groqError);
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }

      // PRIORITY 2: Fallback to Gemini Flash API (Free, Fast, Generous Limits)
      if (usedFallback && settings.geminiApiKey) {
        try {
          // Collect all available Gemini keys from separate fields
          const geminiKeys = [
            settings.geminiApiKey,
            settings.geminiApiKey2,
            settings.geminiApiKey3
          ].filter(k => k && k.trim());

          const activeGeminiKey = geminiKeys[Math.floor(Math.random() * geminiKeys.length)];

          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': activeGeminiKey
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemInstruction },
                    { text: '\n\nالمحادثة السابقة:\n' + messages.map(m => `${m.sender === 'user' ? 'المستخدم' : 'المساعد'}: ${m.text}`).join('\n') },
                    { text: '\n\nالسؤال الحالي:\n' + userMessage.text }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500
              }
            })
          });

          if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json().catch(() => ({ error: { message: geminiResponse.statusText } }));
            console.error('Gemini API Error:', errorData);

            // Check if it's a rate limit error (Gemini also has limits)
            if (errorData?.error?.status === 'RESOURCE_EXHAUSTED' || geminiResponse.status === 429) {
              console.warn('⚠️ Gemini rate limit exceeded, using rule-based fallback...');
              throw new Error('GEMINI_RATE_LIMIT');
            }

            throw new Error(`Gemini API Error: ${geminiResponse.status} - ${errorData?.error?.message || geminiResponse.statusText}`);
          }

          const geminiData = await geminiResponse.json();
          if (geminiData.candidates && geminiData.candidates.length > 0) {
            responseText = geminiData.candidates[0].content.parts[0].text;
          } else {
            throw new Error('Gemini Empty Response');
          }
        } catch (geminiError) {
          console.error('Gemini API failed, using rule-based fallback...', geminiError);
          // PRIORITY 3: Use simple pattern matching
          const fallbackText = getFallbackResponse(userMessage.text);
          responseText = fallbackText || "أهلاً! حالياً الخدمة الذكية مشغولة، لكن تقدر تتصفح المنيو أو تتواصل معنا مباشرة 😊\n[SHOW_CATEGORIES]";
        }
      } else if (usedFallback && !settings.geminiApiKey) {
        // No API key - use rule-based responses
        const fallbackText = getFallbackResponse(userMessage.text);
        responseText = fallbackText || "أهلاً! للاستمتاع بالمساعد الذكي، يرجى من المسؤول إضافة مفتاح Gemini API (مجاني!) 🤖\n\nلكن تقدر تتصفح المنيو:\n[SHOW_CATEGORIES]";
      }


      // Detect if response contains contact numbers and add action buttons
      const actions: MessageAction[] = [];

      // Detect and handle category/product display markers
      let displayText = responseText;

      // Check for [SHOW_CATEGORIES] marker
      if (displayText.includes('[SHOW_CATEGORIES]')) {
        displayText = displayText.replace('[SHOW_CATEGORIES]', '');

        // Add category buttons
        categories.forEach(category => {
          actions.push({
            label: `${category.icon || '📂'} ${category.name}`,
            onClick: () => {
              // Scroll to category and CLICK it to active it
              const categoryElement = document.getElementById(`category-${category.id}`);
              if (categoryElement) {
                categoryElement.click(); // Trigger state change in Menu.tsx
                setTimeout(() => {
                  categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
              toggleChat(); // Close chat
            },
            type: 'secondary'
          });
        });
      }

      // Check for [SHOW_PRODUCTS:categoryName] marker
      const productMarkerMatch = displayText.match(/\[SHOW_PRODUCTS:([^\]]+)\]/);
      if (productMarkerMatch) {
        const categoryName = productMarkerMatch[1];
        displayText = displayText.replace(productMarkerMatch[0], '');

        // Find matching category
        const matchingCategory = categories.find(c =>
          c.name.includes(categoryName) || categoryName.includes(c.name)
        );

        if (matchingCategory) {
          // Get products for this category
          const categoryProducts = products.filter(p => p.categoryId === matchingCategory.id);

          // Add product buttons
          categoryProducts.forEach(product => {
            actions.push({
              label: `${product.name} - ${product.price} ريال`,
              onClick: () => {
                // 1. Switch Category First
                const categoryElement = document.getElementById(`category-${matchingCategory.id}`);
                if (categoryElement) {
                  categoryElement.click(); // Trigger state change
                }

                // 2. Wait for re-render then scroll to product
                setTimeout(() => {
                  const productElement = document.querySelector(`[data-product-id="${product.id}"]`);
                  if (productElement) {
                    productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional: Highlight effect
                    productElement.classList.add('ring-4', 'ring-purple-400');
                    setTimeout(() => productElement.classList.remove('ring-4', 'ring-purple-400'), 2000);
                  }
                }, 300); // Wait 300ms for state update and DOM render

                toggleChat(); // Close chat
              },
              type: 'secondary'
            });
          });
        }
      }

      // Check for [SUGGEST_PRODUCT:...] marker
      const suggestRegex = /\[SUGGEST_PRODUCT:([^:\]]+)(?::([^:\]]+))?(?::([^:\]]+))?\]/g;
      let suggestionMatch;
      while ((suggestionMatch = suggestRegex.exec(displayText)) !== null) {
        const [fullMatch, productId, size, temperature] = suggestionMatch;
        displayText = displayText.replace(fullMatch, '');

        // Find the product
        const product = products.find(p => p.id === productId);
        if (product) {
          // Find size object if specified
          const sizeObj = size && product.sizes ? product.sizes.find(s => s.name === size) : undefined;
          const temp = temperature as 'hot' | 'cold' | undefined;

          actions.push({
            label: `🛒 إضافة ${product.name} للسلة`,
            onClick: () => {
              addToCart(product, sizeObj, temp);
              // Add confirmation message
              const confirmMsg: Message = {
                id: Date.now().toString(),
                text: `تمام! أضفت ${product.name} للسلة 🎉\nتقدر تكمل طلبك أو تفتح السلة للتأكيد`,
                sender: 'bot',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, confirmMsg]);
            },
            type: 'primary',
            actionType: 'add-to-cart',
            productData: {
              productId,
              size: sizeObj,
              temperature: temp
            }
          });
        }
      }

      responseText = displayText;

      // SHOW_DELIVERY logic
      if (responseText.includes('[SHOW_DELIVERY]')) {
        responseText = responseText.replace('[SHOW_DELIVERY]', '');
        actions.push({
          label: `📞 تواصل واتساب للتوصيل`,
          url: `https://wa.me/${settings.deliveryNumber.replace(/\D/g, '')}`,
          type: 'primary'
        });
      }

      // SHOW_ADMIN logic
      if (responseText.includes('[SHOW_ADMIN]') || responseText.includes(settings.adminNumber) || responseText.includes('إدارة')) {
        responseText = responseText.replace('[SHOW_ADMIN]', '').trim();
        actions.push({
          label: `💼 تواصل مع الإدارة (للحجز/الاستلام)`,
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

  if (!mounted) return null;

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
                        action.onClick ? (
                          <button
                            key={idx}
                            onClick={action.onClick}
                            className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-xl transform hover:scale-105 w-full ${action.type === 'primary'
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                              }`}
                          >
                            <span className="text-lg">{action.label.split(' ')[0]}</span>
                            <span>{action.label.split(' ').slice(1).join(' ')}</span>
                          </button>
                        ) : (
                          <a
                            key={idx}
                            href={action.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-xl transform hover:scale-105 w-full ${action.type === 'primary'
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                              }`}
                          >
                            <span className="text-lg">{action.label.split(' ')[0]}</span>
                            <span>{action.label.split(' ').slice(1).join(' ')}</span>
                          </a>
                        )
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
        style={{ display: isCartOpen ? 'none' : 'flex' }}
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