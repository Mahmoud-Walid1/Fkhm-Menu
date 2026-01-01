import React, { useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, MessageCircle } from 'lucide-react';
import { useAppStore, AppProvider } from './store';
import { Hero } from './components/Hero';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { ChatBot } from './components/ChatBot';
import { PromoPopup } from './components/PromoPopup';
import { AdminPanel } from './components/AdminPanel';
import { OffersSection } from './components/OffersSection';

const AppContent: React.FC = () => {
  const { cart, settings, toggleChat } = useAppStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  
  // Secret Admin Trigger (Triple Click on Footer Text)
  const handleSecretAdminTrigger = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    
    if (newCount === 3) {
        const pwd = prompt('أدخل كلمة مرور الإدارة (123):');
        if (pwd === '123') { 
            setIsAdminOpen(true);
            setAdminClickCount(0);
        } else {
            if(pwd !== null) alert('كلمة المرور خاطئة');
            setAdminClickCount(0);
        }
    }
    
    // Reset counter if too slow
    setTimeout(() => setAdminClickCount(0), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Navbar Logo */}
             <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                <img src="logo.png" className="w-full h-full object-contain p-1" alt="Logo" />
             </div>
             <span className="font-bold text-xl text-gray-900 tracking-tight">{settings.shopName}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
             <button 
                onClick={toggleChat}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-800 transition-colors relative group"
                title="المساعد الذكي"
             >
                <MessageCircle size={24} />
             </button>

             <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-md hover:bg-gray-100 text-gray-800 transition-colors"
                title="سلة المشتريات"
             >
                <ShoppingBag size={24} />
                {cart.length > 0 && (
                  <span 
                    className="absolute top-0 right-0 w-5 h-5 text-xs text-white rounded-full flex items-center justify-center font-bold shadow-sm translate-x-1/4 -translate-y-1/4"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {cart.reduce((a, b) => a + b.quantity, 0)}
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