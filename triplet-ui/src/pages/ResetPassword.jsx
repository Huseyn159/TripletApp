import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, ShieldCheck, Sunrise } from 'lucide-react';
import api from '../api/axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        if (password !== confirmPassword) {
            return setStatus({ type: 'error', message: 'Passwords do not match. Check your inputs.' });
        }
        if (password.length < 8) {
            return setStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
        }
        if (!token) {
            return setStatus({ type: 'error', message: 'Invalid or missing recovery token.' });
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token: token,
                newPassword: password,
                confirmPassword: confirmPassword
            });
            setStatus({ type: 'success', message: 'Coordinates updated! Redirecting to login...' });
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to reset password. The link might be expired.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2011&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-amber-500/20 p-4 rounded-full mb-4 border border-amber-400/30 text-amber-300">
                        <Sunrise className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white font-serif tracking-wide">New Beginnings</h1>
                    <p className="text-amber-100 text-sm mt-2 font-medium">Set a new password to resume your travels.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                    {status.message && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className={`p-4 rounded-xl text-sm backdrop-blur-md border flex items-start gap-2 ${
                                        status.type === 'error' ? 'bg-red-500/20 border-red-400/50 text-red-100' : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100'
                                    }`}
                        >
                            {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <p className="font-medium opacity-90 leading-relaxed">{status.message}</p>
                        </motion.div>
                    )}

                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-amber-300 transition-colors" />
                        <input type="password" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} required minLength="8"
                               className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-white placeholder-white/50" />
                    </div>

                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-amber-300 transition-colors" />
                        <input type="password" placeholder="Confirm New Password" onChange={(e) => setConfirmPassword(e.target.value)} required minLength="8"
                               className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-white placeholder-white/50" />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading}
                                   className="w-full bg-amber-500/90 hover:bg-amber-400 text-white py-3.5 mt-2 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all disabled:opacity-70 backdrop-blur-md border border-amber-300/50"
                    >
                        {isLoading ? 'Updating...' : 'Set New Route (Reset)'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-amber-300 font-bold hover:text-white transition-colors underline decoration-amber-300/50 underline-offset-4">
                        Return to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;