/**
 * 🔒 RANKLISTIC QUALITY VALIDATOR v3.0
 * Template compliance + AI jargon kontrolü
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

// 🚫 YASAKLI AI JARGONU (GENİŞLETİLMİŞ)
const BANNED_AI_PHRASES = [
  // Tier 1: Klasik AI abartıları
  "stunning", "elevate", "elevate your", "perfect for any", "exquisite", 
  "must-have", "game-changer", "unleash", "realm", "dive into",
  "meticulously", "breathtaking", "timeless elegance", "crafted with care",
  "meticulously crafted", "delve into", "embark on",
  
  // Tier 2: Sinsi AI ifadeleri
  "picture this", "imagine this", "it's not just", "it's more than just",
  "it's perfect for", "perfect addition", "transform your", "bring elegance",
  "adds a touch of", "touch of elegance", "sleek and modern", "modern elegance",
  
  // Tier 3: Dramatik AI dili
  "journey", "masterpiece", "unparalleled", "revolutionary", "transcend",
  "symphony of", "tapestry of", "canvas of", "beacon of",
  
  // Tier 4: Aşırı duygusal
  "captivating", "mesmerizing", "enchanting", "spellbinding",
  "feast for the eyes", "visual delight", "pure joy", "sheer beauty",
  
  // Template placeholders
  "[insert", "{{", "___", "lorem ipsum"
];

// 📋 TEMPLATE STRUCTURE MARKERS (bunlar olmalı)
const REQUIRED_TEMPLATE_SECTIONS = [
  "🌟 Overview",
  "📦 ENJOY FREE SHIPPING",
  "Why you", // 💫 ve tırnaktan sonrasını sildik, en garantisi bu!
  "🎁 Perfect gift for",
  "📏 Available sizes",
  "🎨 Color options",
  "🛠️ Material & craftsmanship",
  "📦 Shipping & guarantee",
  "🏁 Final touch"
];

// 🎯 TEMPLATE COMPLIANCE VALIDATOR (YENİ!)
export const validateTemplateCompliance = (description: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. SECTION KONTROLÜ - Tüm bölümler var mı?
  const missingSections = REQUIRED_TEMPLATE_SECTIONS.filter(
    section => !description.includes(section)
  );

  if (missingSections.length > 0) {
    missingSections.forEach(section => {
      errors.push(`❌ Missing template section: "${section}"`);
      score -= 15;
    });
  }

  // 2. PLACEHOLDER KONTROLÜ - Doldurulmamış yerler var mı?
  const placeholderPatterns = [
    /\[Insert[^\]]*\]/gi,
    /\{\{[^\}]*\}\}/g,
    /___+/g,
    /\[⚠️[^\]]*\]/gi,
    /\[Example:[^\]]*\]/gi
  ];

  placeholderPatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      errors.push(`❌ Unfilled placeholder found: ${matches[0]}`);
      score -= 20;
    }
  });

  // 3. EMOJI OVERLOAD KONTROLÜ
  const emojiCount = (description.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount > 15) {
    warnings.push(`⚠️ Too many emojis (${emojiCount}), template has 9 section markers which is ideal`);
    score -= 5;
  }

  // 4. BULLET POINT FORMAT KONTROLÜ
  const whyLoveSection = description.match(/💫 Why you'll love this[\s\S]*?(?=🎁|$)/);
  if (whyLoveSection && whyLoveSection[0]) {
    const bulletCount = (whyLoveSection[0].match(/\*/g) || []).length;
    if (bulletCount < 4) {
      warnings.push(`⚠️ "Why you'll love this" section should have 4-5 bullet points (found ${bulletCount})`);
      score -= 5;
    }
  }

  // 5. SHIPPING SECTION KONTROLÜ
  const shippingSection = description.includes("FREE SHIPPING ON ALL ORDERS!");
  if (!shippingSection) {
    errors.push("❌ Missing mandatory 'FREE SHIPPING ON ALL ORDERS!' text");
    score -= 10;
  }

  // 6. FINAL TOUCH KONTROLÜ
  const hasFinalTouch = description.includes("Looking for a custom size or color?");
  if (!hasFinalTouch) {
    warnings.push("⚠️ Missing standard closing: 'Looking for a custom size or color?'");
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

// 🎯 ETSY VALIDATION (GELİŞTİRİLMİŞ)
export const validateEtsyListing = (result: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. TITLE KONTROLÜ
  if (!result.newTitle || result.newTitle.length < 20) {
    errors.push("❌ Title too short (min 20 chars)");
    score -= 20;
  }
  
  if (result.newTitle && result.newTitle.length > 140) {
    errors.push("❌ Title exceeds Etsy limit (140 chars)");
    score -= 15;
  }

  // Tekrar eden kelime kontrolü
  const titleWords = result.newTitle?.toLowerCase().split(/\s+/) || [];
  const allowedRepeats = new Set(['and', 'with', 'for', '&', 'the', 'a', 'an', 'or']);
  const significantWords = titleWords.filter(w => w.length > 3 && !allowedRepeats.has(w));
  const wordCounts = significantWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const repeatedWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 1)
    .map(([word, _]) => word);
  
  if (repeatedWords.length > 0) {
    errors.push(`❌ Title has repeated words: ${repeatedWords.join(', ')}`);
    score -= 15;
  }

  // 2. DESCRIPTION KONTROLÜ
  const descLower = result.newDescription?.toLowerCase() || "";
  
  // AI jargon taraması
  BANNED_AI_PHRASES.forEach(phrase => {
    if (descLower.includes(phrase.toLowerCase())) {
      errors.push(`❌ BANNED AI phrase found: "${phrase}"`);
      score -= 10;
    }
  });

  // Template compliance check
  const templateValidation = validateTemplateCompliance(result.newDescription || "");
  errors.push(...templateValidation.errors);
  warnings.push(...templateValidation.warnings);
  score = Math.min(score, templateValidation.score);

  // Description minimum uzunluk (template kullanıldığında daha uzun olmalı)
  if (result.newDescription && result.newDescription.length < 800) {
    warnings.push(`⚠️ Description seems short for template format (${result.newDescription.length} chars, expect 1000+)`);
    score -= 5;
  }

  // 3. HASHTAG/TAG KONTROLÜ
  if (!result.hashtags || result.hashtags.length !== 13) {
    errors.push(`❌ Must have exactly 13 tags (found ${result.hashtags?.length || 0})`);
    score -= 15;
  }

  const longTailTags = result.hashtags?.filter(tag => tag.split(' ').length >= 2) || [];
  if (longTailTags.length < 7) {
    warnings.push(`⚠️ Only ${longTailTags.length}/13 tags are long-tail (need 7+)`);
    score -= 10;
  }

  // Duplicate tag check
  const tagSet = new Set(result.hashtags?.map(t => t.toLowerCase()));
  if (tagSet.size !== result.hashtags?.length) {
    errors.push("❌ Duplicate tags found");
    score -= 10;
  }

  // Hashtag symbol check
  const hasHashSymbol = result.hashtags?.some(tag => tag.startsWith('#'));
  if (hasHashSymbol) {
    errors.push("❌ Tags should NOT include # symbol");
    score -= 10;
  }

  // 4. SOCIAL MEDIA KONTROLÜ
  if (result.socialMedia) {
    // Pinterest
    if (!result.socialMedia.pinterestTitle || result.socialMedia.pinterestTitle.length < 20) {
      errors.push("❌ Pinterest title is missing or too short");
      score -= 5;
    }

    if (!result.socialMedia.pinterestDescription || result.socialMedia.pinterestDescription.length < 50) {
      errors.push("❌ Pinterest description is too short (min 50 chars)");
      score -= 5;
    }

    const pinDescLower = result.socialMedia.pinterestDescription?.toLowerCase() || "";
    BANNED_AI_PHRASES.forEach(phrase => {
      if (pinDescLower.includes(phrase.toLowerCase())) {
        errors.push(`❌ Pinterest description has AI jargon: "${phrase}"`);
        score -= 5;
      }
    });

    // Instagram
    if (!result.socialMedia.instagramCaption || result.socialMedia.instagramCaption.length < 50) {
      errors.push("❌ Instagram caption is too short");
      score -= 5;
    }

    const instaHashtags = result.socialMedia.instagramHashtags?.split(/\s+/).filter(t => t.startsWith('#')) || [];
    if (instaHashtags.length < 20) {
      warnings.push(`⚠️ Instagram needs 25-30 hashtags (found ${instaHashtags.length})`);
      score -= 5;
    }
  } else {
    errors.push("❌ Social media content is missing");
    score -= 10;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

// 🎯 AMAZON VALIDATION (aynı kalıyor)
export const validateAmazonListing = (result: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  if (!result.title || result.title.length < 80) {
    errors.push("❌ Amazon title too short (min 80 chars)");
    score -= 20;
  }

  if (result.title && result.title.length > 200) {
    errors.push("❌ Amazon title exceeds 200 chars");
    score -= 15;
  }

  if (!result.bulletPoints || result.bulletPoints.length !== 5) {
    errors.push(`❌ Must have exactly 5 bullet points (found ${result.bulletPoints?.length || 0})`);
    score -= 20;
  } else {
    result.bulletPoints.forEach((bullet: string, idx: number) => {
      if (bullet.length < 150) {
        warnings.push(`⚠️ Bullet ${idx + 1} is short (${bullet.length} chars, recommend 200+)`);
        score -= 3;
      }
      if (bullet.length > 250) {
        warnings.push(`⚠️ Bullet ${idx + 1} exceeds 250 chars`);
        score -= 2;
      }
    });
  }

  if (!result.productDescription) {
    errors.push("❌ Product description is missing");
    score -= 25;
  } else if (result.productDescription.length < 1000) {
    errors.push(`❌ Description too short (${result.productDescription.length} chars, need 1800)`);
    score -= 15;
  }

  const descLower = result.productDescription?.toLowerCase() || "";
  BANNED_AI_PHRASES.forEach(phrase => {
    if (descLower.includes(phrase.toLowerCase())) {
      errors.push(`❌ Description contains banned phrase: "${phrase}"`);
      score -= 10;
    }
  });

  if (!result.backendKeywords && !result.searchTerms) {
    errors.push("❌ Backend search terms are missing");
    score -= 20;
  } else {
    const keywords = result.backendKeywords || result.searchTerms || "";
    if (keywords.length < 100) {
      errors.push(`❌ Backend keywords too short (${keywords.length} chars, need 240-250)`);
      score -= 15;
    }
    
    if (keywords.includes(',')) {
      errors.push("❌ Backend keywords should use SPACES, not commas");
      score -= 10;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

// 🎯 DİJİTAL ÜRÜN VALIDATION
export const validateDigitalListing = (result: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  if (!result.newTitle || !result.newTitle.toLowerCase().includes('digital')) {
    warnings.push("⚠️ Consider adding 'Digital Download' or 'Printable' to title");
    score -= 5;
  }

  const desc = result.newDescription?.toLowerCase() || "";
  if (!desc.includes('instant') && !desc.includes('download')) {
    warnings.push("⚠️ Mention 'Instant Download' in description");
    score -= 5;
  }

  if (!desc.includes('pdf') && !desc.includes('jpg') && !desc.includes('png')) {
    warnings.push("⚠️ Specify file formats (PDF, JPG, PNG, etc.)");
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

// 🆕 HIZLI QUALITY CHECK
export const quickQualityCheck = (text: string): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  const lowerText = text.toLowerCase();

  // Critical banned phrases
  const criticalPhrases = ["picture this", "imagine this", "it's not just", "stunning", "elevate your"];
  criticalPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      issues.push(`CRITICAL: "${phrase}" detected`);
    }
  });

  // Template placeholders
  if (lowerText.includes('[insert') || lowerText.includes('{{') || lowerText.includes('___')) {
    issues.push('CRITICAL: Unfilled template placeholders');
  }

  return {
    passed: issues.length === 0,
    issues
  };
};