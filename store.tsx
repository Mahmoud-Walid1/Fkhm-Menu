import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Product, Category, SiteSettings, CartItem, Message, Size } from './types';

// Default Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'مشروبات فاخرة' },
  { id: '2', name: 'حلويات' },
  { id: '3', name: 'بوكسات الجمعات' },
  { id: '4', name: 'محصول خاص' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '101',
    name: 'سجنتشر لاتيه',
    price: 24,
    description: 'خلطتنا السرية من الحليب المكثف والاسبريسو الفاخر',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
    category: '1',
    isHot: true,
    isCold: true,
    sizes: [{ name: 'وسط', priceModifier: 0 }, { name: 'كبير', priceModifier: 5 }],
    isPromo: true,
    promoPrice: 19
  },
  {
    id: '102',
    name: 'V60 إثيوبي',
    price: 28,
    description: 'قهوة مقطرة بمذاق فاكهي وإيحاءات التوت',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    category: '1',
    isHot: true,
    isCold: false,
  },
  {
    id: '201',
    name: 'سان سباستيان',
    price: 32,
    description: 'كيكة الجبن المحروقة تقدم مع صوص الشوكولاتة البلجيكية',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800',
    category: '2',
  },
  {
    id: '301',
    name: 'بوكس الفخامة',
    price: 120,
    description: '8 عبوات ميني من اختيارك (بارد) في بوكس ثلجي أنيق',
    image: 'https://images.unsplash.com/photo-1623861596758-c0b0c20f1352?auto=format&fit=crop&q=80&w=800',
    category: '3',
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  primaryColor: '#5b21b6', // Deep Royal Purple
  shopName: 'فخم البن',
  heroHeadline: 'القهوة كما يجب أن تكون.. فخامة وتعديل مزاج',
  whatsappNumber: '966504312478', // Delivery Number as default for cart
  deliveryNumber: '966504312478',
  adminNumber: '966538371230',
  heroImages: [
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1507133750069-775b0f0da746?auto=format&fit=crop&q=80&w=1200'
  ],
  offerImages: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200'
  ],
  instagramUrl: 'https://instagram.com',
  snapchatUrl: 'https://snapchat.com',
  tiktokUrl: 'https://tiktok.com',
  // GitHub Integration defaults
  githubOwner: 'Mahmoud-Walid1',
  githubRepo: 'Fkhm-Menu',
  githubBranch: 'main',
  // Default theme
  theme: 'light',
  // Promo Popup Defaults
  popupTitle: 'عرض مميز 🔥',
  popupImage: '',
  popupMessage: 'استمتع بأفضل المشروبات والحلويات لدينا. اطلب الآن!',
  isPopupEnabled: true
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or use defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mood_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mood_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('mood_settings');
    // Merge with defaults to ensure new fields (like heroImages) exist for old users
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Persist Data
  useEffect(() => {
    localStorage.setItem('mood_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mood_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mood_settings', JSON.stringify(settings));
  }, [settings]);


  // Cart Logic
  const addToCart = (product: Product, size?: Size) => {
    const basePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    const finalPrice = basePrice + (size?.priceModifier || 0);

    const newItem: CartItem = {
      ...product,
      cartId: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      selectedSize: size,
      finalPrice
    };
    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  // Admin Logic
  const addProduct = (product: Product) => setProducts([...products, product]);

  const updateProduct = (updated: Product) => {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateSettings = (newSettings: SiteSettings) => setSettings(newSettings);

  const addCategory = (name: string) => {
    setCategories([...categories, { id: Math.random().toString(36).substr(2, 9), name }]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    // Only delete if no products are using this category
    const productsInCategory = products.filter(p => p.category === id);
    if (productsInCategory.length > 0) {
      alert(`لا يمكن حذف القسم.يوجد ${productsInCategory.length} منتج في هذا القسم.`);
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  return (
    <AppContext.Provider value={{
      products,
      categories,
      cart,
      settings,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addProduct,
      updateProduct,
      deleteProduct,
      updateSettings,
      addCategory,
      updateCategory,
      deleteCategory,
      isChatOpen,
      toggleChat
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};