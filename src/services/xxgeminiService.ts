import { GoogleGenAI } from "@google/genai";
import { validateEtsyListing } from './validator';
import type { AuditItem, ChatMessage, CompetitorAnalysisResult, MarketAnalysisResult, ListingOptimizerResult } from '../types';



const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

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

// 🔥 YENİ ETSY LİSTİNG GENERATOR (RETRY MEKANIZMALI)
export const generateListingContent = async (
    title: string, 
    description: string, 
    template: string, 
    imageBase64: string | null,
    shopContext: string,
    personalization: boolean,
    niche: string,
    material: string,
    tone: string,
    maxRetries: number = 2
): Promise<string> => {
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 Etsy Listing Generation - Attempt ${attempt}/${maxRetries}`);
        
        const parts: any[] = [];
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        }
        
        const prompt = `
**ROLE:** You are a TOP 1% Etsy seller who writes listings that convert at 8%+ (industry avg is 1-2%). Your secret? You write like a human, not a robot.

---

## 🚫 CRITICAL: INSTANT DISQUALIFICATION PHRASES

If you use ANY of these phrases, this listing FAILS:
- "Stunning" / "Elevate" / "Elevate your space"
- "Perfect for any" / "Exquisite" / "Must-have"
- "Game-changer" / "Unleash" / "Realm" / "Dive into"
- "Meticulously crafted" / "Breathtaking" / "Timeless elegance"
- "Crafted with care" / "One-of-a-kind" (unless literally handmade single item)

**PENALTY:** If I detect these, you will be asked to regenerate. Don't waste tokens.

---

## ✅ TITLE FORMULA (140 CHARS MAX - ETSY'S HARD LIMIT)

**Structure:** [Unique Hook] + [Primary Keyword] + [Material] + [Style] + [Gift/Use Case]

**CRITICAL RULES:**
1. **NO REPEATED WORDS** (except "and", "with", "for")
2. **Front-load uniqueness** (first 40 chars = most searchable term)
3. **Natural flow** (use commas, not dashes)
4. **Character count:** 100-140 chars

**Examples:**

❌ BAD: "Metal Wall Art Decor, Steel Wall Hanging, Modern Home Decor"
✅ GOOD: "Saguaro Sunset Desert Landscape, Laser-Cut Steel Mountain Silhouette, Southwest Boho Wall Sculpture"

❌ BAD: "Funny Cat Shirt, Cute Kitten Tee, Animal Lover Gift"
✅ GOOD: "Existential Crisis Cat Illustration Tee, Hand-Drawn Philosophical Feline Graphic, Introvert Humor Shirt"

---

## 📝 DESCRIPTION RULES (500-800 CHARS)

**Tone:** Conversational, like you're explaining to a friend. ${tone === 'professional' ? 'Keep it crisp and factual.' : tone === 'friendly' ? 'Warm but not gushy.' : 'Casual, almost like a text message.'}

**Structure:**
1. **Hook (1 sentence):** Paint a visual or emotional scene
2. **What it is (2-3 sentences):** Describe design, materials, craftsmanship
3. **Why it matters (2 sentences):** Benefit to customer (NOT "elevates your space")
4. **Specs (1-2 sentences):** Sizes, colors, shipping, care

**FORBIDDEN:**
- Emoji overload (max 3 per section)
- Lists with bullets (write in prose)
- Template placeholders like "[Insert X]"
- Generic statements like "high-quality craftsmanship"

**REQUIRED MENTIONS (if applicable):**
- Actual material thickness (e.g., "1.5mm steel")
- Finish type (e.g., "matte black powder coat")
- Specific dimensions (e.g., "18x24 inches")
- ${personalization ? 'Personalization options (HOW to request it)' : ''}

---

## 🏷️ 13 TAGS (ETSY SEO 2026 RULES)

**Breakdown:**
- 7-9 **long-tail** (2-3 words): "vintage boho wall art", "minimalist steel sculpture"
- 3-4 **high-volume** (1 word): "wallart", "homedecor", "metalart"
- 1-2 **ultra-niche** (4+ words): "mid century modern abstract geometric"

**CRITICAL:**
- NO duplicates
- NO hashtag symbol (#)
- Tags must match actual product (don't tag "vintage" if it's modern)
- Use all 13 slots (Etsy penalizes empty slots)

---

## 📱 SOCIAL MEDIA CONTENT (CRITICAL - DON'T HALF-ASS THIS!)

### **PINTEREST (HIGH PRIORITY - 40% of Etsy traffic!)**

**Pin Title (60-100 chars):**
- Front-load main keyword
- Include benefit or emotion
- Example: "Desert Sunset Metal Art - Rustic Southwest Wall Decor for Boho Homes"

**Pin Description (100-500 chars):**
- **Paragraph 1 (2 sentences):** What it is + why someone would love it
- **Paragraph 2 (2 sentences):** Where it fits (room types, decor styles)
- **Paragraph 3 (1 sentence):** Call to action ("Shop now for free shipping!")
- **NO AI jargon** - Write like you're texting a friend about a cool find
- Include 2-3 relevant keywords naturally

**Alt Text (125 chars max):**
- Describe the image for visually impaired users
- Example: "Black metal wall art depicting a desert landscape with saguaro cactus and mountains at sunset"

**Hashtags (8-12 tags):**
- Mix popular (#homedecor) and niche (#southwestwallart)
- Format: #space #separated #notCommas

---

### **INSTAGRAM**

**Caption (150-300 chars):**
- **Line 1:** Hook (question, bold statement, or relatable scenario)
- **Line 2-3:** Quick product description (conversational tone)
- **Line 4:** Soft CTA ("Link in bio" or "DM to order")
- **NO emoji spam** (max 5 total)
- **NO AI fluff** - Sound like a real person

**Hashtags (25-30 tags):**
- **Format:** All on separate lines after caption, starting with "." to hide them
- **Mix:**
  - 5 high-volume (1M+ posts): #homedecor #wallart #interiordesign
  - 15 medium (100k-500k): #bohostyle #modernfarmhouse #metalart
  - 10 niche (<50k): #desertdecor #lasercut art #southwestvibes

---

## 📤 JSON OUTPUT FORMAT

{
  "newTitle": "string (100-140 chars)",
  "newDescription": "string (500-800 chars, NO emojis in main body)",
  "hashtags": ["tag1", "tag2", ... 13 total],
  "socialMedia": {
    "pinterestTitle": "string (60-100 chars)",
    "pinterestDescription": "string (200-400 chars, 3 paragraphs)",
    "pinterestAltText": "string (125 chars max)",
    "pinterestHashtags": "#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8",
    "instagramCaption": "string (150-300 chars, 4 lines, natural tone)",
    "instagramHashtags": "#tag1 #tag2 #tag3 ... (25-30 tags, line-separated)"
  }
}

---

## 🎯 YOUR MISSION

Using these inputs:
- **Current Title:** ${title}
- **Current Description:** ${description}
- **Niche:** ${niche}
- **Material:** ${material}
- **Tone:** ${tone}
- **Personalization:** ${personalization ? 'Yes' : 'No'}

Generate a FLAWLESS Etsy listing that:
1. Passes ALL validation rules
2. Sounds 100% human (no AI jargon)
3. Ranks on Page 1 for long-tail searches
4. Converts browsers into buyers

**NOW GENERATE THE JSON. NO PREAMBLE. JUST JSON.**
        `;

        parts.push({ text: prompt });

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: [{ parts }],
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.6, // Biraz düşürdük, daha tutarlı olsun
                    maxOutputTokens: 4096
                }
            });

            const jsonText = cleanJsonString(response.text || "{}");
            const parsed = JSON.parse(jsonText);

            // 🔒 VALİDASYON
            const validation = validateEtsyListing(parsed);
            
            console.log(`📊 Validation Score: ${validation.score}/100`);
            
            if (validation.errors.length > 0) {
                console.error(`❌ Validation Errors:`, validation.errors);
            }
            
            if (validation.warnings.length > 0) {
                console.warn(`⚠️ Warnings:`, validation.warnings);
            }

            // Eğer score 70'in üzerindeyse kabul et, değilse retry
            if (validation.score >= 70) {
                console.log(`✅ Listing APPROVED (Score: ${validation.score})`);
                return jsonText;
            } else {
                console.warn(`⚠️ Low quality score (${validation.score}), retrying...`);
                if (attempt < maxRetries) {
                    continue; // Retry
                } else {
                    console.error(`❌ Max retries reached. Returning best attempt.`);
                    return jsonText; // Son deneme olarak döndür
                }
            }

        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw new Error(`Failed to generate listing after ${maxRetries} attempts: ${error.message}`);
            }
        }
    }

    throw new Error("Unexpected error in generateListingContent");
};

// 💎 BURAYA EKLE: LİSTİNG OPTİMİZER CHAT FONKSİYONU
export const getOptimizerChatResponse = async (
    contextData: { title: string, description: string, template: string },
    currentResult: ListingOptimizerResult,
    history: ChatMessage[], 
    message: string, 
    image: string | null
): Promise<string> => {
    // 🚀 Stabil modelimizi kullanıyoruz
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await model.generateContent({
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            systemInstruction: `Sen Ranklistic asistanısın. Şu an optimize edilen ürün: ${currentResult.newTitle}. Kullanıcının sorularını teknik ve stratejik bir Etsy uzmanı gibi yanıtla.`
        }
    });

    return response.response.text() || "Yanıt oluşturulamadı.";
};

// 🔥 SOCIAL MEDIA POST GENERATOR (STANDALONE) - SENİN KODUN BURADAN DEVAM EDECEK
export const generateSocialPosts = async (
    productTitle: string, 
    productDescription: string,
    platform: 'instagram' | 'pinterest'
): Promise<string> => {
    
    const isPin = platform === 'pinterest';
    
    const prompt = `
You are a social media manager who gets 10%+ engagement rates.

**Product:** ${productTitle}
**Description:** ${productDescription}
**Platform:** ${platform}

${isPin ? `
**PINTEREST REQUIREMENTS:**

**Pin Title (60-100 chars):**
- Front-load main keyword
- Include benefit or style
- Example: "Rustic Metal Wall Art - Bohemian Desert Landscape for Living Room"

**Pin Description (200-400 chars):**
Write 3 short paragraphs:
1. What it is + emotional appeal (2 sentences)
2. Where/how to use it (2 sentences)  
3. Call to action (1 sentence: "Free shipping!" or "Shop now!")

**Alt Text (125 chars):**
Describe image for accessibility.
Example: "Black steel wall art showing a desert scene with cacti and mountains"

**Hashtags (8-12):**
Format: #hashtag1 #hashtag2 #hashtag3
Mix popular and niche tags.

**JSON OUTPUT:**
{
  "title": "...",
  "description": "...",
  "altText": "...",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8"
}
` : `
**INSTAGRAM REQUIREMENTS:**

**Caption (150-300 chars, 4 lines):**
Line 1: Hook (question or bold statement)
Line 2-3: Product description (conversational)
Line 4: CTA ("Link in bio" or "DM for details")

**Tone:** Like texting a friend. Max 5 emojis.

**Hashtags (25-30):**
Line-separated, starting with "."
Mix:
- 5 high-volume (1M+)
- 15 medium (100k-500k)
- 10 niche (<50k)

**JSON OUTPUT:**
{
  "caption": "...",
  "hashtags": "#tag1\\n#tag2\\n#tag3\\n... (25-30 total)"
}
`}

**🚫 FORBIDDEN WORDS:** "Stunning", "Elevate", "Perfect for any", "Must-have", "Exquisite"

**NOW GENERATE JSON. NO MARKDOWN. JUST JSON.**
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        });

        return cleanJsonString(response.text || "{}");
    } catch (error) {
        console.error('❌ Social post generation failed:', error);
        throw error;
    }
};


// 🔍 RAKİP ANALİZİ (CompetitorAnalyzer.tsx için)
export const runCompetitorAnalysis = async (myShop: string, competitorShop: string): Promise<string> => {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze the gap between my Etsy shop (${myShop}) and competitor (${competitorShop}). Provide a detailed strategy in JSON format including sales gap, comparison points, and an immediate action plan.`;
    const result = await model.generateContent(prompt);
    return cleanJsonString(result.response.text());
};

// 🔍 RAKİP CHAT SİSTEMİ
export const getCompetitorChatResponse = async (history: ChatMessage[], message: string, context: any): Promise<string> => {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });
    const response = await model.generateContent({ contents });
    return response.response.text();
};

// 📊 PAZAR ANALİZİ (MarketAnalyzer.tsx için)
export const runMarketAnalysis = async (niche: string): Promise<string> => {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analyze the Etsy market for: ${niche}. Provide demand score, competition level, and price points in JSON format.`;
    const result = await model.generateContent(prompt);
    return cleanJsonString(result.response.text());
};

// 🛡️ ETSY MAĞAZA DENETİMİ (Audit.tsx için)
export const runEtsyAudit = async (shopName: string, shopData: string): Promise<string> => {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Perform a full Etsy shop audit for: ${shopName}. Analysis data: ${shopData}. Provide a score and recommendations in JSON format.`;
    const result = await model.generateContent(prompt);
    return cleanJsonString(result.response.text());
};

// 🖼️ GÖRSEL ANALİZ (Image Analysis)
export const analyzeProductImage = async (imageBase64: string): Promise<string> => {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Analyze this product image for Etsy. Identify materials, style, and potential keywords.";
    const result = await model.generateContent([prompt, { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }]);
    return result.response.text();
};

// 📊 GLOBAL MARKET ANALYZER CHAT SİSTEMİ (Eksik olan fonksiyon bu!)
export const getMarketAnalysisChatResponse = async (
    history: ChatMessage[], 
    message: string, 
    context: MarketAnalysisResult
): Promise<string> => {
    // Kararlı sürüm olan gemini-2.0-flash kullanıyoruz
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Geçmiş mesajları modelin anlayacağı formata çevir
    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    // Kullanıcının yeni mesajını ekle
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await model.generateContent({
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            systemInstruction: `Sen bir Global Market Analistisin. Şu anki niş: ${context.niche}. Etsy pazarındaki trendler, fiyatlandırma ve rekabet hakkında kullanıcının sorularını teknik ve stratejik olarak yanıtla.`
        }
    });

    return response.response.text() || "Analiz yanıtı oluşturulamadı.";
};