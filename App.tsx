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
    <div className={`${settings.theme === 'dark' ? 'dark' : ''}`}>
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
                <a href={settings.instagramUrl} target="_blank" className="w-10 h-10 rounded bg-white/10 flex items-center justify-center hover:bg-pink-600 transition-all text-white">
                  <span className="sr-only">Instagram</span>📷
                </a>
              )}
              {settings.snapchatUrl && (
                <a href={settings.snapchatUrl} target="_blank" className="w-10 h-10 rounded bg-white/10 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all text-white">
                  <span className="sr-only">Snapchat</span>👻
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" className="w-10 h-10 rounded bg-white/10 flex items-center justify-center hover:bg-black hover:border-gray-600 border border-transparent transition-all text-white">
                  <span className="sr-only">TikTok</span>🎵
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

        {/* Overlays */}
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <ChatBot />
        <PromoPopup />
        {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}

      </div>
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