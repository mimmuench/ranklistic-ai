
import React, { useState, useRef } from 'react';
import { CloseIcon, UserIcon, CreditCardIcon, BrandIcon, CheckCircleIcon, PrinterIcon, StarIcon, SaveIcon, KeyIcon } from './icons';
import { supabaseMock, UserProfile } from '../services/supabaseService';
import type { UserSettings } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    settings: UserSettings;
    onSaveSettings: (newSettings: UserSettings) => void;
    onOpenSubscription: () => void;
    lang: 'en' | 'tr';
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String); // Keep full data URI
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, settings, onSaveSettings, onOpenSubscription, lang }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'branding'>('profile');
    const [formData, setFormData] = useState<UserSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    
    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call for settings
        setTimeout(() => {
            onSaveSettings(formData);
            setIsSaving(false);
        }, 800);
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword) return;
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: lang === 'tr' ? "Şifreler eşleşmiyor" : "Passwords do not match" });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: lang === 'tr' ? "Şifre en az 6 karakter olmalı" : "Password must be at least 6 chars" });
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabaseMock.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordMsg({ type: 'success', text: lang === 'tr' ? "Şifre güncellendi!" : "Password updated successfully!" });
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            setPasswordMsg({ type: 'error', text: e.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await blobToBase64(file);
            setFormData({...formData, brandLogo: base64});
        }
    };

    const isAgency = user.plan === 'agency';
    const defaultName = isAgency ? "Agency Administrator" : "Store Owner";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#0F172A] border border-gray-700 rounded-2xl w-full max-w-4xl h-[600px] shadow-2xl flex overflow-hidden animate-fade-in-up">
                
                {/* Sidebar Navigation */}
                <div className="w-64 bg-[#0B1120] border-r border-gray-800 p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-8">Settings</h2>
                    <nav className="space-y-2 flex-1">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <UserIcon className="w-5 h-5" />
                            <span className="font-medium">Profile & Security</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('billing')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'billing' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <CreditCardIcon className="w-5 h-5" />
                            <span className="font-medium">Billing</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('branding')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'branding' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <BrandIcon className="w-5 h-5" />
                            <span className="font-medium">Branding</span>
                            {!isAgency && <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded ml-auto">PRO</span>}
                        </button>
                    </nav>
                    <div className="text-xs text-gray-600 text-center">v2.5.0</div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-[#1E293B]">
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#1E293B]">
                        <h3 className="text-xl font-bold text-white capitalize">{activeTab} Settings</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full transition-colors">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        
                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 max-w-lg">
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold text-lg">General Info</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                        <input type="email" value={user.email} disabled className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                        <input type="text" defaultValue={defaultName} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.notifications} 
                                                onChange={e => setFormData({...formData, notifications: e.target.checked})}
                                                className="w-5 h-5 rounded bg-gray-900 border-gray-600 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-300">Receive email notifications for audit reports</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-6">
                                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                        <KeyIcon className="w-5 h-5 text-orange-500"/>
                                        Change Password
                                    </h4>
                                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">New Password</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:border-orange-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:border-orange-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        
                                        {passwordMsg && (
                                            <div className={`text-xs p-2 rounded ${passwordMsg.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                                {passwordMsg.text}
                                            </div>
                                        )}

                                        <div className="flex justify-end">
                                            <button 
                                                onClick={handlePasswordUpdate}
                                                disabled={isSaving || !newPassword}
                                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BILLING TAB */}
                        {activeTab === 'billing' && (
                            <div className="space-y-8">
                                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-400 text-sm font-bold uppercase mb-1">Current Plan</div>
                                        <div className="text-3xl font-extrabold text-white capitalize">{user.plan}</div>
                                    </div>
                                    <button onClick={onOpenSubscription} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
                                        Manage Subscription
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2"><StarIcon className="w-5 h-5 text-yellow-500"/> Credits Remaining</h4>
                                        <div className="text-4xl font-bold text-white mb-2">{user.credits}</div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <div className="bg-yellow-500 h-full w-1/2"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Refills on 1st of month.</p>
                                    </div>
                                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500"/> Plan Status</h4>
                                        <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active
                                        </div>
                                        <p className="text-sm text-gray-400">Next billing date: Oct 24, 2025</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BRANDING TAB */}
                        {activeTab === 'branding' && (
                            <div className="space-y-8 relative">
                                {!isAgency && (
                                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8 rounded-xl border border-purple-500/30">
                                        <div className="bg-purple-600 p-4 rounded-full mb-4 shadow-lg shadow-purple-900/50">
                                            <BrandIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Agency Feature Locked</h3>
                                        <p className="text-gray-300 max-w-md mb-6">Upgrade to the Agency plan to unlock White-Label reporting. Replace Ranklistic branding with your own.</p>
                                        <button onClick={onOpenSubscription} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                                            Upgrade to Agency
                                        </button>
                                    </div>
                                )}

                                <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-6">
                                    <h4 className="text-purple-300 font-bold mb-2">White Label Settings</h4>
                                    <p className="text-sm text-gray-400 mb-6">These details will appear on all PDF exports and print views instead of Ranklistic branding.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Agency / Business Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.brandName || ''}
                                                onChange={e => setFormData({...formData, brandName: e.target.value})}
                                                placeholder="e.g. Acme Consulting" 
                                                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500" 
                                                disabled={!isAgency}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Logo Upload</label>
                                            <div className="flex items-center gap-4">
                                                {formData.brandLogo ? (
                                                    <div className="w-20 h-20 bg-white rounded-lg p-2 object-contain overflow-hidden border border-gray-600">
                                                        <img src={formData.brandLogo} alt="Brand Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="w-20 h-20 bg-gray-800 rounded-lg border border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xs">No Logo</div>
                                                )}
                                                <div>
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef} 
                                                        onChange={handleLogoUpload}
                                                        className="hidden" 
                                                        accept="image/*"
                                                        disabled={!isAgency}
                                                    />
                                                    <button 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors"
                                                        disabled={!isAgency}
                                                    >
                                                        Choose File
                                                    </button>
                                                    <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px PNG</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-white font-bold">Preview Report Header</h4>
                                        <p className="text-xs text-gray-400">How it looks on PDF</p>
                                    </div>
                                    <div className="bg-white px-6 py-4 rounded shadow-sm w-1/2 flex items-center gap-3">
                                        {formData.brandLogo ? (
                                            <img src={formData.brandLogo} alt="Logo" className="h-8 object-contain" />
                                        ) : (
                                            <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Logo</div>
                                        )}
                                        <span className="text-black font-bold text-lg">{formData.brandName || "Agency Name"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-700 bg-[#1E293B] flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white font-bold mr-4">Close</button>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : <><SaveIcon className="w-4 h-4"/> Save Profile</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
