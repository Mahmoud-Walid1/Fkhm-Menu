export interface Size {
  name: string;
  priceModifier: number;
  icon?: 'cup' | 'box';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  isPromo?: boolean;
  category?: string; // @deprecated use categoryIds instead
  categoryIds?: string[]; // New multi-category support
  order?: number;
  image: string;
  description: string;
  sizes?: Size[];
  isHot?: boolean;
  isCold?: boolean;
}

export interface Category {
  id: string;
  name: string;
  order?: number;
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedSize?: Size;
  selectedTemperature?: 'hot' | 'cold';
  finalPrice: number;
}

export interface SiteSettings {
  primaryColor: string; // Hex code
  shopName: string;
  heroHeadline: string;
  whatsappNumber: string; // Default/Cart number
  deliveryNumber: string;
  adminNumber: string;
  heroImages: string[];
  offerImages: string[];
  instagramUrl?: string;
  snapchatUrl?: string;
  tiktokUrl?: string;
  // GitHub Integration (for image uploads)
  // Cloudinary Integration (for image uploads)
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  // Gemini AI (for ChatBot)
  geminiApiKey?: string;
  // Groq AI (Llama 3)
  groqApiKey?: string;
  // Theme
  theme: 'light' | 'dark';
  // Promo Popup
  popupTitle?: string;
  popupImage?: string;
  popupMessage?: string;
  isPopupEnabled: boolean;
  // Other
  scrollingBannerText?: string;
}

export interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  settings: SiteSettings;
  addToCart: (product: Product, size?: Size, temperature?: 'hot' | 'cold') => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (settings: SiteSettings) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: Category[]) => void;
  reorderProducts: (newOrder: Product[]) => void;
  refreshData: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  toggleTheme: () => void;
}

export interface MessageAction {
  label: string;
  url?: string;
  onClick?: () => void;
  type: 'primary' | 'secondary';
  actionType?: 'link' | 'navigate' | 'add-to-cart';
  productData?: {
    productId: string;
    size?: Size;
    temperature?: 'hot' | 'cold';
  };
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actions?: MessageAction[];
}