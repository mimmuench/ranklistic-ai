import { GoogleGenAI } from "@google/genai";
import type { AmazonListingResult, AmazonCategory } from '../types/amazon';
import { validateAmazonListing } from './validator';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

const cleanJsonString = (str: string): string => {
    if (!str) return "{}";
    try {
        JSON.parse(str);
        return str;
    } catch (e) {
        const markdownMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) return markdownMatch[1].trim();
        const firstBrace = str.indexOf('{');
        const firstBracket = str.indexOf('[');
        let start = -1;
        if (firstBrace > -1 && (firstBracket === -1 || firstBrace < firstBracket)) start = firstBrace;
        else if (firstBracket > -1) start = firstBracket;
        if (start === -1) return "{}";
        const end = str.lastIndexOf(str[start] === '{' ? '}' : ']');
        if (end > start) return str.substring(start, end + 1);
    }
    return "{}";
};

const detectMimeType = (base64: string): string => {
    if (base64.startsWith('data:')) {
        const match = base64.match(/data:([^;]+);/);
        return match ? match[1] : 'image/jpeg';
    }
    const firstChars = base64.substring(0, 10);
    if (firstChars.startsWith('iVBORw')) return 'image/png';
    if (firstChars.startsWith('/9j/')) return 'image/jpeg';
    if (firstChars.startsWith('R0lGOD')) return 'image/gif';
    if (firstChars.startsWith('UklGR')) return 'image/webp';
    return 'image/jpeg';
};

const cleanBase64 = (base64: string): string => {
    if (base64.includes(',')) return base64.split(',')[1];
    return base64;
};

// 🔥 AMAZON LİSTİNG GENERATOR (RETRY + VALİDASYON)
export const generateAmazonListingFromImage = async (
    imageBase64: string,
    category: AmazonCategory,
    additionalContext?: string,
    maxRetries: number = 2
): Promise<string> => {
    
    const cleanedBase64 = cleanBase64(imageBase64);
    const mimeType = detectMimeType(imageBase64);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 Amazon Listing Generation - Attempt ${attempt}/${maxRetries}`);
        
        const prompt = `
**ROLE:** You are an Amazon SEO expert who gets products to Page 1 within 30 days.

**TASK:** Analyze this product image and create a COMPLETE Amazon listing optimized for the A9 algorithm.

**Category:** ${category}
${additionalContext ? `**Additional Context:** ${additionalContext}` : ''}

---

## 🚫 CRITICAL: BANNED AI PHRASES (AUTO-FAIL IF USED)

- "Premium quality" / "Best" / "Top-rated"
- "Stunning" / "Amazing" / "Incredible"
- "Perfect for any" / "Must-have" / "Game-changer"
- "Elevate" / "Transform your life"

**Why banned?** Amazon suppresses listings with obvious AI jargon. Write factually.

---

## 📋 STEP-BY-STEP REQUIREMENTS

### 1️⃣ TITLE (150-200 chars)

**Amazon A9 Formula:**
[Brand or Material] + [Product Type] + [Key Feature 1] + [Key Feature 2] + [Size/Color] + [Benefit/Use Case]

**Example:**
"Stainless Steel French Press Coffee Maker, 34oz Double-Wall Insulated, Rust-Resistant with 4-Level Filter System for Rich Espresso"

**RULES:**
- Front-load primary keyword (what customers search first)
- NO repeated words
- Use EXACT dimensions if visible (e.g., "18x24 inch")
- Include 1-2 benefit keywords (e.g., "Rust-Resistant", "Heat-Insulated")

---

### 2️⃣ BULLET POINTS (5 required, 200-250 chars EACH)

**Structure for EACH bullet:**
[BENEFIT IN CAPS]: [Feature explanation] + [Why it matters to customer]

**Example:**
"PREVENTS SPILLS & MESSES: The precision-pour spout is angled at 45° for controlled liquid flow, eliminating drips on countertops. The stay-cool handle remains safe to touch even after brewing boiling water, protecting your hands from burns."

**RULES:**
- Start with ALL CAPS benefit
- Be SPECIFIC (not "durable" but "1.5mm thick steel resists dents")
- Include 1-2 keywords naturally per bullet
- Each bullet = 200-250 characters (COUNT THEM!)

---

### 3️⃣ PRODUCT DESCRIPTION (1700-1900 chars)

**4 PARAGRAPHS (Exact lengths):**

**Paragraph 1 (400 chars):** Customer pain point + emotional hook
Example: "Tired of coffee that tastes burnt by noon? Most carafes lose heat within an hour, forcing you to microwave stale coffee. This double-wall vacuum-sealed press keeps your brew piping hot for 4+ hours, so every cup tastes freshly poured."

**Paragraph 2 (500 chars):** How THIS product solves it + unique features
Example: "Unlike single-wall presses that cool fast, our 304 stainless steel construction traps heat inside while keeping the exterior touchable. The 4-stage mesh filter blocks 99% of grounds, giving you silky-smooth coffee without grit. The wide mouth makes cleaning effortless—no stuck grounds in hard-to-reach corners."

**Paragraph 3 (500 chars):** Technical specs (dimensions, materials, weight, care)
Example: "Specifications: Holds 34oz (1 liter) / Serves 4 cups. Dimensions: 8.5"H x 4.5"W. Weight: 1.2 lbs empty. Material: 18/8 food-grade stainless steel interior, BPA-free ABS plastic accents. Care: Hand wash with warm soapy water; not dishwasher safe. Press mechanism rated for 10,000+ uses."

**Paragraph 4 (400 chars):** Use cases, gift ideas, warranty/guarantee
Example: "Perfect for morning routines, office meetings, camping trips, or gifting to coffee enthusiasts. Pairs with French roast, cold brew concentrate, or loose-leaf tea. Backed by a 2-year manufacturer warranty—if the seal fails or the filter breaks, we replace it free. Risk-free purchase with 30-day returns."

**CRITICAL:** Count characters for EACH paragraph. If under 1700 total, ADD MORE DETAIL (not fluff).

---

### 4️⃣ BACKEND SEARCH TERMS (240-250 chars)

**RULES:**
- Use SPACES only (NO COMMAS, NO SEMICOLONS)
- Do NOT repeat words from title or bullets
- Include:
  - Synonyms (e.g., "carafe pot brewer")
  - Misspellings (e.g., "french pres" "stainles steel")
  - Related terms (e.g., "espresso maker pourover")
  - Translations: Spanish (café cafetera), German (kaffee bereiter)

**Example:**
"carafe pot brewer espresso pourover cafe cafetera kaffee bereiter glass borosilicate thermal insulated vacuum sealed gifts housewarming wedding registry stainless stainles pres press coffe cofee"

**CHARACTER COUNT:** Must be 240-250 characters. COUNT BEFORE SUBMITTING.

---

### 5️⃣ A+ CONTENT SUGGESTIONS (4 bullet points)

**What to include:**
- Lifestyle image ideas (e.g., "Show press on breakfast table with croissants")
- Feature callouts (e.g., "Highlight the 4-layer filter in a close-up")
- Comparison angle (e.g., "Side-by-side with cheap plastic press showing heat loss")
- Trust signals (e.g., "Display '10,000+ happy customers' badge")

---

## 📤 JSON OUTPUT FORMAT

Return ONLY this JSON structure:

{
  "productIdentified": "Exact product name",
  "confidence": 95,
  "title": "150-200 char title following formula",
  "bulletPoints": [
    "200-250 char bullet 1",
    "200-250 char bullet 2",
    "200-250 char bullet 3",
    "200-250 char bullet 4",
    "200-250 char bullet 5"
  ],
  "productDescription": "1700-1900 char description in 4 paragraphs",
  "backendKeywords": "240-250 chars space-separated",
  "aPlusSuggestions": "4 bullet points for A+ content",
  "suggestedCategory": "Best fit category",
  "estimatedPrice": "$XX-XX range",
  "seoScore": 85
}

**VALIDATION CHECKLIST (before responding):**
- [ ] Title is 150-200 chars?
- [ ] Each bullet is 200-250 chars?
- [ ] Description is 1700-1900 chars?
- [ ] Backend keywords are 240-250 chars with NO COMMAS?
- [ ] NO banned AI phrases used?

**NOW ANALYZE THE IMAGE AND GENERATE THE JSON. NO PREAMBLE.**
        `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{
                    parts: [
                        { inlineData: { mimeType: mimeType, data: cleanedBase64 } },
                        { text: prompt }
                    ]
                }],
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.6,
                    maxOutputTokens: 6000
                }
            });

            const jsonText = cleanJsonString(response.text || "{}");
            const parsed = JSON.parse(jsonText);

            // 🔒 VALİDASYON
            const validation = validateAmazonListing(parsed);
            
            console.log(`📊 Amazon Validation Score: ${validation.score}/100`);
            
            if (validation.errors.length > 0) {
                console.error(`❌ Validation Errors:`, validation.errors);
            }
            
            if (validation.warnings.length > 0) {
                console.warn(`⚠️ Warnings:`, validation.warnings);
            }

            // 🔧 AUTO-FIX: Backend Keywords virgül sorunu
            if (parsed.backendKeywords && parsed.backendKeywords.includes(',')) {
                console.warn('⚠️ Fixing commas in backend keywords...');
                parsed.backendKeywords = parsed.backendKeywords.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
            }

            // 🔧 AUTO-FIX: searchTerms alanı varsa backendKeywords'e kopyala
            if (parsed.searchTerms && !parsed.backendKeywords) {
                parsed.backendKeywords = parsed.searchTerms;
            }

            // Score 75+ ise kabul et
            if (validation.score >= 75) {
                console.log(`✅ Amazon Listing APPROVED (Score: ${validation.score})`);
                return JSON.stringify(parsed);
            } else {
                console.warn(`⚠️ Low quality (${validation.score}), retrying...`);
                if (attempt < maxRetries) {
                    continue;
                } else {
                    console.error(`❌ Max retries reached. Returning best attempt.`);
                    return JSON.stringify(parsed);
                }
            }

        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw new Error(`Amazon listing generation failed after ${maxRetries} attempts: ${error.message}`);
            }
        }
    }

    throw new Error("Unexpected error in generateAmazonListingFromImage");
};

// 🔥 AMAZON CHAT RESPONSE
export const getAmazonChatResponse = async (
    currentListing: AmazonListingResult,
    history: any[],
    message: string,
    image: string | null
): Promise<string> => {
    
    const systemInstruction = `
You are an Amazon SEO consultant.

**Current Listing:**
- Product: ${currentListing.productIdentified}
- Title: ${currentListing.title}
- SEO Score: ${currentListing.seoScore}/100

**Your Role:**
Help optimize this listing for Page 1 ranking. Discuss:
- Keyword placement strategy
- A/B testing for bullets
- Image compliance
- Backend keyword alternatives

**Tone:** Direct, data-driven. Cite Amazon TOS when relevant.

**Forbidden:** "Premium quality", "Best", "Amazing", "Stunning"

**Keep responses under 150 words.**
    `;

    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: msg.image 
            ? [
                { inlineData: { mimeType: detectMimeType(msg.image), data: cleanBase64(msg.image) } },
                { text: msg.text }
              ]
            : [{ text: msg.text }]
    }));

    const currentParts: any[] = [{ text: message }];
    if (image) {
        currentParts.unshift({ 
            inlineData: { mimeType: detectMimeType(image), data: cleanBase64(image) } 
        });
    }
    contents.push({ role: 'user', parts: currentParts });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contents,
            config: { systemInstruction, maxOutputTokens: 600 }
        });

        return response.text || "I couldn't process that. Try asking about title or bullet optimization.";
    } catch (error) {
        console.error('❌ Amazon chat error:', error);
        return "Sorry, error occurred. Please try again.";
    }
};
