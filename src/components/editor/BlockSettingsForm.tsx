import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import {
    XMarkIcon,
    ArrowLeftIcon,
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
    const [isUploading, setIsUploading] = useState(false);
    const [platformErrors, setPlatformErrors] = useState<Record<string, string>>({});

    const validateUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Sanitize username: remove HTML tags, special characters except @ . _ - and alphanumeric
    const sanitizeSocialUsername = (username: string): string => {
        if (!username) return '';

        // Remove HTML tags
        let sanitized = username.replace(/<[^>]*>?/gm, '');

        // Remove dangerous attributes and scripts
        sanitized = sanitized
            .replace(/javascript\s*:/gi, '')
            .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/on\w+\s*=\s*'[^']*'/gi, '')
            .replace(/on\w+\s*=\s*[^ >]*/gi, '');

        // Remove extra whitespace
        sanitized = sanitized.replace(/\s+/g, '');

        return sanitized;
    };

    // Enhanced sanitization for text blocks - comprehensive XSS protection
    const sanitizeTextContent = (text: string): string => {
        if (!text) return '';

        let sanitized = text;

        // 1. Remove all script tags and their content
        sanitized = sanitized.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');

        // 2. Remove all HTML comments and CDATA sections
        sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
        sanitized = sanitized.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

        // 3. Remove dangerous tags (iframe, embed, object, svg, style, link, meta, base)
        sanitized = sanitized.replace(/<\/?(iframe|embed|object|svg|style|link|meta|base)[^>]*>/gim, '');

        // 4. Remove event handlers (onclick, onload, etc.)
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gim, '');
        sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]+/gim, '');

        // 5. Remove javascript: and data: URLs
        sanitized = sanitized.replace(/\s+(href|src|background|style)\s*=\s*["'](javascript:|data:)[^"']*["']/gim, '');
        sanitized = sanitized.replace(/javascript\s*:/gim, '');

        // 6. Remove CSS expressions and dangerous CSS
        sanitized = sanitized.replace(/expression\s*\([^)]*\)/gim, '');
        sanitized = sanitized.replace(/url\s*\(\s*["']?(javascript:|data:)[^"')]*["']?\s*\)/gim, '');

        // 7. Escape HTML entities in remaining content
        const escapeHtml = (str: string) => {
            const htmlEntities: Record<string, string> = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "/": "&#x2F;"
            };
            return str.replace(/[&<>"'/]/g, char => htmlEntities[char]);
        };

        // 8. Allow safe HTML tags for basic formatting (optional)
        // For now, we'll escape all HTML to be safe
        // You can uncomment below to allow basic formatting
        /*
        const safeTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'a'];
        const allowedAttrs = ['href', 'target', 'title'];
        // This would require a more complex parser - for now we escape all
        */

        // Escape all HTML tags that remain
        sanitized = escapeHtml(sanitized);

        // 9. Remove excessive whitespace and newlines
        sanitized = sanitized.replace(/\s+/g, ' ').trim();

        return sanitized;
    };

    // Validate username format (alphanumeric, underscore, dot, hyphen, optionally starting with @)
    const validateSocialUsername = (username: string): boolean => {
        if (!username) return true; // Empty is allowed (means no icon)
        const cleaned = username.replace(/^@/, ''); // Remove leading @ for validation
        return /^[a-zA-Z0-9_.-]+$/.test(cleaned);
    };

    const handleSocialInputChange = (platform: string, value: string) => {
        const sanitized = sanitizeSocialUsername(value);
        setFormData({ ...formData, [platform]: sanitized });

        // Validate and set error
        if (value && !validateSocialUsername(value)) {
            setPlatformErrors(prev => ({
                ...prev,
                [platform]: 'Username hanya boleh mengandung huruf, angka, underscore (_), titik (.), dan strip (-)'
            }));
        } else {
            setPlatformErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[platform];
                return newErrors;
            });
        }
    };

    const handleSave = () => {
        if (blockType === 'link' || blockType === 'article') {
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
            // Validate all platform usernames
            const platforms = ['instagram', 'tiktok', 'twitter', 'linkedin', 'threads', 'facebook'];
            const hasErrors = platforms.some(platform =>
                formData[platform] && !validateSocialUsername(formData[platform])
            );

            if (hasErrors) {
                setError("Beberapa username tidak valid. Periksa format input.");
                return;
            }

            // Sanitize all platform usernames
            const sanitizedData = { ...formData };
            platforms.forEach(platform => {
                if (sanitizedData[platform]) {
                    sanitizedData[platform] = sanitizeSocialUsername(sanitizedData[platform]);
                }
            });

            onSave(sanitizedData);
        } else if (blockType === 'text') {
            // Use the enhanced sanitization function
            onSave({
                ...formData,
                title: sanitizeTextContent(formData.title || ''),
                content: sanitizeTextContent(formData.content || '')
            });
        } else if (blockType === 'video') {
            const preview = formData._preview;
            if (!preview || (!preview.isYT && !preview.isVM)) {
                setError("Hanya tautan YouTube dan Vimeo yang didukung");
                return;
            }

            // Hapus _preview dari data akhir sebelum disimpan
            const { _preview, ...cleanFormData } = formData;
            
            onSave({ 
                ...cleanFormData, 
                videoId: preview.videoId, 
                isYouTube: preview.isYT, 
                isVimeo: preview.isVM 
            });
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
                // Real-time YouTube/Vimeo URL parser
                const parseVideoUrl = (rawUrl: string) => {
                    const url = rawUrl.trim();
                    const isYT = url.includes('youtube.com') || url.includes('youtu.be');
                    const isVM = url.includes('vimeo.com');

                    let videoId = '';
                    if (isYT) {
                        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
                        videoId = m?.[1] || '';
                    } else if (isVM) {
                        const m = url.match(/vimeo\.com\/(\d+)/);
                        videoId = m?.[1] || '';
                    }
                    return { isYT, isVM, videoId };
                };

                const handleVideoUrlChange = (raw: string) => {
                    setFormData((prev: any) => ({ ...prev, url: raw }));
                    setError(null);

                    if (!raw.trim()) return;

                    // Auto-prepend https if missing
                    const url = raw.startsWith('http') ? raw : `https://${raw}`;
                    const { isYT, isVM, videoId } = parseVideoUrl(url);

                    if (!isYT && !isVM) {
                        setError('Hanya tautan YouTube dan Vimeo yang didukung');
                        setFormData((prev: any) => ({ ...prev, url: raw, _preview: null }));
                    } else {
                        // Store parsed data for preview
                        setFormData((prev: any) => ({
                            ...prev,
                            url: raw,
                            _preview: { isYT, isVM, videoId }
                        }));
                    }
                };

                const preview = formData._preview;
                const previewEmbedUrl = preview?.isYT && preview?.videoId
                    ? `https://www.youtube.com/embed/${preview.videoId}`
                    : preview?.isVM && preview?.videoId
                    ? `https://player.vimeo.com/video/${preview.videoId}`
                    : null;

                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Judul Video</label>
                            <Input
                                placeholder="e.g. My Latest Project"
                                value={formData.title || ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">URL Video (YouTube / Vimeo)</label>
                            <Input
                                placeholder="https://youtube.com/watch?v=..."
                                value={formData.url || ''}
                                onChange={(e) => handleVideoUrlChange(e.target.value)}
                            />
                            {error && (
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2">{error}</p>
                            )}
                            {!error && previewEmbedUrl && (
                                <div className="mt-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    Video terdeteksi
                                </div>
                            )}
                        </div>

                        {/* Inline Preview */}
                        {previewEmbedUrl && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Preview</label>
                                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                                    <iframe
                                        key={previewEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        src={previewEmbedUrl}
                                        title="Video Preview"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'image':
                const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Client-side pre-validation (fast feedback before upload)
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
                        setError('Format tidak didukung atau file terlalu besar (Maks 2MB)');
                        return;
                    }

                    setError(null);
                    setIsUploading(true);

                    // Show instant local preview while uploading
                    const localPreview = URL.createObjectURL(file);
                    setFormData((prev: any) => ({ ...prev, imageUrl: localPreview, fileName: file.name }));

                    try {
                        const data = new FormData();
                        data.append('image', file);
                        const res = await fetch('/api/blocks/upload-image', { method: 'POST', body: data });
                        const json = await res.json();

                        if (!res.ok) {
                            setError(json.error || 'Format tidak didukung atau file terlalu besar (Maks 2MB)');
                            // Revert preview if upload failed
                            setFormData((prev: any) => ({ ...prev, imageUrl: '', fileName: '' }));
                        } else {
                            // Replace blob URL with permanent Supabase Storage URL
                            setFormData((prev: any) => ({ ...prev, imageUrl: json.url, fileName: file.name }));
                        }
                    } catch {
                        setError('Gagal mengunggah gambar. Coba lagi.');
                        setFormData((prev: any) => ({ ...prev, imageUrl: '', fileName: '' }));
                    } finally {
                        URL.revokeObjectURL(localPreview);
                        setIsUploading(false);
                    }
                };

                return (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Upload Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                />
                                <div className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:bg-white group-hover:border-primary/30 transition-all overflow-hidden relative">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                            </svg>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mengunggah...</p>
                                        </div>
                                    ) : formData.imageUrl ? (
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
                                        onChange={(e) => handleSocialInputChange('instagram', e.target.value)}
                                    />
                                    {platformErrors.instagram && (
                                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight mt-1">
                                            {platformErrors.instagram}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">TikTok</label>
                                    <Input
                                        placeholder="@username"
                                        value={formData.tiktok || ''}
                                        onChange={(e) => handleSocialInputChange('tiktok', e.target.value)}
                                    />
                                    {platformErrors.tiktok && (
                                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight mt-1">
                                            {platformErrors.tiktok}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">Twitter (X)</label>
                                    <Input
                                        placeholder="@username"
                                        value={formData.twitter || ''}
                                        onChange={(e) => handleSocialInputChange('twitter', e.target.value)}
                                    />
                                    {platformErrors.twitter && (
                                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight mt-1">
                                            {platformErrors.twitter}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">Threads</label>
                                    <Input
                                        placeholder="@username"
                                        value={formData.threads || ''}
                                        onChange={(e) => handleSocialInputChange('threads', e.target.value)}
                                    />
                                    {platformErrors.threads && (
                                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight mt-1">
                                            {platformErrors.threads}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-tight ml-1">Facebook</label>
                                    <Input
                                        placeholder="username/page"
                                        value={formData.facebook || ''}
                                        onChange={(e) => handleSocialInputChange('facebook', e.target.value)}
                                    />
                                    {platformErrors.facebook && (
                                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight mt-1">
                                            {platformErrors.facebook}
                                        </p>
                                    )}
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
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-slate-100 shadow-[0_0_60px_-15px_rgba(0,0,0,0.2)] z-[120] flex flex-col  animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all active:scale-95 group"
                        title="Kembali ke pilih blok"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">{getTitle()}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Configure component</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all active:scale-95"
                    title="Tutup Panel"
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
                        <Toggle checked={true} onChange={() => { }} />
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
