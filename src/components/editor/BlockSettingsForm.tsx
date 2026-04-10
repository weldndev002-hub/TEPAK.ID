import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { 
    XMarkIcon,
    Bars3CenterLeftIcon,
    LinkIcon,
    VideoCameraIcon,
    ShoppingBagIcon,
    CalendarIcon,
    MegaphoneIcon,
    DocumentTextIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';

export interface BlockSettingsFormProps {
    blockType: string;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const BlockSettingsForm: React.FC<BlockSettingsFormProps> = ({ blockType, onClose, onSave }) => {
    const [formData, setFormData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    const validateUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSave = () => {
        if (blockType === 'link' || blockType === 'article' || blockType === 'video') {
            let url = formData.url || '';
            
            // Auto-prepend https:// if missing
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                url = `https://${url}`;
            }

            // Validate
            if (!url) {
                setError("URL tidak boleh kosong");
                return;
            }

            if (!validateUrl(url)) {
                setError("Format URL tidak valid");
                return;
            }

            onSave({ ...formData, url });
        } else if (blockType === 'social') {
            const sanitizedData = { ...formData };
            // Sanitize all platform usernames
            ['instagram', 'tiktok', 'twitter', 'linkedin'].forEach(platform => {
                if (sanitizedData[platform]) {
                    sanitizedData[platform] = sanitizedData[platform]
                        .replace(/<[^>]*>?/gm, '') // Remove HTML
                        .replace(/\s+/g, '');      // Remove spaces
                }
            });
            onSave(sanitizedData);
        } else if (blockType === 'text') {
            const sanitize = (val: string) => {
                if (!val) return '';
                return val
                    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Strip script tags
                    .replace(/on\w+="[^"]*"/gim, "") // Remove event handlers
                    .replace(/javascript\s*:/gim, ""); // Remove JS links
            };
            
            onSave({
                ...formData,
                title: sanitize(formData.title),
                content: sanitize(formData.content)
            });
        } else if (blockType === 'video') {
            const url = formData.url || '';
            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
            const isVimeo = url.includes('vimeo.com');

            if (!isYouTube && !isVimeo) {
                setError("Hanya tautan YouTube dan Vimeo yang didukung");
                return;
            }

            // Extract YouTube ID if applicable
            let videoId = '';
            if (isYouTube) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                videoId = (match && match[2].length === 11) ? match[2] : '';
            }

            onSave({ ...formData, videoId, isYouTube, isVimeo });
        } else {
            onSave(formData);
        }
    };

    const renderFields = () => {
        switch (blockType) {
            case 'link':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Link Title</label>
                            <Input 
                                placeholder="e.g. Visit my Portfolio" 
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Destination URL</label>
                            <Input 
                                placeholder="https://..." 
                                value={formData.url || ''}
                                onChange={(e) => {
                                    setFormData({ ...formData, url: e.target.value });
                                    setError(null);
                                }}
                            />
                            {error && (
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                );
            case 'video':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Video Title</label>
                            <Input 
                                placeholder="e.g. My Latest Project" 
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Video URL (YouTube/Vimeo)</label>
                            <Input 
                                placeholder="https://youtube.com/watch?v=..." 
                                value={formData.url || ''}
                                onChange={(e) => {
                                    setFormData({ ...formData, url: e.target.value });
                                    setError(null);
                                }}
                            />
                            {error && (
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                );
            case 'image':
                const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validation
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        setError("Format tidak didukung (Gunakan JPG, PNG, atau WEBP)");
                        return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                        setError("File terlalu besar (Maks 2MB)");
                        return;
                    }

                    setError(null);
                    // Simulate upload
                    const imageUrl = URL.createObjectURL(file);
                    setFormData({ ...formData, imageUrl, fileName: file.name });
                };

                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Upload Image</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:bg-white group-hover:border-primary/30 transition-all overflow-hidden relative">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300">
                                                <PhotoIcon className="w-7 h-7" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-900 uppercase">Click to browse</p>
                                                <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase italic">Max 2MB • JPG, PNG, WEBP</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {error && (
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-4 text-center">{error}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Image Caption (Optional)</label>
                            <Input 
                                placeholder="Describe the image..." 
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'product':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Select Product</label>
                            <Select>
                                <option>Mastering UI Design</option>
                                <option>Social Media Kit</option>
                                <option>Web Template v1</option>
                            </Select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Button Text</label>
                            <Input placeholder="Buy Now ($24.90)" />
                        </div>
                    </div>
                );
            case 'event':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Event Name</label>
                            <Input placeholder="e.g. Design Workshop" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Date</label>
                                <Input type="date" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Time</label>
                                <Input type="time" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Location / Link</label>
                            <Input placeholder="e.g. Zoom or Jakarta" />
                        </div>
                    </div>
                );
            case 'social':
                return (
                    <div className="space-y-8">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Connected Platforms</p>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">Instagram</label>
                                    <Input 
                                        placeholder="@username" 
                                        value={formData.instagram || ''}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">TikTok</label>
                                    <Input 
                                        placeholder="@username" 
                                        value={formData.tiktok || ''}
                                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">Twitter (X)</label>
                                    <Input 
                                        placeholder="@username" 
                                        value={formData.twitter || ''}
                                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Headline</label>
                            <Input 
                                placeholder="e.g. My Creative Journey" 
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Description</label>
                            <textarea 
                                className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 text-slate-800 rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-tight outline-none transition-all resize-none min-h-[160px] shadow-inner"
                                placeholder="Tell your story..."
                                value={formData.content || ''}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                            <p className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-relaxed px-1">Tip: Use this for your bio, about section, or important announcements.</p>
                        </div>
                    </div>
                );
            case 'article':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Headline</label>
                            <Input placeholder="e.g. How to scale your freelance business" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">URL</label>
                            <Input placeholder="https://medium.com/..." />
                        </div>
                    </div>
                );
            default:
                return <div className="text-slate-400 italic text-sm">Select a block type to see fields.</div>;
        }
    };

    const getTitle = () => {
        const titles: any = {
            link: 'Link Settings',
            video: 'Video Settings',
            product: 'Product Settings',
            event: 'Event Settings',
            social: 'Social Settings',
            article: 'Article Settings'
        };
        return titles[blockType] || 'Block Settings';
    };

    const getIcon = () => {
        const icons: any = {
            link: LinkIcon,
            video: VideoCameraIcon,
            product: ShoppingBagIcon,
            event: CalendarIcon,
            social: MegaphoneIcon,
            article: DocumentTextIcon,
            image: PhotoIcon
        };
        const Icon = icons[blockType] || Bars3CenterLeftIcon;
        return <Icon className="w-5 h-5" />;
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-100 shadow-[0_0_60px_-15px_rgba(0,0,0,0.2)] z-[70] flex flex-col  animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">{getTitle()}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Configure component</p>
                    </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                {renderFields()}
                
                <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase">Visible on Page</p>
                            <p className="text-[10px] text-slate-400 font-medium">Show this block to visitors</p>
                        </div>
                        <Toggle checked={true} onChange={() => {}} />
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                <Button 
                    variant="primary" 
                    className="w-full py-4 text-[11px] uppercase tracking-[0.3em] font-black rounded-2xl shadow-xl shadow-primary/20"
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

export default BlockSettingsForm;
