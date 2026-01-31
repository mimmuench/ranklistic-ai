/**
 * 🔒 RANKLISTIC QUALITY VALIDATOR
 * Her platformun SEO kurallarına göre sıkı validasyon
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

// 🚫 YASAKLI AI JARGONU (Global)
const BANNED_AI_PHRASES = [
  "stunning", "elevate", "elevate your", "perfect for any", "exquisite", 
  "must-have", "game-changer", "unleash", "realm", "dive into", 
  "meticulously", "breathtaking", "timeless elegance", "crafted with care",
  "meticulously crafted", "one-of-a-kind" // (bu sadece gerçekten tek parça ise OK)
];

// 🎯 ETSY VALIDATION
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
  const uniqueWords = new Set(titleWords.filter(w => w.length > 3));
  const repeatedWords = titleWords.filter((word, index) => 
    word.length > 3 && titleWords.indexOf(word) !== index
  );
  
  if (repeatedWords.length > 0) {
    errors.push(`❌ Title has repeated words: ${repeatedWords.join(', ')}`);
    score -= 15;
  }

  // 2. DESCRIPTION KONTROLÜ
  const descLower = result.newDescription?.toLowerCase() || "";
  
  BANNED_AI_PHRASES.forEach(phrase => {
    if (descLower.includes(phrase)) {
      errors.push(`❌ BANNED AI phrase found: "${phrase}"`);
      score -= 10;
    }
  });

  if (result.newDescription && result.newDescription.length < 200) {
    warnings.push("⚠️ Description is too short (recommend 500+ chars)");
    score -= 5;
  }

  // Template placeholder check
  if (descLower.includes('[insert') || descLower.includes('{{') || descLower.includes('___')) {
    errors.push("❌ Description contains unfilled placeholders");
    score -= 20;
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
      if (pinDescLower.includes(phrase)) {
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

// 🎯 AMAZON VALIDATION
export const validateAmazonListing = (result: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. TITLE (150-200 chars optimal)
  if (!result.title || result.title.length < 80) {
    errors.push("❌ Amazon title too short (min 80 chars)");
    score -= 20;
  }

  if (result.title && result.title.length > 200) {
    errors.push("❌ Amazon title exceeds 200 chars");
    score -= 15;
  }

  // 2. BULLET POINTS (5 required, 200-250 chars each)
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

  // 3. PRODUCT DESCRIPTION (1800 chars)
  if (!result.productDescription) {
    errors.push("❌ Product description is missing");
    score -= 25;
  } else if (result.productDescription.length < 1000) {
    errors.push(`❌ Description too short (${result.productDescription.length} chars, need 1800)`);
    score -= 15;
  } else if (result.productDescription.length < 1700) {
    warnings.push(`⚠️ Description could be longer (${result.productDescription.length}/1800 chars)`);
    score -= 5;
  }

  // AI jargon check
  const descLower = result.productDescription?.toLowerCase() || "";
  BANNED_AI_PHRASES.forEach(phrase => {
    if (descLower.includes(phrase)) {
      errors.push(`❌ Description contains banned phrase: "${phrase}"`);
      score -= 10;
    }
  });

  // 4. BACKEND KEYWORDS (250 chars)
  if (!result.backendKeywords && !result.searchTerms) {
    errors.push("❌ Backend search terms are missing");
    score -= 20;
  } else {
    const keywords = result.backendKeywords || result.searchTerms || "";
    if (keywords.length < 100) {
      errors.push(`❌ Backend keywords too short (${keywords.length} chars, need 240-250)`);
      score -= 15;
    }
    
    // Virgül kontrolü (Amazon backend'de virgül OLMAMALI)
    if (keywords.includes(',')) {
      errors.push("❌ Backend keywords should use SPACES, not commas");
      score -= 10;
    }
  }

  // 5. A+ CONTENT SUGGESTIONS
  if (!result.aPlusSuggestions) {
    warnings.push("⚠️ A+ Content suggestions missing");
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
};

// 🎯 DİJİTAL ÜRÜN VALIDATION (Yeni!)
export const validateDigitalListing = (result: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Digital product için özel kurallar
  if (!result.newTitle || !result.newTitle.toLowerCase().includes('digital')) {
    warnings.push("⚠️ Consider adding 'Digital Download' or 'Printable' to title");
    score -= 5;
  }

  // Instant download mention
  const desc = result.newDescription?.toLowerCase() || "";
  if (!desc.includes('instant') && !desc.includes('download')) {
    warnings.push("⚠️ Mention 'Instant Download' in description");
    score -= 5;
  }

  // File format mention
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
