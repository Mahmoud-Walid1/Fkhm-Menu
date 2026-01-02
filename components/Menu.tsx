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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8"
      >
        <AnimatePresence mode="popLayout">
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
      className="bg-white rounded-3xl shadow-lg border-2 border-purple-50 flex flex-col h-full overflow-hidden transform transition-all duration-200 active:scale-95"
    >
      <div className="relative h-40 md:h-56 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-70" />

        {/* Promo Badge */}
        {product.isPromo && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
            خصم
          </div>
        )}

        {/* Icons */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
          {product.isHot && <span className="w-8 h-8 flex items-center justify-center bg-white/90 text-red-500 rounded-full shadow-sm"><Flame size={16} /></span>}
          {product.isCold && <span className="w-8 h-8 flex items-center justify-center bg-white/90 text-blue-500 rounded-full shadow-sm"><Snowflake size={16} /></span>}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative bg-white">
        <div className="flex flex-col items-center mb-2">
          <h3 className="font-extrabold text-gray-900 text-lg md:text-2xl text-center leading-tight mb-1">
            {product.name}
          </h3>

          {/* Interactive Cup Icons for Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-end gap-2 mt-1">
              {product.sizes.map((size, index) => (
                <button
                  key={size.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`transition-all ${selectedSize?.name === size.name
                    ? 'text-purple-600 scale-110'
                    : 'text-purple-300 hover:text-purple-500'
                    }`}
                  title={size.name}
                >
                  <Coffee
                    size={selectedSize?.name === size.name ? 22 : 16}
                    strokeWidth={selectedSize?.name === size.name ? 3 : 2.5}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Size Label */}
          {selectedSize && (
            <span className="text-[10px] text-purple-600 font-bold mt-1">{selectedSize.name}</span>
          )}
        </div>

        <p className="text-gray-500 text-sm text-center mb-4 line-clamp-2 px-1 font-medium">
          {product.description || '...'}
        </p>

        <div className="flex items-center justify-between mt-auto bg-purple-50 p-3 rounded-2xl border border-purple-100">
          <div className="flex flex-col items-start min-w-[30%]">
            {product.isPromo && product.promoPrice ? (
              <div className="flex flex-col items-start leading-none">
                <span className="font-black text-xl md:text-2xl text-red-600">{displayPrice}<span className="text-[10px] font-bold text-gray-500 mr-1">ر.س</span></span>
                <span className="text-[10px] text-gray-400 line-through decoration-red-500">{product.price + (selectedSize?.priceModifier || 0)}</span>
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
            className="w-10 h-10 md:w-12 md:h-12 rounded-full text-white flex items-center justify-center shadow-md transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus size={24} strokeWidth={3} />
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