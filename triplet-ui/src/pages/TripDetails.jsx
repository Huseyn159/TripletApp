import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Wallet, Sparkles, Navigation, CheckCircle2, Trash2, Plus, Bot, Send, ChevronRight, Globe, Cloud, Sun, CloudRain, Snowflake, TrendingDown, TrendingUp, PieChart } from 'lucide-react';
import api from '../api/axios';

const TripDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [newItinerary, setNewItinerary] = useState({ placeName: '', visitDate: '', visitTime: '', estimatedCost: '' });
    const [showItineraryForm, setShowItineraryForm] = useState(false);
    const [newChecklist, setNewChecklist] = useState({ itemName: '' });

    // AI CHAT STATE
    const [aiQuery, setAiQuery] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isAiTyping, setIsAiTyping] = useState(false);

    // 🔥 DÜZƏLİŞ: scrollIntoView əvəzinə, ancaq qutunun içini scroll etmək üçün
    const chatContainerRef = useRef(null);

    // HAVA PROQNOZU
    const [forecast, setForecast] = useState([]);

    // BÜDCƏ MODALI VƏ HESABLAMALAR
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [budgetAction, setBudgetAction] = useState('add');

    const fetchTripDetails = useCallback(async () => {
        try {
            const response = await api.get(`/trips/${id}`);
            setTrip(response.data);

            if (chatMessages.length === 0 && response.data) {
                setChatMessages([
                    { sender: 'ai', text: `"Commander, coordinates for ${response.data.destination} are locked. How can I assist with your logistics?"` }
                ]);
            }
        } catch (error) {
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate, chatMessages.length]);

    useEffect(() => { fetchTripDetails(); }, [fetchTripDetails]);

    // 🔥 DÜZƏLİŞ: Ekranın tullanmasının qarşısını alan kod!
    // Yalnız Chat qutusunun içini aşağı sürüşdürür.
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatMessages, isAiTyping]);

    useEffect(() => {
        if (!trip?.destination) return;
        const fetchWeather = async () => {
            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${trip.destination}&count=1`);
                const geoData = await geoRes.json();
                if (!geoData.results || geoData.results.length === 0) return;
                const { latitude, longitude } = geoData.results[0];

                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
                const weatherData = await weatherRes.json();

                const formattedForecast = weatherData.daily.time.slice(0, 5).map((date, i) => {
                    const code = weatherData.daily.weathercode[i];
                    let type = 'sun';
                    if (code >= 1 && code <= 3) type = 'cloud';
                    if (code >= 51 && code <= 67) type = 'rain';
                    if (code >= 71 && code <= 77) type = 'snow';

                    return {
                        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                        max: Math.round(weatherData.daily.temperature_2m_max[i]),
                        min: Math.round(weatherData.daily.temperature_2m_min[i]),
                        type: type
                    };
                });
                setForecast(formattedForecast);
            } catch (error) {}
        };
        fetchWeather();
    }, [trip?.destination]);

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        const amount = Number(budgetAmount);
        if (!amount || amount <= 0) return;

        const finalAmount = budgetAction === 'add' ? amount : -amount;
        try {
            await api.put(`/trips/${id}/budget?amount=${finalAmount}`);
            await fetchTripDetails();
            setIsBudgetModalOpen(false);
            setBudgetAmount('');
        } catch (error) {
            console.error("Budget update error", error);
        }
    };

    const handleAiFinancialAudit = async () => {
        const places = trip.itineraries.map(i => `${i.placeName} ($${i.estimatedCost})`).join(', ');
        const prompt = `Mənim ümumi büdcəm $${trip.budget}-dir. Planlanan xərclərim bunlardır: ${places}. 
        Zəhmət olmasa bu xərcləri kateqoriyalara (Nəqliyyat, Əyləncə, Yemək və s.) böl və mənə büdcəmə uyğun 2 cümləlik çox qısa maliyyə məsləhəti ver. İngiliscə yaz.`;

        setAiQuery('');
        setChatMessages(prev => [...prev, { sender: 'user', text: "Run Financial Audit on my itinerary." }]);
        setIsAiTyping(true);

        try {
            const response = await api.post(`/trips/${id}/chat`, prompt, { headers: { 'Content-Type': 'text/plain' } });
            setChatMessages(prev => [...prev, { sender: 'ai', text: response.data }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { sender: 'ai', text: "Audit failed. Network error." }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleSendAiMessage = async () => {
        if (!aiQuery.trim()) return;
        const userMsg = aiQuery;
        setAiQuery('');
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setIsAiTyping(true);
        try {
            const response = await api.post(`/trips/${id}/chat`, userMsg, { headers: { 'Content-Type': 'text/plain' } });
            setChatMessages(prev => [...prev, { sender: 'ai', text: response.data }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { sender: 'ai', text: "Comms error. Signal lost." }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleToggleChecklist = async (item) => {
        const newStatus = !item.isPacked;
        setTrip(prev => ({...prev, checklists: prev.checklists.map(c => c.id === item.id ? { ...c, isPacked: newStatus } : c)}));
        try { await api.put(`/trips/${id}/checklists/${item.id}`, { id: item.id, itemName: item.itemName, isPacked: newStatus, packed: newStatus });
        } catch (error) { fetchTripDetails(); }
    };

    const handleAddItinerary = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/trips/${id}/itineraries`, { ...newItinerary, estimatedCost: Number(newItinerary.estimatedCost) });
            await fetchTripDetails();
            setNewItinerary({ placeName: '', visitDate: '', visitTime: '', estimatedCost: '' });
            setShowItineraryForm(false);
        } catch (error) { console.error(error); }
    };

    const handleDeleteItinerary = async (itineraryId) => {
        try {
            await api.delete(`/trips/${id}/itineraries/${itineraryId}`);
            setTrip(prev => ({ ...prev, itineraries: prev.itineraries.filter(i => i.id !== itineraryId) }));
        } catch (error) { console.error(error); }
    };

    const handleAddChecklist = async (e) => {
        e.preventDefault();
        if(!newChecklist.itemName.trim()) return;
        try { await api.post(`/trips/${id}/checklists`, { itemName: newChecklist.itemName, isPacked: false }); await fetchTripDetails(); setNewChecklist({ itemName: '' });
        } catch (error) {}
    };

    const handleDeleteChecklist = async (checklistId) => {
        try { await api.delete(`/trips/${id}/checklists/${checklistId}`); setTrip(prev => ({ ...prev, checklists: prev.checklists.filter(c => c.id !== checklistId) }));
        } catch (error) {}
    };

    if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!trip) return null;

    const totalSpent = trip.itineraries?.reduce((sum, item) => sum + item.estimatedCost, 0) || 0;
    const remainingBudget = trip.budget - totalSpent;
    const spendPercentage = trip.budget > 0 ? Math.min((totalSpent / trip.budget) * 100, 100) : 0;

    return (
        <div className="min-h-screen relative font-sans text-slate-200 bg-[#0f172a] overflow-x-hidden pb-10 selection:bg-sky-500/30">
            <div className="fixed inset-0 bg-cover bg-center z-0 opacity-50" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')" }}></div>
            <div className="fixed inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/60 to-[#0f172a]/95 z-0"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 bg-[#1e293b]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                    <div>
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-all mb-4 text-xs font-bold uppercase tracking-widest group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </button>
                        <div className="flex items-center gap-3 text-sky-400 mb-1">
                            <Globe size={18} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Travel Log</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">{trip.destination}</h1>
                        <div className="flex items-center gap-3 mt-4 text-slate-300 font-bold text-xs bg-slate-900/50 px-4 py-2 rounded-xl w-fit border border-white/5">
                            <Calendar size={14} className="text-sky-400" />
                            <span>{trip.startDate}</span>
                            <ChevronRight size={12} className="opacity-30" />
                            <span>{trip.endDate}</span>
                        </div>

                        {/* HAVA PROQNOZU */}
                        {forecast.length > 0 && (
                            <div className="flex items-center mt-5 bg-slate-900/50 p-3 rounded-2xl border border-white/5 w-fit shadow-inner">
                                {forecast.map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-center px-4 border-r border-white/10 last:border-0">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{day.day}</span>
                                        {day.type === 'sun' && <Sun size={18} className="text-amber-400 mb-2 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />}
                                        {day.type === 'cloud' && <Cloud size={18} className="text-slate-300 mb-2 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" />}
                                        {day.type === 'rain' && <CloudRain size={18} className="text-sky-400 mb-2 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />}
                                        {day.type === 'snow' && <Snowflake size={18} className="text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                                        <div className="flex gap-2 text-xs font-bold">
                                            <span className="text-white">{day.max}°</span>
                                            <span className="text-slate-500">{day.min}°</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BÜDCƏ WIDGET */}
                    <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl min-w-[300px] flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/20">
                                    <Wallet className="text-emerald-400" size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Finances</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setBudgetAction('sub'); setIsBudgetModalOpen(true); }} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><TrendingDown size={16}/></button>
                                <button onClick={() => { setBudgetAction('add'); setIsBudgetModalOpen(true); }} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"><TrendingUp size={16}/></button>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <p className="text-3xl font-black text-white tabular-nums">${trip.budget}</p>
                                <p className="text-xs font-bold text-slate-500 mb-1">Total</p>
                            </div>

                            <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden flex">
                                <div className={`h-full ${spendPercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-1000 ease-out`} style={{ width: `${spendPercentage}%` }}></div>
                            </div>

                            <div className="flex justify-between mt-3 text-xs font-bold">
                                <span className="text-slate-400">Planned: <span className="text-white">${totalSpent}</span></span>
                                <span className={remainingBudget < 0 ? 'text-red-400' : 'text-emerald-400'}>
                                    Remaining: ${remainingBudget}
                                </span>
                            </div>
                        </div>

                        <button onClick={handleAiFinancialAudit} disabled={isAiTyping || trip.itineraries?.length === 0} className="w-full mt-2 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <PieChart size={14} /> AI Budget Audit
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                    {/* LEFT: ITINERARY */}
                    <div className="lg:col-span-8 space-y-6">
                        {trip.aiGeneralAdvice && (
                            <div className="bg-[#1e293b]/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg flex gap-4 items-center border border-white/5">
                                <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
                                    <Sparkles className="text-amber-400 shrink-0" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">AI Protocol Advice</h4>
                                    <p className="text-slate-300 font-medium italic text-sm leading-relaxed">"{trip.aiGeneralAdvice}"</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                    <div className="bg-sky-500/20 p-2 rounded-xl border border-sky-500/30">
                                        <Navigation className="text-sky-400" size={20} />
                                    </div>
                                    Route Map
                                </h2>
                                <button onClick={() => setShowItineraryForm(!showItineraryForm)} className="bg-sky-500 text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                    {showItineraryForm ? "Cancel" : "Add Stop"}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showItineraryForm && (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        onSubmit={handleAddItinerary} className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4 overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Place" value={newItinerary.placeName} onChange={e => setNewItinerary({...newItinerary, placeName: e.target.value})} required className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                                            <input type="number" placeholder="Cost ($)" value={newItinerary.estimatedCost} onChange={e => setNewItinerary({...newItinerary, estimatedCost: e.target.value})} required className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500" />
                                            <input type="date" value={newItinerary.visitDate} min={trip.startDate} max={trip.endDate} onChange={e => setNewItinerary({...newItinerary, visitDate: e.target.value})} required className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white [color-scheme:dark]" />
                                            <input type="time" value={newItinerary.visitTime} onChange={e => setNewItinerary({...newItinerary, visitTime: e.target.value})} required className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white [color-scheme:dark]" />
                                        </div>
                                        <button type="submit" className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest">Confirm Waypoint</button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="space-y-6 relative border-l-2 border-slate-700 ml-4 pl-8">
                                {trip.itineraries?.map((item) => (
                                    <div key={item.id} className="relative group">
                                        <div className="absolute -left-[41px] top-1.5 w-5 h-5 bg-[#0f172a] border-4 border-sky-500 rounded-full z-10 shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-transform group-hover:scale-125"></div>
                                        <div className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 p-6 rounded-2xl transition-all shadow-lg">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{item.visitDate} // {item.visitTime}</span>
                                                    <h3 className="text-xl font-bold text-white tracking-tight uppercase mt-1">{item.placeName}</h3>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-2xl font-black text-emerald-400 tabular-nums">${item.estimatedCost}</span>
                                                    <button onClick={() => handleDeleteItinerary(item.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors bg-white/5 rounded-lg"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            {item.aiPlaceTip && (
                                                <div className="mt-4 pt-4 border-t border-white/5 text-slate-400 text-xs italic flex items-start gap-2">
                                                    <Sparkles size={14} className="text-amber-500/70 shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">{item.aiPlaceTip}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: GEAR & NAV */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* PACKING */}
                        <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl">
                            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                                    <CheckCircle2 className="text-emerald-400" size={18} />
                                </div>
                                Packing
                            </h2>
                            <form onSubmit={handleAddChecklist} className="flex gap-2 mb-6">
                                <input type="text" placeholder="Add gear..." value={newChecklist.itemName} onChange={e => setNewChecklist({ itemName: e.target.value })} required className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500" />
                                <button type="submit" className="bg-white text-slate-900 p-2.5 rounded-xl hover:bg-emerald-400 transition-all"><Plus size={18} /></button>
                            </form>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {trip.checklists?.map((item) => (
                                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${item.isPacked ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/40 border-white/5 hover:border-white/10'}`}>
                                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleToggleChecklist(item)}>
                                            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${item.isPacked ? 'bg-emerald-500 border-emerald-500 shadow-inner' : 'border-slate-600 bg-slate-900'}`}>
                                                {item.isPacked && <CheckCircle2 size={12} className="text-slate-900" />}
                                            </div>
                                            <span className={`text-sm font-bold ${item.isPacked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.itemName}</span>
                                        </div>
                                        <button onClick={() => handleDeleteChecklist(item.id)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NAVIGATOR WIDGET (AI CHAT) - Sabit hündürlüklü və ekrana yapışan dizayn */}
                        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] h-[400px] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                                <div className="p-2.5 bg-sky-500 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                                    <Bot className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Navigator</h3>
                                    <p className="text-[9px] text-sky-400 font-bold tracking-widest uppercase">System Online</p>
                                </div>
                            </div>

                            {/* 🔥 DÜZƏLİŞ: Burada daxili scroll aktivdir və ref bu div-ə qoşulub */}
                            <div
                                ref={chatContainerRef}
                                className="flex-1 bg-black/40 rounded-2xl p-4 mb-4 overflow-y-auto border border-white/5 flex flex-col gap-3 custom-scrollbar"
                            >
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-slate-700 text-white self-end rounded-tr-none' : 'bg-sky-500/10 border border-sky-500/20 text-sky-100 self-start rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                ))}
                                {isAiTyping && (
                                    <div className="bg-sky-500/5 border border-sky-500/10 text-sky-400 self-start rounded-2xl rounded-tl-none p-3 max-w-[85%] flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 relative">
                                <input type="text" placeholder="Ask AI..." value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendAiMessage()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-sky-500 transition-colors" />
                                <button onClick={handleSendAiMessage} disabled={isAiTyping} className="bg-sky-500 text-slate-900 px-4 rounded-xl hover:bg-sky-400 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20"><Send size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BÜDCƏ MODALI */}
            <AnimatePresence>
                {isBudgetModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative">
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">{budgetAction === 'add' ? 'Add Funds' : 'Reduce Funds'}</h3>
                            <p className="text-slate-400 text-xs mb-6">Enter the amount to {budgetAction === 'add' ? 'add to' : 'subtract from'} your total budget.</p>
                            <form onSubmit={handleUpdateBudget}>
                                <input type="number" placeholder="0.00" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} required className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-sky-500 mb-6" />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors uppercase text-xs tracking-widest border border-white/5">Cancel</button>
                                    <button type="submit" className={`flex-1 py-3.5 rounded-xl font-bold text-slate-900 ${budgetAction === 'add' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300'} transition-colors uppercase text-xs tracking-widest shadow-lg`}>Confirm</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TripDetails;