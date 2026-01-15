
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
    
    // YENİLENMİŞ SERT PROMPT
    const prompt = `
    Act as a veteran Etsy Seller and SEO Strategist (2026 Update). 
    Generate a listing that sounds AUTHENTIC, HUMAN, and CRAFTSMAN-LIKE. 
    
    **STRICT TITLE RULES (ETSY 2026):**
    1. ZERO REPETITION: Do NOT use the same word twice in the title.
    2. HUMAN FLOW: Use commas (,) instead of dashes. Read like a natural sentence.
    3. FRONT-LOAD: Primary subject + material in first 40 chars.

    **STRICT DESCRIPTION RULES (ANTI-AI JARGON):**
    1. 🚫 BANNED WORDS: "Stunning", "Unique", "Must-have", "Elevate", "Exquisite", "Perfect for", "Crafted with care", "Unleash", "Dive in", "Realm", "Game-changer".
    2. TONE: Write as if describing the product to a friend. Focus on texture, utility, and feeling.
    3. TEMPLATE: Follow this structure exactly: ${template}

    **STRICT SOCIAL MEDIA RULES (THE FIX):**
    1. INSTAGRAM: Casual, influencer vibe. NO robot words. Max 2 emojis.
    2. PINTEREST: Keyword-rich but inspiring.
    3. HASHTAGS: You MUST provide 20-30 hashtags for each platform. Mix high volume (1M+) and niche tags.

    **INPUT DATA:**
    - Draft: ${title}
    - Niche: ${niche}
    - Material: ${material}
    - Context: ${shopContext}
    - Tone: ${tone}

    **RETURN ONLY THIS JSON:**
    {
        "newTitle": "Clean SEO Title",
        "newDescription": "Full description",
        "hashtags": ["tag1", "tag2", ... 13 Etsy tags],
        "seoStrategy": "Why this works...",
        "socialMedia": {
            "pinterestTitle": "Clickable Headline",
            "pinterestDescription": "SEO rich description",
            "pinterestAltText": "Visual description",
            "pinterestHashtags": "#tag1 #tag2 ... (List 20+ tags here)",
            "instagramCaption": "Short, punchy, human caption. No 'Elevate'.",
            "instagramHashtags": "#tag1 #tag2 ... (List 20+ tags here)"
        }
    }
    `;
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Veya kullandığın en iyi model
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json"
        }
    });

    return cleanJsonString(response.text || "{}");
};

export const getOptimizerChatResponse = async (
    contextData: { title: string, description: string, template: string },
    currentResult: ListingOptimizerResult,
    history: ChatMessage[], 
    message: string, 
    image: string | null
): Promise<string> => {
    
    const systemInstruction = `
    You are a Strict Etsy SEO & Copywriting Editor (2026 Standards).
    Your ONLY job is to help the user refine the CURRENT listing.

    **CORE GUIDELINES:**
    1. **Strict Context:** Only answer questions related to the current Etsy Title, Description, and Tags.
    2. **Refusal Policy:** If the user asks for anything else (e.g., writing a blog post, coding, general chat, or unrelated advice), politely state: "I am specialized only in refining your current Etsy listing. Please stay on topic."
    3. **No AI Jargon:** Even in your chat responses, NEVER use words like "stunning", "elevate", "exquisite", or "perfect for any decor". Keep your advice practical and human.
    4. **Zero Repetition Enforcement:** If the user asks for a new title, you MUST still follow the Zero Repetition rule (never use the same word twice).
    5. **Concise Responses:** Keep your chat answers short and direct. Don't write long essays.

    **CURRENT LISTING DATA:**
    - Current Title: ${currentResult.newTitle}
    - Current Description: ${currentResult.newDescription}
    - User's Original Template: ${contextData.template}

    **USER REQUEST:** "${message}"
    
    Process the user request while staying strictly within the Etsy 2026 SEO framework.
    `;

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
