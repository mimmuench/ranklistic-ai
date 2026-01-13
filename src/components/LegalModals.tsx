
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
                **1. Data Collection & Usage**
                Ranklistic AI ("Service"), operated by **Mundo Global LLC**, collects minimal data necessary for account creation and service delivery. This includes your email address and Etsy shop URL. We do not store credit card details; payments are processed securely via Stripe.

                **2. Third-Party Sharing**
                We do not sell your personal data. We share necessary data with trusted third-party providers solely for the purpose of operating the service (e.g., Stripe for payments, Supabase for authentication, Google Gemini for AI processing).

                **3. Data Security**
                We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure.

                **4. Contact Us**
                For privacy concerns, please contact us at: **support@ranklistic.com**
            `
        },
        terms: {
            title: "Terms of Service",
            text: `
                **1. Acceptance of Terms**
                By accessing Ranklistic AI, you agree to these Terms. The service is provided by **Mundo Global LLC**.

                **2. Description of Service & Delivery Policy**
                Ranklistic AI is a Software-as-a-Service (SaaS) platform. Upon successful payment, your account is upgraded immediately, and you gain instant access to digital credits and tools. No physical goods are shipped.

                **3. User Obligations**
                You agree not to reverse engineer, scrape, or abuse the API. Accounts found in violation will be terminated.

                **4. Governing Law**
                These terms are governed by the laws of the jurisdiction in which Mundo Global LLC is registered.
            `
        },
        refund: {
            title: "Refund & Cancellation Policy",
            text: `
                **1. Cancellation Policy**
                You may cancel your subscription at any time via your account dashboard or by emailing **support@ranklistic.com**.
                - If you cancel, your subscription will remain active until the end of the current billing period.
                - You will not be charged for the next billing cycle.

                **2. Refund Policy (7-Day Guarantee)**
                We offer a 7-day money-back guarantee for first-time purchases under the following conditions:
                - You request the refund within 7 days of the initial transaction.
                - You have used less than 20% of your allocated AI credits.
                To request a refund, email **support@ranklistic.com** with your account email.

                **3. Dispute Resolution**
                In the event of a billing dispute, please contact our support team first to resolve the issue amicably before initiating a chargeback.
            `
        }
    },
    tr: {
        privacy: {
            title: "Gizlilik Politikası",
            text: `
                **1. Veri Toplama**
                **Mundo Global LLC** tarafından işletilen Ranklistic AI, hizmeti sağlamak için gerekli asgari verileri (E-posta, Mağaza URL'si) toplar. Kredi kartı bilgileriniz sunucularımızda saklanmaz; ödemeler Stripe aracılığıyla güvenle işlenir.

                **2. Üçüncü Taraflar**
                Kişisel verilerinizi satmayız. Veriler sadece hizmetin işlemesi için gerekli altyapı sağlayıcıları (Stripe, Google, Supabase) ile paylaşılır.

                **3. İletişim**
                Gizlilik konuları için iletişim: **support@ranklistic.com**
            `
        },
        terms: {
            title: "Kullanım Şartları",
            text: `
                **1. Kabul**
                Hizmeti kullanarak bu şartları kabul etmiş sayılırsınız. Hizmet sağlayıcı: **Mundo Global LLC**.

                **2. Hizmet Tanımı ve Teslimat Politikası**
                Ranklistic AI dijital bir SaaS hizmetidir. Ödeme başarılı olduğunda hesabınız anında yükseltilir ve dijital araçlara erişiminiz derhal başlar. Fiziksel kargo gönderimi yoktur.

                **3. Kullanıcı Yükümlülükleri**
                Sistemi manipüle etmek, izinsiz veri çekmek (scraping) veya kötüye kullanmak yasaktır.
            `
        },
        refund: {
            title: "İptal ve İade Politikası",
            text: `
                **1. İptal Politikası**
                Aboneliğinizi dilediğiniz zaman panelinizden veya **support@ranklistic.com** adresine yazarak iptal edebilirsiniz.
                - İptal durumunda, mevcut fatura döneminin sonuna kadar erişiminiz devam eder.
                - Bir sonraki dönem için ücret alınmaz.

                **2. İade Politikası (7 Gün Garanti)**
                İlk satın alma işlemleri için, kredilerin %20'sinden azının kullanılmış olması şartıyla 7 gün içinde iade garantisi sunuyoruz. İade talebi için destek ekibimize ulaşın.
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
