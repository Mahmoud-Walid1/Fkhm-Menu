import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Snowflake, Star, X, Coffee } from 'lucide-react';

export const Menu: React.FC = () => {
  const { products, categories, addToCart, settings } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '1');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    // Support both old 'categoryId' and new 'category' field for backward compatibility
    const productCategory = (p as any).categoryId || p.category;
    return productCategory === activeCategory;
  });

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto min-h-screen" id="menu">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">استكشف قائمتنا المميزة</h2>
        <div className="w-24 h-1 bg-gray-300 mx-auto rounded"></div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-3 mb-12 pb-4 justify-start md:justify-center no-scrollbar px-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`category-${cat.id}`} // Added ID for ChatBot navigation
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-3 rounded-md whitespace-nowrap transition-all duration-300 font-bold text-sm md:text-base border ${activeCategory === cat.id
              ? 'text-white border-transparent shadow-md transform -translate-y-1'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
              }`}
            style={{ backgroundColor: activeCategory === cat.id ? settings.primaryColor : undefined }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <motion.div
        layout
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8"
      >
        <AnimatePresence mode="wait">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => setSelectedProduct(product)}
              primaryColor={settings.primaryColor}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Products Found */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <p className="text-lg">جاري تجهيز المنتجات في هذا القسم...</p>
        </div>
      )}

      {/* Product Options Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onConfirm={(size, temperature) => {
              addToCart(selectedProduct, size, temperature);
              setSelectedProduct(null);
            }}
            primaryColor={settings.primaryColor}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const ProductCard: React.FC<{ product: Product; onAdd: () => void; primaryColor: string }> = ({ product, onAdd, primaryColor }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);

  // Calculate display price based on selected size
  const basePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
  const displayPrice = basePrice + (selectedSize?.priceModifier || 0);

  return (
    <div
      data-product-id={product.id}
      className="bg-white rounded-[2rem] shadow-xl border border-purple-100 flex flex-col h-full overflow-visible transform transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 relative mt-12 pt-12"
    >
      {/* Popped Out Image Container */}
      <div className="absolute -top-16 left-0 right-0 flex justify-center z-10 w-full pointer-events-none">
        <div className="relative w-40 h-40 md:w-48 md:h-48 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:-translate-y-2">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)] transition-all duration-500 pointer-events-auto"
            loading="lazy"
          />
        </div>

        {/* Promo Badge */}
        {product.isPromo && (
          <div className="absolute top-4 right-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 animate-pulse">
            خصم
          </div>
        )}

        {/* Icons */}
        <div className="absolute top-4 left-10 flex flex-col gap-2 z-20">
          {product.isHot && <span className="w-8 h-8 flex items-center justify-center bg-white/90 text-red-500 rounded-full shadow-md backdrop-blur-sm"><Flame size={16} /></span>}
          {product.isCold && <span className="w-8 h-8 flex items-center justify-center bg-white/90 text-blue-500 rounded-full shadow-md backdrop-blur-sm"><Snowflake size={16} /></span>}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 relative bg-white rounded-[2rem] z-0">
        <div className="flex flex-col items-center mb-3 mt-4">
          <h3 className="font-extrabold text-gray-900 text-xl md:text-2xl text-center leading-tight mb-2">
            {product.name}
          </h3>

          {/* Interactive Cup Icons for Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-end gap-3 my-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              {product.sizes.map((size, index) => (
                <button
                  key={size.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`transition-all relative group ${selectedSize?.name === size.name
                    ? 'text-purple-600 scale-110'
                    : 'text-gray-400 hover:text-purple-400'
                    }`}
                  title={size.name}
                >
                  <Coffee
                    size={selectedSize?.name === size.name ? 24 : 18}
                    strokeWidth={selectedSize?.name === size.name ? 2.5 : 2}
                  />
                  {selectedSize?.name === size.name && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {size.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Simple Size Label if not interactive or just one */}
          {selectedSize && (!product.sizes || product.sizes.length === 0) && (
            <span className="text-xs text-gray-400 font-medium">{product.category}</span>
          )}

        </div>

        <p className="text-gray-500 text-sm text-center mb-6 line-clamp-2 px-2 font-medium leading-relaxed">
          {product.description || 'وصف المنتج غير متوفر حالياً، لكن الطعم أكيد هيعجبك! 😋'}
        </p>

        <div className="flex items-center justify-between mt-auto bg-gray-50 p-3 rounded-2xl border border-gray-100 group-hover:border-purple-200 transition-colors">
          <div className="flex flex-col items-start min-w-[30%]">
            {product.isPromo && product.promoPrice ? (
              <div className="flex flex-col items-start leading-none">
                <span className="font-black text-xl md:text-2xl text-red-600">{displayPrice}<span className="text-[10px] font-bold text-gray-500 mr-1">ر.س</span></span>
                <span className="text-[10px] text-gray-400 line-through decoration-red-500 mt-1">{product.price + (selectedSize?.priceModifier || 0)}</span>
              </div>
            ) : (
              <span className="font-black text-xl md:text-2xl text-gray-900">{displayPrice}<span className="text-[10px] font-bold text-gray-500 mr-1">ر.س</span></span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl text-white flex items-center justify-center shadow-lg shadow-purple-200 hover:shadow-purple-400 hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus size={26} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductModal: React.FC<{
  product: Product;
  onClose: () => void;
  onConfirm: (size?: { name: string; priceModifier: number }, temperature?: 'hot' | 'cold') => void;
  primaryColor: string;
}> = ({ product, onClose, onConfirm, primaryColor }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [selectedTemp, setSelectedTemp] = useState<'hot' | 'cold' | undefined>(
    product.isHot && !product.isCold ? 'hot' :
      !product.isHot && product.isCold ? 'cold' : undefined
  );

  const showTempSelection = product.isHot && product.isCold;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-md overflow-hidden relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-56 overflow-hidden relative group">
          <img src={product.image} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 text-white rounded p-1 hover:bg-black/40 transition-colors">
            <X size={20} />
          </button>

          <div className="absolute bottom-4 right-4 text-white">
            <h2 className="text-2xl font-bold mb-1 shadow-black/10 drop-shadow-md">{product.name}</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed bg-gray-50 p-3 rounded border text-sm">{product.description}</p>

          {/* Temperature Selection (Only if both are available) */}
          {showTempSelection && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded" style={{ backgroundColor: primaryColor }}></span>
                طريقة التقديم:
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTemp('hot')}
                  className={`flex-1 py-2 px-4 rounded border transition-all flex items-center justify-center gap-2 ${selectedTemp === 'hot'
                    ? 'bg-red-500 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Flame size={18} />
                  <span>حار</span>
                </button>
                <button
                  onClick={() => setSelectedTemp('cold')}
                  className={`flex-1 py-2 px-4 rounded border transition-all flex items-center justify-center gap-2 ${selectedTemp === 'cold'
                    ? 'bg-blue-500 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Snowflake size={18} />
                  <span>بارد</span>
                </button>
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded" style={{ backgroundColor: primaryColor }}></span>
                اختر الحجم:
              </h3>
              <div className="flex gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-1 py-3 px-4 rounded border transition-all flex items-center justify-between group ${selectedSize?.name === size.name
                      ? 'border-transparent text-white shadow'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    style={{
                      backgroundColor: selectedSize?.name === size.name ? primaryColor : undefined,
                    }}
                  >
                    <span className="font-bold">{size.name}</span>
                    {size.priceModifier > 0 && <span className={`text-xs px-2 py-1 rounded ${selectedSize?.name === size.name ? 'bg-white/20' : 'bg-gray-100'}`}>+{size.priceModifier} ر.س</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <span className="block text-xs text-gray-400">السعر النهائي</span>
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                {(product.isPromo && product.promoPrice ? product.promoPrice : product.price) + (selectedSize?.priceModifier || 0)} ر.س
              </span>
            </div>

            <button
              onClick={() => {
                if (showTempSelection && !selectedTemp) {
                  alert('الرجاء اختيار طريقة التقديم (حار/بارد)');
                  return;
                }
                onConfirm(selectedSize, selectedTemp);
              }}
              className="flex-1 py-3 rounded text-white font-bold text-lg shadow hover:opacity-90 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} />
              أضف للسلة
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};