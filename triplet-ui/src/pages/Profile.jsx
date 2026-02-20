import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Camera, Lock, Save, CheckCircle2, AlertCircle, LogOut, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [name, setName] = useState('');

    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // 🔥 GET /api/v1/users/me
                const res = await api.get('/users/me');
                setUser(res.data);
                setAvatarUrl(res.data.avatarUrl || '');
                setName(res.data.name || '');
            } catch (error) {
                console.error("User fetch error:", error);
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    // 📸 Avatarı Yenilə
    const handleUpdateAvatar = async () => {
        setIsLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            // 🔥 PUT /api/v1/users/avatar
            await api.put('/users/avatar', avatarUrl, { headers: { 'Content-Type': 'text/plain' } });
            setStatus({ type: 'success', msg: 'Avatar image updated successfully!' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to update avatar image.' });
        } finally {
            setIsLoading(false);
        }
    };

    // ✏️ Adı Yenilə
    const handleUpdateName = async () => {
        setIsSavingName(true);
        setStatus({ type: '', msg: '' });
        try {
            // 🔥 PUT /api/v1/users/me
            await api.put('/users/me', { name: name });
            setUser(prev => ({ ...prev, name: name }));
            setStatus({ type: 'success', msg: 'Traveler name updated successfully!' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to update traveler name.' });
        } finally {
            setIsSavingName(false);
        }
    };

    // 🔒 Şifrəni Sıfırla
    const handleRequestPasswordReset = async () => {
        setStatus({ type: '', msg: '' });
        try {
            // 🔥 POST /api/v1/auth/forgot-password (Bunu AuthController edir)
            await api.post('/auth/forgot-password', { email: user.email });
            setStatus({ type: 'success', msg: 'A security link has been sent to your email.' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to send security request.' });
        }
    };

    // 🗑️ Hesabı Sil
    const handleDeleteAccount = async () => {
        try {
            await api.delete('/users/me');
            localStorage.removeItem('token');
            // window.location istifadə etmək daha təhlükəsizdir, bütün yaddaşı təmizləyir
            window.location.href = '/';
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to delete account.' });
            setIsDeleteModalOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    if (!user) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 sm:p-6 flex flex-col items-center relative overflow-x-hidden">
            {/* Arxa fon bəzəyi */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl w-full relative z-10 mt-6 sm:mt-10">
                {/* Yuxarı Naviqasiya */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors font-bold uppercase text-xs tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                        <ArrowLeft size={16} /> Basecamp
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-colors border border-red-500/10 font-bold uppercase text-xs tracking-widest">
                        <LogOut size={16} /> Disconnect
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-[#1e293b]/70 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 opacity-80"></div>

                    <div className="mb-10 text-center sm:text-left">
                        <h2 className="text-4xl sm:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">Traveler Profile</h2>
                        <p className="text-slate-400 mt-2 font-medium">Manage your Triplet identity and security settings.</p>
                    </div>

                    {status.msg && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mb-10 p-5 rounded-2xl flex items-start sm:items-center gap-4 text-sm font-bold border backdrop-blur-md ${status.type === 'success' ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
                            <span className="leading-relaxed">{status.msg}</span>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* --- SOL TƏRƏF: AVATAR --- */}
                        <div className="lg:col-span-4 space-y-6 flex flex-col items-center lg:items-start border-b lg:border-b-0 lg:border-r border-white/5 pb-10 lg:pb-0 lg:pr-10">
                            <div className="relative group cursor-pointer">
                                <div className="w-48 h-48 rounded-[2.5rem] bg-slate-900 border-4 border-[#0f172a] shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={80} className="text-slate-700" />
                                    )}
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-sky-500 p-4 rounded-2xl shadow-[0_10px_20px_rgba(14,165,233,0.3)] border-4 border-[#1e293b] text-white">
                                    <Camera size={24} />
                                </div>
                            </div>

                            <div className="w-full space-y-3 mt-8">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Avatar URL Link</label>
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="Paste image link here..."
                                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-sky-500/50 outline-none transition-all placeholder-slate-600 shadow-inner"
                                />
                                <button
                                    onClick={handleUpdateAvatar}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20"
                                >
                                    {isLoading ? 'Scanning...' : <><Save size={18} /> Update Image</>}
                                </button>
                            </div>
                        </div>

                        {/* --- SAĞ TƏRƏF: ŞƏXSİ MƏLUMATLAR --- */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* Ad və Email */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                                    <Edit3 size={18} className="text-teal-400" /> Identity Coordinates
                                </h3>

                                <div className="bg-slate-900/40 p-1 rounded-3xl border border-white/5 space-y-1">
                                    {/* Ad Dəyişdirmə */}
                                    <div className="p-5 sm:p-6 bg-white/5 rounded-[1.5rem] flex flex-col sm:flex-row sm:items-end gap-4">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Traveler Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-transparent border-b-2 border-slate-700 focus:border-teal-400 px-1 py-2 text-xl font-bold text-white outline-none transition-colors"
                                            />
                                        </div>
                                        <button
                                            onClick={handleUpdateName} disabled={isSavingName}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0 border border-white/5"
                                        >
                                            {isSavingName ? '...' : 'Save Name'}
                                        </button>
                                    </div>

                                    {/* Sabit Email */}
                                    <div className="p-5 sm:p-6 bg-transparent flex flex-col justify-center">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 mb-1">Registered Email (Fixed)</p>
                                        <p className="text-lg font-medium text-slate-400 px-1">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Təhlükəsizlik Paneli */}
                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                                    <ShieldAlert size={18} className="text-indigo-400" /> Security Protocol
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleRequestPasswordReset}
                                        className="flex flex-col items-start p-6 bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 rounded-[2rem] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Lock size={18} className="text-indigo-400" />
                                        </div>
                                        <span className="font-bold text-white mb-1">Reset Password</span>
                                        <span className="text-xs text-slate-500 text-left">Receive a secure link to change your access codes.</span>
                                    </button>

                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="flex flex-col items-start p-6 bg-slate-900/60 hover:bg-red-950/30 border border-white/5 hover:border-red-500/30 rounded-[2rem] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Trash2 size={18} className="text-red-400" />
                                        </div>
                                        <span className="font-bold text-red-400 mb-1">Erase Account</span>
                                        <span className="text-xs text-slate-500 text-left">Permanently delete your profile and all travel data.</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- HESABI SİLMƏ MODALI --- */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-red-500/20 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                            </div>

                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Erase Identity?</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                This action is irreversible. Your profile, avatar, and all future travel plans will be permanently destroyed.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full py-4 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 uppercase tracking-widest text-xs transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Yes, Terminate Account
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="w-full py-4 rounded-xl font-bold text-slate-300 bg-transparent hover:bg-white/5 border border-white/10 transition-colors text-sm"
                                >
                                    Cancel Request
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;