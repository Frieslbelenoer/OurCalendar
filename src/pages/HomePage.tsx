import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { useCalendar } from '../context/CalendarContext';
import { format, differenceInHours, differenceInMinutes, nextFriday, setHours, setMinutes } from 'date-fns';
import '../styles/index.css';

export const HomePage: React.FC = () => {
    const { user } = useAuth();
    const { allUsers } = useUsers(); // For feed simulation
    const { events } = useCalendar();
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number }>({ hours: 0, minutes: 0 });

    // Hype Timer
    useEffect(() => {
        const targetDate = setMinutes(setHours(nextFriday(new Date()), 20), 0);
        const tick = () => {
            const now = new Date();
            const diffH = differenceInHours(targetDate, now);
            const diffM = differenceInMinutes(targetDate, now) % 60;
            setTimeLeft({ hours: Math.max(0, diffH), minutes: Math.max(0, diffM) });
        };
        tick();
        const timer = setInterval(tick, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleImFree = () => {
        // In real app: Trigger notification
        alert("📢 SQUAD NOTIFIED: You are FREE! Prepare for invite spam.");
    };

    return (
        <div className="p-6 h-full overflow-y-auto w-full animate-fade-in custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* 1. Header (Compact) */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            HQ Dashboard
                        </h1>
                        <p className="text-gray-400 text-sm">Welcome back, Commander {user?.displayName?.split(' ')[0]}.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-mono text-purple-400 border border-purple-500/30 px-2 py-1 rounded bg-purple-900/10">
                            SERVER TIME: {format(new Date(), 'HH:mm')}
                        </p>
                    </div>
                </div>

                {/* 2. Top Grid: Hero | Feed | Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Col 1: Hero (User Status) - Span 3 */}
                    <div className="lg:col-span-3 card bg-slate-800/60 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group h-full min-h-[300px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative mb-4 shrink-0">
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.3)] mx-auto overflow-hidden">
                                <img
                                    src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName}`}
                                    className="w-full h-full rounded-full bg-slate-900 object-cover"
                                    alt="User"
                                    style={{ minWidth: '100%', minHeight: '100%' }}
                                />
                            </div>
                            <div className="absolute bottom-1 right-1/2 translate-x-10 w-6 h-6 bg-green-500 border-4 border-slate-800 rounded-full dark:border-slate-900"></div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1 truncate w-full">{user?.displayName}</h2>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                            <span className="text-sm text-emerald-400 font-medium tracking-wide whitespace-nowrap">ONLINE & READY</span>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                            <button className="bg-slate-700/50 hover:bg-slate-700 text-xs py-2 rounded-lg text-gray-300 transition-colors">Edit Profile</button>
                            <button className="bg-slate-700/50 hover:bg-slate-700 text-xs py-2 rounded-lg text-gray-300 transition-colors">Settings</button>
                        </div>
                    </div>

                    {/* Col 2: Live Feed - Span 5 */}
                    <div className="lg:col-span-5 card bg-slate-800/40 backdrop-blur border border-slate-700/50 p-6 rounded-2xl shadow-lg flex flex-col overflow-hidden h-full min-h-[300px]">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Squad Activity
                        </h3>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {/* Mock Feed Items */}
                            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors w-full">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Budi`} className="w-full h-full object-cover" alt="Budi" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-200 truncate"><span className="font-bold text-white">Budi</span> is now <span className="text-green-400 font-bold">Online</span></p>
                                    <p className="text-xs text-gray-500 mt-0.5">2 mins ago</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors w-full">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} className="w-full h-full object-cover" alt="Sarah" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-200 truncate"><span className="font-bold text-white">Sarah</span> reached <span className="text-yellow-400 font-bold">Gold III</span></p>
                                    <p className="text-xs text-gray-500 mt-0.5">15 mins ago</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors w-full">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Eko`} className="w-full h-full object-cover" alt="Eko" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-200 truncate"><span className="font-bold text-white">Eko</span> is "Busy working"</p>
                                    <p className="text-xs text-gray-500 mt-0.5">1 hour ago</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Lobby Chat - Span 4 */}
                    <div className="lg:col-span-4 card bg-slate-800/40 backdrop-blur border border-slate-700/50 p-6 rounded-2xl shadow-lg flex flex-col relative overflow-hidden h-full min-h-[300px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10 shrink-0">
                            <span className="text-lg">💬</span> Lobby Chat
                        </h3>
                        <div className="space-y-3 mb-4 flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2">
                            <div className="bg-slate-900/60 p-2.5 rounded-lg rounded-tl-none border border-slate-700/50 w-fit max-w-[90%]">
                                <p className="text-xs font-bold text-purple-400 mb-0.5">Fernando</p>
                                <p className="text-sm text-gray-300 break-words">Gas Valorant nanti malem?</p>
                            </div>
                            <div className="bg-slate-700/60 p-2.5 rounded-lg rounded-tr-none border border-slate-600/50 ml-auto w-fit max-w-[90%] text-right">
                                <p className="text-xs font-bold text-green-400 mb-0.5">You</p>
                                <p className="text-sm text-white break-words">Gas! Jam 8 kan?</p>
                            </div>
                            <div className="bg-slate-900/60 p-2.5 rounded-lg rounded-tl-none border border-slate-700/50 w-fit max-w-[90%]">
                                <p className="text-xs font-bold text-orange-400 mb-0.5">Citra</p>
                                <p className="text-sm text-gray-300 break-words">Aku telat dikit ya.</p>
                            </div>
                        </div>
                        <div className="relative z-10 mt-auto shrink-0">
                            <input type="text" placeholder="Type a message..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Grid: Big Hype + Quick Action */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Next Hype (Span 8) */}
                    <div className="lg:col-span-8 card relative overflow-hidden rounded-2xl border border-purple-500/30 group shadow-2xl">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                        <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase relative">
                                    Next Hype
                                    <span className="absolute -top-1 -right-4 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                                </h2>
                                <p className="text-purple-300 text-lg font-medium mb-6">Friday Night Valorant</p>
                                <div className="flex gap-4">
                                    <div className="bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-lg text-center min-w-[80px]">
                                        <span className="block text-2xl font-bold text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                                        <span className="text-[10px] text-gray-400 uppercase">Hours</span>
                                    </div>
                                    <div className="bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-lg text-center min-w-[80px]">
                                        <span className="block text-2xl font-bold text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                        <span className="text-[10px] text-gray-400 uppercase">Mins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <button className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all hover:scale-105 active:scale-95 border border-purple-400">
                                    JOIN LOBBY
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action (Span 4) */}
                    <div className="lg:col-span-4 h-full">
                        <button
                            onClick={handleImFree}
                            className="w-full h-full min-h-[180px] rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 hover:from-lime-300 hover:to-green-400 border-4 border-green-300/30 shadow-[0_0_40px_rgba(74,222,128,0.3)] flex flex-col items-center justify-center gap-2 group transition-all transform hover:-translate-y-1 active:scale-95 relative overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">📢</span>
                            <span className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                                AJAK GW MAIN!
                            </span>
                            <span className="text-slate-800 font-bold bg-white/20 px-3 py-1 rounded-full text-xs">
                                Broadcast "I'm Free"
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
