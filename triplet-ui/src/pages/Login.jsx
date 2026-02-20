import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, MapPin } from 'lucide-react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [shake, setShake] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        // Əgər istifadəçinin tokeni varsa, onu zorla Dashboard-a at (Login/Landing görməsin)
        const token = localStorage.getItem('token');
        if (token && token !== "undefined" && token !== "null") {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            // DİQQƏT: Back-end accessToken qaytarır. Onu 'token' adı ilə yadda saxlayırıq.
            const token = response.data.accessToken;

            if (token) {
                localStorage.setItem('token', token);
                // navigate əvəzinə window.location istifadə edirik
                // Bu, React-in yaddaşını təmizləyir və tokeni 100% düzgün oxutdurur.
                window.location.href = '/dashboard';
            } else {
                throw new Error("Identity token not found in response.");
            }

        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Invalid coordinates. Please try again.';

            if (errorMsg.toLowerCase().includes('locked')) {
                setError(
                    <span>
                        Passport locked. <Link to="/forgot-password" className="underline font-bold">Recover access here.</Link>
                    </span>
                );
            } else {
                setError(errorMsg);
            }
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-orange-500/20 p-4 rounded-full mb-4 border border-orange-400/30 text-orange-300">
                        <MapPin className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-wide">Welcome Back</h1>
                    <p className="text-orange-100 text-sm mt-2">Resume your journey with Triplet.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/20 border border-red-400/50 text-red-100 p-3.5 rounded-xl flex items-start gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-orange-300" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-white transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/50 group-focus-within:text-orange-300" />
                        <input
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/40 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-white transition-all"
                        />
                    </div>

                    <div className="flex justify-end -mt-2">
                        <Link
                            to="/forgot-password"
                            className="text-xs font-bold text-orange-300 hover:text-white transition-colors underline decoration-orange-300/50 underline-offset-4"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-orange-500/90 hover:bg-orange-400 text-white py-3.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Verifying Coordinates...' : 'Continue Journey'}
                        {!isLoading && <LogIn className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-white/70">
                    New here? <Link to="/register" className="text-orange-300 font-bold hover:underline">Start exploring</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;