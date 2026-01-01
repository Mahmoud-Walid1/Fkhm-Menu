import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { X } from 'lucide-react';

export const PromoPopup: React.FC = () => {
  const { products, settings } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  // Check if popup is enabled in settings
  const isEnabled = settings.isPopupEnabled;

  useEffect(() => {
    if (isEnabled) {
      // Show after delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isEnabled]);

  if (!isVisible || !isEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white rounded-3xl w-full max-w-sm relative overflow-hidden text-center shadow-2xl"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 bg-black/20 text-white rounded-full p-1 hover:bg-black/40 z-10"
          >
            <X size={20} />
          </button>

          <div className="relative h-48">
            <img
              src={settings.popupImage || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800'}
              className="w-full h-full object-cover"
              alt="Promo"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
              <span className="text-white font-bold text-2xl tracking-wider">{settings.popupTitle || 'عرض مميز 🔥'}</span>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-6 leading-relaxed">
              {settings.popupMessage || 'استمتع بأفضل المشروبات والحلويات لدينا. اطلب الآن!'}
            </p>

            <button
              onClick={() => {
                setIsVisible(false);
                const el = document.getElementById('menu');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 rounded-xl text-white font-bold shadow-lg"
              style={{ backgroundColor: settings.primaryColor }}
            >
              تصفح المنيو
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
