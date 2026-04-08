import React, { useState } from 'react';
import StepIndicator from './StepIndicator';
import SubdomainInput from './SubdomainInput';
import ThemePicker from './ThemePicker';
import Button from '../ui/Button';

const STEPS = [
  { id: 1, label: 'Profil' },
  { id: 2, label: 'Subdomain' },
  { id: 3, label: 'Tema' },
];

const THEMES = [
  { 
    id: 'minimal', name: 'Minimal', 
    thumbnailClass: 'bg-slate-50 text-slate-800', 
    accentColor: 'bg-slate-300' 
  },
  { 
    id: 'bold', name: 'Bold', 
    thumbnailClass: 'bg-slate-900 text-white', 
    accentColor: 'bg-primary' 
  },
  { 
    id: 'warm', name: 'Warm', 
    thumbnailClass: 'bg-orange-50 text-orange-950', 
    accentColor: 'bg-orange-400' 
  },
];

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(2); // Start at subdomain as per prompt
  const [subdomain, setSubdomain] = useState('creatorsenja');
  const [selectedTheme, setSelectedTheme] = useState('minimal');
  
  const isAvailable = subdomain !== 'kopi'; // Simulation as per prompt

  return (
    <div className="space-y-16 py-8">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentStep === 1 && (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
                <h2 className="text-2xl font-bold font-headline">Lengkapi Profil Anda</h2>
                <p className="text-slate-500">Isi data diri Anda sebagai arsitek digital.</p>
                <div className="pt-8">
                    <Button onClick={() => setCurrentStep(2)} size="lg">Lanjut ke Subdomain</Button>
                </div>
            </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <SubdomainInput 
              value={subdomain} 
              onChange={setSubdomain}
              isAvailable={isAvailable && subdomain.length > 3}
              isTaken={!isAvailable}
              isLoading={false}
            />
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!isAvailable || subdomain.length < 3}
                size="lg"
                className="px-12"
              >
                Pilih Tema Website
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-12">
            <ThemePicker 
              options={THEMES} 
              selectedId={selectedTheme} 
              onSelect={setSelectedTheme} 
            />
            
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep(2)}
                size="lg"
              >
                Kembali
              </Button>
              <Button 
                variant="amber"
                size="lg"
                className="px-12"
                onClick={() => window.location.href = '/editor'}
              >
                Selesaikan Pendaftaran
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
