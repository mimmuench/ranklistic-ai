
import { GoogleGenAI } from "@google/genai";
import type { AuditItem, ChatMessage, CompetitorAnalysisResult, MarketAnalysisResult, ListingOptimizerResult } from '../types';
import { validateEtsyListing, quickQualityCheck } from '../services/validator';

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
**CRITICAL MISSION:** You MUST fill out the provided template EXACTLY as structured. Do NOT create a freeform description.

---

## 🚫 ZERO TOLERANCE - INSTANT REJECTION PHRASES

Using ANY of these = AUTOMATIC FAILURE:
- "Stunning" / "Elevate" / "Perfect for any" / "Exquisite" / "Must-have"
- "Picture this" / "Imagine this" / "It's not just" / "Transform your"
- "Captivating" / "Mesmerizing" / "Breathtaking" / "Pure joy"
- "Game-changer" / "Unleash" / "Realm" / "Journey" / "Masterpiece"
- "Adds a touch of" / "Touch of elegance" / "Fresh [X], crisp [Y]"
- Template placeholders: "[Insert", "{{", "___"

---

## 📋 YOUR TEMPLATE TO FILL (MANDATORY STRUCTURE)

${template}

---

## ✅ FILLING INSTRUCTIONS - FOLLOW EXACTLY

### 1. TITLE (newTitle field)
**Structure:** [Specific Design Detail] + [Material/Process] + [Product Type] + [Style] + [Use Case]
**Rules:**
- 100-140 chars
- NO repeated words (except: and, with, for, &)
- Front-load specificity (first 40 chars = unique descriptor)
- NO generic words: "Beautiful", "Amazing", "Perfect", "Unique"

**Example for skiing metal art:**
❌ BAD: "Powder Day Shredder, Laser-Cut Steel Skiing Art, Mountain Home Decor"
✅ GOOD: "Downhill Skier Mid-Turn Silhouette, Laser-Cut Steel Alpine Wall Sculpture, Ski Lodge Mountain Sports Decor"

---

### 2. DESCRIPTION (newDescription field)

**CRITICAL:** Fill EACH section of the template. Do NOT write freeform text.

#### 🌟 Overview Section:
- **Opening Hook:** 1 sentence, factual scene-setting (NO "Picture this", NO "Imagine")
  - ✅ Example: "This skier silhouette captures the moment of a downhill carve against a mountain backdrop."
  - ❌ Example: "Picture this: fresh powder, crisp air, pure joy on the slopes."

- **Visual Description:** 1-2 sentences describing ACTUAL design elements
  - ✅ Example: "The figure leans into the turn with ski poles extended, surrounded by geometric mountain peaks."
  - ❌ Example: "A stunning visual that brings elegance to any space."

#### 💫 Why you'll love this [Product Name/Type]:
Use bullet format EXACTLY as template shows:
- **[Benefit 1 Name]** – [Specific explanation, 1 sentence, NO AI jargon]
- **[Benefit 2 Name]** – [Specific explanation]
- **Premium Craftsmanship** – "Cut from {material thickness} {material type} using precision laser cutting."
- **Durable Finish** – "{Coating type} finish resists {specific properties like moisture/UV/scratches}."
- **3D Shadow Effect** – [IF APPLICABLE: "Mounted on {spacer detail} creating {depth measurement} shadow."]

**Example:**
* **Unique Alpine Design** – Captures the technical form of a downhill turn rather than generic mountain scenery.
* **Versatile Placement** – Works in ski lodges, mountain cabins, or covered outdoor areas where moisture resistance matters.
* **Premium Craftsmanship** – Cut from 1.5mm cold-rolled steel using precision laser cutting.
* **Durable Finish** – Powder coat finish resists moisture, UV exposure, and temperature fluctuations.

#### 🎁 Perfect gift for:
List 3 specific audiences/occasions:
* [Specific person type - be precise]
* [Specific occasion - be clear]
* [Specific style match - be accurate]

**Example:**
* Skiers and snowboarders who want their passion reflected in home decor
* Housewarming gifts for mountain homeowners or ski resort property
* Modern rustic interiors mixing industrial materials with alpine aesthetics

#### 📏 Available sizes:
**IF USER PROVIDED SIZES:** List them exactly as given
**IF NO SIZES PROVIDED:** Use realistic defaults:
- Small: 12"×16" / 30×40cm
- Medium: 18"×24" / 45×60cm
- Large: 24"×32" / 60×80cm
(Custom sizes available upon request)

#### 🎨 Color options:
List colors based on ${material} input:
- If "steel" or "metal": Matte black, white, gold, silver, bronze
- If "wood": Natural oak, walnut, cherry, ebony, whitewashed
- If user specified colors: Use those

#### 🛠️ Material & craftsmanship:
Be SPECIFIC with technical details:
- Material: {material type} - {thickness}mm
- Process: {cutting method} (laser-cut, CNC-milled, hand-welded)
- Finish: {coating type} ({specific properties})
- Weight: {approximate weight if metal}
- Mounting: {mounting method - keyhole brackets, spacers, etc.}

**Example:**
- Material: Cold-rolled steel - 1.5mm thickness
- Process: Precision laser-cut with smooth, deburred edges
- Finish: Electrostatic powder coating (moisture and UV resistant)
- Weight: Approximately 2.8 lbs for 18×24" size
- Mounting: Pre-drilled holes with included mounting hardware

#### 📦 Shipping & guarantee:
KEEP EXACTLY AS TEMPLATE (already perfect):
* FREE SHIPPING ON ALL ORDERS!
* Worldwide shipping with secure, protective packaging
* Fast delivery: 3–5 business days to North America & Europe
* 100% satisfaction guarantee — full refund or replacement if damaged

#### 🏁 Final touch:
Write 1 sentence that summarizes the piece WITHOUT AI jargon
- ✅ Example: "A technical celebration of alpine sports for those who live the mountain lifestyle."
- ❌ Example: "This masterpiece will elevate your space and bring timeless elegance to your home."

Then add: "Looking for a custom size or color? Feel free to contact us — we're happy to help."

---

## 🏷️ 13 TAGS (hashtags field)

**Breakdown:**
- 7-9 long-tail (2-3 words): "alpine sports decor", "ski lodge wall art", "laser cut metal"
- 3-4 high-volume (1-2 words): "wall art", "metal decor", "skiing gift"
- 1-2 ultra-niche (4+ words): "downhill skier silhouette art"

**Rules:**
- NO # symbol
- NO duplicates
- Match ACTUAL product (don't tag "vintage" if it's modern)
- Include: material, style, use case, audience

**Example for skiing art:**
[
  "ski wall art",
  "alpine sports decor",
  "metal ski sculpture",
  "mountain home art",
  "skiing gift",
  "laser cut metal",
  "ski lodge decor",
  "winter sports wall art",
  "downhill skier art",
  "metal wall hanging",
  "skier silhouette",
  "mountain cabin decor",
  "outdoor enthusiast gift"
]

---

## 📱 SOCIAL MEDIA (socialMedia field)

### Pinterest:
**pinterestTitle (60-100 chars):**
"{Main Design Detail} - {Material} {Product Type} for {Target Space}"
Example: "Downhill Skier Silhouette - Steel Wall Art for Ski Lodges & Mountain Homes"

**pinterestDescription (200-400 chars):**
Paragraph 1: What it is + key benefit (2 sentences, factual)
Paragraph 2: Where it fits (2 sentences, specific rooms/styles)
Paragraph 3: CTA (1 sentence, direct)

Example:
"This laser-cut steel skier captures a downhill turn with technical precision. The powder-coated finish resists moisture for use in bathrooms or covered patios.

Fits modern rustic, industrial, or alpine-themed interiors. Pairs with natural wood furniture and stone accents.

Available in five finishes with free shipping on all orders."

**pinterestAltText (max 125 chars):**
Describe image for accessibility
Example: "Black metal wall art showing skier in downhill turn position with mountain peaks in background"

**pinterestHashtags (8-12 tags, space-separated):**
#skidecor #metalwallart #alpinehome #mountaincabin #skiinggift #lasercutart #lodgedecor #winterdecor

### Instagram:
**instagramCaption (150-300 chars, 4 lines):**

Line 1 (Hook): Question or statement, NO AI clichés
Example: "Ever wonder what makes metal art better than canvas for mountain homes?"

Lines 2-3 (Description): Product facts, conversational
Example: "This skier silhouette is laser-cut from 1.5mm steel with powder coating. Resists moisture and temperature swings that destroy prints."

Line 4 (CTA): Soft, informative
Example: "Link in bio - free shipping, 5 finishes available."

**instagramHashtags (25-30 tags, each on new line after "..."):**
Mix:
- 5 high-volume: #homedecor #wallart #interiordesign #metalart #skiing
- 15 medium: #skiinggift #mountainhome #alpinedecor #lasercutart #steelart #lodgedecor
- 10 niche: #skierdecor #downh illskier #alpinesports #mountaincabinart #winterhome

---

## 🎯 YOUR INPUTS

- **Current Title:** ${title}
- **Current Description:** ${description}
- **Niche:** ${niche}
- **Material:** ${material}
- **Tone:** ${tone}
- **Personalization:** ${personalization ? 'YES - Explain HOW to request it in description' : 'NO'}
- **Shop Context:** ${shopContext}

---

## 📤 JSON OUTPUT (STRICT FORMAT)

{
  "newTitle": "string (100-140 chars, follows title formula)",
  "newDescription": "string (EXACTLY matching template structure with all sections filled)",
  "hashtags": ["tag1", "tag2", ... exactly 13 tags, no # symbols],
  "socialMedia": {
    "pinterestTitle": "string (60-100 chars)",
    "pinterestDescription": "string (200-400 chars, 3 paragraphs)",
    "pinterestAltText": "string (max 125 chars)",
    "pinterestHashtags": "#tag1 #tag2 #tag3 ... (8-12 tags)",
    "instagramCaption": "string (150-300 chars, 4 lines)",
    "instagramHashtags": "#tag1\\n#tag2\\n#tag3\\n... (25-30 tags)"
  }
}

---

## ⚠️ FINAL CHECKLIST BEFORE SUBMITTING

- [ ] newDescription follows EXACT template structure (all emoji headers present)
- [ ] NO banned AI phrases used anywhere
- [ ] Title has NO repeated words
- [ ] All technical specs filled with real numbers (not "[Insert]" placeholders)
- [ ] 13 tags provided with no duplicates
- [ ] Social media content is factual, not flowery

**NOW GENERATE THE JSON. NO PREAMBLE. JUST THE JSON OBJECT.**
`;
        parts.push({ text: prompt });

        try {
            // ✅ Senin sistemindeki çalışan yapı: ai.models.generateContent
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash", 
                contents: [{ parts }],
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.4, // Isıyı düşürdük: Daha az "şairane", daha çok "zanaatkar"
                    maxOutputTokens: 4096
                }
            });

            const jsonText = cleanJsonString(response.text || "{}");
			const parsed = JSON.parse(jsonText);

			// ✅ YENİ VALIDATION SİSTEMİ
			console.log(`📋 Validating attempt ${attempt}/${maxRetries}...`);

			// Quick check
			const quickCheck = quickQualityCheck(parsed.newDescription || "");
			if (!quickCheck.passed) {
				console.error("❌ Quick validation failed:", quickCheck.issues);
				if (attempt < maxRetries) {
					console.log("🔄 Retrying...");
					continue;
				}
			}

			// Full validation
			const validationResult = validateEtsyListing(parsed);
			console.log(`📊 Validation Score: ${validationResult.score}/100`);

			if (validationResult.errors.length > 0) {
				console.error("Errors:", validationResult.errors);
			}

			// Karar
			if (validationResult.isValid && validationResult.score >= 85) {
				console.log(`✅ Listing APPROVED (Score: ${validationResult.score})`);
				return jsonText;
			} 
			else if (attempt === maxRetries) {
				console.warn(`⚠️ Max retries reached (Score: ${validationResult.score})`);
				return jsonText;
			} 
			else {
				console.warn(`⚠️ Retrying... (Score: ${validationResult.score})`);
				continue;
			}

        } catch (error: any) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw new Error(`Kritik Hata: ${error.message}`);
            }
        }
    } // <-- for döngüsü kapanışı

    throw new Error("Unexpected error in generateListingContent");
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
You are the #1 Etsy SEO strategist who has generated $50M+ in sales for handmade sellers.

**MISSION:** Convert this simple input into a MAGNETIC Etsy title that makes people click.

**INPUT:** "${input}"

---

### 🎯 2026 ETSY ALGORITHM RULES (MOBILE-FIRST):

**TITLE FORMULA:**
[Emotional Hook/Specific Detail] [Primary Keyword] [Material/Technique] [Style Descriptor] [Use Case/Gift Angle]

**CRITICAL SUCCESS FACTORS:**

1. **ZERO REPETITION RULE:**
   - NEVER use the same word twice (except "and", "with", "for")
   - ❌ BAD: "Metal Wall Art, Steel Wall Decor, Modern Wall Hanging"
   - ✅ GOOD: "Mojave Sunset Saguaro Scene, Laser-Cut Steel Desert Landscape"

2. **MOBILE-FIRST HOOK (First 40 Chars):**
   - Most shoppers see ONLY the first 40 characters on mobile
   - Put your MOST UNIQUE/EMOTIONAL keyword here
   - ❌ BAD: "Handmade Personalized Custom Unique..."
   - ✅ GOOD: "Moonlit Forest Cabin Print, Watercolor..."

3. **HUMAN READABILITY:**
   - Use commas (,) not dashes (-)
   - Should read like a sentence, not a robot list
   - ❌ BAD: "Necklace-Gold-Minimalist-Dainty-Gift"
   - ✅ GOOD: "Crescent Moon Gold Necklace, Dainty Layering Pendant"

4. **SENSORY + SPECIFIC:**
   - Use texture, color, size, feeling words
   - Be hyper-specific, not generic
   - ❌ BAD: "Beautiful Vintage Mug"
   - ✅ GOOD: "1970s Amber Glass Coffee Mug, Retro Mushroom Design"

5. **CHARACTER LIMIT:** 
   - Max 140 characters (Etsy's hard limit)
   - Aim for 120-135 for best mobile display

---

### 🏆 CATEGORY-SPECIFIC EXAMPLES:

**Metal/Wood Art:**
❌ "Metal Wall Art Decor for Home"
✅ "Desert Sunset Saguaro Scene, Hand-Cut Steel Wall Sculpture, Southwest Boho Decor"

**Jewelry:**
❌ "Gold Necklace Pendant Jewelry"
✅ "Tiny Crescent Moon Necklace, 14K Gold Vermeil Lunar Charm, Delicate Layering Piece"

**Apparel:**
❌ "Funny Cat T-Shirt Gift"
✅ "Vintage Cat Mom Graphic Tee, Retro 70s Style, Soft Ring-Spun Cotton, Gift for Her"

**Digital Prints:**
❌ "Printable Wall Art Poster"
✅ "Moody Forest Cabin Print, Dark Academia Watercolor, Instant Download, 5 Sizes Included"

**Ceramics/Pottery:**
❌ "Handmade Coffee Mug Pottery"
✅ "Ocean Wave Stoneware Mug, Hand-Thrown Blue Glaze, Microwave Safe, 12oz Capacity"

**Home Decor:**
❌ "Rustic Wood Sign Decor"
✅ "Farmhouse Kitchen Sign, Distressed White Oak, Hand-Painted Script, Vintage Charm"

---

### 🧠 STRATEGIC THINKING PROCESS:

**Before you write, ask yourself:**

1. **What makes this DIFFERENT?** (Not "handmade mug" but "ocean wave hand-thrown mug")
2. **What's the VIBE?** (Boho? Minimalist? Vintage? Dark Academia?)
3. **Who is the BUYER?** (New homeowner? Gift-giver? College student?)
4. **What's the FIRST visual?** (Sunset? Forest? Geometric pattern?)

**Use this hierarchy:**
1. UNIQUE VISUAL/FEELING (Moonlit, Vintage, Geometric, Rustic)
2. PRODUCT TYPE (Necklace, Mug, Print, Sign)
3. MATERIAL/TECHNIQUE (Hand-Cut Steel, Watercolor, 14K Gold)
4. STYLE (Boho, Minimalist, Industrial, Farmhouse)
5. USE CASE (Gift, Layering, Kitchen Decor, Wall Art)

---

### 📤 OUTPUT RULES:

1. Return ONLY the title text
2. No quotes, no intro phrase, no "Here is..."
3. No markdown formatting
4. Must be 120-140 characters
5. Must pass the "Would I click this on mobile?" test

---

### 🔍 QUALITY CHECK (Before responding):

Ask yourself:
- ❌ Did I repeat any word? (If yes → REWRITE)
- ❌ Is the first 40 chars generic? (If yes → ADD EMOTION)
- ❌ Would this title blend in with 100 others? (If yes → BE MORE SPECIFIC)
- ✅ Does it paint a clear mental image? (If no → ADD SENSORY DETAIL)
- ✅ Would I click this on my phone? (If no → START OVER)

---

**EXAMPLES OF TRANSFORMATIONS:**

Input: "wooden cutting board"
❌ Weak: "Handmade Wooden Cutting Board Kitchen Decor"
✅ STRONG: "Live Edge Walnut Cutting Board, Hand-Oiled Charcuterie Platter, Rustic Kitchen Gift"

Input: "cat drawing"
❌ Weak: "Cat Art Print Digital Download"
✅ STRONG: "Watercolor Tabby Cat Portrait, Soft Pastel Fine Art Print, Instant Digital Download"

Input: "minimalist necklace"
❌ Weak: "Minimalist Gold Necklace Jewelry Gift"
✅ STRONG: "Floating Diamond Necklace, 14K Gold Solitaire, Dainty Everyday Pendant, Bridal Gift"

---

**NOW GENERATE THE TITLE FOR:** "${input}"

Remember: This is a DEMO on a landing page. It needs to make visitors say "Wow, I need this tool!"
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // 🔥 En yeni modeli kullan
        contents: prompt,
        config: {
            temperature: 0.8, // Biraz daha yaratıcı olsun
            maxOutputTokens: 200, // Title kısa olmalı
            candidateCount: 1
        }
    });
    
    const rawText = response.text?.trim() || input;
    
    // 🔥 EKSTRA TEMİZLİK: Bazen AI tırnak işareti veya "Here is..." gibi şeyler ekliyor
    let cleanedTitle = rawText
        .replace(/^["']|["']$/g, '') // Başta/sonda tırnak varsa sil
        .replace(/^Here is your title:?\s*/i, '') // "Here is your title:" silme
        .replace(/^Title:?\s*/i, '') // "Title:" silme
        .replace(/^\*\*|\*\*$/g, '') // Markdown bold işaretleri
        .trim();
    
    // 🔥 140 karakter kontrolü
    if (cleanedTitle.length > 140) {
        cleanedTitle = cleanedTitle.substring(0, 137) + '...';
    }
    
    return cleanedTitle || input;
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
        model: "gemini-2.0-flash", // veya elindeki en yeni model
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
        model: "gemini-2.0-flash",
        contents: prompt
  });
  return response.text || "";
};
