import React, { useState } from 'react';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Stepper from '../ui/Stepper';
import ThemeCard from '../ui/ThemeCard';
import AvatarUpload from '../ui/AvatarUpload';
import { 
    CheckCircleIcon, 
    LinkIcon, 
    AtSymbolIcon, 
    MusicalNoteIcon, 
    PlayCircleIcon, 
    CheckBadgeIcon, 
    ArrowRightIcon 
} from '@heroicons/react/24/outline';

const ONBOARDING_STEPS = [
    { label: 'Profile' },
    { label: 'Content' },
    { label: 'Finish' },
];

const MOCK_EXISTING_DOMAINS = ['admin', 'orbit', 'tepak', 'studio'];

const domainSchema = z.string()
    .min(3, "Minimal 3 karakter")
    .regex(/^[a-zA-Z0-9-]+$/, "Error format")
    .refine((val) => !MOCK_EXISTING_DOMAINS.includes(val.toLowerCase()), "Subdomain telah digunakan");

export const OnboardingForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [domain, setDomain] = useState('yourname');
    const [selectedTheme, setSelectedTheme] = useState('atelier-dark');

    // STEP 2 STATES
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [socials, setSocials] = useState({ ig: '', tt: '', yt: '' });

    // VALIDATION STATES
    const [errors, setErrors] = useState<{ domain?: string }>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const themes = [
        { id: 'atelier-dark', name: 'Atelier Dark', gradient: 'bg-slate-900 shadow-2xl' },
        { id: 'clean-minimal', name: 'Clean Minimal', gradient: 'bg-white border-2 border-slate-100 shadow-sm' },
        { id: 'sunrise-glow', name: 'Sunrise Glow', gradient: 'bg-gradient-to-br from-amber-100 to-rose-200' },
    ];

    const nextStep = async () => {
        setApiError(null);
        if (currentStep === 0) {
            const result = domainSchema.safeParse(domain);
            if (!result.success) {
                setErrors({ domain: result.error.errors[0].message });
                return;
            }
            setErrors({});
        }

        if (currentStep === 1) {
            setIsSubmitting(true);
            try {
                // Save domain
                const domainRes = await fetch('/api/settings/domain', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain_name: domain })
                });
                
                const domainData = await domainRes.json();
                if (!domainRes.ok) {
                    throw new Error(domainData.error || 'Terjadi kesalahan saat menyimpan domain');
                }

                // Save profile settings
                const profileRes = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: fullName,
                        bio: bio
                    })
                });

                if (!profileRes.ok) {
                    const profileData = await profileRes.json();
                    throw new Error(profileData.error || 'Terjadi kesalahan saat menyimpan profil');
                }

            } catch (err: any) {
                console.error('Save Onboarding Error:', err);
                setApiError(err.message);
                setIsSubmitting(false);
                return; // Stop and don't go to next step
            }
            setIsSubmitting(false);
        }

        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto ">
            
            {/* STEPPER */}
            <Stepper steps={ONBOARDING_STEPS} currentStep={currentStep} className="mb-14" />

            {/* MAIN CONTENT CARD */}
            <div className="bg-white rounded-[3.5rem] p-10 md:p-20 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
                
                {currentStep === 0 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <header className="text-center space-y-6">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Step 01 — Identity</span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase whitespace-pre-line leading-tight">Claim Your\nDomain Identity</h1>
                            <p className="text-slate-400 font-medium tracking-tight max-w-lg mx-auto uppercase text-[10px] leading-relaxed">Secure your unique URL and choose a visual style that represents your creative soul.</p>
                        </header>

                        <div className="space-y-12">
                            {/* DOMAIN INPUT */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Page URL (Public)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                        <span className="text-slate-300 font-black text-lg tracking-tight">tepak.id/</span>
                                    </div>
                                    <Input 
                                        className="h-20 pl-24 text-xl font-black tracking-tight rounded-[1.5rem] border border-slate-100 focus:border-primary shadow-none bg-slate-50/30 uppercase"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        placeholder="yourname"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center translate-y-[1px]">
                                        {domain && !errors.domain ? (
                                            <CheckCircleIcon className="w-8 h-8 text-emerald-500 animate-in zoom-in duration-300" />
                                        ) : domain && errors.domain ? (
                                            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-in zoom-in duration-300">
                                                <span className="font-black text-xs">!</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                {errors.domain ? (
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2 animate-in fade-in slide-in-from-top-1">
                                        {errors.domain}
                                    </p>
                                ) : domain && (
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest px-2">Domain is available! This will be your primary store link.</p>
                                )}
                            </div>

                            {/* THEME PICKER */}
                            <div className="space-y-10 pt-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 mb-10 block">Select Visual Signature</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {themes.map((theme) => (
                                        <ThemeCard 
                                            key={theme.id}
                                            id={theme.id}
                                            name={theme.name}
                                            previewGradient={theme.gradient}
                                            isActive={selectedTheme === theme.id}
                                            onSelect={setSelectedTheme}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <header className="text-center space-y-6">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Step 02 — Personalize</span>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Craft Your Profile</h2>
                            <p className="text-slate-400 font-medium tracking-tight max-w-lg mx-auto uppercase text-[10px] leading-relaxed">Let your audience know who you are and where to find your other creative works.</p>
                        </header>

                        <div className="flex flex-col lg:flex-row gap-16">
                            {/* PHOTO & BIO */}
                            <div className="lg:w-1/2 space-y-12">
                                <AvatarUpload className="mb-14" />
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Profile Full Name</label>
                                    <Input 
                                        placeholder="Ex: Alexandra Quinn"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-16 font-black uppercase tracking-tight rounded-2xl border-slate-100 bg-slate-50/30 px-6"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Short Bio</label>
                                    <textarea 
                                        placeholder="Describe yourself in one short, impactful sentence..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full min-h-[140px] p-6 rounded-2xl border border-slate-100 focus:border-primary outline-none font-medium text-sm transition-all resize-none bg-slate-50/30"
                                    />
                                </div>
                            </div>

                            {/* SOCIAL LINKS */}
                            <div className="lg:w-1/2 space-y-10">
                                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-10">
                                    <header className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <LinkIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Social Connections</h3>
                                    </header>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instagram</span>
                                                <AtSymbolIcon className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <Input 
                                                placeholder="Instagram handle"
                                                value={socials.ig}
                                                onChange={(e) => setSocials({...socials, ig: e.target.value})}
                                                className="h-14 text-xs font-black uppercase tracking-tight bg-white border-slate-100 rounded-xl"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TikTok</span>
                                                <MusicalNoteIcon className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <Input 
                                                placeholder="TikTok handle"
                                                value={socials.tt}
                                                onChange={(e) => setSocials({...socials, tt: e.target.value})}
                                                className="h-14 text-xs font-black uppercase tracking-tight bg-white border-slate-100 rounded-xl"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">YouTube</span>
                                                <PlayCircleIcon className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <Input 
                                                placeholder="Channel name / URL"
                                                value={socials.yt}
                                                onChange={(e) => setSocials({...socials, yt: e.target.value})}
                                                className="h-14 text-xs font-black uppercase tracking-tight bg-white border-slate-100 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="h-[400px] flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-6 shadow-sm border border-emerald-100/50">
                            <CheckBadgeIcon className="w-12 h-12" />
                        </div>
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase whitespace-pre-line leading-tight">Masterfully\nCreated</h2>
                            <p className="text-slate-400 font-medium text-center max-w-sm uppercase text-[10px] leading-relaxed tracking-widest mx-auto">The world can now experience your creations at\ntepak.id/{domain}</p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="px-16 mt-6 font-black uppercase text-[11px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                            onClick={() => {
                                window.location.href = `/editor?theme=${selectedTheme}&subdomain=${domain}`;
                            }}
                        >
                            Open Dashboard
                        </Button>
                    </div>
                )}

                {/* NAVIGATION CTA */}
                {apiError && (
                    <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">{apiError}</p>
                    </div>
                )}
                <div className="mt-12 pt-16 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] max-w-[240px] text-center md:text-left leading-relaxed">
                        By continuing, you agree to the TEPAK.ID Ecosystem Terms & Conditions.
                    </p>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button 
                            variant="outline" 
                            className="px-12 py-5 font-black uppercase text-[10px] tracking-widest border-2 border-slate-100 hover:border-primary rounded-2xl group transition-all"
                            onClick={() => {
                                if (currentStep > 0) prevStep();
                                else window.history.back();
                            }}
                        >
                            <span>Back</span>
                        </Button>
                        {currentStep < 2 && (
                            <Button 
                                variant="primary" 
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-16 py-5 font-black uppercase text-[10px] tracking-widest group shadow-2xl shadow-primary/20 rounded-2xl bg-primary text-white"
                                onClick={nextStep}
                            >
                                <span>{isSubmitting ? 'Saving...' : 'Continue'}</span>
                                {!isSubmitting && <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingForm;
