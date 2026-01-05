import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Snowflake, Star, X, Coffee, Package, Utensils, CupSoda, Cake, Box } from 'lucide-react';

export const Menu: React.FC = () => {
  const { products, categories, addToCart, settings } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Helper to check if a product belongs to a category
  const productBelongsToCategory = (product: Product, categoryId: string) => {
    // Check categoryIds (must have length), fallback to category, then fallback to categoryId (legacy)
    const ids = (product.categoryIds && product.categoryIds.length > 0)
      ? product.categoryIds
      : (product.category ? [product.category] : ((product as any).categoryId ? [(product as any).categoryId] : []));

    return ids.includes(categoryId);
  };

  const isAll = activeCategory === 'ALL';

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto min-h-screen" id="menu">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">استكشف قائمتنا المميزة</h2>
        <div className="w-24 h-1 bg-gray-300 mx-auto rounded"></div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-3 mb-12 pb-4 justify-start md:justify-center no-scrollbar px-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-6 py-3 rounded-md whitespace-nowrap transition-all duration-300 font-bold text-sm md:text-base border ${activeCategory === 'ALL'
            ? 'text-white border-transparent shadow-md transform -translate-y-1'
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
            }`}
          style={{ backgroundColor: activeCategory === 'ALL' ? settings.primaryColor : undefined }}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`category-${cat.id}`}
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

      {/* Product Sections */}
      <div className="space-y-16">
        {categories.map((cat) => {
          if (!isAll && cat.id !== activeCategory) return null;

          const catProducts = products.filter(p => productBelongsToCategory(p, cat.id));

          if (catProducts.length === 0) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              key={cat.id}
            >
              {isAll && (
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white border-r-4 pr-4 rounded-sm" style={{ borderColor: settings.primaryColor }}>
                    {cat.name}
                  </h3>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-20 md:gap-x-8 md:gap-y-28 pt-8 px-2">
                <AnimatePresence mode="popLayout">
                  {catProducts.map((product) => (
                    <ProductCard
                      key={`${cat.id}-${product.id}`} // Unique key for multi-category items
                      product={product}
                      onAdd={() => setSelectedProduct(product)}
                      primaryColor={settings.primaryColor}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No Products Found Fallback */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <p className="text-lg">جاري تجهيز المنتجات...</p>
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

const getSizeIcon = (categoryName: string, isCold: boolean) => {
  if (categoryName.includes('بوكس') || categoryName.includes('Box')) return Package;
  if (categoryName.includes('حلى') || categoryName.includes('حلويات') || categoryName.includes('كيك')) return Cake;
  if (categoryName.includes('اكل') || categoryName.includes('فطور')) return Utensils;
  if (isCold) return CupSoda;
  return Coffee;
};

const ProductCard: React.FC<{ product: Product; onAdd: () => void; primaryColor: string }> = ({ product, onAdd, primaryColor }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const SizeIcon = getSizeIcon(product.category || '', product.isCold || false);

  // Calculate display price based on selected size
  const basePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
  const displayPrice = basePrice + (selectedSize?.priceModifier || 0);

  return (
    <div
      data-product-id={product.id}
      className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-purple-100 flex flex-col h-full overflow-visible transform transition-all duration-200 hover:shadow-2xl hover:-translate-y-2 relative mt-12 pt-10 md:mt-16 md:pt-16 group will-change-transform"
    >
      {/* Popped Out Image Container */}
      <div className="absolute -top-16 md:-top-20 left-0 right-0 flex justify-center z-10 w-full pointer-events-none">
        <div className="relative w-36 h-36 md:w-52 md:h-52 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:-translate-y-3 transform-gpu">
          {/* Realistic Ground Shadow - Simplified on Mobile */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 md:w-32 md:h-4 bg-black/20 blur-md rounded-[100%] transition-all duration-500 group-hover:w-20 group-hover:bg-black/10 group-hover:blur-lg"></div>

          {/* Glow Effect - Hidden on Mobile for Perf */}
          <div className="hidden md:block absolute inset-0 bg-purple-500/0 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500 transform translate-y-4"></div>

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.15)] md:group-hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.3)] transition-all duration-500 pointer-events-auto"
            loading="lazy"
          />
        </div>

        {/* Promo Badge */}
        {product.isPromo && (
          <div className="absolute top-4 right-4 md:top-6 md:right-8 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg z-20 animate-pulse">
            خصم
          </div>
        )}

        {/* Icons - No backdrop-blur on mobile */}
        <div className="absolute top-4 left-4 md:top-6 md:left-8 flex flex-col gap-1.5 md:gap-2 z-20">
          {product.isHot && <span className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center bg-white/95 text-red-500 rounded-full shadow-lg md:backdrop-blur-sm"><Flame size={14} className="md:w-[18px] md:h-[18px]" /></span>}
          {product.isCold && <span className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center bg-white/95 text-blue-500 rounded-full shadow-lg md:backdrop-blur-sm"><Snowflake size={14} className="md:w-[18px] md:h-[18px]" /></span>}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 md:p-6 flex flex-col flex-1 relative bg-gradient-to-b from-white to-gray-50 rounded-[1.5rem] md:rounded-[2rem] z-0">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

        <div className="flex flex-col items-center mb-2 md:mb-4 mt-4 md:mt-6 z-10">
          <h3 className="font-extrabold text-gray-900 text-lg md:text-2xl text-center leading-tight mb-1">
            {product.name}
          </h3>




          {/* Product Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-end gap-3 my-2 md:my-3 bg-gray-50 px-3 py-2 rounded-full border border-gray-100 min-h-[50px]">
              {product.sizes.map((size, index) => (
                <button
                  key={size.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`transition-all relative group flex flex-col items-center justify-end ${selectedSize?.name === size.name
                    ? 'text-purple-600 scale-110'
                    : 'text-gray-400 hover:text-purple-400'
                    }`}
                  title={size.name}
                >
                  <div className="flex flex-col items-center">
                    {size.icon === 'box' ? (
                      <Box
                        size={selectedSize?.name === size.name ? 24 : 18}
                        strokeWidth={selectedSize?.name === size.name ? 2.5 : 2}
                        className={`md:w-[24px] md:h-[24px] w-[20px] h-[20px] mb-1 ${selectedSize?.name === size.name ? 'text-purple-600' : 'text-gray-400'}`}
                      />
                    ) : size.icon === 'cup' ? (
                      product.isCold ? (
                        <CupSoda
                          size={selectedSize?.name === size.name ? 24 : 18}
                          strokeWidth={selectedSize?.name === size.name ? 2.5 : 2}
                          className={`md:w-[24px] md:h-[24px] w-[20px] h-[20px] mb-1 ${selectedSize?.name === size.name ? 'text-purple-600' : 'text-gray-400'}`}
                        />
                      ) : (
                        <Coffee
                          size={selectedSize?.name === size.name ? 24 : 18}
                          strokeWidth={selectedSize?.name === size.name ? 2.5 : 2}
                          className={`md:w-[24px] md:h-[24px] w-[20px] h-[20px] mb-1 ${selectedSize?.name === size.name ? 'text-purple-600' : 'text-gray-400'}`}
                        />
                      )
                    ) : (
                      <SizeIcon
                        size={selectedSize?.name === size.name ? 24 : 18}
                        strokeWidth={selectedSize?.name === size.name ? 2.5 : 2}
                        className={`md:w-[24px] md:h-[24px] w-[20px] h-[20px] mb-1 ${selectedSize?.name === size.name ? 'text-purple-600' : 'text-gray-400'}`}
                      />
                    )}
                  </div>
                  {/* Label - Positioned Above to avoid covering description */}
                  <span className={`text-[10px] font-bold whitespace-nowrap transition-all duration-300 ${selectedSize?.name === size.name
                    ? 'opacity-100 translate-y-0 text-purple-700'
                    : 'opacity-0 translate-y-2 text-transparent absolute pointer-events-none'
                    }`}>
                    {size.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Simple Size Label if not interactive or just one */}
          {selectedSize && (!product.sizes || product.sizes.length === 0) && (
            <span className="text-[10px] md:text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
              <SizeIcon size={12} />
              {product.category}
            </span>
          )}

        </div>

        <p className="text-gray-500 text-xs md:text-sm text-center mb-4 md:mb-6 line-clamp-3 px-1 md:px-2 font-medium leading-relaxed h-[4.5em] md:h-[3em]">
          {product.description || 'وصف المنتج غير متوفر حالياً، لكن الطعم أكيد هيعجبك! 😋'}
        </p>

        <div className="flex items-center justify-between mt-auto bg-gray-50 p-2 md:p-3 rounded-2xl border border-gray-100 group-hover:border-purple-200 transition-colors">
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
                    <div className="flex items-center gap-2">
                      {size.icon === 'box' ? <Box size={18} /> : (size.icon === 'cup' ? <Coffee size={18} /> : null)}
                      <span className="font-bold">{size.name}</span>
                    </div>
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