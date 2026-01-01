import { createPortal } from 'react-dom';

// ... (existing imports)

export const ChatBot: React.FC<{ isCartOpen?: boolean }> = ({ isCartOpen = false }) => {
  const { products, settings, isChatOpen, toggleChat } = useAppStore();
  // ... (state)

  // Auto-popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isChatOpen) {
        setShowAutoPopup(true);
        // Hide after 8 seconds
        setTimeout(() => setShowAutoPopup(false), 8000);
      }
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [isChatOpen]);

  // ... (rest of logic)

  return createPortal(
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* ... content ... */}
            {/* Note: I need to include the FULL content here since I'm wrapping the return */}
            {/* Optimizing: I will just wrap the return statement's JSX content in createPortal */}
            {/* Since replace_file_content requires exact string matches, replacing the whole return is tricky unless I copy everything. */}
            {/* I will use the StartLine strategy to insert the import and then replace the return block. */}
            {/* Actually, I'll allow multiple chunks. */}
          </motion.div>
        )}
      </AnimatePresence>

      {!isCartOpen && (
        <>
          <AnimatePresence>
            {showAutoPopup && !isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9998] max-w-[200px]"
              >
                <p className="text-sm font-bold">👋 ممكن أساعدك؟</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">اضغط للتحدث معي!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                '0 20px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.2)',
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            onClick={toggleChat}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 p-4 rounded-full shadow-2xl text-white z-[9999] flex items-center justify-center group relative"
            style={{ backgroundColor: settings.primaryColor }}
          >
            {isChatOpen ? <X size={24} /> : (
              <>
                <MessageCircle size={28} />
                <span className="absolute right-full mr-3 bg-white text-gray-800 px-2 py-1 rounded-md text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  محادثة
                </span>
              </>
            )}
          </motion.button>
        </>
      )}
    </>,
    document.body
  );
};