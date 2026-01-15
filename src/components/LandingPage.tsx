
import React, { useState, useEffect } from 'react';
import { SparklesIcon, SearchIcon, RocketIcon, CheckCircleIcon, PrinterIcon, StarIcon, CloseIcon, ScaleIcon, LaserIcon, BrandIcon, TrendingUpIcon, GeneratorIcon, FireIcon } from './icons';
import { Footer } from './Footer';
import { LegalModal } from './LegalModals';
import { AnnouncementBar } from './AnnouncementBar';
import { supabase } from '../services/client';
import { generateDemoTitle } from '../services/geminiService';

// Demo modunu kapattık, gerçek moddayız (Services üzerinden kontrol edilir)
const isDemoMode = false;

interface LandingPageProps {
  onGetStarted: (lang: 'en' | 'tr') => void;
  onLoginSuccess: (user: UserProfile) => void;
}

type Language = 'en' | 'tr';

interface UserProfile {
    id: string;
    email: string;
    plan: 'starter' | 'growth' | 'agency' | 'free';
    credits: number;
    full_name?: string;
}

interface PricingCardProps {
    title: string;
    target: string;
    price: string;
    originalPrice?: string;
    billingNote?: string;
    features: string[];
    buttonText: string;
    onButtonClick: () => void;
    isPopular?: boolean;
}

interface FAQItemProps {
    question: string;
    answer: string;
}

const translations = {
  en: {
    nav: { features: "Features", compare: "Compare", pricing: "Pricing", login: "Login", tryDemo: "Try Demo" },
    hero: {
      updateBadge: "New: Gemini 2.5 Flash Integration",
      titleLine1: "Stop Analyzing.",
      titleLine2: "Start Ranking.",
      subtitle: "Data tools give you charts. **Ranklistic** gives you sales. The first AI that writes your listings, audits your shop, and executes strategy.",
      ctaPrimary: "Start Free Audit",
      ctaSecondary: "See How It Works"
    },
    demo: {
      title: "Don't believe us?",
      titleHighlight: "Try it.",
      subtitle: "Type a boring product title below (e.g., 'Blue Mug') and watch Ranklistic fix it instantly.",
      placeholder: "e.g. Leather Wallet, T-Shirt, or Wall Art",
      button: "Fix It",
      waiting: "Waiting for your input...",
      beforeLabel: "Before (Boring)",
      afterLabel: "After (Ranklistic)",
      magicLabel: "AI Magic",
      trafficLabel: "Traffic Potential",
      disclaimer: "* This is a live demo using Gemini 2.5 Flash.",
      limitReachedTitle: "Daily Demo Limit Reached 🚀",
      limitReachedDesc: "You've used your 3 free AI generations for today. Create a free account to get 50 credits/month.",
      limitBtn: "Create Free Account"
    },
    comparison: {
      title: "How We Compare",
      trapTitle: "The Analytics Trap (Others)",
      trapItems: [
        "Gives you raw search volume numbers",
        "\"Here is the data, now YOU write the listing\"",
        "Complicated charts that need a course to understand",
        "Requires constant monthly manual checking"
      ],
      planTitle: "The Ranklistic Way",
      planItems: [
        "Auto-writes SEO titles based on trends",
        "\"Here is the finished listing, ready to copy-paste\"",
        "Visual AI analysis of your actual product photos",
        "Reverse-engineers competitor strategies"
      ],
      tableFeatures: "Features",
      tableUs: "Ranklistic (Action)",
      tableOthers: "Analytics Tools (Erank)",
      tableGpt: "Standard ChatGPT",
      rows: [
        { name: "Listing Writing", us: "Full Auto (Title+Desc+Tags)", others: "Manual Discovery", gpt: "Generic, Sounds Fake" },
        { name: "Visual Image Analysis", us: "Yes (Vision AI)", others: "No", gpt: "Limited" },
        { name: "Primary Goal", us: "Done-For-You Content", others: "Data & Search Volume", gpt: "Chatting" },
        { name: "Cost", us: "$9 / mo", others: "$10 - $20 / mo", gpt: "$20 / mo (Plus)" }
      ]
    },
    features: {
      audit: {
        title: "Your Personal",
        titleHighlight: "Shop Doctor.",
        desc: "Stop wondering why your sales are low. Ranklistic scans your entire shop against 50+ public data points used by top 1% sellers.",
        list: ["Get a brutal 0-10 Health Score", "Find broken or banned keywords instantly", "Actionable checklist to fix traffic leaks"],
        cta: "Start Auditing"
      },
      launchpad: {
        title: "Visual Launchpad",
        titleHighlight: "Predicts Winners.",
        desc: "Don't waste materials on products that won't sell. Upload a raw photo or sketch, and our Visual AI will analyze its aesthetic viability.",
        list: ["Instant 'Viability Score' before you list", "Auto-generates Titles & Tags from the image", "Pinterest Viral Description generator included"],
        cta: "Try Visual Launchpad"
      },
      competitor: {
        title: "Reverse-Engineer",
        titleHighlight: "Competitors.",
        desc: "Why is that shop winning? Paste their URL. We analyze their public data to reverse-engineer their strategy.",
        list: ["Identify their visible 'Power Keywords'", "Compare visual aesthetics side-by-side", "Get a specific strategy to outrank them"],
        cta: "Start Spying"
      }
    },
    pricing: {
      title: "Pricing that pays for itself.",
      subtitle: "Stop guessing. Start dominating.",
      starter: { 
          title: "Starter", 
          target: "For Hobbyists",
          btn: "Start Free Trial", 
          features: [
              "**50 AI Credits / mo** (Approx. 50 Listings)", 
              "**Basic Shop Audit** (Find critical errors)", 
              "**SEO Generator** (Fix your titles)", 
              "Email Support"
          ] 
      },
      growth: { 
          title: "Growth", 
          target: "For Serious Sellers",
          btn: "Get Started", 
          features: [
              "**200 AI Credits / mo** (High Volume)", 
              "**Competitor Spy Tool** (Unlock Strategy)", 
              "**Visual Launchpad** (Test photos before posting)", 
              "**Global Market Scan** (Find blue oceans)", 
              "Priority Support"
          ] 
      },
      agency: { 
          title: "Agency", 
          target: "For Consultants",
          btn: "Contact Sales", 
          features: [
              "**1,000 AI Credits / mo** (Massive Volume)", 
              "**White-Label Reports** (Sell to your clients)", 
              "Multi-Shop Management Dashboard", 
              "Priority API Access", 
              "Commercial Use License"
          ] 
      }
    },
    faq: {
        title: "Frequently Asked Questions",
        items: [
            { q: "Is this safe for my Etsy shop?", a: "Yes, absolutely. We only use public data that is visible to everyone on the internet. We do not access your private Etsy account, ask for your password, or use API keys that could put your shop at risk." },
            { q: "How accurate is the AI?", a: "We use Google's latest Gemini 2.5 Flash models, specifically tuned for e-commerce. While no tool can guarantee sales, our users typically see a 30-50% increase in traffic after optimizing their listings." },
            { q: "Can I cancel anytime?", a: "Yes. There are no contracts. You can cancel your subscription from your dashboard with one click." },
            { q: "Do unused credits rollover?", a: "No, credits reset every month to ensure we can maintain server speeds for all users. Pick the plan that fits your volume." }
        ]
    },
    finalCta: {
      title: "Ready to dominate your niche?",
      subtitle: "Join thousands of sellers who have automated their success. No credit card required for the first audit.",
      btn: "Start Scaling Now"
    }
  },
  tr: {
    nav: { features: "Özellikler", compare: "Karşılaştırma", pricing: "Fiyatlandırma", login: "Giriş Yap", tryDemo: "Demoyu Dene" },
    hero: {
      updateBadge: "Yeni: Gemini 2.5 Flash Entegrasyonu",
      titleLine1: "Analizle Vakit Kaybetme.",
      titleLine2: "Sıralamaya Gir.",
      subtitle: "Veri araçları sana sadece grafik verir. **Ranklistic** sana satış verir. Listelemelerini yazan, denetleyen ve strateji üreten ilk Yapay Zeka.",
      ctaPrimary: "Ücretsiz Analiz Başlat",
      ctaSecondary: "Nasıl Çalışır?"
    },
    demo: {
      title: "İnanmıyor musun?",
      titleHighlight: "Hemen Dene.",
      subtitle: "Aşağıya sıkıcı bir ürün başlığı yaz (Örn: 'Mavi Kupa') ve Ranklistic'in onu nasıl Top-Seller seviyesine getirdiğini izle.",
      placeholder: "Örn: T-Shirt, Gümüş Kolye veya Metal Tablo",
      button: "Sihir Yap",
      waiting: "Bir şeyler yazmanı bekliyorum...",
      beforeLabel: "Önce (Sıradan)",
      afterLabel: "Sonra (Ranklistic)",
      magicLabel: "Yapay Zeka Sihri",
      trafficLabel: "Trafik Potansiyeli",
      disclaimer: "* Bu canlı bir demudur. Gemini 2.5 Flash teknolojisi kullanılmaktadır.",
      limitReachedTitle: "Günlük Demo Limiti Doldu 🚀",
      limitReachedDesc: "Bugünlük 3 ücretsiz deneme hakkını kullandın. Ayda 50 kredi kazanmak için ücretsiz hesap oluştur.",
      limitBtn: "Ücretsiz Hesap Oluştur"
    },
    comparison: {
      title: "Farkımız Nedir?",
      trapTitle: "Analiz Tuzağı (Diğerleri)",
      trapItems: [
        "Sana sadece ham arama hacmi sayılarını verirler",
        "\"İşte veri bu, şimdi otur listelemeyi SEN yaz\"",
        "Anlamak için kurs almanı gerektiren karışık grafikler",
        "Sürekli manuel kontrol gerektirir"
      ],
      planTitle: "Ranklistic Yöntemi",
      planItems: [
        "Trendlere göre SEO başlıklarını otomatik yazar",
        "\"İşte bitmiş listeleme, kopyala-yapıştır yap\"",
        "Ürün fotoğraflarını Görsel Zeka ile analiz eder",
        "Rakip stratejilerini tersine mühendislikle çözer"
      ],
      tableFeatures: "Özellikler",
      tableUs: "Ranklistic (Aksiyon)",
      tableOthers: "Analiz Araçları (Erank)",
      tableGpt: "Standart ChatGPT",
      rows: [
        { name: "Listeleme Yazımı", us: "Tam Otomatik (Başlık+Açıklama+Etiket)", others: "Manuel Kelime Bulma", gpt: "Jenerik, Yapay Duruyor" },
        { name: "Görsel Fotoğraf Analizi", us: "Evet (Vision AI)", others: "Hayır", gpt: "Sınırlı" },
        { name: "Ana Hedef", us: "Hazır İçerik Üretmek", others: "Veri ve Arama Hacmi", gpt: "Sohbet Etmek" },
        { name: "Maliyet", us: "299₺ / ay", others: "$10 - $20 / ay", gpt: "600₺ / ay (Plus)" }
      ]
    },
    features: {
      audit: {
        title: "Kişisel",
        titleHighlight: "Mağaza Doktorun.",
        desc: "Satışların neden düşük diye düşünmeyi bırak. Ranklistic, mağazanı en iyi %1'lik satıcıların kullandığı 50+ kriterle tarar.",
        list: ["Acımasız ama gerçekçi bir 0-10 Sağlık Skoru", "Kırık veya yasaklı kelimeleri anında bulur", "Trafik kaçaklarını önlemek için yapılacaklar listesi"],
        cta: "Denetime Başla"
      },
      launchpad: {
        title: "Görsel Analiz ile",
        titleHighlight: "Kazananı Seç.",
        desc: "Satmayacak ürünler için malzeme harcama. Ham fotoğrafı veya çizimi yükle, Görsel Zekamız Etsy trendlerine göre estetik geçerliliğini analiz etsin.",
        list: ["Listelemeden önce anlık 'Satılabilirlik Skoru'", "Görselden otomatik Başlık ve Etiket üretimi", "Pinterest Viral Açıklama üreticisi dahil"],
        cta: "Görsel Analizi Dene"
      },
      competitor: {
        title: "Rakiplerini",
        titleHighlight: "Çözümle.",
        desc: "O mağaza neden kazanıyor? Linkini yapıştır. Etiketlerini, başlıklarını ve fiyatlandırma yapılarını analiz edip stratejilerini sana sunalım.",
        list: ["Rakiplerin gizli 'Güçlü Kelimelerini' bul", "Görsel estetiği yan yana kıyasla", "Onları geçmek için özel strateji al"],
        cta: "Casusluğa Başla"
      }
    },
    pricing: {
      title: "Tek Bir Satışla Maliyetini Çıkarır.",
      subtitle: "Tahmin etmeyi bırakın. Dominasyona başlayın.",
      starter: { 
          title: "Başlangıç",
          target: "Yeni Başlayanlar İçin", 
          btn: "Ücretsiz Dene", 
          features: [
              "**50 AI Kredisi / ay** (Yaklaşık 50 İşlem)", 
              "**Temel Mağaza Denetimi** (Hatalarını Bul)", 
              "**SEO Oluşturucu** (SEO'yu Otomatize Et)", 
              "E-posta Desteği"
          ] 
      },
      growth: { 
          title: "Büyüme", 
          target: "Ciddi Satıcılar İçin",
          btn: "Hemen Başla", 
          features: [
              "**200 AI Kredisi / ay** (Yüksek Hacim)", 
              "**Rakip Casus Aracı** (Stratejilerini Kopyala)", 
              "**Görsel Test Tarayıcısı** (Fotoğrafın Satar mı?)", 
              "**Global Pazar Tarayıcı** (Niş Bulucu)", 
              "Öncelikli Destek"
          ] 
      },
      agency: { 
          title: "Ajans", 
          target: "Danışmanlar İçin",
          btn: "Satışla İletişime Geç", 
          features: [
              "**1,000 AI Kredisi / ay** (Devasa Hacim)", 
              "**Logosuz (White-Label) PDF Raporlar** (Müşterine Sat)", 
              "Çoklu Mağaza Yönetim Paneli", 
              "Öncelikli API Erişimi", 
              "Ticari Kullanım Lisansı"
          ] 
      }
    },
    faq: {
        title: "Sıkça Sorulan Sorular",
        items: [
            { q: "Etsy mağazam için güvenli mi?", a: "Evet, kesinlikle. Sadece internetteki herkesin görebildiği halka açık verileri kullanırız. Şifrenizi istemeyiz, hesabınıza girmeyiz veya riskli API işlemleri yapmayız." },
            { q: "Yapay zeka ne kadar doğru?", a: "Google'ın e-ticaret için özelleştirilmiş Gemini 2.5 modellerini kullanıyoruz. Kesin satış garantisi verilemese de, kullanıcılarımız optimizasyon sonrası genelde %30-50 trafik artışı görmektedir." },
            { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet. Kontrat yok. Panelinizden tek tıkla aboneliğinizi durdurabilirsiniz." },
            { q: "Kullanılmayan krediler devreder mi?", a: "Hayır, sunucu hızını korumak için krediler her ay yenilenir. Hacminize uygun planı seçmenizi öneririz." }
        ]
    },
    finalCta: {
      title: "Nişini domine etmeye hazır mısın?",
      subtitle: "Başarısını otomatize eden binlerce satıcıya katıl. İlk denetim için kredi kartı gerekmez.",
      btn: "Büyümeye Başla"
    }
  }
};

const LiveActivityFeed: React.FC<{lang: Language}> = ({lang}) => {
    const [activity, setActivity] = useState<{user: string, action: string, flag: string, time: string}>({user: "", action: "", flag: "", time: ""});
    const [show, setShow] = useState(false);
    
    const getLocation = (userString: string) => {
        if (!userString || !userString.includes('(')) return '...';
        return userString.split('(')[1].replace(')', '');
    };

    useEffect(() => {
        const activities = [
            { user: "Sarah (Texas)", actionEn: "generated 13 SEO tags", actionTr: "13 SEO etiketi oluşturdu", flag: "🇺🇸" },
            { user: "Mehmet (Istanbul)", actionEn: "audited competitor gap", actionTr: "rakip analizi yaptı", flag: "🇹🇷" },
            { user: "Elena (Berlin)", actionEn: "checked shipping feasibility", actionTr: "kargo fizibilitesini kontrol etti", flag: "🇩🇪" },
            { user: "Liam (London)", actionEn: "created a new listing", actionTr: "yeni ürün listelemesi yaptı", flag: "🇬🇧" },
            { user: "Yuki (Tokyo)", actionEn: "analyzed product photo", actionTr: "ürün fotoğrafını analiz etti", flag: "🇯🇵" },
            { user: "Anna (Canada)", actionEn: "found a low competition niche", actionTr: "düşük rekabetli niş buldu", flag: "🇨🇦" },
            { user: "Carlos (Spain)", actionEn: "optimized shop title", actionTr: "mağaza başlığını optimize etti", flag: "🇪🇸" }
        ];
        
        const showNext = () => {
            setShow(false);
            setTimeout(() => {
                const random = activities[Math.floor(Math.random() * activities.length)];
                setActivity({
                    user: random.user, 
                    action: lang === 'tr' ? random.actionTr : random.actionEn, 
                    flag: random.flag, 
                    time: lang === 'tr' ? "Az önce" : "Just now"
                });
                setShow(true);
            }, 800); 
        };

        const interval = setInterval(showNext, 12000); 
        showNext(); 
        
        return () => clearInterval(interval);
    }, [lang]);

    return (
        <div className={`fixed bottom-6 left-6 z-50 transition-all duration-500 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} hidden md:block`}>
            <div className="flex items-center space-x-3 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg p-3 shadow-2xl max-w-xs">
                <div className="text-2xl">{activity.flag}</div>
                <div>
                    <div className="text-xs text-gray-400 font-medium flex justify-between w-full gap-4">
                        <span>
                            {lang === 'tr' 
                              ? `${getLocation(activity.user)} konumundan biri` 
                              : `Someone in ${getLocation(activity.user)}`
                            }
                        </span>
                        <span className="text-gray-500">{activity.time}</span>
                    </div>
                    <div className="text-sm font-bold text-white leading-tight">
                        {activity.action}
                    </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
        </div>
    );
};

const PricingCard: React.FC<PricingCardProps> = ({ title, target, price, originalPrice, billingNote, features, buttonText, onButtonClick, isPopular }) => {
    return (
        <div className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 group hover:scale-105 ${
            isPopular 
                ? 'bg-slate-800/80 border-orange-500 shadow-xl shadow-orange-900/20' 
                : 'bg-slate-900/50 border-gray-700 hover:border-gray-600'
        }`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                </div>
            )}
            <div className="mb-4">
                <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : 'text-gray-200'}`}>{title}</h3>
                <p className="text-sm text-gray-400">{target}</p>
            </div>
            
            <div className="mb-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{price}</span>
                    <span className="text-gray-500 text-lg">/mo</span>
                    {originalPrice && (
                        <span className="text-lg text-gray-500 line-through decoration-red-500 decoration-2 ml-1">
                            {originalPrice}
                        </span>
                    )}
                </div>
                {billingNote && (
                    <div className="text-xs text-green-400 font-bold mt-1 bg-green-900/20 w-fit px-2 py-0.5 rounded border border-green-500/20">
                        {billingNote}
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-white/5 mb-6 mt-4"></div>
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feat, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                        <CheckCircleIcon className={`w-5 h-5 mr-3 flex-shrink-0 ${isPopular ? 'text-orange-400' : 'text-gray-500'}`} />
                        <span dangerouslySetInnerHTML={{ __html: feat.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                ))}
            </ul>
            <button
                onClick={onButtonClick}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
                    isPopular
                        ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90 shadow-lg'
                        : 'bg-white text-gray-900 hover:bg-gray-200'
                }`}
            >
                {buttonText}
            </button>
        </div>
    );
};

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-700 rounded-xl bg-[#161b28] overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-bold text-white hover:bg-gray-800/50 transition-colors"
            >
                <span>{question}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
                <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-gray-700/50 bg-[#0d121f]">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FeatureCarousel = () => {
    const [slide, setSlide] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setSlide(prev => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const content = [
        {
            title: "Shop Health Audit",
            subtitle: "Find errors instantly.",
            color: "text-orange-500",
            icon: SearchIcon,
            render: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs uppercase font-bold">Health Score</span>
                            <span className="text-4xl font-bold text-white">8.4<span className="text-lg text-gray-500">/10</span></span>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center bg-green-500/10">
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-red-900/20 border border-red-500/30 p-2 rounded flex items-center gap-2">
                            <CloseIcon className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-200">Titles missing long-tail keywords</span>
                        </div>
                        <div className="bg-green-900/20 border border-green-500/30 p-2 rounded flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-200">Photography lighting is excellent</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "AI Listing Writer",
            subtitle: "Write SEO titles in seconds.",
            color: "text-pink-500",
            icon: GeneratorIcon,
            render: (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
                            <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=100" alt="Ring" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="h-2 bg-gray-700 rounded w-1/3 mb-1"></div>
                            <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-1 -top-1 w-full h-full bg-pink-500/20 blur-md rounded-lg"></div>
                        <div className="relative bg-gray-900 border border-pink-500/50 p-3 rounded-lg text-xs text-gray-200 font-mono">
                            <span className="text-pink-400 font-bold">Generated Title:</span><br/>
                            "Handmade Sterling Silver Ring, Boho Stackable Band, Minimalist Jewelry Gift for Her"
                        </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {['#silverring', '#bohojewelry', '#handmade'].map(t => (
                            <span key={t} className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">{t}</span>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Competitor Spy",
            subtitle: "See why they sell more.",
            color: "text-blue-500",
            icon: ScaleIcon,
            render: (
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs text-gray-400">Monthly Sales</span>
                    </div>
                    <div className="flex items-end gap-4 h-24">
                        <div className="w-1/2 bg-gray-800 rounded-t-lg relative group h-1/2">
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">You</span>
                        </div>
                        <div className="w-1/2 bg-blue-600 rounded-t-lg relative h-full">
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-blue-400 font-bold">Them</span>
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white text-blue-900 text-[10px] font-bold px-1.5 rounded">+420%</div>
                        </div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded text-[10px] text-blue-200 text-center">
                        Action: Add "Free Shipping" to match competitor.
                    </div>
                </div>
            )
        }
    ];

    const CurrentIcon = content[slide].icon;

    return (
        <div className="w-full max-w-[500px] mx-auto perspective-1000">
            {/* The Floating Card */}
            <div className="relative bg-[#111827] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.02]">
                
                {/* Fake Browser Top Bar */}
                <div className="bg-[#1F2937] px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
                    <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="bg-[#111827] text-gray-500 text-[9px] rounded px-2 py-0.5 inline-block font-mono">
                            ranklistic.com/app
                        </div>
                    </div>
                </div>

                {/* Main Content Area (Rotates) */}
                <div className="p-6 h-[320px] flex flex-col relative">
                    
                    {/* Header of the Slide */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className={`text-xl font-bold transition-colors duration-300 ${content[slide].color}`}>
                                {content[slide].title}
                            </h3>
                            <p className="text-gray-400 text-sm">{content[slide].subtitle}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-gray-800 border border-gray-700 transition-colors duration-300 ${content[slide].color}`}>
                            <CurrentIcon className="w-6 h-6" />
                        </div>
                    </div>

                    {/* The Rendered Mockup */}
                    <div className="flex-1 animate-fade-in relative">
                        {content[slide].render}
                    </div>

                    {/* Footer Nav Dots */}
                    <div className="flex justify-center gap-2 mt-auto pt-4">
                        {content.map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setSlide(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${slide === i ? `bg-white w-6` : 'bg-gray-700 hover:bg-gray-600'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative Glows */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[80px] -z-10 rounded-full opacity-20 transition-colors duration-1000 ${slide === 0 ? 'bg-orange-500' : slide === 1 ? 'bg-pink-500' : 'bg-blue-500'}`}></div>
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoginSuccess }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Billing State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Legal Modal State for Landing Page
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | 'refund' | null>(null);

  // Demo State
  const [demoInput, setDemoInput] = useState("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<{title: string, traffic: string} | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const t = translations[lang];

  // --- AUTOMATIC LEGAL MODAL FROM URL (For Stripe Verification) ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const legalParam = params.get('legal');
      if (legalParam === 'privacy') {
          setLegalType('privacy');
          setLegalModalOpen(true);
      } else if (legalParam === 'terms') {
          setLegalType('terms');
          setLegalModalOpen(true);
      } else if (legalParam === 'refund') {
          setLegalType('refund');
          setLegalModalOpen(true);
      }
  }, []);

  const handleOpenLogin = () => setShowLoginModal(true);
  const handleCloseLogin = () => setShowLoginModal(false);

  const handleOpenPolicy = (type: 'privacy' | 'terms' | 'refund') => {
      setLegalType(type);
      setLegalModalOpen(true);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  // --- GERÇEK AUTH FONKSİYONLARI (SUPABASE ENTEGRASYONU) ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
          setErrorMessage(lang === 'tr' ? "Lütfen email ve şifre girin." : "Please enter email and password.");
          return;
      }
      
      setLoginStatus('loading');
      setErrorMessage('');

      try {
          if (authMode === 'signup') {
              // --- KAYIT OLMA (Sign Up) ---
              const { data, error } = await supabase.auth.signUp({
                  email,
                  password,
              });
              if (error) throw error;
              
              alert(lang === 'tr' ? "Kayıt başarılı! Giriş yapabilirsiniz." : "Sign up successful! You can now login.");
              setAuthMode('signin'); 
              setLoginStatus('idle');
          } else {
              // --- GİRİŞ YAPMA (Sign In) ---
              const { error, data: authData } = await supabase.auth.signInWithPassword({
                  email,
                  password
              });
              
              if (error) throw error;

              // Giriş başarılıysa, kullanıcının PROFIL bilgilerini (kredi, plan vs.) tablodan çekiyoruz
              if (authData.user) {
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();
                  
                  if (profile) {
                      setLoginStatus('success');
                      // Kullanıcıyı içeri al
                      setTimeout(() => onLoginSuccess(profile as UserProfile), 500);
                  } else {
                      // Profil henüz oluşmamışsa (nadiren olur), auth verisiyle devam etmeyi deneyebilir veya hata verebiliriz
                      console.error("Profil bulunamadı:", profileError);
                      // Geçici bir obje ile devam et (Hata vermemesi için)
                      const tempProfile: UserProfile = {
                          id: authData.user.id,
                          email: authData.user.email!,
                          plan: 'free',
                          credits: 0
                      };
                      setLoginStatus('success');
                      setTimeout(() => onLoginSuccess(tempProfile), 500);
                  }
              }
          }
      } catch (e: any) {
          setLoginStatus('error');
          // Hata mesajını kullanıcıya göster
          setErrorMessage(e.message || "Authentication failed");
      }
  };

  // 2. Sosyal Medya ile Giriş
  const handleSocialLogin = async (provider: 'google' | 'github') => {
      const { error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
              redirectTo: window.location.origin // Giriş yapınca ana sayfaya geri dönsün
          }
      });
      if (error) alert(error.message);
  };

  // 3. Şifre Sıfırlama
  const handleForgotPassword = async () => {
    if (!email) {
        alert(lang === 'tr' ? "Lütfen önce email adresinizi girin." : "Please enter your email address first.");
        return;
    }
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Şifre sıfırlama linkine tıklayınca siteye dönsün
        });
        if (error) throw error;
        alert(lang === 'tr' ? "Şifre sıfırlama linki gönderildi!" : "Password reset link sent! Check your email.");
    } catch (e: any) {
        alert("Error: " + e.message);
    }
  };

  const runDemo = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!demoInput) return;

      // --- TOKEN LIMIT CHECK ---
      const STORAGE_KEY = 'ranklistic_demo_usage';
      const LIMIT = 3;
      const today = new Date().toDateString();
      
      let stored: { date: string, count: number } = { date: today, count: 0 };
      try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) stored = JSON.parse(raw);
          // If date mismatch, reset
          if (stored.date !== today) {
              stored = { date: today, count: 0 };
          }
      } catch (err) {
          console.error("Storage error", err);
      }

      if (stored.count >= LIMIT) {
          setIsLimitReached(true);
          return;
      }

      // Increment Count
      stored.count++;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      // --------------------------
      
      setIsDemoLoading(true);
      setDemoResult(null);

      try {
          const smartTitle = await generateDemoTitle(demoInput);
          setDemoResult({
              title: smartTitle,
              traffic: "+420%"
          });
      } catch (e) {
          // New 2025 Standard Fallback
          let smartTitle = `Handcrafted ${demoInput} with Custom Engraving - Minimalist Modern Home Decor Gift`;
          setDemoResult({
              title: smartTitle,
              traffic: "+380%"
          });
      } finally {
          setIsDemoLoading(false);
      }
  };

  // ... (Helper functions getPrice, getOriginalPrice, getBillingNote - same as existing)
  const getPrice = (plan: 'starter' | 'growth' | 'agency') => {
    const isTr = lang === 'tr';
    const base = isTr 
        ? (plan === 'starter' ? 299 : plan === 'growth' ? 999 : 3499)
        : (plan === 'starter' ? 9 : plan === 'growth' ? 29 : 99);
    
    if (billingCycle === 'annual' && plan !== 'starter') {
        const discounted = Math.floor(base * 0.8);
        return isTr ? `${discounted}₺` : `$${discounted}`;
    }
    return isTr ? `${base}₺` : `$${base}`;
  };

  const getOriginalPrice = (plan: 'starter' | 'growth' | 'agency') => {
      if (billingCycle === 'monthly' || plan === 'starter') return undefined;
      const isTr = lang === 'tr';
      const base = isTr 
        ? (plan === 'growth' ? 999 : 3499)
        : (plan === 'growth' ? 29 : 99);
      
      return isTr ? `${base}₺` : `$${base}`;
  };

  const getBillingNote = (plan: 'starter' | 'growth' | 'agency') => {
      const isTr = lang === 'tr';
      if (billingCycle === 'monthly') return undefined;
      const baseMonthly = isTr 
        ? (plan === 'starter' ? 299 : plan === 'growth' ? 999 : 3499)
        : (plan === 'starter' ? 9 : plan === 'growth' ? 29 : 99);
      
      let finalMonthly = baseMonthly;
      if (plan !== 'starter') {
          finalMonthly = Math.floor(baseMonthly * 0.8);
      }
      const totalYearly = finalMonthly * 12;
      if (plan === 'starter') {
          return isTr ? `Yıllık faturalandırılır: ${totalYearly}₺` : `Billed $${totalYearly} yearly`;
      }
      return isTr 
        ? `Yıllık ${totalYearly}₺ (%20 İndirim)` 
        : `Billed $${totalYearly} yearly (Save 20%)`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden relative">
      
      {/* Announcement Bar at TOP */}
      <AnnouncementBar />

      <LiveActivityFeed lang={lang} />

      {/* GLOBAL ANIMATION STYLES */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>

      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* NAVIGATION - BU KISMI DİKKATLİCE DEĞİŞTİR */}
      <nav className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl py-6 flex justify-between items-center sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 shadow-sm">
        <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative">
             <div className="absolute inset-0 bg-orange-500 blur-sm opacity-50 group-hover:opacity-100 transition-opacity rounded-full"></div>
             <TrendingUpIcon className="w-8 h-8 text-orange-500 relative z-10" />
          </div>
          <span className="text-xl font-bold tracking-tight">Ranklistic</span>
        </div>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300 items-center">
          <a href="#demo" className="hover:text-white transition-colors">{t.nav.tryDemo}</a>
          <a href="#features" className="hover:text-white transition-colors">{t.nav.features}</a>
          <a href="#comparison" className="hover:text-white transition-colors">{t.nav.compare}</a>
          <a href="#pricing" className="hover:text-white transition-colors">{t.nav.pricing}</a>
        </div>
        
        <div className="flex items-center space-x-4">
            <button onClick={handleOpenLogin} className="text-gray-300 hover:text-white font-bold text-sm px-2">
              {t.nav.login}
            </button>
            <button onClick={handleOpenLogin} className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-6 py-2.5 rounded-full font-bold hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform hover:scale-105 text-sm">
              GET STARTED
            </button>
        </div>
      </nav> {/* NAV BURADA KAPANIYOR - KRİTİK NOKTA! */}

      {/* HERO SECTION */}
      <header className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Left Content */}
            <div className="md:w-1/2 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-xs md:text-sm mb-6 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span>{t.hero.updateBadge}</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
                  {t.hero.titleLine1} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 animate-gradient-x">
                    {t.hero.titleLine2}
                  </span>
                </h1>
                
                <p className="text-lg text-gray-400 max-w-lg mx-auto md:mx-0 mb-8 leading-relaxed">
                   {t.hero.subtitle.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <button 
                    onClick={handleOpenLogin}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-pink-600 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1 relative overflow-hidden group"
                  >
                    <span className="relative z-10">{t.hero.ctaPrimary}</span>
                    <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-orange-500/30"></div>
                  </button>
                  <a href="#demo" onClick={(e) => scrollToSection(e, 'demo')} className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group cursor-pointer">
                    <span className="group-hover:text-orange-400 transition-colors">{t.hero.ctaSecondary}</span>
                    <SparklesIcon className="w-5 h-5 group-hover:animate-spin" />
                  </a>
                </div>
            </div>

             {/* Right Content: 3D App Preview Carousel */}
            <div className="md:w-1/2 relative hidden md:block">
                <FeatureCarousel />
            </div>
        </div>
      </header>

      {/* Infinite Marquee */}
      <div className="bg-[#0B0F19] border-y border-white/5 py-8 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0F19] via-[#0B0F19]/80 to-transparent z-10"></div>
          
          <div className="flex animate-scroll w-[200%]">
              <div className="flex space-x-16 items-center min-w-full justify-around px-8">
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><StarIcon className="w-6 h-6"/> CraftyCo</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><RocketIcon className="w-6 h-6"/> SellerBoost</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><ScaleIcon className="w-6 h-6"/> NicheHunter</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><PrinterIcon className="w-6 h-6"/> PrintMaster</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><SearchIcon className="w-6 h-6"/> RankHigh</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6"/> VerifiedShop</span>
              </div>
              <div className="flex space-x-16 items-center min-w-full justify-around px-8">
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><StarIcon className="w-6 h-6"/> CraftyCo</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><RocketIcon className="w-6 h-6"/> SellerBoost</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><ScaleIcon className="w-6 h-6"/> NicheHunter</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><PrinterIcon className="w-6 h-6"/> PrintMaster</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><SearchIcon className="w-6 h-6"/> RankHigh</span>
                  <span className="text-2xl font-bold text-gray-600 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6"/> VerifiedShop</span>
              </div>
          </div>
      </div>

       {/* DEMO SECTION */}
       <section id="demo" className="py-24 relative z-10 bg-[#0B0F19]">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-4xl">
              <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.demo.title} <span className="text-orange-400">{t.demo.titleHighlight}</span></h2>
                  <p className="text-gray-400">{t.demo.subtitle}</p>
              </div>

              <div className="bg-[#161b28] border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500"></div>
                  
                  {isLimitReached ? (
                      <div className="text-center py-8 animate-fade-in">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-900/50">
                              <RocketIcon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{t.demo.limitReachedTitle}</h3>
                          <p className="text-gray-400 mb-8 max-w-md mx-auto">{t.demo.limitReachedDesc}</p>
                          <button 
                            onClick={handleOpenLogin}
                            className="bg-white text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl"
                          >
                              {t.demo.limitBtn}
                          </button>
                      </div>
                  ) : (
                      <>
                        <form onSubmit={runDemo} className="flex flex-col sm:flex-row gap-4 mb-8">
                            <input 
                                type="text" 
                                value={demoInput}
                                onChange={(e) => setDemoInput(e.target.value)}
                                placeholder={t.demo.placeholder} 
                                className="flex-1 p-4 bg-gray-900 border border-gray-600 rounded-xl text-white text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                            <button 
                                type="submit" 
                                disabled={isDemoLoading || !demoInput}
                                className="bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 min-w-[160px]"
                            >
                                {isDemoLoading ? (
                                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>{t.demo.button}</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {demoResult && (
                            <div className="animate-fade-in space-y-4">
                                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <div className="text-xs text-red-400 uppercase font-bold mb-1">{t.demo.beforeLabel}</div>
                                    <div className="text-gray-400 line-through">{demoInput}</div>
                                </div>
                                <div className="flex flex-col items-center justify-center py-2">
                                    <div className="w-0.5 h-8 bg-gray-700"></div>
                                    <div className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300">{t.demo.magicLabel}</div>
                                    <div className="w-0.5 h-8 bg-gray-700"></div>
                                </div>
                                <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg relative overflow-hidden">
                                    <div className="text-xs text-green-400 uppercase font-bold mb-1">{t.demo.afterLabel}</div>
                                    <div className="text-white text-lg font-bold">{demoResult.title}</div>
                                    <div className="absolute top-4 right-4 bg-green-500 text-black font-bold px-3 py-1 rounded-full text-xs animate-bounce shadow-lg">
                                        {t.demo.trafficLabel}: {demoResult.traffic}
                                    </div>
                                </div>
                                <p className="text-center text-gray-500 text-sm mt-4">
                                    {t.demo.disclaimer}
                                </p>
                            </div>
                        )}

                        {!demoResult && !isDemoLoading && (
                            <div className="text-center text-gray-600 text-sm italic">
                                {t.demo.waiting}
                            </div>
                        )}
                      </>
                  )}
              </div>
          </div>
       </section>

      {/* COMPARISON TABLE */}
      <section id="comparison" className="py-24 relative z-10 bg-[#0B0F19]">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-5xl">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.comparison.title}</h2>
                  <div className="flex justify-center gap-8 mt-8">
                      <div className="text-left">
                          <h3 className="text-red-400 font-bold mb-2">{t.comparison.trapTitle}</h3>
                          <ul className="text-sm text-gray-400 space-y-2">
                              {t.comparison.trapItems.map((item, i) => <li key={i}>❌ {item}</li>)}
                          </ul>
                      </div>
                      <div className="w-px bg-gray-700"></div>
                      <div className="text-left">
                          <h3 className="text-green-400 font-bold mb-2">{t.comparison.planTitle}</h3>
                          <ul className="text-sm text-gray-400 space-y-2">
                              {t.comparison.planItems.map((item, i) => <li key={i}>✅ {item}</li>)}
                          </ul>
                      </div>
                  </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-700 shadow-2xl">
                  <table className="w-full text-left bg-[#161b28]">
                      <thead>
                          <tr className="border-b border-gray-700 bg-gray-900">
                              <th className="p-6 text-gray-400 font-medium">{t.comparison.tableFeatures}</th>
                              <th className="p-6 text-orange-400 font-bold text-lg bg-orange-900/10 border-x border-orange-500/20">{t.comparison.tableUs}</th>
                              <th className="p-6 text-gray-400 font-medium">{t.comparison.tableOthers}</th>
                              <th className="p-6 text-gray-400 font-medium">{t.comparison.tableGpt}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                          {t.comparison.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                                  <td className="p-6 font-bold text-white">{row.name}</td>
                                  <td className="p-6 text-green-400 font-bold bg-orange-900/5 border-x border-orange-500/10"><CheckCircleIcon className="w-5 h-5 inline mr-2"/>{row.us}</td>
                                  <td className="p-6 text-gray-400">{row.others}</td>
                                  <td className="p-6 text-gray-400">{row.gpt}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 bg-[#0B0F19]">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl space-y-32">
              
              {/* Feature 1: Audit */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                  <div className="md:w-1/2">
                      <div className="bg-orange-500/20 p-3 rounded-lg w-fit mb-6"><SearchIcon className="w-8 h-8 text-orange-500"/></div>
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.features.audit.title} <br/><span className="text-orange-400">{t.features.audit.titleHighlight}</span></h2>
                      <p className="text-lg text-gray-400 leading-relaxed mb-8">{t.features.audit.desc}</p>
                      <ul className="space-y-3 mb-8">
                          {t.features.audit.list.map((item, i) => (<li key={i} className="flex items-center gap-3 text-gray-300"><CheckCircleIcon className="w-5 h-5 text-green-500"/> {item}</li>))}
                      </ul>
                      <button onClick={handleOpenLogin} className="text-orange-400 font-bold hover:text-orange-300 flex items-center gap-2 text-lg">{t.features.audit.cta} &rarr;</button>
                  </div>
                  <div className="md:w-1/2 relative">
                      <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>
                      <div className="relative bg-[#161b28] border border-gray-700 rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                          <div className="flex items-center justify-between mb-4"><span className="font-bold text-xl">Shop Score</span><span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">4.2/10</span></div>
                          <div className="h-2 bg-gray-700 rounded-full mb-6"><div className="w-[42%] h-full bg-red-500 rounded-full"></div></div>
                          <div className="space-y-3">
                              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-200 flex gap-2"><CloseIcon className="w-4 h-4 mt-0.5"/> Missing 13 tags on 4 listings.</div>
                              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-sm text-yellow-200 flex gap-2"><StarIcon className="w-4 h-4 mt-0.5"/> Titles are too short for SEO.</div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Feature 2: Visual Launchpad */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                  <div className="md:w-1/2">
                      <div className="bg-pink-500/20 p-3 rounded-lg w-fit mb-6"><RocketIcon className="w-8 h-8 text-pink-500"/></div>
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.features.launchpad.title} <br/><span className="text-pink-500">{t.features.launchpad.titleHighlight}</span></h2>
                      <p className="text-lg text-gray-400 leading-relaxed mb-8">{t.features.launchpad.desc}</p>
                      <ul className="space-y-3 mb-8">
                          {t.features.launchpad.list.map((item, i) => (<li key={i} className="flex items-center gap-3 text-gray-300"><CheckCircleIcon className="w-5 h-5 text-green-500"/> {item}</li>))}
                      </ul>
                      <button onClick={handleOpenLogin} className="text-pink-500 font-bold hover:text-pink-400 flex items-center gap-2 text-lg">{t.features.launchpad.cta} &rarr;</button>
                  </div>
                  <div className="md:w-1/2 relative">
                      <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full"></div>
                      <div className="relative bg-[#161b28] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=500" className="w-full h-48 object-cover opacity-50" alt="Product" />
                          <div className="p-6 relative">
                              <div className="absolute -top-10 right-6 bg-green-500 text-black font-bold px-4 py-2 rounded-lg shadow-lg">9.2/10 Viability</div>
                              <h3 className="font-bold text-lg text-white mb-2">Gold Pendant Necklace</h3>
                              <p className="text-sm text-gray-400 mb-4">"High potential for 'Minimalist Jewelry' niche. Suggest pricing: $45-$60."</p>
                              <div className="flex gap-2"><span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">#goldjewelry</span><span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">#giftforher</span></div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Feature 3: Competitor Spy */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                  <div className="md:w-1/2">
                      <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-6"><ScaleIcon className="w-8 h-8 text-blue-500"/></div>
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.features.competitor.title} <br/><span className="text-blue-500">{t.features.competitor.titleHighlight}</span></h2>
                      <p className="text-lg text-gray-400 leading-relaxed mb-8">{t.features.competitor.desc}</p>
                      <ul className="space-y-3 mb-8">
                          {t.features.competitor.list.map((item, i) => (<li key={i} className="flex items-center gap-3 text-gray-300"><CheckCircleIcon className="w-5 h-5 text-green-500"/> {item}</li>))}
                      </ul>
                      <button onClick={handleOpenLogin} className="text-blue-500 font-bold hover:text-blue-400 flex items-center gap-2 text-lg">{t.features.competitor.cta} &rarr;</button>
                  </div>
                  <div className="md:w-1/2 relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                      <div className="relative bg-[#161b28] border border-gray-700 rounded-2xl p-6 shadow-2xl">
                          <div className="flex justify-between border-b border-gray-700 pb-4 mb-4">
                              <div><div className="text-xs text-gray-500 uppercase">You</div><div className="text-xl font-bold text-red-400">12 Sales/mo</div></div>
                              <div className="text-right"><div className="text-xs text-gray-500 uppercase">Competitor</div><div className="text-xl font-bold text-green-400">450 Sales/mo</div></div>
                          </div>
                          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                              <div className="text-xs text-blue-300 font-bold uppercase mb-2">Strategy Gap</div>
                              <p className="text-sm text-gray-300">They use "Free Shipping Guarantee" and focus on "Gift" keywords. You don't.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 relative z-10 bg-[#0d121f]">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
              <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.pricing.title}</h2>
                  <p className="text-gray-400">{t.pricing.subtitle}</p>
              </div>
              
              <div className="flex items-center justify-center gap-4 bg-slate-900/80 p-1.5 rounded-full border border-white/10 mb-12 w-fit mx-auto relative z-10">
                  <button 
                    onClick={() => setBillingCycle('monthly')} 
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                      {lang === 'tr' ? 'Aylık' : 'Monthly'}
                  </button>
                  <button 
                    onClick={() => setBillingCycle('annual')} 
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                      {lang === 'tr' ? 'Yıllık' : 'Annual'}
                      <span className={`text-[10px] bg-white text-orange-600 px-1.5 rounded-sm font-extrabold ${billingCycle === 'annual' ? 'opacity-100' : 'opacity-70 bg-gray-700 text-white'}`}>-20%</span>
                  </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  <PricingCard 
                    title={t.pricing.starter.title} 
                    target={t.pricing.starter.target} 
                    price={getPrice('starter')} 
                    originalPrice={getOriginalPrice('starter')} 
                    billingNote={getBillingNote('starter')} 
                    features={t.pricing.starter.features} 
                    buttonText={t.pricing.starter.btn} 
                    onButtonClick={handleOpenLogin} 
                  />
                  <PricingCard 
                    title={t.pricing.growth.title} 
                    target={t.pricing.growth.target} 
                    price={getPrice('growth')} 
                    originalPrice={getOriginalPrice('growth')} 
                    billingNote={getBillingNote('growth')} 
                    isPopular 
                    features={t.pricing.growth.features} 
                    buttonText={t.pricing.growth.btn} 
                    onButtonClick={handleOpenLogin} 
                  />
                  <PricingCard 
                    title={t.pricing.agency.title} 
                    target={t.pricing.agency.target} 
                    price={getPrice('agency')} 
                    originalPrice={getOriginalPrice('agency')} 
                    billingNote={getBillingNote('agency')} 
                    features={t.pricing.agency.features} 
                    buttonText={t.pricing.agency.btn} 
                    onButtonClick={handleOpenLogin} 
                  />
              </div>
          </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 relative z-10 bg-[#0B0F19]">
          <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-3xl">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t.faq.title}</h2>
              </div>
              <div className="space-y-4">
                  {t.faq.items.map((item, i) => (
                      <FAQItem key={i} question={item.q} answer={item.a} />
                  ))}
              </div>
          </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] to-[#1a1f2e]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-orange-600/10 blur-[100px] rounded-full"></div>
          
          <div className="container mx-auto px-6 text-center relative z-20">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">{t.finalCta.title}</h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">{t.finalCta.subtitle}</p>
              <button 
                onClick={handleOpenLogin}
                className="px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)]"
              >
                  {t.finalCta.btn}
              </button>
          </div>
      </section>

      <Footer lang={lang} onOpenPolicy={handleOpenPolicy} />

      {/* --- YENİ GİRİŞ PENCERESİ --- */}
      {showLoginModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                  
                  <button onClick={handleCloseLogin} className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                  
                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-4">
                          {authMode === 'signin' ? (lang === 'tr' ? 'Tekrar Hoşgeldin' : 'Welcome Back') : (lang === 'tr' ? 'Hesap Oluştur' : 'Create Account')}
                      </h2>
                      <div className="flex p-1 bg-gray-900 rounded-lg">
                          <button 
                              onClick={() => setAuthMode('signin')}
                              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'signin' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                              {lang === 'tr' ? 'Giriş Yap' : 'Login'}
                          </button>
                          <button 
                              onClick={() => setAuthMode('signup')}
                              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${authMode === 'signup' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                              {lang === 'tr' ? 'Kaydol' : 'Sign Up'}
                          </button>
                      </div>
                  </div>
                  
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          <input 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none" 
                              placeholder="you@example.com"
                              required 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">{lang === 'tr' ? 'Şifre' : 'Password'}</label>
                          <input 
                              type="password" 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none" 
                              placeholder="••••••••"
                              required 
                              minLength={6}
                          />
                      </div>

                      <div className="flex justify-end mt-1">
                          <button 
                              type="button"
                              onClick={handleForgotPassword}
                              className="text-xs text-gray-400 hover:text-white transition-colors hover:underline"
                          >
                              Forgot Password?
                          </button>
                      </div>

                      {loginStatus === 'error' && (<div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/20">{errorMessage}</div>)}
                      
                      <button type="submit" disabled={loginStatus === 'loading'} className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg font-bold text-white hover:shadow-lg transition-all disabled:opacity-50">
                          {loginStatus === 'loading' ? '...' : (authMode === 'signin' ? (lang === 'tr' ? 'Giriş Yap' : 'Login') : (lang === 'tr' ? 'Kaydol' : 'Sign Up'))}
                      </button>
                  </form>

                  <div className="mt-6">
                      <div className="relative mb-4">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                          <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-400">{lang === 'tr' ? 'veya' : 'or continue with'}</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center py-2.5 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors bg-white text-black font-bold">
                              <span className="mr-2">G</span> Google
                          </button>
                          <button onClick={() => handleSocialLogin('github')} className="flex items-center justify-center py-2.5 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors bg-[#24292e] text-white font-bold">
                              GitHub
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <LegalModal isOpen={legalModalOpen} type={legalType} onClose={() => setLegalModalOpen(false)} lang={lang} />
    </div> // div kapatıldı
  ); // return kapatıldı
}; // bileşen kapatıldı