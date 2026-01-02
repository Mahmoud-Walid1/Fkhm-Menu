export interface Size {
  name: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  isPromo?: boolean;
  category: string;
  image: string;
  description: string;
  sizes?: Size[];
  isHot?: boolean;
  isCold?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedSize?: Size;
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
  githubToken?: string;
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
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
}

export interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  settings: SiteSettings;
  addToCart: (product: Product, size?: Size) => void;
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
  isChatOpen: boolean;
  toggleChat: () => void;
  toggleTheme: () => void;
}

export interface MessageAction {
  label: string;
  url: string;
  type: 'primary' | 'secondary';
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actions?: MessageAction[];
}