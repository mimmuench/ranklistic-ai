
import React from 'react';
import { CloseIcon, ScaleIcon } from './icons';

interface LegalModalProps {
    isOpen: boolean;
    type: 'privacy' | 'terms' | 'refund' | null;
    onClose: () => void;
    lang: 'en' | 'tr';
}

const legalContent = {
    en: {
        privacy: {
            title: "Privacy Policy",
            text: `
                **1. Data Collection**
                We collect minimal data necessary to operate the service. This includes email addresses for account management and Etsy shop URLs for analysis. We do NOT store your credit card information; payments are processed by secure third-party providers.

                **2. Shop Data Usage**
                When you input a shop URL, we access publicly available data (listings, tags, titles). We do not access your private Etsy account backend (we do not ask for your password or API keys).

                **3. AI Analysis**
                Data submitted to our tools (images, titles) is processed by Google Gemini AI. We do not use your data to train our own models in a way that exposes your intellectual property.

                **4. Cookies**
                We use cookies to maintain your login session and preferences.
            `
        },
        terms: {
            title: "Terms of Service",
            text: `
                **1. Introduction**
                Ranklistic AI is a service operated by **Mundo Global LLC**. By using Ranklistic, you agree to these terms. If you represent an agency, you agree that you have the authority to bind that entity.

                **2. Fair Use**
                You may not reverse engineer, scrape, or excessively burden our API. Accounts found abusing the credit system will be suspended without refund.

                **3. Disclaimer**
                Ranklistic provides suggestions based on AI analysis. We do not guarantee specific sales results or Etsy rankings. E-commerce success depends on many factors beyond SEO.

                **4. Subscriptions**
                You can cancel your subscription at any time. Credits reset monthly and do not rollover.
            `
        },
        refund: {
            title: "Refund Policy",
            text: `
                **1. 7-Day Money Back Guarantee**
                If you are not satisfied with Ranklistic, contact us within 7 days of your first purchase for a full refund, provided you have not used more than 20% of your credits.

                **2. Cancellation**
                You may cancel your recurring subscription at any time. You will retain access until the end of your billing cycle.

                **3. Abuse**
                Refunds are not granted in cases of Terms of Service violations (e.g., account sharing, scraping).
            `
        }
    },
    tr: {
        privacy: {
            title: "Gizlilik Politikası",
            text: `
                **1. Veri Toplama**
                Hizmeti yürütmek için gereken asgari verileri topluyoruz. Buna hesap yönetimi için e-posta adresleri ve analiz için Etsy mağaza URL'leri dahildir. Kredi kartı bilgilerinizi SAKLAMIYORUZ; ödemeler güvenli üçüncü taraf sağlayıcılar tarafından işlenir.

                **2. Mağaza Verisi Kullanımı**
                Bir mağaza URL'si girdiğinizde, herkese açık verileri (ilanlar, etiketler, başlıklar) kullanırız. Özel Etsy hesabınıza erişmeyiz (şifrenizi veya API anahtarlarınızı istemeyiz).

                **3. Yapay Zeka Analizi**
                Araçlarımıza gönderilen veriler (görseller, başlıklar) Google Gemini AI tarafından işlenir. Verilerinizi fikri mülkiyetinizi ifşa edecek şekilde modellerimizi eğitmek için kullanmayız.
            `
        },
        terms: {
            title: "Kullanım Şartları",
            text: `
                **1. Giriş**
                Ranklistic AI, **Mundo Global LLC** tarafından işletilen bir hizmettir. Ranklistic'i kullanarak bu şartları kabul etmiş olursunuz.

                **2. Adil Kullanım**
                API'mizi tersine mühendislik yapamaz, kazıyamaz veya aşırı yükleyemezsiniz. Kredi sistemini kötüye kullandığı tespit edilen hesaplar iade yapılmaksızın askıya alınacaktır.

                **3. Sorumluluk Reddi**
                Ranklistic, yapay zeka analizine dayalı öneriler sunar. Belirli satış sonuçlarını veya Etsy sıralamalarını garanti etmeyiz. E-ticaret başarısı SEO dışındaki birçok faktöre bağlıdır.
            `
        },
        refund: {
            title: "İade Politikası",
            text: `
                **1. 7 Gün Para İade Garantisi**
                Ranklistic'ten memnun kalmazsanız, kredilerinizin %20'sinden fazlasını kullanmamış olmanız kaydıyla, tam iade için ilk satın alma işleminizden sonraki 7 gün içinde bizimle iletişime geçin.

                **2. İptal**
                Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Fatura döngünüzün sonuna kadar erişiminizi korursunuz.
            `
        }
    }
};

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose, lang }) => {
    if (!isOpen || !type) return null;

    const content = legalContent[lang][type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-up">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                            <ScaleIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{content.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto text-gray-300 text-sm leading-relaxed space-y-4">
                    {content.text.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <br key={i}/>;
                        if (trimmed.startsWith('**')) {
                            // Simple bold parsing
                            return <p key={i} className="font-bold text-white text-lg mt-4 mb-2">{trimmed.replace(/\*\*/g, '')}</p>;
                        }
                        return <p key={i}>{trimmed}</p>;
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-800/30 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {lang === 'tr' ? 'Kapat' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};
