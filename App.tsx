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

      {/* WhatsApp Contact Button */}
      <motion.a
        href={`https://wa.me/${settings.adminNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 left-4 z-[9998]"
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-green-500/40 transition-all">
          {/* WhatsApp Icon */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className="font-bold text-sm">تواصل معنا</span>
        </div>
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