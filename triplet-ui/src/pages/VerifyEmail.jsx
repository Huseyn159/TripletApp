import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { CheckCircle2, AlertCircle, Loader2, Compass } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');

    // 🔥 FIX: StrictMode-un 2 dəfə render etməsinin qarşısını alırıq
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token || hasFetched.current) return;
        hasFetched.current = true;

        const verify = async () => {
            try {
                await api.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setTimeout(() => navigate('/login'), 3500);
            } catch (error) {
                setStatus('error');
            }
        };
        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px]"></div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 text-center">

                {status === 'loading' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="bg-sky-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-400/30">
                            <Loader2 className="w-10 h-10 text-sky-300 animate-spin" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 font-serif tracking-wide">Verifying...</h2>
                        <p className="text-sky-100/80 text-sm">Please wait while we confirm your coordinates.</p>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="bg-emerald-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/30">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 font-serif tracking-wide">Clear Skies!</h2>
                        <p className="text-emerald-100/80 text-sm mb-6">Your identity is confirmed. Redirecting to Basecamp...</p>
                        <Compass className="w-6 h-6 text-emerald-400/50 animate-spin mx-auto" style={{ animationDuration: '3s' }} />
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="bg-red-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-400/30">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 font-serif tracking-wide">Link Broken</h2>
                        <p className="text-red-100/80 text-sm mb-8">This verification link is invalid or has expired.</p>
                        <button onClick={() => navigate('/register')} className="w-full bg-red-500/90 hover:bg-red-400 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all backdrop-blur-md border border-red-400/50">
                            Return to Registration
                        </button>
                    </motion.div>
                )}

            </motion.div>
        </div>
    );
};

export default VerifyEmail;