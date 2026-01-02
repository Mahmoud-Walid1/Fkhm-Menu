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
import { AdminLogin, useAdminAuth } from './components/AdminLogin';
import { OffersSection } from './components/OffersSection';

const AppContent: React.FC = () => {
  const { cart, settings, toggleChat, updateSettings, toggleTheme } = useAppStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const { isAuthenticated, logout } = useAdminAuth();

  // Check for /admin in URL
  React.useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setShowAdminLogin(true);
      // Clear the URL without reloading
      window.history.replaceState({}, '', '/');
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
      // Show admin login
      setTimeout(() => {
        setShowAdminLogin(true);
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
                <a href={settings.snapchatUrl} target="_blank" className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-xl overflow-hidden">
                  <span className="sr-only">Snapchat</span>
                  <img src="/snapchat.png" alt="Snapchat" className="w-6 h-6 object-contain" />
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

      {/* Admin Login Modal */}
      {showAdminLogin && !isAuthenticated && (
        <AdminLogin onLoginSuccess={() => setShowAdminLogin(false)} />
      )}

      {/* Admin Panel - Only show if authenticated */}
      {isAuthenticated && <AdminPanel onClose={logout} />}
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