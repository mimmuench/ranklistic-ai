
import { supabaseMock } from './supabaseService';

// --- GÜVENLİ ÖDEME SİSTEMİ (STRIPE PAYMENT LINKS) ---
// ADIM 1: Stripe Dashboard'a git (https://dashboard.stripe.com/test/payment-links)
// ADIM 2: Her paket (Starter, Growth, Agency) için hem Aylık hem Yıllık link oluştur.
// ADIM 3: Linkleri aşağıya yapıştır.
// ADIM 4: 'test_' kısmını canlıya geçerken gerçek linklerle değiştirmeyi unutma.

const STRIPE_LINKS = {
    starter: {
        monthly: 'https://buy.stripe.com/test_starter_monthly', // ÖRN: https://buy.stripe.com/cN2...
        annual: 'https://buy.stripe.com/test_starter_annual'
    },
    growth: {
        monthly: 'https://buy.stripe.com/test_growth_monthly',
        annual: 'https://buy.stripe.com/test_growth_annual'
    },
    agency: {
        monthly: 'https://buy.stripe.com/test_agency_monthly',
        annual: 'https://buy.stripe.com/test_agency_annual'
    },
    // NEW: Credit Top-Ups (One-time payments)
    credits: {
        pack_50: 'https://buy.stripe.com/test_credit_50',
        pack_200: 'https://buy.stripe.com/test_credit_200',
        pack_500: 'https://buy.stripe.com/test_credit_500'
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
