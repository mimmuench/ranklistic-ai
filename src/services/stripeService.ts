import { supabase } from './client'; // ✅ DÜZELTİLDİ: Artık gerçek client'ı kullanıyor

const STRIPE_LINKS = {
    starter: {
        monthly: 'https://buy.stripe.com/eVqdR95X0bUWexYdhh9EI00', 
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
    // Kredi Paketleri
    credits: {
        pack_50: 'https://buy.stripe.com/8x26oHfxA7EGgG6a559EI06',
        pack_200: 'https://buy.stripe.com/14A5kDclo6ACfC2a559EI07',
        pack_500: 'https://buy.stripe.com/14A8wP3OSbUWdtUell9EI08'
    }
};

export const initiateCheckout = async (
    planId: 'starter' | 'growth' | 'agency' | 'credits_50' | 'credits_200' | 'credits_500', 
    interval: 'monthly' | 'annual', 
    userEmail: string, 
    userId: string
) => {
    
    let targetLink = '';

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

    if (!targetLink || targetLink.includes('test_')) {
        console.warn(`UYARI: ${planId} için link bulunamadı.`);
    }

    // Stripe URL'ine email ve user_id ekle
    const finalUrl = `${targetLink}?prefilled_email=${encodeURIComponent(userEmail)}&client_reference_id=${userId}`;

    window.open(finalUrl, '_blank');
    
    return true; 
};