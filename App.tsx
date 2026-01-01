import React, { useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, MessageCircle, Moon, Sun } from 'lucide-react';
import { useAppStore, AppProvider } from './store';
import { Hero } from './components/Hero';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { ChatBot } from './components/ChatBot';
import { PromoPopup } from './components/PromoPopup';
import { AdminPanel } from './components/AdminPanel';
import { OffersSection } from './components/OffersSection';

const AppContent: React.FC = () => {
  const { cart, settings, toggleChat, updateSettings } = useAppStore();
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


  // Apply theme to html element
  React.useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Secret Admin Trigger (Triple Click on Footer Text)
  const handleSecretAdminTrigger = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    if (newCount === 3) {
      const pwd = prompt('أدخل كلمة مرور الإدارة:');
      if (pwd === '12345') {
        setIsAdminOpen(true);
        setAdminClickCount(0);
      } else {
        if (pwd !== null) alert('كلمة المرور خاطئة');
        setAdminClickCount(0);
      }
    }

    // Reset counter if too slow
    setTimeout(() => setAdminClickCount(0), 2000);
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
              {/* Dark Mode Toggle */}
              <button
                onClick={() => updateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                title={settings.theme === 'dark' ? 'وضع النهار' : 'الوضع الليلي'}
              >
                {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>


              <button
                onClick={toggleChat}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors relative group"
                title="المساعد الذكي"
              >
                <MessageCircle size={20} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors relative"
                title="السلة"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        <main>
          <Hero />

          {/* Offers Banner Strip */}
          <div className="bg-gray-900 border-y border-gray-800 py-3 overflow-hidden shadow-inner">
            <div className="animate-marquee whitespace-nowrap text-center text-white text-sm font-medium tracking-wide">
              ✨ {settings.shopName} يرحب بكم ✨ استمتعوا بأجود أنواع البن المختص ✨ حلويات فاخرة تصنع يومكم ✨
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
                <a href={settings.snapchatUrl} target="_blank" className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-xl">
                  <span className="sr-only">Snapchat</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5.82 10.95c.34-.11.75-.41.75-.82 0-.43-.3-.6-.56-.71-.56-.23-1.01-.6-1.01-1.35 0-.64.49-1.2 1.2-1.31.23-.04.45.08.6.15.22.11.45.22.67.11.19-.08.3-.3.3-.56 0-.34-.34-.79-.52-1.01C7 5.14 7.5 4.5 8.61 4.5c.3 0 .6.07.86.19.26.11.52.26.82.26.3 0 .56-.15.82-.26.26-.11.56-.19.86-.19 1.12 0 1.61.64 1.35.9-.19.23-.52.68-.52 1.01 0 .26.11.49.3.56.22.11.45 0 .67-.11.15-.08.37-.19.6-.15.71.11 1.2.68 1.2 1.31 0 .75-.45 1.12-1.01 1.35-.26.11-.56.26-.56.71 0 .41.41.71.75.82 2.25.75 2.25 2.25 2.25 3.37 0 .37-.15.56-.26.67-.15.15-.41.19-.71.19-.34 0-.6-.11-.79-.37-.19-.26-.37-.6-.94-.6-.23 0-.49.07-.75.19-.26.12-.53.27-.9.27-.37 0-.64-.15-.9-.27-.26-.11-.53-.19-.75-.19-.22 0-.49.08-.75.19-.26.12-.52.27-.9.27s-.64-.15-.9-.27c-.26-.11-.53-.19-.75-.19-.56 0-.75.34-.94.6-.19.26-.45.37-.79.37-.3 0-.56-.04-.71-.19-.11-.11-.26-.3-.26-.67 0-1.12 0-2.62 2.25-3.37z" />
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