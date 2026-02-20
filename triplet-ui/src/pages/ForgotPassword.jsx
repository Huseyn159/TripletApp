import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Map, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setStatus({ type: 'success', message: 'If an account exists, a recovery map has been sent to your email.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Something went wrong on our end. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="bg-sky-500/20 p-4 rounded-full mb-4 border border-sky-400/30 text-sky-300">
                        <Map className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white font-serif tracking-wide">Lost Your Way?</h1>
                    <p className="text-sky-100 text-sm mt-2 font-medium">Enter your email and we'll send you a recovery route.</p>
                </div>

                <form onSubmit={handleResetRequest} className="space-y-5">
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
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-sky-300 transition-colors" />
                        <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} required
                               className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none text-white placeholder-white/50 transition-all" />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading}
                                   className="w-full bg-sky-500/90 hover:bg-sky-400 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all disabled:opacity-70 backdrop-blur-md border border-sky-300/50"
                    >
                        {isLoading ? 'Sending Route...' : 'Send Recovery Link'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-sky-300 font-bold hover:text-white transition-colors underline decoration-sky-300/50 underline-offset-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Basecamp (Sign In)
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;