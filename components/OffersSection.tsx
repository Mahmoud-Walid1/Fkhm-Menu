import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const OffersSection: React.FC = () => {
  const { settings } = useAppStore();
  const [index, setIndex] = useState(0);

  // If no offer images are set, do not render this section
  if (!settings.offerImages || settings.offerImages.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % settings.offerImages.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + settings.offerImages.length) % settings.offerImages.length);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [settings.offerImages.length]);

  return (
    <div className="bg-gray-50 py-10 px-4">
       <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <span className="text-red-500">🔥</span>
               أحدث العروض
             </h2>
             <div className="flex gap-2">
                <button onClick={prevSlide} className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"><ChevronRight size={20}/></button>
                <button onClick={nextSlide} className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"><ChevronLeft size={20}/></button>
             </div>
          </div>

          {/* Container designed to handle both Portrait and Landscape images gracefully */}
          <div className="relative w-full h-[450px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gray-200 group border border-gray-100">
             <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
                >
                    {/* Blurred Background Layer (for filling space around vertical images) */}
                    <img 
                        src={settings.offerImages[index]}
                        className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl scale-110"
                        alt="Background Blur"
                    />
                    
                    {/* Main Image (Contained to show full image without cropping) */}
                    <img
                        src={settings.offerImages[index]}
                        className="relative z-10 w-full h-full object-contain"
                        alt={`Offer ${index + 1}`}
                    />
                </motion.div>
             </AnimatePresence>
             
             {/* Indicators */}
             <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                {settings.offerImages.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-300 shadow-sm ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};