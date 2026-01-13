
import React, { useState, useEffect } from 'react';
import { SparklesIcon, RocketIcon, CheckCircleIcon, TrendingUpIcon } from './icons';

interface ComingSoonProps {
    onBypass: () => void; // Secret way to enter the app for devs
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ onBypass }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [count, setCount] = useState(2418); // Fake initial waitlist count

    // Fake live counter effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.6) {
                setCount(prev => prev + 1);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            localStorage.setItem('ranklistic_waitlist', 'true');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-orange-500 selection:text-white flex flex-col relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full mix-blend-screen filter blur-[120px]"></div>

            {/* Navbar */}
            <nav className="w-full p-6 flex justify-between items-center relative z-20">
                <div className="flex items-center space-x-2">
                    <TrendingUpIcon className="w-8 h-8 text-orange-500" />
                    <span className="text-xl font-bold tracking-tight">Ranklistic AI</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
                
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span>Opening Soon for Beta Users</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight max-w-4xl leading-[1.1]">
                    Stop Guessing. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                        Start Dominating Etsy.
                    </span>
                </h1>

                <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
                    The first AI that doesn't just show you data—it <strong>writes your listings</strong>, audits your shop, and spies on competitors. Get early access before we launch on Product Hunt.
                </p>

                {/* Waitlist Form */}
                <div className="w-full max-w-md relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    
                    {status === 'success' ? (
                        <div className="relative bg-gray-900 ring-1 ring-white/10 rounded-xl p-8 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
                            <p className="text-gray-400 text-sm">We'll notify you as soon as spots open up.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="relative flex p-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address..." 
                                className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 focus:outline-none"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className="bg-white text-gray-900 hover:bg-gray-200 font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {status === 'loading' ? 'Joining...' : <>Join Waitlist <RocketIcon className="w-4 h-4" /></>}
                            </button>
                        </form>
                    )}
                </div>

                {/* Social Proof */}
                <div className="mt-8 flex flex-col items-center space-y-2">
                    <div className="flex -space-x-2">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-gray-700 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                <img src={`https://randomuser.me/api/portraits/thumb/men/${i+20}.jpg`} alt="User" className="w-full h-full object-cover opacity-80" />
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">
                        Join <span className="text-white font-bold">{count.toLocaleString()}</span> sellers waiting for access.
                    </p>
                </div>

                {/* Feature Pills */}
                <div className="mt-16 flex flex-wrap justify-center gap-4 opacity-60">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm">
                        <SparklesIcon className="w-4 h-4 text-purple-400" /> AI Listing Writer
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm">
                        <TrendingUpIcon className="w-4 h-4 text-green-400" /> Competitor Spy
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm">
                        <RocketIcon className="w-4 h-4 text-orange-400" /> Rank #1
                    </div>
                </div>

            </main>

            <footer className="p-6 text-center text-gray-600 text-xs relative z-10">
                &copy; {new Date().getFullYear()} Ranklistic Inc. Made for Product Hunt.
            </footer>
        </div>
    );
};
