import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Product, Category, SiteSettings, CartItem, Message, Size } from './types';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  writeBatch,
  getDoc
} from 'firebase/firestore';

// Default Data (Used for Seeding)
// Default Data (Used for Seeding) - Cleared as data is now fetched from Firestore/Cloudinary
const DEFAULT_CATEGORIES: Category[] = [];

const DEFAULT_PRODUCTS: Product[] = [];

const DEFAULT_SETTINGS: SiteSettings = {
  primaryColor: '#5b21b6', // Deep Royal Purple
  shopName: 'فخم البن',
  heroHeadline: 'القهوة كما يجب أن تكون.. فخامة وتعديل مزاج',
  whatsappNumber: '966504312478',
  deliveryNumber: '966504312478',
  adminNumber: '966538371230',
  heroImages: [],
  offerImages: [],
  instagramUrl: 'https://instagram.com',
  snapchatUrl: 'https://snapchat.com',
  tiktokUrl: 'https://tiktok.com',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
  theme: 'light',
  popupTitle: 'عرض مميز 🔥',
  popupImage: '',
  popupMessage: 'استمتع بأفضل المشروبات والحلويات لدينا. اطلب الآن!',
  isPopupEnabled: true,
  groqApiKey: '',
  scrollingBannerText: '✨ فخم البن يرحب بكم ✨ استمتعوا بأجود أنواع البن المختص ✨ حلويات فاخرة تصنع يومكم ✨'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Cart remains local (Session Only)
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);



  // Firestore Subscriptions
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      // Sort by order if available
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProducts(items);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      // Sort by order if available, otherwise by name
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(items);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...data }); // Merge to ensure new fields
      } else {
        // If settings doc doesn't exist, create it with defaults
        setDoc(doc(db, 'settings', 'config'), DEFAULT_SETTINGS);
      }
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  const refreshData = () => {
    window.location.reload();
  };

  // One-time Seeding Logic - DISABLED to prevent ghost data
  // useEffect(() => {
  //   const seed = async () => { ... }
  //   seed();
  // }, []);

  // Cart Logic
  const addToCart = (product: Product, size?: Size, temperature?: 'hot' | 'cold') => {
    const basePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    const finalPrice = basePrice + (size?.priceModifier || 0);

    const newItem: CartItem = {
      ...product,
      cartId: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      selectedSize: size,
      selectedTemperature: temperature,
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

  // Admin Logic (Firestore)
  const addProduct = async (product: Product) => {
    try {
      const { id, ...data } = product; // Remove potentially temporary ID

      // Calculate next order index
      const maxOrder = products.length > 0 ? Math.max(...products.map(p => p.order || 0)) : 0;
      const newOrder = maxOrder + 1;

      await addDoc(collection(db, 'products'), { ...data, order: newOrder });
    } catch (error: any) {
      console.error("Error adding product:", error);
      alert("فشل إضافة المنتج: " + (error.message || "خطأ غير معروف"));
    }
  };

  const updateProduct = async (updated: Product) => {
    try {
      if (!updated.id) return;
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'products', id), data as any);
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert("فشل تعديل المنتج: " + (error.message || "خطأ غير معروف"));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert("فشل حذف المنتج: " + (error.message || "خطأ غير معروف"));
    }
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'config'), newSettings, { merge: true });
    } catch (error: any) {
      console.error("Error updating settings:", error);
      alert("فشل تحديث الإعدادات: " + (error.message || "خطأ غير معروف"));
    }
  };

  const addCategory = async (name: string) => {
    await addDoc(collection(db, 'categories'), { name });
  };

  const updateCategory = async (id: string, name: string) => {
    await updateDoc(doc(db, 'categories', id), { name });
  };

  const deleteCategory = async (id: string) => {
    // Check local state for products (fast check)
    const productsInCategory = products.filter(p => p.category === id);
    if (productsInCategory.length > 0) {
      alert(`لا يمكن حذف القسم.يوجد ${productsInCategory.length} منتج في هذا القسم.`);
      return;
    }
    await deleteDoc(doc(db, 'categories', id));
  };

  const reorderCategories = async (newOrder: Category[]) => {
    // Optimistic update
    setCategories(newOrder);

    const batch = writeBatch(db);
    newOrder.forEach((cat, index) => {
      const ref = doc(db, 'categories', cat.id);
      batch.update(ref, { order: index });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error reordering categories:", error);
      alert("فشل حفظ ترتيب الأقسام");
    }
  };

  const reorderProducts = async (newOrder: Product[]) => {
    // Optimistic update
    setProducts(newOrder);

    const batch = writeBatch(db);
    newOrder.forEach((prod, index) => {
      const ref = doc(db, 'products', prod.id);
      batch.update(ref, { order: index });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error reordering products:", error);
      alert("فشل حفظ ترتيب المنتجات");
    }
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);







  return (
    <AppContext.Provider value={{
      products,
      categories,
      cart,
      settings, // Use global settings directly
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
      reorderCategories,
      reorderProducts,
      refreshData,
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