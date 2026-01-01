export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image: string;
  categoryId: string;
  isHot?: boolean;
  isCold?: boolean;
  sizes?: { name: string; priceModifier: number }[];
  isPromo?: boolean;
  promoPrice?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedSize?: { name: string; priceModifier: number };
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