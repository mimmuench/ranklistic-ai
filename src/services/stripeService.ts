
import { supabase } from './supabaseService';

const STRIPE_LINKS = {
    starter: {
        monthly: 'https://buy.stripe.com/eVqdR95X0bUWexYdhh9EI00', // ÖRN: https://buy.stripe.com/cN2...
        annual: 'https://buy.stripe.com/9B6aEXfxA6ACcpQdhh9EI01'
    },
    growth: {
        monthly: 'https://buy.stripe.com/3cI00jadg4su2Pga559EI02',
        annual: 'https://buy.stripe.com/7sYaEXclogbcexYell9EI03'
    },
    agency: {
        monthly: 'https://buy.stripe.com/5kQ8wP99c5wycpQ1yz9EI04',
        annual: 'https://buy.stripe.com/dRm28r7144su9dEell9EI05'
    },
    // NEW: Credit Top-Ups (One-time payments)
    credits: {
        pack_50: 'https://buy.stripe.com/8x26oHfxA7EGgG6a559EI06',
        pack_200: 'https://buy.stripe.com/14A5kDclo6ACfC2a559EI07',
        pack_500: 'https://buy.stripe.com/14A8wP3OSbUWdtUell9EI08'
    }
};

export const initiateCheckout = async (
    planId: 'starter' | 'growth' | 'agency' | 'credits_50' | 'credits_200' | 'credits_500', 
    interval: 'monthly' | 'annual', // Ignored for credits
    userEmail: string, 
    userId: string
) => {
    
    let targetLink = '';

    // Determine Link based on type (Subscription or One-time)
    if (planId.startsWith('credits_')) {
        const packSize = planId.split('_')[1];
        // @ts-ignore
        targetLink = STRIPE_LINKS.credits[`pack_${packSize}`];
    } else {
        // @ts-ignore
        const planLinks = STRIPE_LINKS[planId];
        if (!planLinks) {
            console.error("Geçersiz Plan");
            return false;
        }
        targetLink = planLinks[interval];
    }

    // Link henüz girilmemişse uyarı ver (Geliştirici için)
    if (!targetLink || targetLink.includes('test_')) {
        console.warn(`UYARI: ${planId} için gerçek Stripe linki girilmemiş. services/stripeService.ts dosyasını düzenleyin.`);
        // Test amaçlı devam etmesine izin veriyoruz ama normalde buraya gerçek link gelmeli
    }

    // 2. Kullanıcı emailini linke ekle (Stripe'da otomatik dolması için)
    // Stripe URL parametresi: ?prefilled_email=user@example.com
    // client_reference_id: Webhook ile ödemeyi kullanıcıyla eşleştirmek için kullanılır.
    const finalUrl = `${targetLink}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${userId}`;

    // 3. Kullanıcıyı yeni sekmede ödeme sayfasına gönder
    window.open(finalUrl, '_blank');
    
    return true; 
};
