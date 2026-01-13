
import React, { useState } from 'react';
import { CheckCircleIcon, CloseIcon, RocketIcon, StarIcon, FireIcon, KeyIcon, CreditCardIcon } from './icons';
import { supabaseMock } from '../services/supabaseService';
import { initiateCheckout } from '../services/stripeService';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'en' | 'tr';
    onSuccess: () => void;
}

const basePrices = {
    starter: 9,
    growth: 29,
    agency: 99
};

const creditPrices = {
    50: 5,
    200: 15,
    500: 30
};

const plansConfig = {
    starter: {
        id: 'starter',
        nameEn: 'Starter',
        nameTr: 'Başlangıç',
        credits: 50,
        licenseKey: 'START50', // Basit doğrulama için kod
        popular: false,
        featuresEn: ['50 AI Credits / mo', 'Basic Shop Audit', 'SEO Generator', 'Email Support'],
        featuresTr: ['50 AI Kredisi / ay', 'Temel Mağaza Denetimi', 'SEO Oluşturucu', 'E-posta Desteği'],
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-400'
    },
    growth: {
        id: 'growth',
        nameEn: 'Growth',
        nameTr: 'Büyüme',
        credits: 200,
        licenseKey: 'GROW200', // Basit doğrulama için kod
        popular: true,
        featuresEn: ['200 AI Credits / mo', 'Competitor Spy Tool', 'Visual Launchpad', 'Global Market Scan'],
        featuresTr: ['200 AI Kredisi / ay', 'Rakip Casus Aracı', 'Görsel Analiz', 'Global Pazar Tarayıcı'],
        color: 'orange',
        gradient: 'from-orange-500 to-pink-500'
    },
    agency: {
        id: 'agency',
        nameEn: 'Agency',
        nameTr: 'Ajans',
        credits: 1000,
        licenseKey: 'AGENCY1K', // Basit doğrulama için kod
        popular: false,
        featuresEn: ['1,000 AI Credits / mo', '**TrendRadar Predictive AI**', 'White-Label Reports', 'Multi-Shop Dashboard'],
        featuresTr: ['1,000 AI Kredisi / ay', '**TrendRadar (Geleceği Gör)**', 'Logosuz PDF Raporlar', 'Çoklu Mağaza Paneli'],
        color: 'purple',
        gradient: 'from-purple-500 to-indigo-500'
    }
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, lang, onSuccess }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [viewMode, setViewMode] = useState<'plans' | 'credits'>('plans');
    
    // License Key Activation State
    const [activationCode, setActivationCode] = useState('');
    const [activationStatus, setActivationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [activationMessage, setActivationMessage] = useState('');

    if (!isOpen) return null;

    const handleUpgrade = async (planKey: string) => {
        try {
            const user = await supabaseMock.auth.getUser();
            if (user) {
                // 1. Stripe Ödeme Sayfasını Aç
                await initiateCheckout(planKey as any, billingCycle, user.email, user.id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleBuyCredits = async (amount: number) => {
        try {
            const user = await supabaseMock.auth.getUser();
            if (user) {
                // `credits_50` formatında ID gönder
                await initiateCheckout(`credits_${amount}` as any, 'monthly', user.email, user.id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleActivateLicense = async () => {
        if (!activationCode) return;
        setActivationStatus('loading');

        await new Promise(resolve => setTimeout(resolve, 1500)); // Network delay simulation

        const code = activationCode.trim().toUpperCase();
        let success = false;
        let msg = '';

        // 1. Check if it's a PLAN upgrade code
        let upgradePlan: 'starter' | 'growth' | 'agency' | null = null;
        if (code === 'START50' || code.includes('START')) upgradePlan = 'starter';
        else if (code === 'GROW200' || code.includes('GROW')) upgradePlan = 'growth';
        else if (code === 'AGENCY1K' || code.includes('AGENCY')) upgradePlan = 'agency';
        else if (code === 'LAUNCH20' || code === 'DEMO') upgradePlan = 'growth'; // Demo codes

        if (upgradePlan) {
            await supabaseMock.db.upgradePlan(upgradePlan);
            success = true;
            msg = lang === 'tr' ? 'Paketiniz yükseltildi!' : 'Plan upgraded successfully!';
        }

        // 2. Check if it's a CREDIT TOP-UP code (Top-ups don't change plan, just add credits)
        let creditAmount = 0;
        if (code === 'TOPUP50' || code.includes('CREDIT50')) creditAmount = 50;
        else if (code === 'TOPUP200' || code.includes('CREDIT200')) creditAmount = 200;
        else if (code === 'TOPUP500' || code.includes('CREDIT500')) creditAmount = 500;

        if (creditAmount > 0) {
            await supabaseMock.db.addCredits(creditAmount);
            success = true;
            msg = lang === 'tr' ? `${creditAmount} Kredi eklendi!` : `${creditAmount} Credits added!`;
        }

        if (success) {
            setActivationStatus('success');
            setActivationMessage(msg);
            setTimeout(() => {
                onSuccess(); // Refresh user data in App
                onClose();   // Close modal
            }, 2000);
        } else {
            setActivationStatus('error');
            setActivationMessage(lang === 'tr' ? 'Geçersiz lisans anahtarı.' : 'Invalid license key.');
        }
    };

    // Helper to calculate price to display
    const getDisplayPrice = (basePrice: number, planKey: string) => {
        let price = basePrice;
        if (billingCycle === 'annual' && planKey !== 'starter') {
            price = basePrice * 0.8; 
        }
        return Math.floor(price);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div 
                className="fixed inset-0 bg-[#0B0F19]/90 backdrop-blur-xl transition-opacity" 
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-5xl bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up transform scale-100 transition-all flex flex-col md:flex-row">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all z-20"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>

                {/* LEFT SIDE: SELECTION AREA */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[80vh] bg-[#0F172A]">
                    
                    {/* Mode Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-slate-900 p-1 rounded-full border border-white/10 flex">
                            <button
                                onClick={() => setViewMode('plans')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'plans' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {lang === 'tr' ? 'Abonelik Planları' : 'Subscriptions'}
                            </button>
                            <button
                                onClick={() => setViewMode('credits')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'credits' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {lang === 'tr' ? 'Kredi Yükle' : 'Buy Credits'}
                            </button>
                        </div>
                    </div>

                    {/* VIEW: PLANS */}
                    {viewMode === 'plans' && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-extrabold text-white mb-2">
                                    {lang === 'tr' ? 'Planını Seç' : 'Choose Your Plan'}
                                </h2>
                                <p className="text-slate-400 text-xs">
                                    {lang === 'tr' ? 'Tüm araçlara erişim sağlar. Krediler her ay yenilenir.' : 'Unlocks tools. Credits refresh monthly.'}
                                </p>

                                {/* BILLING TOGGLE */}
                                <div className="flex items-center justify-center gap-2 mt-4 text-[10px]">
                                    <span className={billingCycle === 'monthly' ? 'text-white font-bold' : 'text-slate-500'}>Monthly</span>
                                    <button
                                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                                        className={`w-10 h-5 rounded-full p-1 transition-colors ${billingCycle === 'annual' ? 'bg-green-500' : 'bg-slate-600'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${billingCycle === 'annual' ? 'translate-x-5' : ''}`} />
                                    </button>
                                    <span className={billingCycle === 'annual' ? 'text-white font-bold' : 'text-slate-500'}>Annual (-20%)</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(plansConfig).map(([key, plan]) => {
                                    const numericPrice = basePrices[key as keyof typeof basePrices];
                                    const displayPrice = getDisplayPrice(numericPrice, key);
                                    
                                    return (
                                        <div key={key} className={`relative p-4 rounded-xl border transition-all ${plan.popular ? 'bg-slate-800/80 border-orange-500/50' : 'bg-slate-900/50 border-white/5'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">{lang === 'tr' ? plan.nameTr : plan.nameEn}</h3>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold text-white">${displayPrice}</span>
                                                        <span className="text-[10px] text-slate-500">/mo</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUpgrade(key)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                                                >
                                                    {lang === 'tr' ? 'Yükselt' : 'Upgrade'}
                                                </button>
                                            </div>
                                            <ul className="grid grid-cols-2 gap-y-1 gap-x-4">
                                                {(lang === 'tr' ? plan.featuresTr : plan.featuresEn).map((feat, i) => (
                                                    <li key={i} className="flex items-center text-[10px] text-slate-300">
                                                        <CheckCircleIcon className="w-3 h-3 mr-1 text-slate-500" />
                                                        <span className="truncate" dangerouslySetInnerHTML={{ __html: feat.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* VIEW: CREDITS (TOP UP) */}
                    {viewMode === 'credits' && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-extrabold text-white mb-2">
                                    {lang === 'tr' ? 'Kredi Yükle' : 'Top Up Credits'}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {lang === 'tr' 
                                        ? 'Video üretimi gibi işlemler için ekstra krediye mi ihtiyacın var? Paket değiştirmeden kredi al.' 
                                        : 'Need more credits for video generation? Add credits without changing your plan.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { amount: 50, price: creditPrices[50], label: 'Starter Pack', icon: RocketIcon },
                                    { amount: 200, price: creditPrices[200], label: 'Creator Pack', icon: StarIcon, popular: true },
                                    { amount: 500, price: creditPrices[500], label: 'Pro Pack', icon: FireIcon }
                                ].map((pack, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${pack.popular ? 'bg-orange-900/10 border-orange-500/50' : 'bg-slate-900/50 border-white/5'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pack.popular ? 'bg-orange-500 text-white' : 'bg-slate-700 text-gray-300'}`}>
                                                <pack.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-white">{pack.amount} {lang === 'tr' ? 'Kredi' : 'Credits'}</div>
                                                <div className="text-xs text-gray-400">{pack.label}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyCredits(pack.amount)}
                                            className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            ${pack.price}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-[10px] text-gray-500 mt-6">
                                * {lang === 'tr' ? 'Eklenen kredilerin son kullanım tarihi yoktur.' : 'Top-up credits never expire.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: ACTIVATION */}
                <div className="w-full md:w-80 bg-[#0B1120] border-t md:border-t-0 md:border-l border-white/10 p-6 md:p-8 flex flex-col justify-center">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {lang === 'tr' ? 'Anahtar Gir' : 'Enter Key'}
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            {lang === 'tr' 
                                ? 'Ödeme sonrası e-postanıza gelen kodu buraya girerek kredilerinizi anında yükleyin.' 
                                : 'Received a code via email after purchase? Enter it here to unlock credits instantly.'}
                        </p>

                        <div className="space-y-3">
                            <input 
                                type="text" 
                                value={activationCode}
                                onChange={(e) => setActivationCode(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX"
                                className={`w-full p-3 bg-black/40 border rounded-lg text-center font-mono text-sm text-white focus:outline-none focus:ring-2 ${activationStatus === 'error' ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-green-500'}`}
                            />
                            <button 
                                onClick={handleActivateLicense}
                                disabled={!activationCode || activationStatus === 'loading'}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {activationStatus === 'loading' ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    lang === 'tr' ? 'Aktif Et' : 'Activate'
                                )}
                            </button>
                        </div>

                        {activationMessage && (
                            <div className={`mt-4 text-xs font-bold ${activationStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {activationMessage}
                            </div>
                        )}
                        
                        <div className="mt-6 pt-6 border-t border-white/5 text-[10px] text-slate-500">
                            {lang === 'tr' ? 'Ödeme güvenliği Stripe tarafından sağlanmaktadır.' : 'Payments secured by Stripe.'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
