import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { AvatarUpload } from '../ui/AvatarUpload';
import {
    CheckBadgeIcon,
    BuildingLibraryIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const EditProfileForm = () => {
    const [profile, setProfile] = useState<any>({
        full_name: '',
        bio: '',
        phone: '',
        instagram_url: '',
        twitter_url: '',
        youtube_url: '',
        address_text: '',
        city: '',
        postcode: '',
        avatar_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveModal, setSaveModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        setHasMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    ...data,
                    // Fallbacks for null values
                    full_name: data.full_name || '',
                    bio: data.bio || '',
                    phone: data.phone || '',
                    instagram_url: data.instagram_url || '',
                    twitter_url: data.twitter_url || '',
                    youtube_url: data.youtube_url || '',
                    address_text: data.address_text || '',
                    city: data.city || '',
                    postcode: data.postcode || '',
                    avatar_url: data.avatar_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setProfile((prev: any) => ({ ...prev, avatar_url: data.avatar_url }));
                showToast('Foto profil berhasil diunggah dan disimpan!');
            } else {
                const errBody = await res.json().catch(() => ({}));
                console.error('[Avatar Upload] Error:', res.status, errBody);
                showToast('Gagal upload: ' + (errBody?.error || `HTTP ${res.status}`));
            }
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            showToast('Error: ' + error.message);
        }
    };

    const executeSave = async () => {
        setSaveModal(false);
        setIsSaving(true);
        try {
            // Remove 'settings' property because it doesn't belong to the 'profiles' db table
            const { settings, ...profileToUpdate } = profile;

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileToUpdate)
            });

            if (res.ok) {
                showToast('Profile berhasil diperbarui!');
            } else {
                const err = await res.json();
                showToast('Gagal: ' + err.error);
            }
        } catch (error) {
            showToast('Kesalahan sistem saat menyimpan.');
        } finally {
            setIsSaving(false);
        }
    };

    // Fix Hydration Mismatch: Always return a skeleton or a consistent state during SSR
    if (!hasMounted || isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading your identity...</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Toast */}
                {toast && (
                    <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                        <CheckCircleIcon className="w-5 h-5 shrink-0" />{toast}
                    </div>
                )}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                    <div className="text-center md:text-left">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Identity Management</span>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">Edit Profile</h2>
                        <p className="text-slate-500 mt-2 font-medium text-sm">Manage your public presence and personal information.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {profile.username && (
                            <a href={`/u/${profile.username}`} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none">
                                <Button
                                    variant="outline"
                                    className="w-full h-full border-2 border-slate-200 hover:bg-white transition-all font-black px-8 py-5 rounded-2xl text-[11px] uppercase tracking-widest"
                                >
                                    View My Page
                                </Button>
                            </a>
                        )}
                        <Button
                            variant="primary"
                            className="flex-1 md:flex-none shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black px-10 py-5 rounded-2xl text-[11px] uppercase tracking-widest"
                            onClick={executeSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-12 gap-8 lg:gap-10">

                    {/* Section 1: Profile Photo (Side Column) */}
                    <div className="col-span-12 lg:col-span-4 space-y-8 lg:space-y-10">
                        {/* Section 1: Profile Photo */}
                        <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8 w-full text-left">Profile Photo</h3>
                            <div className="py-2">
                                <AvatarUpload
                                    image={profile.avatar_url}
                                    onUpload={handleAvatarUpload}
                                />
                            </div>
                        </section>

                    </div>

                    {/* Main Column */}
                    <div className="col-span-12 lg:col-span-8 space-y-8 lg:space-y-10">

                        {/* Section 2: Basic Information */}
                        <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-10">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-6 md:gap-8">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                                    <Input
                                        name="full_name"
                                        type="text"
                                        value={profile.full_name}
                                        onChange={handleChange}
                                        className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50 px-5"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <div className="flex justify-between items-end mb-3 ml-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</label>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{profile.bio.length} / 500</span>
                                    </div>
                                    <Textarea
                                        name="bio"
                                        rows={3}
                                        value={profile.bio}
                                        onChange={handleChange}
                                        className="rounded-2xl border-slate-100 font-medium text-xs tracking-tight bg-slate-50/50 p-5 px-6"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                                    <Input
                                        name="phone"
                                        type="text"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50 px-5"
                                        placeholder="+62 ..."
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="rounded-2xl bg-slate-50 text-slate-400 cursor-not-allowed border-none font-black text-xs uppercase tracking-tight opacity-50 px-5"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Alamat */}
                        <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-10">Address Information</h3>
                            <div className="grid grid-cols-12 gap-6 md:gap-8">
                                <div className="col-span-12">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Address</label>
                                    <Input
                                        name="address_text"
                                        type="text"
                                        value={profile.address_text}
                                        onChange={handleChange}
                                        className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50 px-5"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">City</label>
                                    <Input
                                        name="city"
                                        type="text"
                                        value={profile.city}
                                        onChange={handleChange}
                                        className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50 px-5"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Postcode</label>
                                    <Input
                                        name="postcode"
                                        type="text"
                                        value={profile.postcode}
                                        onChange={handleChange}
                                        className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50 px-5"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section: Security */}
                        <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-10">Security & Account</h3>
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100/50">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">Change Password</p>
                                        <p className="text-[10px] text-slate-400 max-w-sm font-medium uppercase tracking-tight">
                                            {profile.app_metadata?.provider === 'google' || profile.identities?.[0]?.provider === 'google' 
                                                ? 'You are using Google Login. Password management is handled by Google.' 
                                                : 'It is recommended to use a strong and unique password to secure your account.'}
                                        </p>
                                    </div>
                                    {!(profile.app_metadata?.provider === 'google' || profile.identities?.[0]?.provider === 'google') && (
                                        <a href="/reset-password" title="Go to password reset" className="w-full sm:w-auto">
                                            <Button variant="outline" type="button" className="font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl bg-white w-full">Change Password</Button>
                                        </a>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100/50">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">Account Management</p>
                                        <p className="text-[10px] text-slate-400 max-w-sm font-medium uppercase tracking-tight">Manage account status and data deletion from the platform.</p>
                                    </div>
                                    <a href="/account-management" title="Account settings" className="w-full sm:w-auto">
                                        <Button variant="ghost" type="button" className="text-rose-500 border border-rose-100 hover:bg-rose-50 font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl w-full">Delete Account</Button>
                                    </a>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100/50">
                                    <div>
                                        <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">Custom Domain</p>
                                        <p className="text-[10px] text-slate-400 max-w-sm font-medium uppercase tracking-tight">Connect your own custom domain (e.g. my-store.com) for a more professional look.</p>
                                    </div>
                                    <a href="/domain-settings" title="Domain setup" className="w-full sm:w-auto">
                                        <Button variant="outline" type="button" className="font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl bg-white w-full">Setup Domain</Button>
                                    </a>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-primary/[0.03] rounded-2xl p-6 md:p-8 border border-primary/10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xs font-black text-primary uppercase tracking-tight">SEO Optimization</p>
                                            <span className="px-2 py-0.5 rounded bg-primary text-[7px] font-black text-white uppercase tracking-widest">PRO</span>
                                        </div>
                                        <p className="text-[10px] text-primary/60 max-w-sm font-medium uppercase tracking-tight">Optimize your site snippet for Google search and social media sharing.</p>
                                    </div>
                                    <a href="/seo-settings" title="SEO settings" className="w-full sm:w-auto">
                                        <Button variant="primary" type="button" className="bg-primary text-white font-black text-[9px] uppercase tracking-widest px-8 py-3 rounded-xl shadow-lg shadow-primary/20 w-full">Configure SEO</Button>
                                    </a>
                                </div>
                            </div>
                        </section>

                        {/* Section 5: Bank Account Details */}
                        <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Bank Account details</h3>
                                <span className="flex items-center gap-2 text-[9px] font-black text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                                    Verified
                                </span>
                            </div>

                            <div className="bg-slate-50 border border-slate-100/50 p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-start gap-8 relative group">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-3 text-primary shrink-0 border border-slate-100">
                                    <BuildingLibraryIcon className="w-10 h-10" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-y-6 w-full">
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Bank Central Asia (BCA)</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                                        <p className="text-xs font-black text-slate-900 tracking-[0.3em]">•••• •••• 8829</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner Name</p>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{profile.full_name}</p>
                                    </div>
                                </div>
                                <a href="/bank-info" title="Edit Bank Info" className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-300 hover:text-primary transition-all active:scale-95">
                                    <PencilSquareIcon className="w-6 h-6" />
                                </a>
                            </div>
                        </section>

                        {/* Bottom Action Bar */}
                        <div className="pt-6 flex flex-col md:flex-row items-center justify-end gap-6">
                            <Button
                                variant="ghost"
                                className="text-slate-400 hover:bg-slate-100 px-8 py-4 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all w-full md:w-auto"
                                onClick={() => setCancelModal(true)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary text-white w-full md:w-auto"
                                onClick={executeSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>



                {/* Cancel Confirm Modal */}
                {cancelModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 mb-4">
                                    <XCircleIcon className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Discard Changes?</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Semua perubahan yang belum disimpan akan dibatalkan. Tindakan ini tidak dapat diurungkan.</p>
                            </div>
                            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setCancelModal(false)}>Keep Editing</button>
                                <button className="px-6 py-2.5 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest" onClick={() => fetchProfile()}>Yes, Discard</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default EditProfileForm;

