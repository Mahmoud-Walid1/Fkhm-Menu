import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';

export const Hero: React.FC = () => {
  const { settings } = useAppStore();
  const [index, setIndex] = useState(0);

  // Fallback if settings.heroImages is empty
  const displayImages = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : ['https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1200'];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayImages.length]);

  return (
    <div className="relative h-[65vh] md:h-[600px] w-full overflow-hidden bg-gray-900">
      {/* Background Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={displayImages[index]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Coffee Background"
          loading="eager"
        />
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {/* Logo Container - Standard Circle */}
          <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-full flex items-center justify-center p-4 shadow-2xl border-4 border-white">
            <img
              src="logo.png"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex-col');
              }}
              className="w-full h-full object-contain"
              alt="فخم البن"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl md:text-5xl text-white font-bold max-w-3xl leading-tight drop-shadow-md"
        >
          {settings.heroHeadline}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 rounded bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            تصفح المنيو
          </button>
        </motion.div>
      </div>
    </div>
  );
};