import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Stepper from '../ui/Stepper';
import ThemeCard from '../ui/ThemeCard';
import AvatarUpload from '../ui/AvatarUpload';

const ONBOARDING_STEPS = [
    { label: 'Profil' },
    { label: 'Konten' },
    { label: 'Selesai' },
];

export const OnboardingForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [domain, setDomain] = useState('namamu');
    const [selectedTheme, setSelectedTheme] = useState('atelier-dark');

    // STEP 2 STATES
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [socials, setSocials] = useState({ ig: '', tt: '', yt: '' });

    const themes = [
        { id: 'atelier-dark', name: 'Atelier Dark', gradient: 'bg-slate-900 shadow-2xl' },
        { id: 'clean-minimal', name: 'Clean Minimal', gradient: 'bg-white border-2 border-slate-100 shadow-sm' },
        { id: 'sunrise-glow', name: 'Sunrise Glow', gradient: 'bg-gradient-to-br from-amber-100 to-rose-200' },
    ];

    const nextStep = () => {
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
        <div className="w-full max-w-4xl mx-auto">
            
            {/* STEPPER */}
            <Stepper steps={ONBOARDING_STEPS} currentStep={currentStep} className="mb-12" />

            {/* MAIN CONTENT CARD */}
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] border border-slate-50 animate-in fade-in zoom-in-95 duration-700">
                
                {currentStep === 0 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <header className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Atur Halaman Pertama</h1>
                            <p className="text-slate-500 font-medium tracking-tight">Klaim nama domain unikmu dan pilih gaya yang paling mewakili karyamu.</p>
                        </header>

                        <div className="space-y-10">
                            {/* DOMAIN INPUT */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Alamat Halaman (URL)</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                        <span className="text-slate-300 font-bold text-sm tracking-tight">tepak.id/</span>
                                    </div>
                                    <Input 
                                        className="h-16 pl-[70px] text-lg font-black tracking-tight rounded-2xl border-2 border-slate-100 focus:border-primary shadow-none"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        placeholder="namakamu"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
                                        <span className="material-symbols-outlined text-green-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Domain tersedia! Ini akan menjadi tautan publik Anda.</p>
                            </div>

                            {/* THEME PICKER */}
                            <div className="space-y-8 pt-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 mb-8 block">Pilih Tema Visual</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <header className="text-center space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Personalisasi Konten</h2>
                            <p className="text-slate-500 font-medium tracking-tight">Lengkapi profil Anda agar pengikut dapat mengenali identitas digital Anda.</p>
                        </header>

                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* PHOTO & BIO */}
                            <div className="lg:w-1/2 space-y-8">
                                <AvatarUpload className="mb-10" />
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Nama Lengkap di Profil</label>
                                    <Input 
                                        placeholder="Contoh: Santi Nusantara"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-14 font-bold"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Bio Singkat</label>
                                    <textarea 
                                        placeholder="Ceritakan siapa Anda dalam satu kalimat..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full min-h-[100px] p-5 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none font-medium text-sm transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* SOCIAL LINKS */}
                            <div className="lg:w-1/2 space-y-8">
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                                    <header className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-primary">link</span>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tautan Media Sosial</h3>
                                    </header>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instagram</span>
                                                <span className="material-symbols-outlined text-slate-300 text-sm">alternate_email</span>
                                            </div>
                                            <Input 
                                                placeholder="Username Instagram (tanpa @)"
                                                value={socials.ig}
                                                onChange={(e) => setSocials({...socials, ig: e.target.value})}
                                                className="h-12 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TikTok</span>
                                                <span className="material-symbols-outlined text-slate-300 text-sm">music_note</span>
                                            </div>
                                            <Input 
                                                placeholder="Username TikTok"
                                                value={socials.tt}
                                                onChange={(e) => setSocials({...socials, tt: e.target.value})}
                                                className="h-12 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">YouTube</span>
                                                <span className="material-symbols-outlined text-slate-300 text-sm">play_circle</span>
                                            </div>
                                            <Input 
                                                placeholder="Nama Channel / URL"
                                                value={socials.yt}
                                                onChange={(e) => setSocials({...socials, yt: e.target.value})}
                                                className="h-12 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="h-64 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter text-center">Selamat! Profil Anda Siap</h2>
                        <p className="text-slate-500 font-medium text-center max-w-sm">Dunia kini bisa melihat karya-karya luar biasa Anda melalui tepak.id/{domain}</p>
                        <Button variant="amber" size="lg" className="px-12 mt-4 font-black uppercase text-[10px] tracking-widest">
                            Buka Dashboard
                        </Button>
                    </div>
                )}

                {/* NAVIGATION CTA */}
                <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest max-w-[200px] text-center md:text-left leading-loose">
                        Dengan menekan lanjut, Anda menyetujui Ketentuan Layanan tepak.id.
                    </p>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="px-10 py-5 font-black uppercase text-[10px] tracking-widest border-2 border-slate-100 hover:border-primary"
                            onClick={() => {
                                if (currentStep > 0) prevStep();
                                else window.history.back();
                            }}
                        >
                            Kembali
                        </Button>
                        {currentStep < 2 && (
                            <Button 
                                variant="amber" 
                                size="lg" 
                                className="w-full md:w-auto px-12 py-5 font-black uppercase text-[10px] tracking-widest group shadow-2xl shadow-primary/20"
                                onClick={nextStep}
                            >
                                <span>Lanjut</span>
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingForm;
