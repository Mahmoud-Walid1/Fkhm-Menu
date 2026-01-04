// Firebase Types
export interface Category {
    id: string;
    nameAr: string;
    nameEn?: string;
    icon: string;
    order: number;
    isActive: boolean;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        backgroundColor: string;
        patternStyle?: 'default' | 'winter' | 'summer' | 'none';
    };
    isSeasonal: boolean;
    seasonalDates?: {
        start: Date;
        end: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductSize {
    name: string;
    price: number;
    isAvailable: boolean;
}

export interface ProductTemperature {
    hot: { available: boolean; priceModifier?: number };
    cold: { available: boolean; priceModifier?: number };
}

export interface ProductExtra {
    name: string;
    price: number;
}

export interface ProductOptions {
    sizes?: ProductSize[];
    temperature?: ProductTemperature;
    extras?: ProductExtra[];
}

export interface Product {
    id: string;
    nameAr: string;
    descriptionAr?: string;
    categoryId: string;
    image: string;
    order: number;
    isActive: boolean;
    options: ProductOptions;
    basePrice?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Announcement {
    id: string;
    titleAr: string;
    descriptionAr: string;
    image?: string;
    type: 'offer' | 'announcement' | 'seasonal';
    isActive: boolean;
    priority: number;
    displayDates?: {
        start: Date;
        end: Date;
    };
    productId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SiteSettings {
    id: 'site_settings';
    siteName: string;
    siteNameAr: string;
    logo: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };
}

export interface Admin {
    id: string;
    email: string;
    displayName: string;
    role: 'super_admin' | 'admin';
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Component Props Types
export interface CategoryCardProps {
    category: Category;
}

export interface ProductCardProps {
    product: Product;
    categoryTheme?: Category['theme'];
}

export interface AnnouncementModalProps {
    announcement: Announcement;
    isOpen: boolean;
    onClose: () => void;
}
