
import React from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, ShoppingBag, Send, Coffee, Box, CupSoda } from 'lucide-react';
import { useAppStore } from '../store';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, settings, clearCart } = useAppStore();

  const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = `مرحباً، أود طلب التالي من * ${settings.shopName}*: \n\n`;
    cart.forEach(item => {
      const sizeText = item.selectedSize ? `(${item.selectedSize.name})` : '';
      const tempText = item.selectedTemperature ? ` (${item.selectedTemperature === 'hot' ? 'حار' : 'بارد'})` : '';
      message += `▪️ ${item.quantity}x ${item.name} ${sizeText}${tempText} - ${item.finalPrice * item.quantity} ر.س\n`;
    });
    message += `\n * المجموع: ${subtotal} ر.س * `;
    message += `\n\nأرجو تأكيد الطلب والتوصيل.`;

    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-white z-50 shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: settings.primaryColor }} />
            <h2 className="font-bold text-xl">سلة المشتريات</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={64} className="mb-4 opacity-20" />
              <p>السلة فارغة</p>
              <button
                onClick={onClose}
                className="mt-4 text-sm underline hover:text-gray-600"
              >
                تصفح المنيو
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    {item.selectedSize && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>الحجم:</span>
                        {item.selectedSize.icon === 'box' ? (
                          <Box size={14} className="text-purple-600" />
                        ) : item.selectedSize.icon === 'cup_soda' ? (
                          <CupSoda size={14} className="text-blue-500" />
                        ) : (
                          <Coffee size={14} className="text-orange-600" />
                        )}
                        <span>{item.selectedSize.name}</span>
                      </div>
                    )}
                    {item.selectedTemperature && (
                      <p className="text-xs text-gray-500">
                        التقديم: {item.selectedTemperature === 'hot' ? 'حار 🔥' : 'بارد ❄️'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-gray-700">{item.finalPrice * item.quantity} ر.س</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.cartId, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow text-sm hover:bg-gray-100"
                      >-</button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow text-sm hover:bg-gray-100"
                      >+</button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartId)}
                  className="text-gray-300 hover:text-red-500 self-start p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">المجموع الكلي:</span>
              <span className="text-2xl font-bold" style={{ color: settings.primaryColor }}>{subtotal} ر.س</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 rounded-xl text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: '#25D366' }} // Whatsapp Color
              >
                <Send size={20} />
                إتمام الطلب واتساب
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};
