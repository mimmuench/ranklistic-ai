import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔧 MOCK VALIDATOR (eğer validator.ts yoksa)
// Eğer validator.ts dosyan varsa, bu kısmı sil ve gerçek validator'ı import et
const validateDigitalListing = (data: any) => {
  const errors = [];
  let score = 100;

  if (!data.newTitle?.includes('Digital Download') && !data.newTitle?.includes('Printable')) {
    errors.push('Title must include "Digital Download" or "Printable"');
    score -= 20;
  }
  if (data.newTitle?.length > 140) {
    errors.push('Title exceeds 140 characters');
    score -= 10;
  }
  if (data.hashtags?.length !== 13) {
    errors.push(`Expected 13 tags, got ${data.hashtags?.length || 0}`);
    score -= 10;
  }
  if (!data.hashtags?.includes('digital download')) {
    errors.push('Tags must include "digital download"');
    score -= 15;
  }

  return { score: Math.max(0, score), errors };
};

const validateEtsyListing = (data: any) => {
  const errors = [];
  let score = 100;

  if (!data.newDescription || data.newDescription.length < 200) {
    errors.push('Description too short (min 200 chars)');
    score -= 20;
  }

  return { score: Math.max(0, score), errors };
};

// ✅ API Key kontrolü
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  console.error('❌ VITE_GOOGLE_API_KEY is not set!');
}

const ai = new GoogleGenerativeAI(apiKey || 'dummy-key');

const cleanJsonString = (str: string): string => {
    if (!str) return "{}";
    try {
        JSON.parse(str);
        return str;
    } catch (e) {
        const markdownMatch = str.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) return markdownMatch[1].trim();
        const firstBrace = str.indexOf('{');
        if (firstBrace === -1) return "{}";
        const end = str.lastIndexOf('}');
        if (end > firstBrace) return str.substring(firstBrace, end + 1);
    }
    return "{}";
};

export type DigitalProductType = 
    | 'printable-art'
    | 'planner'
    | 'templates'
    | 'clipart'
    | 'fonts'
    | 'svg-files'
    | 'patterns'
    | 'ebook'
    | 'other';

export interface DigitalListingResult {
    newTitle: string;
    newDescription: string;
    hashtags: string[];
    fileFormats: string[];
    instantDownload: boolean;
    licenseInfo: string;
    socialMedia: {
        pinterestTitle: string;
        pinterestDescription: string;
        pinterestAltText: string;
        pinterestHashtags: string;
        instagramCaption: string;
        instagramHashtags: string;
    };
}

// 🔥 DİJİTAL ÜRÜN LİSTİNG GENERATOR
export const generateDigitalProductListing = async (
    productType: DigitalProductType,
    title: string,
    description: string,
    imageBase64: string | null,
    niche: string,
    tone: string,
    maxRetries: number = 2
): Promise<string> => {
    
    // API Key kontrolü
    if (!apiKey) {
        throw new Error('Google API Key is not configured. Please set VITE_GOOGLE_API_KEY in your .env file');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 Digital Product Listing - Attempt ${attempt}/${maxRetries}`);
        
        const parts: any[] = [];
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        }
        
        const prompt = `
**ROLE:** You are a technical Etsy digital product expert. You analyze uploaded artwork/images and generate professional listings for SVG/CNC/Laser cutting files.

**TASK:** Analyze the uploaded image and create a listing following this EXACT template structure.

**PRODUCT TYPE:** ${productType}
**USER INPUT TITLE:** ${title}
**USER INPUT DESCRIPTION:** ${description}

---

## 📋 EXACT TEMPLATE TO FOLLOW:

**TITLE FORMAT (140 chars):**
[Subject] Silhouette SVG [Action/Style] Cut File [Category] [Application] Vector for Cricut Silhouette Glowforge CNC Laser Cuttora

**EXAMPLE TITLES:**
- Alpine Skier Silhouette SVG Skiing Cut File Sports Winter Decal Vector for Cricut Silhouette Glowforge CNC Laser Cuttora
- Mountain Biker SVG Adventure Cut File Cycling Sports Vector for Cricut Silhouette Glowforge CNC Laser Cuttora
- Yoga Pose Silhouette SVG Meditation Cut File Wellness Fitness Vector for Cricut Silhouette Glowforge CNC Laser Cuttora

**DESCRIPTION STRUCTURE (EXACT FORMAT):**

🎯 QUICK OVERVIEW:
[2-3 sentences describing the design from the image - what it shows, style, technical quality]
Example: "High-precision digital silhouette of an alpine skier in a professional aerodynamic racing tuck. This Cuttora design is engineered specifically for clean cutting, engraving, and scaling without loss of detail."

🛠️ COMPATIBILITY & USAGE:
Fully compatible with Cricut Design Space, Silhouette Studio, Glowforge, CNC Plasma, and other laser cutters. Our files feature clean, smooth paths tested for technical precision to ensure minimal node count and efficient cutting times.

📦 WHAT YOU RECEIVE:
You will receive a ZIP archive containing the following formats:
• SVG: Professional-grade vector for scaling and cutting.
• PNG: High-resolution (300 DPI) with a transparent background.
• EPS: Master vector file for advanced editing software.
• DXF: Technical format for AutoCAD and basic CNC software.
• PDF: Versatile format for printing and vector viewing.
Note: This is a single-path design optimized for easy weeding and material efficiency.

📜 COMMERCIAL LICENSE:
Personal use and Small Business commercial use (up to 500 physical items) are included with your purchase. You may create shirts, decals, signs, and laser-engraved items. NO digital resale, redistribution, or sharing of these files is permitted.

📥 INSTANT DOWNLOAD:
This is a digital-only product. No physical item will be shipped. Once payment is confirmed, your files will be available immediately through your Etsy account under 'Purchases and Reviews' or via your registered email.

⚠️ IMPORTANT NOTES:
Due to the nature of digital downloads, all sales are final. No refunds, exchanges, or cancellations will be issued. Please ensure your software is compatible with the listed formats before purchasing.

---

## 🎯 YOUR TASK:

1. **ANALYZE THE IMAGE** (if provided) and identify:
   - Main subject (person, animal, object, shape)
   - Action/pose/style
   - Category (sports, nature, abstract, etc.)
   - Technical qualities

2. **CREATE TITLE** following the exact format above

3. **CREATE DESCRIPTION** following the EXACT emoji structure:
   - 🎯 QUICK OVERVIEW: [Describe what's in the image]
   - 🛠️ COMPATIBILITY & USAGE: [Use exact template text]
   - 📦 WHAT YOU RECEIVE: [Use exact template text]
   - 📜 COMMERCIAL LICENSE: [Use exact template text]
   - 📥 INSTANT DOWNLOAD: [Use exact template text]
   - ⚠️ IMPORTANT NOTES: [Use exact template text]

4. **CRITICAL RULES:**
   - MUST use emojis (🎯 🛠️ 📦 📜 📥 ⚠️)
   - MUST follow exact section structure
   - ONLY customize the "QUICK OVERVIEW" section based on image
   - ALL other sections stay exactly as template
   - Title MUST end with "Cuttora"
   - Title MUST include: Cricut Silhouette Glowforge CNC Laser

---

## 🚫 BANNED PHRASES:

- "Stunning" / "Elevate" / "Perfect for any"
- "Must-have" / "Game-changer" / "Unique"
- "Exquisite" / "Meticulously crafted"

---

## 🏷️ 13 TAGS (SVG/CNC SPECIFIC):

**MUST INCLUDE:**
- "svg cut file" or "svg file"
- "cricut" or "silhouette"
- "laser cut" or "cnc"
- Subject-related tags

**EXAMPLE TAG SET for Skier:**
["svg cut file", "skiing svg", "alpine skier", "winter sports svg", "cricut design", "silhouette file", "glowforge svg", "laser cut file", "cnc plasma", "sports decal", "skier silhouette", "cuttora design", "vector cut file"]

**Generate 13 tags based on the image content following this pattern.**

---

## 📱 SOCIAL MEDIA:

### PINTEREST:
**Title:** [Subject] SVG Cut File - Instant Download for Cricut & Laser
**Description:** Professional [subject] silhouette SVG perfect for Cricut, Silhouette, Glowforge, and CNC machines. Includes SVG, PNG, EPS, DXF, PDF formats. Commercial use included!
**Hashtags:** #svgfile #cricutdesign #silhouettecameo #lasercut #cncfile #vectorfile #digitaldownload #etsysvg #cutfile #glowforge

### INSTAGRAM:
**Caption:** New [subject] SVG available! 🎨 Perfect for your Cricut, Silhouette, or laser cutter. Link in bio! ⬆️
**Hashtags:** #svgfiles #cricutmade #silhouettecameo #lasercut #cnc #vectorart #etsyshop #digitaldownload #svgcutfile #crafting #diy #smallbusiness

---

## 📤 JSON OUTPUT FORMAT:

{
  "newTitle": "string (MUST end with 'Cuttora', include Cricut Silhouette Glowforge CNC Laser)",
  "newDescription": "string (EXACT emoji format: 🎯 🛠️ 📦 📜 📥 ⚠️)",
  "hashtags": ["13 SVG/CNC specific tags"],
  "fileFormats": ["SVG", "PNG", "EPS", "DXF", "PDF"],
  "instantDownload": true,
  "licenseInfo": "Personal use and Small Business commercial use (up to 500 physical items)",
  "socialMedia": {
    "pinterestTitle": "string",
    "pinterestDescription": "string",
    "pinterestAltText": "string (describe the image for accessibility)",
    "pinterestHashtags": "string",
    "instagramCaption": "string",
    "instagramHashtags": "string"
  }
}

---

## 🎯 FINAL INSTRUCTIONS:

Using the uploaded IMAGE (if provided) and USER INPUTS:
- **User Title:** ${title}
- **User Description:** ${description}

1. **ANALYZE the image** to identify the subject, action, and style
2. **GENERATE TITLE** following: [Subject] Silhouette SVG ... Cuttora format
3. **GENERATE DESCRIPTION** with EXACT emoji sections (only customize 🎯 QUICK OVERVIEW)
4. **GENERATE 13 TAGS** for SVG/CNC products
5. **GENERATE social media** content

**CRITICAL:**
- Description MUST have emojis: 🎯 🛠️ 📦 📜 📥 ⚠️
- Only customize the "QUICK OVERVIEW" section
- All other sections use EXACT template text
- Title MUST end with "Cuttora"

**RETURN ONLY JSON. NO PREAMBLE.**
        `;

        parts.push({ text: prompt });

        try {
            console.log('📡 Calling Gemini API...');

            // ✅ GÜNCELLENMİŞ MODEL ADI
            const model = ai.getGenerativeModel({ 
                model: "gemini-2.5-flash" // veya "gemini-2.5-pro"
            });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                    responseMimeType: "application/json"
                }
            });

            const response = await result.response;
            const jsonText = cleanJsonString(response.text());

            console.log('📦 Raw response:', jsonText);

            const parsed = JSON.parse(jsonText);

            // Dual validation: Digital + Etsy
            const digitalValidation = validateDigitalListing(parsed);
            const etsyValidation = validateEtsyListing(parsed);

            const combinedScore = Math.round((digitalValidation.score + etsyValidation.score) / 2);

            console.log(`📊 Digital Product Score: ${combinedScore}/100`);

            if (digitalValidation.errors.length > 0) {
                console.warn('⚠️ Digital Validation:', digitalValidation.errors);
            }
            if (etsyValidation.errors.length > 0) {
                console.warn('⚠️ Etsy Validation:', etsyValidation.errors);
            }

            if (combinedScore >= 70) {
                console.log(`✅ Digital Listing APPROVED (${combinedScore})`);
                return jsonText;
            } else {
                console.warn(`⚠️ Low score (${combinedScore}), retrying...`);
                if (attempt < maxRetries) continue;
                else return jsonText;
            }

        } catch (error: any) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw new Error(`Digital product generation failed: ${error.message}`);
            }
        }
    }

    throw new Error("Unexpected error in generateDigitalProductListing");
};