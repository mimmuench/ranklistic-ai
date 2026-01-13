
export interface AuditItem {
  category: string;
  score: number;
  analysis: string;
  recommendations: string[];
  missingElements?: string[];
  criticalErrors?: string[];
}

export interface AuditReport {
  audit: AuditItem[];
  timestamp?: number;
  shopName?: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  image?: string;
}

export interface ListingOptimizerResult {
  newTitle: string;
  newDescription: string;
  hashtags: string[];
  seoStrategy: string;
  socialMedia: {
    pinterestTitle: string;
    pinterestDescription: string;
    pinterestAltText: string;
    pinterestHashtags: string;
    instagramCaption: string;
    instagramHashtags: string;
  };
}

export interface ComparisonPoint {
  area: string;
  myShopObservation: string;
  competitorObservation: string;
  winner: 'Me' | 'Competitor' | 'Tie';
  insight: string;
}

export interface CompetitorAnalysisResult {
  myShopName: string;
  competitorShopName: string;
  salesGapAnalysis: string;
  comparisonPoints: ComparisonPoint[];
  keyStrategiesToSteal: string[];
  immediateActionPlan: string[];
}

export interface ProductPotentialAnalysis {
  viabilityScore: number;
  verdict: 'GO' | 'NO GO' | 'CAUTION';
  titleIdea: string;      // NEW
  estimatedPrice: string; // NEW
  targetAudience: string; // NEW
  visualCritique: {       // NEW
      strengths: string[];
      weaknesses: string[];
  };
  seoKeywords: string[];  // NEW
  improvementTip: string; // NEW
}

export interface ShopNameResult {
  names: { name: string; reasoning: string }[];
}

export interface BusinessIdeaAnalysis {
  score: number;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard' | 'Nightmare';
  pros: string[];
  cons: string[];
  verdict: string;
  shippingAdvice: string;
}

export interface RegionInsight {
    region: string;
    flag: string;
    demandLevel: 'High' | 'Medium' | 'Low';
    competitionLevel: 'High' | 'Medium' | 'Low';
    keywordNuance: string; // CulturalSEO Mapper
    risingTrend: string; // GeoTrend AI
    culturalNote: string;
    opportunityScore: number;
}

export interface MarketAnalysisResult {
    productName: string;
    globalVerdict: string;
    regions: RegionInsight[];
    seasonalAlerts: string[];
}

// NEW: Enhanced Keyword Analysis Types
export interface KeywordIdea {
    keyword: string;
    volume: number; // 0-100 scale for visual bar
    volumeLabel: string; // "High", "Very High"
    competition: string;
    trendDirection: 'Up' | 'Stable' | 'Down';
    cpcHint: string; // "High Value" or "Low"
    intent: string; 
}

export interface RisingConcept {
    concept: string;
    growthFactor: string; // e.g. "+300% search spike"
    whyTrending: string;
}

export interface PlatformInsight {
    platform: 'Pinterest' | 'Etsy';
    focus: string; // "Aesthetic" vs "Transaction"
    topTags: string[];
    advice: string;
}

export interface KeywordAnalysisResult {
    seedKeyword: string;
    summary: string;
    keywords: KeywordIdea[];
    risingConcepts: RisingConcept[];
    platformInsights: PlatformInsight[];
}

// NEW: TrendRadar Types (Multi-Trend Update)
export interface TrendItem {
    id: string;
    name: string;
    viralityScore: number; // 0-100
    status: 'Exploding' | 'Rising' | 'Hidden Gem';
    description: string;
    signals: string[]; // "Reddit r/design", "TikTok Audio"
    actionPlan: {
        shopVibe: string; // "Dark Academia", "Minimalist"
        targetAudience: string; // "Gen-Z Students"
        productsToMake: string[]; // List of 3 specific products
        marketingHook: string;
    };
    visualPrompt?: string; // NEW: For image generation
    colorPalette?: string[]; // NEW: Hex codes
}

export interface TrendRadarResult {
    niche: string;
    trends: TrendItem[];
}

// NEW: Optimizer Transfer Data Type
export interface OptimizerTransferData {
    imageBase64?: string;
    analysis?: string;
    niche?: string;
    // New fields for text-based transfer (TrendRadar)
    titleSuggestion?: string;
    trendContext?: string;
    mode?: 'image' | 'text';
}

// NEW: For Dashboard History
export interface SavedRecord {
    id: string;
    type: 'audit' | 'market' | 'competitor' | 'listing' | 'trend';
    title: string; // Shop Name or Product Name
    date: string;
    score?: number; // 0-10
    data: any; // Full report object
    tags?: string[]; // e.g. "USA", "Jewelry"
}

// NEW: User Settings & Branding
export interface UserSettings {
    brandName?: string;
    brandLogo?: string; // Base64 or URL
    brandColor?: string;
    language: 'en' | 'tr';
    notifications: boolean;
}
