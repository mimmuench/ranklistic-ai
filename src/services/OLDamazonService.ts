import { GoogleGenAI } from "@google/genai";
import type { 
    AmazonListingResult, 
    AmazonChatMessage,
    AmazonCategory 
} from '../types/amazon';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

// JSON temizleme helper'ı
const cleanJsonString = (str: string): string => {
    if (!str) return "{}";
    try {
        JSON.parse(str);
        return str;
    } catch (e) {
        const markdownMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            return markdownMatch[1].trim();
        }
        const firstBrace = str.indexOf('{');
        const firstBracket = str.indexOf('[');
        let start = -1;
        if (firstBrace > -1 && (firstBracket === -1 || firstBrace < firstBracket)) start = firstBrace;
        else if (firstBracket > -1) start = firstBracket;
        if (start === -1) return "{}";
        const end = str.lastIndexOf(str[start] === '{' ? '}' : ']');
        if (end > start) {
            return str.substring(start, end + 1);
        }
    }
    return "{}";
};

// 🔧 MIME Type Detection Helper
const detectMimeType = (base64: string): string => {
    // Eğer base64 başında data URI varsa, oradan çıkar
    if (base64.startsWith('data:')) {
        const match = base64.match(/data:([^;]+);/);
        return match ? match[1] : 'image/jpeg';
    }
    
    // Base64'ün ilk karakterlerinden format tahmin et
    const firstChars = base64.substring(0, 10);
    if (firstChars.startsWith('iVBORw')) return 'image/png';
    if (firstChars.startsWith('/9j/')) return 'image/jpeg';
    if (firstChars.startsWith('R0lGOD')) return 'image/gif';
    if (firstChars.startsWith('UklGR')) return 'image/webp';
    
    // Default
    return 'image/jpeg';
};

// 🔧 Base64 Cleanup Helper
const cleanBase64 = (base64: string): string => {
    // Eğer data URI formatındaysa prefix'i kaldır
    if (base64.includes(',')) {
        return base64.split(',')[1];
    }
    return base64;
};

// 🚨 FALLBACK: Backend Keywords Generator
const generateBackendKeywords = async (title: string, bulletPoints: string[]): Promise<string> => {
    console.log('🔄 Generating backend keywords with AI...');
    
    const prompt = `
Generate 250 characters of Amazon backend search terms for this product.

Title: ${title}
Bullet Points: ${bulletPoints.join(' ')}

Rules:
1. Do NOT repeat any words from title or bullets
2. Include synonyms, misspellings, related terms
3. Add Spanish translations (decoracion, arte, metal, pared)
4. Add German translations (dekoration, wandkunst, metall)
5. Separate with spaces only (no commas)
6. Make it EXACTLY 240-250 characters

Return ONLY the keyword string, nothing else.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: { maxOutputTokens: 300, temperature: 0.8 }
        });
        
        const keywords = response.text?.trim() || '';
        
        // Eğer hala yetersizse, hardcoded ekle
        if (keywords.length < 150) {
            return 'wall hanging sculpture ornament decoracion pared arte metall wandkunst steel iron decor decoration adorno home living bedroom office den lounge entryway gallery gift present housewarming wedding anniversary memorial remembrance sympathy condolence';
        }
        
        return keywords.substring(0, 250); // Max 250 char
    } catch (error) {
        console.error('Backend keywords generation failed:', error);
        return 'wall art decor decoration hanging sculpture metal steel iron ornament home living room bedroom office gift present decoracion arte pared metall wandkunst adorno modern contemporary minimalist';
    }
};

// 🚨 FALLBACK: Product Description Generator
const generateProductDescription = async (
    productName: string,
    title: string,
    bulletPoints: string[]
): Promise<string> => {
    console.log('🔄 Generating product description with AI...');
    
    const prompt = `
Write a 1800-character Amazon product description for:

Product: ${productName}
Title: ${title}
Features: ${bulletPoints.join('. ')}

Structure (4 paragraphs, ~450 chars each):
1. Customer pain point - why generic products fail
2. How THIS product solves it - unique features
3. Technical specs - dimensions, materials, installation, care
4. Use cases, rooms, gift occasions, guarantee

Use natural keyword placement. Write EXACTLY 1800 characters. Be persuasive but factual.

Return ONLY the description, no markdown or formatting.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: { maxOutputTokens: 800, temperature: 0.7 }
        });
        
        let description = response.text?.trim() || '';
        
        // Eğer hala yetersizse, template kullan
        if (description.length < 500) {
            description = `Transform your space with this ${productName}. Unlike mass-produced alternatives that fade, crack, or lack character, this piece combines artistic vision with lasting durability. Each detail is carefully crafted to create a focal point that reflects your personal style and elevates any room.

This ${productName} features premium construction with attention to detail that sets it apart from competitors. The thoughtful design ensures it complements both modern and traditional interiors, while the quality materials guarantee years of beauty without maintenance hassles. Installation is straightforward, and the result is immediate visual impact.

Technical specifications ensure optimal presentation: precision-cut construction, weather-resistant finish, secure mounting system included. The piece arrives ready to hang with pre-drilled holes for easy installation. Clean with a soft, dry cloth as needed. Suitable for indoor environments and protected outdoor areas.

Perfect for living rooms, bedrooms, offices, entryways, or as a thoughtful gift for housewarmings, weddings, anniversaries, or any special occasion. Our commitment to quality means every piece is backed by careful craftsmanship and customer satisfaction. Elevate your decor today and create a space that truly represents you.`;
        }
        
        // Exact 1800 chars için padding veya trimming
        if (description.length < 1800) {
            const padding = ' This statement piece transforms ordinary walls into extraordinary showcases of style and personality.';
            while (description.length < 1800) {
                description += padding;
            }
        }
        
        return description.substring(0, 1800);
        
    } catch (error) {
        console.error('Description generation failed:', error);
        return `Enhance your home with this distinctive ${productName}. Crafted with precision and designed for lasting impact, this piece brings sophistication to any space. The quality construction ensures durability while the timeless design complements various decor styles. Easy installation with included mounting hardware makes setup effortless. Perfect for living rooms, bedrooms, offices, or as a memorable gift. Our products reflect commitment to quality craftsmanship and customer satisfaction. Transform your walls into expressions of personal style with this exceptional decor piece that combines form and function beautifully.`.padEnd(1800, ' ');
    }
};

// 🔥 ANA FONKSİYON: GÖRSEL'DEN AMAZON LİSTİNG OLUŞTUR
export const generateAmazonListingFromImage = async (
    imageBase64: string,
    category: AmazonCategory,
    additionalContext?: string
): Promise<string> => {
    
    // Base64'ü temizle ve mime type'ı tespit et
    const cleanedBase64 = cleanBase64(imageBase64);
    const mimeType = detectMimeType(imageBase64);
    
    console.log('🖼️ Image Info:', {
        originalLength: imageBase64.length,
        cleanedLength: cleanedBase64.length,
        mimeType: mimeType,
        firstChars: cleanedBase64.substring(0, 20)
    });
    
    const prompt = `
**ROLE:** You are an Amazon SEO Specialist + Product Photographer. You analyze product images and generate Page 1 listings.

**TASK:** Analyze this product image and create a complete Amazon listing optimized for the A9 algorithm.

---

### 🎯 STEP 1: IMAGE ANALYSIS

**What you MUST identify:**
1. **Exact Product Type:** Be specific (e.g., "Stainless Steel French Press" not just "Coffee Maker")
2. **Material & Build Quality:** What is it made of? (Metal, plastic, ceramic, fabric, etc.)
3. **Key Visual Features:** Color, size relative to competitors, unique design elements
4. **Use Case Signals:** Who would buy this? (Home chefs, college students, outdoor enthusiasts?)
5. **Competitive Positioning:** Does it look budget/mid-tier/premium based on finish and styling?

**Category Context:** User selected "${category}". If the image doesn't match, prioritize what you SEE.

**Additional Notes from User:** ${additionalContext || 'None provided'}

---

### 🏆 TITLE FORMULA (200 Chars Max, First 80 Critical):

**Structure:** 
[Brand/Material] [Primary Keyword] [Key Benefit/Feature] [Size/Color/Quantity] [Compatibility/Use Case]

Generate a title between 150-200 characters.

---

### 🎯 5 BULLET POINTS (Each 200-250 Chars):

Generate 5 bullet points, each starting with **[BENEFIT]** and containing 200-250 characters.

---

### 🔍 BACKEND SEARCH TERMS - MANDATORY 250 CHARACTERS:

Generate exactly 250 characters of backend search terms. Include:
- Synonyms of product type
- Material variations (steel, metal, iron, aluminum)
- Use case keywords (decoration, decor, gift, present)
- Room types (living room, bedroom, office, den, lounge)
- Spanish equivalents (decoracion, arte, metal)
- German equivalents (dekoration, wandkunst)
- Misspellings users might type
- Related product types

Separate only with spaces, no commas. Count to 250 characters before responding.

---

### 📦 PRODUCT DESCRIPTION - MANDATORY 1800 CHARACTERS:

Write EXACTLY 1800 characters (about 300 words) in 4 paragraphs:

**Paragraph 1 (400 chars):** Customer pain point + emotional hook
**Paragraph 2 (500 chars):** How this product solves it + unique features
**Paragraph 3 (500 chars):** Technical specifications (dimensions, materials, weight, installation)
**Paragraph 4 (400 chars):** Use cases, gift ideas, warranty/guarantee

Use the product name naturally 3-4 times throughout. Count characters before responding.

---

### 📤 STRICT JSON OUTPUT:

Return ONLY valid JSON with these exact fields. ALL fields must have values:

{
  "productIdentified": "string (product name)",
  "confidence": number (0-100),
  "title": "string (150-200 chars)",
  "bulletPoints": ["string", "string", "string", "string", "string"],
  "backendKeywords": "string (EXACTLY 250 characters of space-separated keywords)",
  "productDescription": "string (EXACTLY 1800 characters in 4 paragraphs)",
  "suggestedCategory": "string",
  "estimatedPrice": "string",
  "competitorKeywords": ["string", "string", "string"],
  "imageCompliance": {
    "whiteBackground": boolean,
    "productFills85": boolean,
    "noTextOverlay": boolean,
    "highResolution": boolean,
    "warnings": []
  },
  "seoScore": number,
  "optimizationTips": ["string", "string"]
}

**CRITICAL:** Before returning JSON, verify:
- backendKeywords is 240-250 characters (count them!)
- productDescription is 1700-1900 characters (count them!)
- All 5 bulletPoints exist and are 200-250 chars each
- NO null, undefined, or empty string values

**NOW ANALYZE THE IMAGE AND RETURN THE JSON.**
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{
                parts: [
                    { inlineData: { mimeType: mimeType, data: cleanedBase64 } },
                    { text: prompt }
                ]
            }],
            config: {
                responseMimeType: "application/json",
                temperature: 0.7, // Biraz artırdık, daha yaratıcı olsun
                maxOutputTokens: 6000 // Token limitini artırdık
            }
        });

        const jsonText = cleanJsonString(response.text || "{}");
        const parsed = JSON.parse(jsonText);
        
        console.log('🔍 API Response Check:', {
            hasBackendKeywords: !!parsed.backendKeywords,
            backendLength: parsed.backendKeywords?.length || 0,
            hasDescription: !!parsed.productDescription,
            descLength: parsed.productDescription?.length || 0
        });
        
        // 🚨 FORCE GENERATE MISSING FIELDS
        if (!parsed.backendKeywords || parsed.backendKeywords.length < 100) {
            console.warn('⚠️ Generating fallback backend keywords...');
            parsed.backendKeywords = await generateBackendKeywords(parsed.title, parsed.bulletPoints);
        }
        
        if (!parsed.productDescription || parsed.productDescription.length < 500) {
            console.warn('⚠️ Generating fallback description...');
            parsed.productDescription = await generateProductDescription(
                parsed.productIdentified || 'Product',
                parsed.title,
                parsed.bulletPoints
            );
        }
        
        return JSON.stringify(parsed);
        
    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        throw new Error(`Failed to generate listing: ${error.message}`);
    }
};

// 🔥 CHAT FONKSİYONU
export const getAmazonChatResponse = async (
    currentListing: AmazonListingResult,
    history: AmazonChatMessage[],
    message: string,
    image: string | null
): Promise<string> => {
    
    const systemInstruction = `
You are an Amazon Listing Optimization Expert.

**CURRENT LISTING CONTEXT:**
- Product: ${currentListing.productIdentified}
- Title: ${currentListing.title}
- SEO Score: ${currentListing.seoScore}/100

**YOUR MISSION:**
Help the user refine this listing to rank on Page 1. You can discuss:
- How to improve keyword placement
- A/B testing strategies for bullets
- Image optimization tips
- Backend keyword alternatives

**FORBIDDEN WORDS (even in chat):**
"Premium quality", "Best", "Top-rated", "Stunning", "Amazing"

**TONE:** Direct, data-driven, technical. Cite Amazon policy when relevant.

**USER'S REQUEST:** "${message}"

Keep responses under 150 words. Be specific and actionable.
`;

    const contents = history.map(msg => {
        const parts: any[] = [{ text: msg.text }];
        if (msg.image) {
            const cleanedImg = cleanBase64(msg.image);
            const mimeType = detectMimeType(msg.image);
            parts.unshift({ inlineData: { mimeType: mimeType, data: cleanedImg } });
        }
        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: parts
        };
    });

    const currentParts: any[] = [{ text: message }];
    if (image) {
        const cleanedImg = cleanBase64(image);
        const mimeType = detectMimeType(image);
        currentParts.unshift({ inlineData: { mimeType: mimeType, data: cleanedImg } });
    }
    contents.push({ role: 'user', parts: currentParts });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: contents,
            config: { systemInstruction, maxOutputTokens: 600 }
        });

        return response.text || "I couldn't process that. Try asking about title optimization or bullet improvements.";
    } catch (error) {
        console.error('❌ Chat Error:', error);
        return "Sorry, I encountered an error. Please try again.";
    }
};

// 🔥 RAKIP ASIN ANALİZİ
export const analyzeCompetitorASIN = async (asin: string): Promise<string> => {
    const prompt = `
Simulate analyzing Amazon product ASIN: ${asin}

Since we can't actually scrape Amazon, generate a realistic competitive analysis based on common patterns for this ASIN format.

Return JSON:
{
    "asin": "${asin}",
    "estimatedCategory": "...",
    "titleStructure": "How their title is formatted",
    "bulletPointStrategy": "Common patterns",
    "keywordGaps": ["Keywords they rank for that user should target"],
    "pricingTier": "Budget/Mid-Tier/Premium",
    "imageStrategy": "Main image style",
    "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return cleanJsonString(response.text || "{}");
    } catch (error) {
        console.error('❌ ASIN Analysis Error:', error);
        throw error;
    }
};