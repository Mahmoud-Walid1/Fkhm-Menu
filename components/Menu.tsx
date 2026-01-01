import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Snowflake, Star, X, Coffee } from 'lucide-react';

export const Menu: React.FC = () => {
  const { products, categories, addToCart, settings } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '1');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => p.categoryId === activeCategory);

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
            onConfirm={(size) => {
              addToCart(selectedProduct, size);
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700 flex flex-col h-full"
    >
      <div className="relative h-40 flex items-center justify-center pt-4 mb-2 group-hover:pt-2 transition-all duration-300">
        {/* Descriptive Blob/Shape Background */}
        <div className="absolute w-32 h-32 bg-luxury-100 dark:bg-luxury-800/50 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500" />

        <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-auto object-contain drop-shadow-xl filter group-hover:drop-shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1"
          />
        </div>

        {/* Promo Badge */}
        {product.isPromo && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-20">
            خصم
          </div>
        )}

        {/* Temp Icons */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          {product.isHot && <span className="w-6 h-6 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-red-500 rounded-full shadow-sm" title="حار"><Flame size={12} /></span>}
          {product.isCold && <span className="w-6 h-6 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-blue-500 rounded-full shadow-sm" title="بارد"><Snowflake size={12} /></span>}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative z-20">
        <div className="flex flex-col items-center mb-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg group-hover:text-luxury-600 dark:group-hover:text-luxury-400 transition-colors text-center">{product.name}</h3>

          {/* Size Visuals - Cup Icons */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-end gap-1 text-gray-400 dark:text-gray-500 mt-1">
              {product.sizes.length >= 2 && <Coffee size={12} className="opacity-70" />}
              <Coffee size={14} />
            </div>
          )}
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-4 line-clamp-2 h-8 leading-relaxed px-2">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col items-start">
            {product.sizes && product.sizes.length > 0 && (
              <span className="text-[10px] text-gray-400">يبدأ من</span>
            )}

            {product.isPromo && product.promoPrice ? (
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-xl text-gray-900 dark:text-white">{product.promoPrice} <span className="text-[10px] font-normal text-gray-500">ر.س</span></span>
                <span className="text-[10px] text-gray-400 line-through decoration-red-500">{product.price}</span>
              </div>
            ) : (
              <span className="font-extrabold text-xl text-gray-900 dark:text-white" >{product.price} <span className="text-[10px] font-normal text-gray-500">ر.س</span></span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:opacity-90 transition-all border-2 border-transparent hover:border-white/20"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductModal: React.FC<{
  product: Product;
  onClose: () => void;
  onConfirm: (size?: { name: string; priceModifier: number }) => void;
  primaryColor: string;
}> = ({ product, onClose, onConfirm, primaryColor }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);

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
              onClick={() => onConfirm(selectedSize)}
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