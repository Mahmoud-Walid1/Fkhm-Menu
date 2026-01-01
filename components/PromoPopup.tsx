import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { X } from 'lucide-react';

export const PromoPopup: React.FC = () => {
  const { products, settings } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  // Get active promos
  const promos = products.filter(p => p.isPromo);

  useEffect(() => {
    // Show popup if there are promos and user hasn't closed it this session (simulated)
    if (promos.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [promos.length]);

  if (!isVisible || promos.length === 0) return null;

  const featuredPromo = promos[0];

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
            <img src={featuredPromo.image} className="w-full h-full object-cover" alt="Offer" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                 <span className="text-white font-bold text-2xl tracking-wider">🔥 عروض اليوم</span>
             </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{featuredPromo.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{featuredPromo.description}</p>
            
            <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-lg text-gray-400 line-through decoration-red-500">{featuredPromo.price} ر.س</span>
                <span className="text-3xl font-bold" style={{ color: settings.primaryColor }}>{featuredPromo.promoPrice} ر.س</span>
            </div>

            <button
               onClick={() => {
                   setIsVisible(false);
                   const el = document.getElementById('menu');
                   el?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="w-full py-3 rounded-xl text-white font-bold shadow-lg"
               style={{ backgroundColor: settings.primaryColor }}
            >
                اطلب الآن
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
