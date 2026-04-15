import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { CameraIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface AvatarUploadProps {
    image?: string;
    onUpload?: (file: File) => void;
    className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ image, onUpload, className }) => {
    const [preview, setPreview] = useState(image || '');

    React.useEffect(() => {
        if (image) setPreview(image);
    }, [image]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                if (onUpload) onUpload(file);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={cn("relative group flex flex-col items-center ", className)}>
            <div className="relative">
                {/* CIRCULAR FRAME */}
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-50 relative">
                    {preview ? (
                        <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                            <CameraIcon className="w-8 h-8 md:w-10 md:h-10" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-2 md:mt-3 opacity-50">Choose Photo</span>
                        </div>
                    )}
                </div>

                {/* EDIT BUTTON OVERLAY */}
                <label className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-white">
                    <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
            
            <p className="mt-4 md:mt-6 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose text-center">
                JPG, PNG or WebP.<br/>Maximum 2MB.
            </p>
        </div>
    );
};

export default AvatarUpload;

