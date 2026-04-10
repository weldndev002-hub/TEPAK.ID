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
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-50 relative">
                    {preview ? (
                        <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                            <CameraIcon className="w-10 h-10" />
                            <span className="text-[9px] font-black uppercase tracking-widest mt-3 opacity-50">Choose Photo</span>
                        </div>
                    )}
                </div>

                {/* EDIT BUTTON OVERLAY */}
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-white">
                    <PencilSquareIcon className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
            
            <p className="mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose text-center">
                JPG, PNG or WebP.<br/>Maximum 2MB.
            </p>
        </div>
    );
};

export default AvatarUpload;

