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
  whatsappNumber: '966504312478',
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
  githubOwner: 'Mahmoud-Walid1',
  githubRepo: 'Fkhm-Menu',
  githubBranch: 'main',
  theme: 'light',
  popupTitle: 'عرض مميز 🔥',
  popupImage: '',
  popupMessage: 'استمتع بأفضل المشروبات والحلويات لدينا. اطلب الآن!',
  isPopupEnabled: true,
  groqApiKey: ''
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
      setProducts(items);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
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

  // One-time Seeding Logic - DB Check Only
  useEffect(() => {
    const seed = async () => {
      // Removed localStorage check as requested. relying strictly on DB state.


      try {
        const batch = writeBatch(db);
        let hasUpdates = false;

        // Check if ANY products exist to avoid overwriting user edits to default products
        const productsSnapshot = await getDoc(doc(db, 'products', '101'));
        const isDbEmpty = !productsSnapshot.exists();

        if (isDbEmpty) {
          // Seed Categories
          DEFAULT_CATEGORIES.forEach(cat => {
            const ref = doc(db, 'categories', cat.id);
            batch.set(ref, cat);
          });

          // Seed Products
          DEFAULT_PRODUCTS.forEach(prod => {
            const ref = doc(db, 'products', prod.id);
            batch.set(ref, prod);
          });
          hasUpdates = true;
        }

        // Seed Settings (Safe check)
        const settingsRef = doc(db, 'settings', 'config');
        const settingsSnap = await getDoc(settingsRef);
        if (!settingsSnap.exists()) {
          batch.set(settingsRef, DEFAULT_SETTINGS);
          hasUpdates = true;
        }

        if (hasUpdates) {
          await batch.commit();
          console.log("Firebase Seeded Successfully");
        }


      } catch (err) {
        console.error("Seeding Error:", err);
      }
    };

    seed();
  }, []);

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

  // Admin Logic (Firestore)
  const addProduct = async (product: Product) => {
    try {
      const { id, ...data } = product; // Remove potentially temporary ID
      await addDoc(collection(db, 'products'), data);
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