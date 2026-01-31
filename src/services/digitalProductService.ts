import { GoogleGenAI } from "@google/genai";
import { validateDigitalListing, validateEtsyListing } from './validator';

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
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 Digital Product Listing - Attempt ${attempt}/${maxRetries}`);
        
        const parts: any[] = [];
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        }
        
        const prompt = `
**ROLE:** You are an Etsy digital product expert who specializes in high-converting instant download listings.

**PRODUCT TYPE:** ${productType}
**NICHE:** ${niche}
**TONE:** ${tone}

---

## 🚫 BANNED AI PHRASES (INSTANT FAIL)

- "Stunning" / "Elevate" / "Perfect for any"
- "Must-have" / "Game-changer" / "Unique"
- "One-of-a-kind" / "Exquisite" / "Meticulously"

---

## ✅ DIGITAL PRODUCT TITLE RULES (140 CHARS MAX)

**Formula:**
[Product Type] + [Style/Theme] + [Use Case] + [File Format] + "Digital Download" or "Printable"

**Examples:**

For Printable Art:
"Boho Desert Landscape Print, Southwestern Wall Art Poster, Instant Download, Minimalist Terracotta Decor, Printable JPG"

For Planner:
"2026 Monthly Budget Planner PDF, Digital Finance Tracker, Printable A4/Letter, Debt Payoff Spreadsheet, Instant Download"

For SVG/Clipart:
"Hand-Drawn Floral Clipart Bundle SVG, 50 Botanical Line Art Graphics, Commercial Use, Cricut Design Files"

**CRITICAL RULES:**
- MUST include "Digital Download" OR "Printable" OR "Instant Download"
- MUST mention file format (PDF, JPG, PNG, SVG, etc.)
- Front-load unique descriptor
- NO repeated words

---

## 📝 DESCRIPTION STRUCTURE (600-1000 CHARS)

**Paragraph 1: What They Get (2-3 sentences)**
Example: "This printable wall art features a serene desert landscape with muted terracotta tones. Perfect for creating a calming boho vibe in your living room, bedroom, or office. Download instantly and print at home or through a professional printer."

**Paragraph 2: File Details (3-4 sentences)**
- List EXACT file formats included (e.g., "1 JPG file (300 DPI), 1 PDF file (8x10 inches)")
- Mention size/dimensions
- Specify if resizable
- Example: "You'll receive 1 high-resolution JPG (300 DPI) sized at 8x10 inches and 1 PDF ready for printing. Files are optimized for quality printing up to 16x20 inches. Compatible with any printer."

**Paragraph 3: How It Works (2 sentences)**
Example: "After purchase, download the files immediately from Etsy's 'Purchases' page. No physical product will be shipped—this is a digital item only."

**Paragraph 4: Usage Rights (2 sentences)**
${productType === 'clipart' || productType === 'svg-files' || productType === 'fonts' 
    ? 'Example: "Personal AND small commercial use allowed (up to 100 physical items or 50 digital products). You may NOT resell or redistribute the files themselves."'
    : 'Example: "For personal use only. You may print unlimited copies for your own home or as gifts, but not for resale."'
}

**Paragraph 5: Technical Notes (1-2 sentences)**
Example: "Colors may vary slightly depending on your screen and printer. For best results, use high-quality cardstock or photo paper."

**Paragraph 6: CTA (1 sentence)**
Example: "Download now and transform your space instantly!"

---

## 🏷️ 13 TAGS (DIGITAL PRODUCT SPECIFIC)

**MUST INCLUDE:**
- "digital download" (ALWAYS)
- "printable" or "instant download"
- File type tag (e.g., "svg file", "pdf planner")

**Breakdown:**
- 5-7 long-tail (e.g., "boho desert wall art printable")
- 3-4 high-volume (e.g., "wall art", "printable art")
- 2-3 niche/specific (e.g., "terracotta poster print")

**Example Tags for Printable Art:**
["digital download", "printable wall art", "boho desert print", "instant download art", "terracotta poster", "southwestern decor", "minimalist landscape", "neutral wall art", "modern printable", "home decor print", "8x10 wall art", "downloadable art", "printable poster"]

---

## 📱 SOCIAL MEDIA (CRITICAL FOR DIGITAL PRODUCTS!)

### **PINTEREST** (MAJOR TRAFFIC SOURCE - 60%+ for digital products!)

**Pin Title (60-100 chars):**
Must include "Printable" or "Digital Download" + benefit
Example: "Boho Desert Printable Wall Art - Instant Download Terracotta Poster"

**Pin Description (250-400 chars):**
3 paragraphs:
1. What it is + why someone needs it
2. How to use it (print at home, Staples, FedEx, etc.)
3. CTA ("Get instant access!" or "Download now for your next project!")

Example:
"Transform your space with this printable desert landscape art. The muted terracotta tones bring a calming, boho vibe to any room.

Simply download the high-res file and print at home, Staples, or your local print shop. Available in 8x10 with scalability up to 16x20.

Perfect for renters who can't paint walls or anyone wanting affordable art rotation. Download instantly and print as many times as you want!"

**Alt Text (125 chars):**
Describe for accessibility.
Example: "Printable desert landscape art print with terracotta and beige tones in minimalist boho style"

**Hashtags (10-15):**
Example: "#printableart #digitaldownload #etsyprintable #bohodecor #desertprint #wallartprintable #instantdownload #affordableart #homedecorideas #printablewalldecor"

---

### **INSTAGRAM**

**Caption (200-300 chars):**
Hook + product description + CTA

Example:
"Why pay $50+ for framed art when you can download this for $5 and print unlimited copies? 🌵

This desert landscape printable is perfect for boho, minimalist, or southwestern vibes. Instant download, print at home or Staples.

Link in bio to grab yours! 💻✨"

**Hashtags (25-30):**
Mix high-volume, medium, and ultra-niche
Example:
"#printableart #digitaldownload #etsyfinds #wallartdecor #bohohomedecor #desertvibes #affordableart #printables #instantdownload #homedecorinspo #minimalistart #terracottadecor #southwesternstyle #printablewalldecor #digitalart #homedecorating #bohostyle #neutraldecor #walldecor #printathome #budgetdecor #diydecor #interiordesign #modernhome #cozyhome #printableposters #etsyshop #smallbusiness #supportsmall #shopsmall"

---

## 📤 JSON OUTPUT

{
  "newTitle": "string (100-140 chars, MUST include 'Digital Download' or 'Printable')",
  "newDescription": "string (600-1000 chars, 6 paragraphs)",
  "hashtags": ["tag1", "tag2", ... 13 total, MUST include 'digital download'],
  "fileFormats": ["PDF", "JPG", "PNG", "SVG"],
  "instantDownload": true,
  "licenseInfo": "Personal use only" OR "Personal + Small Commercial Use",
  "socialMedia": {
    "pinterestTitle": "string (60-100 chars)",
    "pinterestDescription": "string (250-400 chars)",
    "pinterestAltText": "string (125 chars)",
    "pinterestHashtags": "#tag1 #tag2 #tag3 ... (10-15 tags)",
    "instagramCaption": "string (200-300 chars)",
    "instagramHashtags": "#tag1 #tag2 #tag3 ... (25-30 tags, line-separated)"
  }
}

---

## 🎯 YOUR MISSION

Using:
- **Current Title:** ${title}
- **Current Description:** ${description}
- **Product Type:** ${productType}
- **Niche:** ${niche}

Generate a PERFECT digital product listing that:
1. Clearly states it's a digital download
2. Lists exact file formats
3. Explains usage rights
4. Optimized for Pinterest (main traffic source)
5. NO AI jargon

**GENERATE JSON NOW. NO PREAMBLE.**
        `;

        parts.push({ text: prompt });

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ parts }],
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.6,
                    maxOutputTokens: 4096
                }
            });

            const jsonText = cleanJsonString(response.text || "{}");
            const parsed = JSON.parse(jsonText);

            // Dual validation: Digital + Etsy
            const digitalValidation = validateDigitalListing(parsed);
            const etsyValidation = validateEtsyListing(parsed);

            const combinedScore = Math.round((digitalValidation.score + etsyValidation.score) / 2);

            console.log(`📊 Digital Product Score: ${combinedScore}/100`);

            if (digitalValidation.errors.length > 0) {
                console.error('❌ Digital Validation:', digitalValidation.errors);
            }
            if (etsyValidation.errors.length > 0) {
                console.error('❌ Etsy Validation:', etsyValidation.errors);
            }

            if (combinedScore >= 70) {
                console.log(`✅ Digital Listing APPROVED (${combinedScore})`);
                return jsonText;
            } else {
                console.warn(`⚠️ Low score (${combinedScore}), retrying...`);
                if (attempt < maxRetries) continue;
                else return jsonText;
            }

        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                throw new Error(`Digital product generation failed: ${error.message}`);
            }
        }
    }

    throw new Error("Unexpected error in generateDigitalProductListing");
};
