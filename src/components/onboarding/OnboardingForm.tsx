import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
    CheckCircleIcon,
    ArrowRightIcon,
    SparklesIcon,
    CameraIcon,
    GlobeAltIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { AvatarUpload } from '../ui/AvatarUpload';
import { BrandingProvider, type BrandingData } from '../../hooks/useBranding';

interface OnboardingFormProps {
    initialBranding?: BrandingData | null;
}

const ONBOARDING_STEPS = [
    { label: 'Step 01 — Identity' },
    { label: 'Step 02 — Personalize' },
    { label: 'Step 03 — Finish' }
];

const domainSchema = z.string()
    .min(3, "Minimal 3 karakter")
    .regex(/^[a-zA-Z0-9-]+$/, "Subdomain hanya boleh mengandung huruf, angka, dan tanda hubung (-)");

const themes = [
    { id: 'atelier-dark', name: 'Atelier Dark', gradient: 'bg-slate-900 shadow-2xl' },
    { id: 'minimal-light', name: 'Minimal Light', gradient: 'bg-white shadow-xl border border-slate-100' },
    { id: 'sunrise-glow', name: 'Sunrise Glow', gradient: 'bg-gradient-to-br from-amber-100 to-rose-200 shadow-xl' },
];

const ThemeCard: React.FC<{ id: string; name: string; previewGradient: string; isActive: boolean; onSelect: (id: string) => void }> = ({ id, name, previewGradient, isActive, onSelect }) => (
    <button
        onClick={() => onSelect(id)}
        className={cn(
            "group relative flex flex-col items-center gap-4 transition-all duration-500",
            isActive ? "scale-105" : "hover:scale-102 grayscale-[40%] hover:grayscale-0 opacity-60 hover:opacity-100"
        )}
    >
        <div className={cn(
            "w-full aspect-[4/5] rounded-[2rem] p-1 transition-all duration-500",
            isActive ? "bg-primary shadow-2xl shadow-primary/20" : "bg-slate-100"
        )}>
            <div className={cn("w-full h-full rounded-[1.8rem] transition-all duration-500 flex items-center justify-center overflow-hidden", previewGradient)}>
                {isActive && <CheckCircleIcon className="w-10 h-10 text-primary bg-white rounded-full p-2 animate-in zoom-in duration-500" />}
            </div>
        </div>
        <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300",
            isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
        )}>{name}</span>
    </button>
);

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ initialBranding }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [domain, setDomain] = useState('yourname');
    const [selectedTheme, setSelectedTheme] = useState('atelier-dark');

    // STEP 2 STATES
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [socials, setSocials] = useState({ ig: '', tt: '', yt: '' });

    // VALIDATION STATES
    const [errors, setErrors] = useState<{ domain?: string }>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // PRE-FILL EXISTING USER DATA ON MOUNT
    useEffect(() => {
        const fetchExistingData = async () => {
            try {
                const res = await fetch('/api/onboarding/data');
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        if (data.profile.full_name) setFullName(data.profile.full_name);
                        if (data.profile.bio) setBio(data.profile.bio);
                        if (data.profile.avatar_url) setAvatarUrl(data.profile.avatar_url);
                        if (data.profile.instagram_url) setSocials(prev => ({ ...prev, ig: data.profile.instagram_url }));
                        if (data.profile.tiktok_url) setSocials(prev => ({ ...prev, tt: data.profile.tiktok_url }));
                        if (data.profile.youtube_url) setSocials(prev => ({ ...prev, yt: data.profile.youtube_url }));
                    }
                    if (data.settings) {
                        if (data.settings.domain_name) {
                            setDomain(data.settings.domain_name);
                            setIsDomainAvailable(true); // Already owned by this user
                        }
                        if (data.settings.theme) {
                            setSelectedTheme(data.settings.theme);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch existing onboarding data:', err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchExistingData();
    }, []);

    // REAL-TIME VALIDATION WITH DEBOUNCE
    useEffect(() => {
        if (currentStep !== 0) return;

        const checkDomainAvailability = async () => {
            if (!domain || domain.length < 3) {
                setErrors({});
                setIsDomainAvailable(null);
                return;
            }

            // Sync Regex Check
            const result = domainSchema.safeParse(domain);
            if (!result.success) {
                setErrors({ domain: result.error.issues?.[0]?.message || "Subdomain hanya boleh mengandung huruf, angka, dan tanda hubung (-)" });
                setIsDomainAvailable(false);
                return;
            }

            setErrors({});
            setIsCheckingDomain(true);
            try {
                const res = await fetch(`/api/public/check-domain?name=${domain}`);
                const data = await res.json();
                if (!data.available) {
                    setErrors({ domain: data.error || 'Subdomain telah digunakan' });
                    setIsDomainAvailable(false);
                } else {
                    setErrors({});
                    setIsDomainAvailable(true);
                }
            } catch (err) {
                console.error('Check domain error:', err);
            } finally {
                setIsCheckingDomain(false);
            }
        };

        const timer = setTimeout(checkDomainAvailability, 500);
        return () => clearTimeout(timer);
    }, [domain, currentStep]);

    const nextStep = async () => {
        setApiError(null);
        if (currentStep === 0) {
            if (isCheckingDomain) return;
            const result = domainSchema.safeParse(domain);
            if (!result.success) {
                setErrors({ domain: result.error.issues?.[0]?.message || "Subdomain hanya boleh mengandung huruf, angka, dan tanda hubung (-)" });
                return;
            }
            if (isDomainAvailable === false) return;

            if (isDomainAvailable === null) {
                setIsSubmitting(true);
                try {
                    const res = await fetch(`/api/public/check-domain?name=${domain}`);
                    const data = await res.json();
                    if (!data.available) {
                        setErrors({ domain: data.error || 'Subdomain telah digunakan' });
                        setIsSubmitting(false);
                        return;
                    }
                    setIsDomainAvailable(true);
                } catch (err) {
                    setApiError('Gagal memeriksa ketersediaan domain');
                    setIsSubmitting(false);
                    return;
                }
                setIsSubmitting(false);
            }
            setErrors({});
        }

        if (currentStep === 1) {
            setIsSubmitting(true);
            try {
                // Save everything atomically using the new endpoint
                const response = await fetch('/api/onboarding/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        domain_name: domain,
                        full_name: fullName,
                        bio: bio,
                        avatar_url: avatarUrl || null,
                        instagram_url: socials.ig || null,
                        tiktok_url: socials.tt || null,
                        youtube_url: socials.yt || null,
                        theme: selectedTheme
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Gagal menyelesaikan onboarding');
                }

                setIsSubmitting(false);
            } catch (err: any) {
                console.error('Onboarding Finalization Error:', err);
                const errorMsg = err instanceof Error ? err.message : String(err);
                setApiError(errorMsg);
                setIsSubmitting(false);
                return;
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
        <BrandingProvider initialData={initialBranding}>
            {isLoadingData ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto w-full px-6">

                    {/* STEP INDICATOR */}
                    <div className="flex items-center justify-between mb-24 px-4 overflow-x-auto no-scrollbar py-4">
                        {ONBOARDING_STEPS.map((s, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-4 group shrink-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all duration-500",
                                        currentStep === i
                                            ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-110 rotate-3"
                                            : currentStep > i
                                                ? "bg-slate-900 text-white"
                                                : "bg-white text-slate-300 border border-slate-100"
                                    )}>
                                        {currentStep > i ? <CheckCircleIcon className="w-6 h-6" /> : `0${i + 1}`}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-300",
                                            currentStep === i ? "text-primary translate-x-1" : "text-slate-300"
                                        )}>{s.label}</span>
                                        {currentStep === i && <div className="h-[2px] w-4 bg-primary mt-1 rounded-full animate-in slide-in-from-left-2"></div>}
                                    </div>
                                </div>
                                {i < ONBOARDING_STEPS.length - 1 && (
                                    <div className={cn(
                                        "hidden md:block w-16 lg:w-24 h-[1px] mx-4 transition-colors duration-500",
                                        currentStep > i ? "bg-primary/30" : "bg-slate-100"
                                    )}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.08)] border border-slate-50 relative overflow-hidden">
                        {/* PROGRESS BAR */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="p-10 md:p-24">
                            {/* API ERROR BANNER */}
                            {apiError && (
                                <div className="mb-12 p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center gap-4 text-rose-600 animate-in bounce-in duration-500">
                                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">!</div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Initialization Error</p>
                                        <p className="text-sm font-bold tracking-tight">{apiError}</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 0 && (
                                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <header className="text-center space-y-6">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Essential Setup</span>
                                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase whitespace-pre-line leading-[1.05]">
                                            {`Claim Your\nDomain Identity`}
                                        </h1>
                                        <p className="text-slate-400 font-medium tracking-tight max-w-lg mx-auto uppercase text-[10px] leading-relaxed">Secure your unique URL and choose a visual style that represents your creative soul.</p>
                                    </header>

                                    <div className="space-y-12">
                                        {/* DOMAIN INPUT */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Page URL (Public)</label>
                                                <GlobeAltIcon className="w-5 h-5 text-slate-200" />
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                                                    <span className="text-slate-300 font-black text-xl tracking-tight">tepak.id/</span>
                                                </div>
                                                <Input
                                                    className="h-24 pl-32 text-2xl font-black tracking-tight rounded-[2rem] border-2 border-slate-100 focus:border-primary shadow-none bg-slate-50/30 uppercase transition-all"
                                                    value={domain}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                        setDomain(val);
                                                        setIsDomainAvailable(null);
                                                        if (errors.domain) setErrors({});
                                                    }}
                                                    placeholder="yourname"
                                                />
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center z-10">
                                                    {isCheckingDomain ? (
                                                        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                                    ) : domain && isDomainAvailable && !errors.domain ? (
                                                        <div className="bg-emerald-500 rounded-full p-1.5 animate-in zoom-in duration-300 shadow-xl shadow-emerald-500/20">
                                                            <CheckCircleIcon className="w-6 h-6 text-white" />
                                                        </div>
                                                    ) : domain && (errors.domain || isDomainAvailable === false) ? (
                                                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-in zoom-in duration-300 ring-4 ring-white">
                                                            <span className="font-black text-xs">!</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            {errors.domain ? (
                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] px-4 animate-in fade-in slide-in-from-top-1">
                                                    {errors.domain}
                                                </p>
                                            ) : isDomainAvailable && !isCheckingDomain && (
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 animate-in fade-in">
                                                    <SparklesIcon className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                                                    Domain is available!
                                                </p>
                                            )}
                                        </div>

                                        {/* THEME PICKER */}
                                        <div className="space-y-10 pt-8">
                                            <div className="flex items-center gap-3 ml-1">
                                                <FingerPrintIcon className="w-5 h-5 text-slate-200" />
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Visual Signature</div>
                                            </div>
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
                                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <header className="text-center space-y-6">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Personalization</span>
                                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase whitespace-pre-line leading-[1.05]">
                                            {`Design Your\nCreator Profile`}
                                        </h1>
                                        <p className="text-slate-400 font-medium tracking-tight max-w-lg mx-auto uppercase text-[10px] leading-relaxed">Let your audience know who you are. These details will appear on your public landing page.</p>
                                    </header>

                                        {/* PHOTO & BIO */}
                                        <div className="max-w-2xl mx-auto w-full space-y-12">
                                            <AvatarUpload
                                                className="mb-14"
                                                image={avatarUrl}
                                                onUpload={async (file: File) => {
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('avatar', file);
                                                        const res = await fetch('/api/profile/avatar', {
                                                            method: 'POST',
                                                            body: formData,
                                                        });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            setAvatarUrl(data.url);
                                                        } else {
                                                            const err = await res.json().catch(() => ({}));
                                                            toast.error('Gagal upload foto: ' + (err?.error || 'Unknown error'));
                                                        }
                                                    } catch (e: any) {
                                                        toast.error('Error: ' + e.message);
                                                    }

                                                }}
                                            />

                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Profile Full Name</label>
                                                    <Input
                                                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/30 text-lg font-bold tracking-tight"
                                                        placeholder="Tepak Creator"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-4 pt-4">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Short Biography</label>
                                                    <textarea
                                                        className="w-full h-40 rounded-[2rem] border border-slate-100 bg-slate-50/30 text-sm font-medium p-8 focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none outline-none"
                                                        placeholder="Tell the world your story..."
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="text-center space-y-16 animate-in zoom-in-95 duration-1000 py-20">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 animate-bounce cursor-default">
                                            <CheckCircleIcon className="w-16 h-16 text-white" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center animate-pulse">
                                            <SparklesIcon className="w-6 h-6 text-amber-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Manifestation<br />Complete!</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto leading-relaxed">Your digital atelier is ready to welcome your audience. Step into your kingdom.</p>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="px-20 py-8 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group"
                                        onClick={() => {
                                            window.location.href = `/editor?theme=${selectedTheme || 'atelier-dark'}&subdomain=${domain}`;
                                        }}
                                    >
                                        Launch My Kingdom
                                        <ArrowRightIcon className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                </div>
                            )}

                            {/* NAV ACTIONS */}
                            {currentStep < 2 && (
                                <div className="flex items-center justify-between mt-24 pt-16 border-t border-slate-50">
                                    <button
                                        onClick={prevStep}
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.4em] transition-all",
                                            currentStep === 0 ? "opacity-0 pointer-events-none" : "text-slate-300 hover:text-slate-900"
                                        )}
                                    >
                                        Go Back
                                    </button>

                                    <Button
                                        onClick={nextStep}
                                        disabled={isSubmitting || (currentStep === 0 && (isDomainAvailable === false || isCheckingDomain || !!errors.domain))}
                                        className="min-w-[240px] h-20 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-xl group"
                                    >
                                        {isSubmitting ? 'Syncing...' : (
                                            <>
                                                {currentStep === 1 ? 'Build My Kingdom' : 'Next Epoch'}
                                                <ArrowRightIcon className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </BrandingProvider>
    );
};
