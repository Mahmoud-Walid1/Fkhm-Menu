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
                <a href={settings.instagramUrl} target="_blank" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                  <span className="sr-only">Instagram</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings.snapchatUrl && (
                <a href={settings.snapchatUrl} target="_blank" className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:text-black">
                  <span className="sr-only">Snapchat</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12.009 2.125c-3.23 0-5.918 2.257-5.918 5.617 0 .548.163 1.05.32 1.547.115.362.26.822.26 1.34 0 .915-1.16 1.554-1.928 2.167-.406.323-.815.65-1.07 1.096-.342.6-.26 1.365.21 1.93.435.52.875.7 1.488.746.47.037.94-.09 1.488-.236.435-.116.897-.24 1.373-.186.72.08 1.408.847 1.636 1.936.104.5.158.913.116 1.157-.012.064-.027.11-.044.137-.005.008-.005.008-.008.01l-.007.012c-.105.158-.293.2-.558.204-.6.012-1.39-.23-2.12-.44-.336-.095-.652-.185-.92-.185-1.196 0-1.874.966-2.105 1.777-.168.582-.012 1.18.423 1.635.405.422.99.645 1.64.626 1.18-.035 2.13-.505 2.878-.875.293-.146.544-.27.753-.306.4-.07.75.14 1.025.44.53.58 1.258 1.41 2.968 1.41 1.693 0 2.42-.814 2.955-1.394.276-.3.63-.518 1.033-.453.21.035.462.16.756.307.75.37 1.7.84 2.88.875.645.02 1.23-.204 1.64-.626.434-.454.59-1.053.42-1.635-.23-.81-.91-1.776-2.105-1.776-.268 0-.584.09-.922.185-.733.21-1.52.45-2.12.44-.264-.005-.453-.047-.557-.205l-.008-.01-.008-.012c-.017-.026-.03-.072-.043-.136-.042-.245.012-.66.115-1.157.23-1.09.917-1.856 1.637-1.936.476-.053.938.07 1.373.186.548.146 1.018.273 1.488.236.613-.047 1.053-.227 1.488-.747.47-.564.55-1.33.21-1.93-.254-.446-.664-.772-1.07-1.096-.77-.613-1.93-1.252-1.93-2.167 0-.518.146-.978.26-1.34.158-.497.32-1 .32-1.547 0-3.36-2.688-5.617-5.918-5.617z" />
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