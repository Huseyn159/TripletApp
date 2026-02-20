import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, PlaneTakeoff, AlertCircle, CheckCircle2, Compass, ShieldCheck, Inbox } from 'lucide-react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [status, setStatus] = useState({ type: null, messages: [] });
    const [isLoading, setIsLoading] = useState(false);

    // 🔥 YENİ: Qeydiyyatın uğurlu olub-olmadığını izləyir
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatus({ type: null, messages: [] });

        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: 'error', messages: ["Passwords don't match. Please check your coordinates."] });
            return;
        }

        if (formData.password.length < 8) {
            setStatus({ type: 'error', messages: ["Password must be at least 8 characters long."] });
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/register', formData);
            // 🔥 FIX: Logine yönləndirmirik, xüsusi ekranı açırıq!
            setIsRegistered(true);
        } catch (err) {
            const errorData = err.response?.data;
            let errorList = [];
            if (typeof errorData === 'object' && errorData !== null && !errorData.message) {
                errorList = Object.values(errorData);
            } else {
                errorList = [errorData?.message || 'Oops! Something went wrong on the runway.'];
            }
            setStatus({ type: 'error', messages: errorList });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 🔥 YENİ: QEYDİYYAT UĞURLU OLDUQDA ÇIXAN EKRAN
    if (isRegistered) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]"></div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 text-center">
                    <div className="bg-teal-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-400/30">
                        <Inbox className="w-12 h-12 text-teal-300" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3 font-serif tracking-wide">Check Your Inbox</h2>
                    <p className="text-teal-100/80 text-sm mb-8 leading-relaxed">
                        We've sent a boarding pass (verification link) to <br/><span className="text-white font-bold">{formData.email}</span>.<br/> Please click it to activate your account.
                    </p>
                    <button onClick={() => navigate('/login')} className="w-full bg-teal-500/90 hover:bg-teal-400 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all backdrop-blur-md border border-teal-300/50">
                        Proceed to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-teal-500/20 p-4 rounded-full mb-4 border border-teal-400/30 text-teal-300">
                        <Compass className="w-10 h-10 animate-[spin_4s_linear_infinite]" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-wide font-serif">Start Exploring</h1>
                    <p className="text-teal-100 text-sm mt-2 font-medium">Create an account to plan your dream trips.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {status.messages.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-4 rounded-xl text-sm backdrop-blur-md border ${status.type === 'error' ? 'bg-red-500/20 border-red-400/50 text-red-100' : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100'}`}>
                            <div className="flex items-center gap-2 mb-1 font-bold">
                                {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                {status.type === 'error' ? 'Flight Delayed:' : 'Cleared for Takeoff!'}
                            </div>
                            <ul className="list-disc list-inside space-y-1 ml-1 text-xs mt-2 opacity-90">
                                {status.messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
                            </ul>
                        </motion.div>
                    )}

                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-teal-300 transition-colors" />
                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-white placeholder-white/50" />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-teal-300 transition-colors" />
                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-white placeholder-white/50" />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-teal-300 transition-colors" />
                        <input type="password" name="password" placeholder="Secure Password" onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-white placeholder-white/50" />
                    </div>

                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-teal-300 transition-colors" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:bg-slate-900/60 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all text-white placeholder-white/50" />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} className="w-full bg-teal-500/90 hover:bg-teal-400 text-white py-3.5 mt-2 rounded-xl font-bold shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 backdrop-blur-md border border-teal-300/50">
                        {isLoading ? 'Booking Ticket...' : 'Join the Adventure'}
                        {!isLoading && <PlaneTakeoff className="w-5 h-5" />}
                    </motion.button>
                </form>

                <div className="mt-6 text-center text-sm text-white/70">
                    Already a traveler? <Link to="/login" className="text-teal-300 font-bold hover:text-white transition-colors underline decoration-teal-300/50 underline-offset-4">Sign in here</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;