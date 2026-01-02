import React, { useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, MessageCircle, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, AppProvider } from './store';
import { Hero } from './components/Hero';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { ChatBot } from './components/ChatBot';
import { PromoPopup } from './components/PromoPopup';
import { AdminPanel } from './components/AdminPanel';
import { OffersSection } from './components/OffersSection';

const AppContent: React.FC = () => {
  const { cart, settings, toggleChat, updateSettings, toggleTheme } = useAppStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Check for /admin in URL
  React.useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      const pwd = prompt('أدخل كلمة مرور الإدارة:');
      if (pwd === '12345') {
        setIsAdminOpen(true);
        // Clear the URL without reloading
        window.history.replaceState({}, '', '/');
      } else if (pwd !== null) {
        alert('كلمة المرور خاطئة');
      }
    }
  }, []);




  // Secret Admin Trigger (Triple Click on Footer Text)
  const clickTimeoutRef = React.useRef<any>(null);

  const handleSecretAdminTrigger = () => {
    // Clear existing timer (debounce)
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    if (newCount >= 3) {
      // Trigger Admin Prompt
      setTimeout(() => {
        const pwd = prompt('أدخل كلمة مرور الإدارة:');
        if (pwd === '12345') {
          setIsAdminOpen(true);
        } else if (pwd !== null) {
          alert('كلمة المرور خاطئة');
        }
        setAdminClickCount(0);
      }, 50);
      return;
    }

    // Reset counter if no click for 2 seconds
    clickTimeoutRef.current = setTimeout(() => setAdminClickCount(0), 2000);
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
        {/* Navbar */}
        <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Navbar Logo - Circular with Purple Background */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden shadow-md"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <img src="logo.png" className="w-full h-full object-cover p-1" alt="Logo" />
              </div>
              <span className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white tracking-tight">{settings.shopName}</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">



              <button
                onClick={toggleChat}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors relative group"
                title="المساعد الذكي"
              >
                <MessageCircle size={20} />
              </button>

              <motion.button
                layout
                onClick={() => setIsCartOpen(true)}
                title="السلة"
                className={`p-3 rounded-xl transition-colors relative flex items-center gap-2 ${cart.length > 0
                  ? 'bg-red-50 text-red-600 font-bold ring-2 ring-red-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                animate={cart.length > 0 ? {
                  scale: [1, 1.05, 1],
                  boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 12px rgba(220, 38, 38, 0.2)", "0px 0px 0px rgba(0,0,0,0)"]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative">
                  <ShoppingBag size={24} strokeWidth={cart.length > 0 ? 2.5 : 2} />
                  <AnimatePresence>
                    {cart.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-extrabold border-2 border-white shadow-sm"
                      >
                        {cart.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {/* Text Label for extra visibility if needed, or keep minimal with just distinct color */}
              </motion.button>
            </div>
          </div>
        </nav>

        <main>
          <Hero />

          {/* Offers Banner Strip */}
          <div className="bg-gray-900 border-y border-gray-800 py-3 overflow-hidden shadow-inner">
            <div className="animate-marquee whitespace-nowrap text-center text-white text-sm font-medium tracking-wide">
              {settings.scrollingBannerText || '✨ فخم البن يرحب بكم ✨ استمتعوا بأجود أنواع البن المختص ✨ حلويات فاخرة تصنع يومكم ✨'}
            </div>
          </div>

          {/* New Offers Section */}
          <OffersSection />

          <Menu />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 mt-12 text-center relative overflow-hidden">

          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6 font-serif">{settings.shopName}</h2>
            <p className="mb-10 text-gray-400 max-w-lg mx-auto leading-relaxed">{settings.heroHeadline}</p>

            <div className="flex justify-center gap-6 mb-10">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                  <span className="sr-only">Instagram</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings.snapchatUrl && (
                <a href={settings.snapchatUrl} target="_blank" className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-gray-800 hover:scale-110 transition-transform shadow-lg hover:shadow-xl">
                  <span className="sr-only">Snapchat</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3 0 .719-.149.997-.279.405-.187.76-.235 1.053-.235.243 0 .461.06.663.184.407.258.675.751.675 1.234 0 .324-.097.62-.319.877-.465.534-1.361.703-1.903.703-.12 0-.209-.01-.261-.022-.301-.065-.478-.249-.635-.407-.105-.105-.2-.203-.358-.265-.31-.121-.633-.127-.975-.127-.342 0-.684.006-.994.127-.158.062-.253.16-.358.265-.157.158-.334.342-.635.407-.052.012-.141.022-.261.022-.542 0-1.438-.169-1.903-.703a1.218 1.218 0 01-.319-.877c0-.483.268-.976.675-1.234.202-.124.42-.184.663-.184.293 0 .648.048 1.053.235.278.13.697.279.997.279.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793zm.069 1.376c-.94 0-3.906.232-5.214 3.246-.474 1.089-.358 2.931-.256 4.563l.003.061c.028.414.056.794.056 1.118 0 .608-.201.888-.421 1.025-.229.144-.526.225-.859.225-.212 0-.495-.055-.776-.116-.13-.029-.261-.058-.389-.058-.084 0-.142.018-.173.035-.084.049-.132.138-.132.238 0 .076.038.165.095.241.238.281.815.404 1.183.404.076 0 .137-.006.182-.015.133-.029.235-.109.379-.246.129-.129.296-.303.614-.421.407-.151.831-.158 1.22-.158.389 0 .813.007 1.22.158.318.118.485.292.614.421.144.137.246.217.379.246.045.009.106.015.182.015.368 0 .945-.123 1.183-.404a.424.424 0 00.095-.241c0-.1-.048-.189-.132-.238a.293.293 0 00-.173-.035c-.128 0-.259.029-.389.058-.281.061-.564.116-.776.116-.333 0-.63-.081-.859-.225-.22-.137-.421-.417-.421-1.025 0-.324.028-.704.056-1.118l.003-.061c.102-1.632.218-3.474-.256-4.563-1.308-3.014-4.274-3.246-5.214-3.246z" />
                  </svg>
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg border border-gray-800">
                  <span className="sr-only">TikTok</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
                </a>
              )}
            </div>

            <div className="border-t border-white/10 pt-8 select-none">
              <p
                className="text-sm opacity-60 cursor-default hover:text-white transition-colors"
                onClick={handleSecretAdminTrigger}
              >
                © {new Date().getFullYear()} {settings.shopName}. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </footer>

      </div>

      {/* Fast Delivery Button - Animated Car Icon */}
      <motion.a
        href={`https://wa.me/${settings.deliveryNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-32 left-2 md:left-6 z-[9998] flex items-center gap-2 md:gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 md:px-5 py-2 md:py-3 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all group text-xs md:text-sm"
      >
        <motion.div
          animate={{
            x: [0, 5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-lg md:text-2xl"
        >
          🚗
        </motion.div>
        <span className="font-bold whitespace-nowrap hidden sm:inline">توصيل سريع</span>
      </motion.a>

      {/* Contact Admin Button */}
      <motion.a
        href={`https://wa.me/${settings.adminNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 left-2 md:left-6 z-[9998] flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-2.5 md:px-4 py-2 md:py-2.5 rounded-full shadow-xl hover:shadow-gray-700/50 transition-all text-xs"
      >
        <span className="text-base md:text-lg">💼</span>
        <span className="font-semibold whitespace-nowrap hidden sm:inline">تواصل مع الإدارة</span>
      </motion.a>

      {/* Overlays - Moved outside to prevent fixed positioning issues */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ChatBot isCartOpen={isCartOpen} />
      <PromoPopup />
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;