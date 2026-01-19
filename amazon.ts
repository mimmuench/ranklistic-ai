export type AmazonCategory = 
    | 'electronics'
    | 'home-kitchen'
    | 'toys-games'
    | 'sports-outdoors'
    | 'health-personal-care'
    | 'beauty'
    | 'automotive'
    | 'books'
    | 'clothing'
    | 'pet-supplies'
    | 'office-products'
    | 'garden-outdoor';

export interface AmazonListingResult {
    productIdentified: string;
    confidence: number;
    title: string;
    bulletPoints: string[];
    backendKeywords: string;
    productDescription: string;
    suggestedCategory: string;
    estimatedPrice: string;
    competitorKeywords: string[];
    imageCompliance: {
        whiteBackground: boolean;
        productFills85: boolean;
        noTextOverlay: boolean;
        highResolution: boolean;
        warnings: string[];
    };
    seoScore: number;
    optimizationTips: string[];
}

export interface AmazonChatMessage {
    sender: 'user' | 'ai';
    text: string;
    image?: string;
}

export interface CompetitorAnalysis {
    asin: string;
    estimatedCategory: string;
    titleStructure: string;
    bulletPointStrategy: string;
    keywordGaps: string[];
    pricingTier: string;
    imageStrategy: string;
    recommendedActions: string[];
}