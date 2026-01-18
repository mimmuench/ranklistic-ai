
import { GoogleGenAI } from "@google/genai";
import type { AuditItem, ChatMessage, CompetitorAnalysisResult, MarketAnalysisResult, ListingOptimizerResult } from '../types';

// API Key doğrudan process.env'den alınır.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

export const cleanJsonString = (str: string): string => {
    if (!str) return "{}";
    
    try {
        // 1. Önce doğrudan parse etmeyi dene (belki zaten temizdir)
        JSON.parse(str);
        return str;
    } catch (e) {
        // 2. Markdown bloklarını ayıkla (en yaygın durum)
        const markdownMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            return markdownMatch[1].trim();
        }

        // 3. Blok yoksa, ilk { veya [ ile son } veya ] arasını al
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

// Helper to construct chat history
const buildChatContents = (history: ChatMessage[], currentMessage: string, currentImage?: string | null) => {
    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: msg.image ? [
            { inlineData: { mimeType: 'image/jpeg', data: msg.image } },
            { text: msg.text }
        ] : [
            { text: msg.text }
        ]
    }));
    
    const currentParts: any[] = [{ text: currentMessage }];
    if (currentImage) {
        currentParts.unshift({ inlineData: { mimeType: 'image/jpeg', data: currentImage } });
    }
    contents.push({ role: 'user', parts: currentParts });
    
    return contents;
};

// --- NEW: VEO VIDEO GENERATION ---
export const generateProductVideo = async (imageBase64: string, promptText: string): Promise<string> => {
    try {
        console.log("Starting Video Generation with Veo...");
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview', // Fastest model for demo
            prompt: promptText,
            image: {
                imageBytes: imageBase64,
                mimeType: 'image/jpeg' // Assuming jpeg for simplicity
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16' // Reel Format
            }
        });

        console.log("Operation started:", operation);

        // Polling loop
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log("Polling status:", operation.metadata?.state);
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video URI returned.");

        // IMPORTANT: Append API Key for access
        return `${videoUri}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`;

    } catch (error) {
        console.error("Video Gen Error:", error);
        throw error;
    }
};

// ... (Rest of existing functions: runEtsyAudit, getChatResponse, generateListingContent, etc.) ...
export const runEtsyAudit = async (shopUrl: string, manualStats?: any): Promise<string> => {
    const prompt = `
    Role: Ruthless Etsy Shop Auditor & Success Coach.
    Task: Audit the Etsy shop at: ${shopUrl}.
    Context provided by user: ${JSON.stringify(manualStats || {})}
    
    **OBJECTIVE:**
    Identify specifically why this shop is losing sales compared to the Top 1% of sellers in the same niche. 
    Focus on "GAPS" - what successful competitors have that this shop is MISSING.

    **CATEGORIES TO AUDIT:**
    1. **SEO & Discoverability:** (Are titles generic vs long-tail? Are tags repetitive?)
    2. **Visual Merchandising:** (Lighting, styling, thumbnail impact vs competitors)
    3. **Trust & Branding:** (Banner, logo, about section, policies completeness)
    4. **Conversion Triggers:** (Description formatting, clear policies, FAQs)
    5. **Pricing & Value:** (Is it perceived as cheap or premium? Shipping strategy)

    **OUTPUT FORMAT (JSON):**
    {
        "audit": [
            {
                "category": "SEO & Discoverability",
                "score": 6.5,
                "analysis": "Your titles are too short (avg 40 chars). Top sellers in this niche use 120+ chars stacking keywords.",
                "missingElements": [
                    "Long-tail keywords in first 40 characters",
                    "Attributes filled out completely",
                    "Tag diversity (you repeat 'gift' 5 times)"
                ],
                "criticalErrors": [
                    "Missing shop sections",
                    "Title keyword stuffing"
                ],
                "recommendations": [
                    "Rewrite titles using formula: [Main Keyword] + [Benefit] + [Features] + [Gift For]",
                    "Use all 13 tags with multi-word phrases"
                ]
            },
            ... (Repeat for other categories)
        ],
        "shopName": "Derived Shop Name"
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }], // Use Google Search to actually see current trends if possible
            responseMimeType: "application/json"
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const getChatResponse = async (auditItem: AuditItem, history: ChatMessage[], message: string, image: string | null): Promise<string> => {
    const context = `You are an Etsy expert assisting the user with their shop audit.
    Focus on the category: ${auditItem.category}.
    Current Score: ${auditItem.score}/10.
    Analysis: ${auditItem.analysis}.
    Recommendations: ${auditItem.recommendations.join(', ')}.
    `;
    
    const contents = buildChatContents(history, message, image);
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
            systemInstruction: context
        }
    });

    return response.text || "I couldn't generate a response.";
};

export const generateListingContent = async (
    title: string, 
    description: string, 
    template: string, 
    imageBase64: string | null,
    shopContext: string,
    personalization: boolean,
    niche: string,
    material: string,
    tone: string
): Promise<string> => {
    const parts: any[] = [];
    if (imageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    }
    
    // 🔥 YENİ PROMPT (Eski prompt'u tamamen SİL, bunu koy)
    const prompt = `
**ROLE:** You are a veteran Etsy copywriter who has generated $10M+ in sales. Your listings don't sound like AI — they sound like a passionate craftsman talking to a friend.

**TASK:** Generate a professional Etsy listing for the following product.

---

### 🚫 FORBIDDEN AI PHRASES (INSTANT FAIL IF USED):
"Stunning", "Elevate your space", "Perfect for any decor", "Exquisite craftsmanship", "Must-have", "Game-changer", "Unleash", "Realm", "Dive into", "Meticulously crafted", "Breathtaking", "Timeless elegance", "Unique", "One-of-a-kind" (unless literally true), "Crafted with care"

---

### ✅ TITLE FORMULA (STRICT ETSY 2026 RULES):
**Structure:** [Emotional Hook/Unique Detail] + [Primary Keyword] + [Material] + [Style Descriptor] + [Use Case/Gift Angle]

**CRITICAL RULES:**
1. **Zero Repetition:** NEVER use the same word twice (except tiny words like "and", "with", "for").
2. **Front-Load Power:** The first 40 characters MUST contain the most unique/searchable keyword.
3. **Natural Flow:** Use commas, not dashes. It should read like a sentence, not a keyword dump.
4. **Character Limit:** 140 characters max (Etsy's hard limit).

**Examples:**

*For Metal Art:*
❌ BAD: "Metal Wall Art Decor, Steel Wall Hanging, Modern Home Decor"
✅ GOOD: "Mojave Sunset Saguaro Scene, Hand-Cut Steel Desert Landscape, Southwest Mountain Silhouette"

*For Apparel:*
❌ BAD: "Funny Cat Shirt, Cute Kitten Tee, Animal Lover Gift"
✅ GOOD: "Sassy Cat Mom Vintage Tee, Retro Kitten Graphic, Soft Cotton Gift for Her"

*For Jewelry:*
❌ BAD: "Gold Necklace, Minimalist Pendant, Dainty Chain"
✅ GOOD: "Crescent Moon Gold Necklace, Tiny Lunar Pendant, Delicate 14K Chain for Layering"

---

### ✅ DESCRIPTION STRUCTURE (ANTI-AI FRAMEWORK):

Follow this exact structure but make it sound HUMAN:

**OPENING (20-30 words):**
- Start with a **sensory moment**, **emotional question**, or **vivid image**.
- Do NOT start with "This product is...", "Introducing...", or "Looking for...".

**Examples:**
- (Metal Art): "Picture the last golden light hitting a Joshua Tree, casting long shadows across cracked earth. That's the feeling we laser-etched into steel."
- (Jewelry): "There's something about a tiny gold crescent moon resting near your collarbone—mysterious, personal, like carrying a secret."
- (Apparel): "This isn't just another graphic tee. It's the one you'll reach for on a Sunday morning when you want to feel like yourself."

**BODY SECTION:**
Use the user's template structure (${template}), but rewrite each benefit to sound conversational and specific:

Instead of:
❌ "Premium Craftsmanship – Precision laser cutting ensures every detail..."

Write:
✅ "**Cut with Obsessive Precision** – We run the laser three times to get those needle-thin spines on the Saguaro. Overkill? Maybe. But you'll notice."

**IMPORTANT:** Follow the exact section headers from the template, but fill them with natural, non-robotic language.

---

### ✅ HASHTAG STRATEGY (CRITICAL - 13 TAGS REQUIRED):
You MUST provide exactly 13 tags following this distribution:

- **3-4 High-Volume** (broad, 100K+ searches): e.g., "Metal Wall Art", "Gold Necklace"
- **6-7 Long-Tail** (specific, 10K-50K searches): e.g., "Joshua Tree Decor", "Minimalist Moon Pendant"
- **2-3 Ultra-Niche** (hyper-specific, <10K searches): e.g., "Mojave Desert Gift", "Lunar Phase Jewelry"

**Tag Formula Components:**
[Product Type] + [Material] + [Style] + [Use Case] + [Occasion] + [Target Audience] + [Cultural/Location Reference]

**Example (Metal Art):**
Joshua Tree Art, Saguaro Metal Sign, Desert Wall Hanging, Southwest Steel Decor, Outdoor Landscape Art, Boho Mountain Scene, Rustic Cactus Gift, Arizona Home Decor, Modern Farmhouse Metal, Western Interior Design, California Desert Print, Large Steel Sculpture, Housewarming Wall Art

---

### ✅ SOCIAL MEDIA REQUIREMENTS:

**PINTEREST:**
- **Title:** 60-70 characters, keyword-rich but intriguing
- **Description:** 120-150 characters, includes a benefit + search term
- **Alt Text:** Descriptive for accessibility (what's literally in the image)
- **Hashtags:** 20-30 tags, mixing broad + niche

**INSTAGRAM:**
- **Caption:** 2-3 sentences, conversational tone, max 2 emojis
- **Hashtags:** 25-30 tags in first comment format

---

### 📋 INPUT DATA:
- **Product Title/Draft:** ${title || 'Not provided — generate from image'}
- **Niche/Category:** ${niche}
- **Material Details:** ${material || 'Not specified'}
- **User Context:** ${description || 'Not provided'}
- **Desired Tone:** ${tone}
- **Template Structure:** ${template}

---

### 📤 OUTPUT FORMAT (JSON ONLY):
{
  "newTitle": "Your generated title here (max 140 chars, zero word repetition)",
  "newDescription": "Full description following the template structure with human tone",
  "hashtags": ["tag1", "tag2", "tag3", ..., "tag13"],
  "seoStrategy": "Brief explanation (2-3 sentences) of why this title/description combo will rank well and convert",
  "socialMedia": {
    "pinterestTitle": "60-70 char clickable headline",
    "pinterestDescription": "120-150 char SEO description with benefit",
    "pinterestAltText": "Image description for accessibility",
    "pinterestHashtags": "#tag1 #tag2 #tag3 ... (20-30 tags separated by spaces)",
    "instagramCaption": "2-3 sentence caption, casual tone, max 2 emojis",
    "instagramHashtags": "#tag1 #tag2 #tag3 ... (25-30 tags separated by spaces)"
  }
}

---

### 🔍 FINAL QUALITY CHECK (Before you respond):
1. ❌ Did I use ANY forbidden AI phrase? → If YES, REWRITE
2. ❌ Does the title repeat any word (except "and"/"with"/"for")? → If YES, FIX
3. ❌ Does the opening sentence sound like marketing copy? → If YES, make it human
4. ❌ Are fewer than 7 hashtags long-tail (2+ words)? → If YES, add more specific tags
5. ✅ Would a real craftsman say this to a customer? → If NO, simplify

**NOW GENERATE THE LISTING.**
`;
    
    parts.push({ text: prompt });

const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp", // 🔥 En güncel modeli kullan
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 4096
        }
    });

    const responseText = response.text || "{}";
    const cleanJson = cleanJsonString(responseText);

    // 🔥 HATA BURADAYDI: Kontrolü fonksiyon bitmeden içeri aldık
    try {
        const parsedResult = JSON.parse(cleanJson);
        const qualityIssues = validateQuality(parsedResult);
        if (qualityIssues.length > 0) {
            console.warn("Listing Quality Issues:", qualityIssues);
        }
    } catch (e) {
        console.error("JSON Parsing error in validation:", e);
    }

    return cleanJson;
}; // <--- Fonksiyon burada güvenle kapanıyor

// validateQuality fonksiyonu ise aşağıda, dışarıda kalabilir:
const validateQuality = (result: any): string[] => {
    const errors: string[] = [];
    if (!result.newTitle) return errors;

    // Title validation
    const titleWords = result.newTitle.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(titleWords.filter((w: string) => w.length > 3));
    if (titleWords.filter((w: string) => w.length > 3).length !== uniqueWords.size) {
        errors.push("❌ Title contains repeated words");
    }

    // Jargon check
    const banned = ["stunning", "elevate", "perfect for", "exquisite"];
    const content = (result.newTitle + " " + result.newDescription).toLowerCase();
    banned.forEach(word => {
        if (content.includes(word)) errors.push(`❌ Forbidden word: "${word}"`);
    });

    return errors;
};

export const getOptimizerChatResponse = async (
    contextData: { title: string, description: string, template: string },
    currentResult: ListingOptimizerResult,
    history: ChatMessage[], 
    message: string, 
    image: string | null
): Promise<string> => {
    
    const systemInstruction = `
    You are a Wise Etsy Strategy Consultant & Creative Copywriter.
    Your mission is to be the user's partner in making this listing a bestseller.

    **CORE GUIDELINES:**
    1. **Helpful Expert Tone:** Instead of being a strict editor, be a helpful mentor. Talk like a craftsman to a friend. 
    2. **Context Flexibility:** While your focus is the listing, you CAN discuss related things like:
       - Pinterest/Social media ideas for THIS product.
       - How to describe the materials better.
       - Storytelling ideas for the brand.
    3. **Soft Refusal:** If a request is COMPLETELY unrelated (e.g., "how to fix a car"), don't be robotic. Say: "I'd love to help, but let's keep our focus on making your [Product] stand out on Etsy so we don't lose our SEO momentum."
    4. **Avoid the "AI Sound":** Stick to our forbidden words list ("stunning", "elevate", etc.) but don't be a robot. Use vivid, sensory language instead.
    5. **Practicality Over Rules:** If a user wants to break a rule (like repeating a word in the title), explain WHY it's better not to, but still provide a creative alternative.

    **CURRENT CONTEXT:**
    - Product: ${currentResult.newTitle}
    - Details: ${currentResult.newDescription}

    **USER'S CURRENT VIBE:** "${message}"
    
    Respond like a human who cares about the success of this shop. Keep it snappy, professional, but warm.
`	;

    const contents = buildChatContents(history, message, image);

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: { 
            systemInstruction,
            maxOutputTokens: 800 // Mesajların çok uzamasını engelleyerek maliyeti ve suistimali düşürür.
        }
    });

    return response.text || "I couldn't process that request. Please try again with a listing-related question.";
};

export const runCompetitorAnalysis = async (myShopUrl: string, competitorShopUrl: string): Promise<string> => {
    const prompt = `
    Compare my Etsy shop (${myShopUrl}) with this competitor (${competitorShopUrl}).
    Analyze sales gaps, pricing strategy, visual differences, and SEO keywords.
    
    Return JSON:
    {
        "myShopName": "...",
        "competitorShopName": "...",
        "salesGapAnalysis": "Why they are selling more...",
        "comparisonPoints": [
            { "area": "Photography", "myShopObservation": "...", "competitorObservation": "...", "winner": "Competitor", "insight": "..." },
            ...
        ],
        "keyStrategiesToSteal": ["...", "..."],
        "immediateActionPlan": ["...", "..."]
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const getCompetitorChatResponse = async (
    urls: { myShopUrl: string, competitorShopUrl: string },
    analysisResult: CompetitorAnalysisResult,
    history: ChatMessage[],
    message: string,
    image: string | null
): Promise<string> => {
    const systemInstruction = `Context: Competitor Analysis between ${urls.myShopUrl} and ${urls.competitorShopUrl}.
    Analysis Summary: ${analysisResult.salesGapAnalysis}
    `;
    
    const contents = buildChatContents(history, message, image);

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: { systemInstruction }
    });

    return response.text || "";
};

export const analyzeProductImage = async (base64: string, promptText: string, niche: string): Promise<string> => {
    const prompt = `
    You are an expert E-commerce Product Critic and Strategist.
    
    **TASK:**
    1. **IDENTIFY:** First, detect exactly what object is in the image (e.g., Sweatshirt, Wooden Table, Ceramic Lamp, Metal Wall Art, Necklace).
    2. **CONTEXT:** The user has categorized this as: "${niche}". (If the image clearly does not match this category, prioritize what you see in the image).
    3. **ANALYZE:** Provide a commercial critique specific to the *material and type* of the object detected.
       - If **Apparel**: Critique the print quality, fabric folding, model fit, and wrinkle visibility.
       - If **Furniture/Decor**: Critique the staging, lighting reflections on material, sturdiness appearance.
       - If **Jewelry**: Critique the sparkle, macro detail, and skin tone contrast.
       - If **Wall Art**: Critique the wall contrast, sizing simulation, and shadow realism.

    **OUTPUT JSON:**
    {
        "viabilityScore": 8.5, // 0-10 Float based on photo quality and market trends
        "verdict": "GO", // "GO", "NO GO", or "CAUTION"
        "titleIdea": "...", // A strong SEO title (e.g. 'Oversized Beige Hoodie...' or 'Mid-Century Modern Oak Table...')
        "estimatedPrice": "...", // e.g. "$45 - $60" (Make this realistic for the item type)
        "targetAudience": "...", // Specific persona (e.g. "Streetwear enthusiasts", "Interior Designers")
        "visualCritique": {
            "strengths": ["...", "..."], // 2 key visual strengths specific to the object type
            "weaknesses": ["...", "..."] // 2 key visual weaknesses specific to the object type
        },
        "seoKeywords": ["...", "...", "...", "...", "..."], // 5 relevant tags
        "improvementTip": "..." // One actionable tip (e.g. 'Iron the fabric', 'Use a warmer light bulb')
    }
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
            { text: prompt }
        ] }],
        config: {
            responseMimeType: "application/json"
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const generateDemoTitle = async (input: string): Promise<string> => {
    const prompt = `
    Act as a World-Class Etsy SEO Strategist (2026 Algorithm Expert).
    
    Task: Convert the input into a single, high-converting Etsy Title.
    
    **STRICT 2026 SEO RULES:**
    1. **Strict Zero Repetition:** DO NOT use the same word twice. If you use "Metal", do not use it again. If you use "Art", do not use it again. (Exception: tiny words like 'and', 'with').
    2. **Readable Flow:** No "dash-dash-dash" strings. Use commas (,) and create a natural sentence-like flow that a human enjoys reading.
    3. **The 40-Character Hook:** The most important product identifier MUST be in the first 40 characters.
    4. **No Keyword Stuffing:** Focus on the "vibe" and "utility" rather than synonyms.
    5. **Formula:** [Primary Product & Material] with [Unique Detail], [Aesthetic Style] [Category Keyword], [Gift Occasion]
    
    Input: "${input}"
    
    **OUTPUT REQUIREMENT:** Return ONLY the plain text of the title. No quotes, no intro, no "Here is your title". Just the text.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });
    return response.text?.trim() || input;
};

export const generateShopNames = async (niche: string, vibe: string, lang: 'en' | 'tr'): Promise<string> => {
    const prompt = `Generate 5 creative Etsy shop names for:
    Niche: ${niche}
    Vibe: ${vibe}
    Language: ${lang}
    
    Return JSON:
    {
        "names": [
            { "name": "Name 1", "reasoning": "Why this works..." },
            ...
        ]
    }
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return cleanJsonString(response.text || "{}");
};

export const analyzeBusinessIdea = async (idea: string, origin: string, lang: 'en' | 'tr'): Promise<string> => {
    const prompt = `Analyze this Etsy business idea:
    Idea: ${idea}
    Shipping From: ${origin}
    Target Market: Global (USA/EU)
    Language: ${lang}
    
    Evaluate logistics, profitability, and competition.
    
    Return JSON:
    {
        "score": 8,
        "difficultyLevel": "Medium",
        "pros": ["..."],
        "cons": ["..."],
        "verdict": "...",
        "shippingAdvice": "Detailed shipping feasibility advice..."
    }
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }] 
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const runGlobalMarketAnalysis = async (productName: string, lang: 'en' | 'tr'): Promise<string> => {
    const prompt = `Perform a global market analysis for selling "${productName}" on Etsy.
    Analyze 3-5 key regions (e.g. USA, UK, Germany, Australia, Canada).
    Language: ${lang}
    
    Return JSON:
    {
        "productName": "${productName}",
        "globalVerdict": "...",
        "regions": [
            {
                "region": "USA",
                "flag": "🇺🇸",
                "demandLevel": "High",
                "competitionLevel": "High",
                "keywordNuance": "Cultural keyword note",
                "risingTrend": "Current aesthetic trend",
                "culturalNote": "...",
                "opportunityScore": 8
            },
            ...
        ],
        "seasonalAlerts": ["...", "..."]
    }
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }] 
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const getMarketAnalysisChatResponse = async (
    result: MarketAnalysisResult,
    history: ChatMessage[],
    message: string,
    image: string | null
): Promise<string> => {
    const systemInstruction = `Context: Market Analysis for ${result.productName}.
    Global Verdict: ${result.globalVerdict}.
    `;
    const contents = buildChatContents(history, message, image);

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: { systemInstruction }
    });

    return response.text || "";
};

export const runKeywordAnalysis = async (seedKeyword: string, lang: 'en' | 'tr'): Promise<string> => {
    // 1. GÜNCELLEME: Prompt'u sertleştirdik ve 50+ kelime zorunluluğu getirdik.
    const prompt = `
    Role: Advanced SEO Data Analyst for Etsy.
    Task: Deep keyword research for niche: "${seedKeyword}".
    Language: ${lang}
    
    CRITICAL INSTRUCTION: You MUST provide a list of AT LEAST 50 unique keywords. 
    Do not stop at 10 or 20. I need a comprehensive list covering long-tail variations, questions, and niche tags.
    If the list is short, the analysis fails. Generate 50+ items.

    Find high volume, low competition keywords. Look for rising trends.
    
    Return JSON:
    {
        "seedKeyword": "${seedKeyword}",
        "summary": "Detailed strategic summary...",
        "keywords": [
            {
                "keyword": "long tail keyword example",
                "volume": 85,
                "volumeLabel": "High",
                "competition": "Low",
                "trendDirection": "Up",
                "cpcHint": "High",
                "intent": "Purchase"
            },
            ... (Ensure 50+ items here)
        ],
        "risingConcepts": [
            { "concept": "Concept 1", "growthFactor": "+200%", "whyTrending": "..." },
            { "concept": "Concept 2", "growthFactor": "+150%", "whyTrending": "..." },
            { "concept": "Concept 3", "growthFactor": "+120%", "whyTrending": "..." },
            { "concept": "Concept 4", "growthFactor": "+90%", "whyTrending": "..." }
        ],
        "platformInsights": [
            { "platform": "Pinterest", "focus": "Aesthetic", "topTags": ["tag1", "tag2", "tag3"], "advice": "..." },
            { "platform": "Etsy", "focus": "Transactional", "topTags": ["tag1", "tag2", "tag3"], "advice": "..." },
            { "platform": "TikTok", "focus": "Viral", "topTags": ["tag1", "tag2", "tag3"], "advice": "..." }
        ]
    }
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Kullanmaya devam edebilirsin
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
            // 2. GÜNCELLEME: Kelime listesi uzun olacağı için limiti artırdık
            maxOutputTokens: 8192, 
            temperature: 0.7 
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const runTrendRadarAnalysis = async (niche: string, lang: 'en' | 'tr' = 'en'): Promise<string> => {
    const langInstruction = lang === 'tr' ? "Output (descriptions, action plans) MUST be in TURKISH." : "Output in English.";
    
    let modeInstruction = "";
    
    // Niche varsa ona odaklan, yoksa genel keşif yap
    if (niche && niche.trim().length > 0) {
        modeInstruction = `
        **INPUT NICHE:** "${niche}"
        **MISSION:** Identify 6 DISTINCT, rising micro-trends or sub-niches within "${niche}" that are currently exploding.
        **SOURCES:** Scan Reddit communities, TikTok aesthetic trends, and Pinterest rising queries.
        `;
    } else {
        modeInstruction = `
        **INPUT NICHE:** NONE (OPEN DISCOVERY MODE).
        **MISSION:** Act as a global cool-hunter. Find 6 entirely different, exploding Etsy trends (Blue Ocean opportunities).
        **SOURCES:** Scan Reddit, TikTok, and Twitter signals.
        `;
    }

    const prompt = `
        You are "TrendRadar", an elite Agency-grade AI analyst.
        ${modeInstruction}
        ${langInstruction}

        CRITICAL RULES:
        1. **QUANTITY:** You MUST provide exactly 6 trends.
        2. **SPECIFICITY:** Do NOT give generic advice like "Minimalist Wall Art". Be specific (e.g. "Neo-Brutalist Concrete Textures", "Coquette Bow Aesthetics").
        3. **ACTIONABLE:** For "productsToMake", list specific items users can create immediately.

        **OUTPUT:** JSON only.
        {
            "niche": "${niche || 'Global Discovery'}",
            "trends": [
                {
                    "id": "t1",
                    "name": "Trend Name",
                    "viralityScore": 95,
                    "status": "Exploding",
                    "description": "Why it is trending (max 1 sentence)...",
                    "signals": ["TikTok #hashtag", "Pinterest search +200%"],
                    "actionPlan": {
                        "shopVibe": "Describe the aesthetic...",
                        "targetAudience": "Who buys this?",
                        "productsToMake": ["Item 1", "Item 2", "Item 3"],
                        "marketingHook": "One catchy sentence."
                    }
                },
                ... (Total 6 distinct trends)
            ]
        }
    `;

    // Gemini 2.5 veya Flash modelini kullanıyoruz
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp", // veya elindeki en yeni model
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }], // Güncel veri için Google Search açık kalsın
            temperature: 0.7, // Biraz kıstık ki saçmalamasın
            responseMimeType: "application/json"
        }
    });
    
    return cleanJsonString(response.text || "{}");
};

// 👇 BUNU EN ALTA VEYA UYGUN BİR BOŞLUĞA YAPIŞTIR:
export const generateSocialPosts = async (productTitle: string, platform: 'instagram' | 'pinterest'): Promise<string> => {
  const isPin = platform === 'pinterest';
  
  const prompt = `
    Act as a viral social media influencer. Write a caption for: "${productTitle}".
    Platform: ${isPin ? 'Pinterest' : 'Instagram'}.
    
    🚫 FORBIDDEN AI WORDS: "Elevate", "Unleash", "Realm", "Masterpiece", "Game-changer", "Stunning", "Dive in".
    
    TONE:
    - Casual, human, slightly mysterious or helpful.
    - Write like a real person sharing a find with friends.
    - Max 3 Emojis (Don't overdo it).
    
    HASHTAG STRATEGY:
    - Use exactly 25-30 hashtags.
    - Mix high volume (1M+) and ultra-niche (<50k) tags.
    - Tags must be relevant to Etsy/Handmade.
    
    OUTPUT STRUCTURE:
    [Hook/Headline - Catchy & Short]
    [Body - 2 sentences max]
    [Call to Action]
    .
    .
    .
    [Block of 30 Hashtags]
  `;

  // Model çağrısı (Kendi ai.models veya google client yapına göre burayı check et)
  const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
  });
  return response.text || "";
};

// generateListingContent fonksiyonundan SONRA:
const validateQuality = (result: ListingOptimizerResult): string[] => {
    const errors: string[] = [];
    
    // Title validation
    const titleWords = result.newTitle.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(titleWords.filter(w => w.length > 3)); // Ignore "and", "for"
    if (titleWords.length !== uniqueWords.size + titleWords.filter(w => w.length <= 3).length) {
        errors.push("❌ Title contains repeated words");
    }
    
    // AI Jargon detection
    const bannedPhrases = [
        "stunning", "elevate", "perfect for any", "exquisite", 
        "must-have", "game-changer", "unleash", "meticulously"
    ];
    const descLower = result.newDescription.toLowerCase();
    bannedPhrases.forEach(phrase => {
        if (descLower.includes(phrase)) {
            errors.push(`❌ Description contains banned AI jargon: "${phrase}"`);
        }
    });
    
    // Hashtag quality check
    const longTailCount = result.hashtags.filter(tag => tag.split(' ').length >= 2).length;
    if (longTailCount < 7) {
        errors.push(`⚠️ Only ${longTailCount}/13 tags are long-tail (need 7+)`);
    }
    
    return errors;
};

