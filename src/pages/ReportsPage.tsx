import React from 'react';

export const ReportsPage: React.FC = () => {
    // Mock Data for Heatmap (Intensity 0-10)
    // Rows: Hours (18, 19, 20, 21, 22, 23)
    // Cols: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const heatmapData = [
        [2, 3, 5, 4, 8, 9, 7], // 18:00
        [3, 4, 6, 8, 9, 10, 8], // 19:00
        [5, 6, 8, 9, 10, 10, 9], // 20:00
        [6, 7, 8, 10, 10, 10, 9], // 21:00
        [4, 5, 7, 8, 9, 10, 8], // 22:00
        [2, 3, 4, 5, 8, 9, 6], // 23:00
    ];
    const hours = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getColor = (intensity: number) => {
        if (intensity >= 9) return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'; // Glowing "Perfect Time"
        if (intensity >= 7) return 'bg-emerald-500';
        if (intensity >= 5) return 'bg-emerald-600';
        if (intensity >= 3) return 'bg-emerald-800';
        return 'bg-slate-800';
    };

    return (
        <div className="p-8 h-full overflow-y-auto w-full animate-fade-in custom-scrollbar">
            <div className="max-w-6xl mx-auto pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-white">Squad Analytics</h1>
                    <p className="text-secondary text-lg font-light">See when the squad is free and who is carrying the mood.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Availability Heatmap */}
                    <div className="card bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Availability Heatmap</h3>
                                <p className="text-sm text-gray-500">Darker = Busy, Glowing Green = Full Squad</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-[400px]">
                                {/* Header */}
                                <div className="grid grid-cols-8 gap-1 mb-2">
                                    <div className="text-xs text-gray-500"></div>
                                    {days.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>)}
                                </div>
                                {/* Rows */}
                                {heatmapData.map((row, hIndex) => (
                                    <div key={hIndex} className="grid grid-cols-8 gap-1 mb-1">
                                        <div className="text-xs text-gray-500 flex items-center justify-end pr-2">{hours[hIndex]}</div>
                                        {row.map((intensity, dIndex) => (
                                            <div
                                                key={dIndex}
                                                className={`h-8 rounded transition-all duration-300 hover:scale-110 cursor-pointer ${getColor(intensity)}`}
                                                title={`${intensity} friends free`}
                                            ></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Games Distribution */}
                    <div className="card bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Top Games</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Mobile Legends', percent: 85, color: 'bg-yellow-500' },
                                { name: 'Valorant', percent: 60, color: 'bg-rose-500' },
                                { name: 'PUBG Mobile', percent: 45, color: 'bg-orange-500' },
                                { name: 'EAFC 24', percent: 30, color: 'bg-blue-500' }
                            ].map(game => (
                                <div key={game.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{game.name}</span>
                                        <span className="text-gray-400">{game.percent}% Squad</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <div className={`h-full rounded-full ${game.color}`} style={{ width: `${game.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Leaderboard & Shame Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Podium */}
                    <div className="md:col-span-2 card bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-8">Top Nongkrong (Hours)</h3>
                        <div className="flex items-end justify-center gap-4 h-48">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full border-4 border-gray-400 overflow-hidden mb-2 relative">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Andi`} alt="Andi" />
                                    <div className="absolute -bottom-1 -right-1 bg-gray-400 text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</div>
                                </div>
                                <div className="w-20 bg-slate-700/50 rounded-t-lg h-24 flex items-end justify-center pb-2 border-t-4 border-gray-400">
                                    <span className="text-gray-300 font-bold">28h</span>
                                </div>
                                <span className="mt-2 font-bold text-gray-400">Andi</span>
                            </div>
                            {/* 1st Place */}
                            <div className="flex flex-col items-center z-10">
                                <span className="text-2xl mb-1">👑</span>
                                <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 relative shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Budi`} alt="Budi" />
                                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</div>
                                </div>
                                <div className="w-24 bg-slate-700/80 rounded-t-lg h-32 flex items-end justify-center pb-2 border-t-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                                    <span className="text-yellow-400 font-bold text-xl">42h</span>
                                </div>
                                <span className="mt-2 font-bold text-yellow-500">Budi S.</span>
                            </div>
                            {/* 3rd Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full border-4 border-orange-700 overflow-hidden mb-2 relative">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Caca`} alt="Caca" />
                                    <div className="absolute -bottom-1 -right-1 bg-orange-700 text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</div>
                                </div>
                                <div className="w-20 bg-slate-700/50 rounded-t-lg h-16 flex items-end justify-center pb-2 border-t-4 border-orange-700">
                                    <span className="text-orange-700 font-bold">15h</span>
                                </div>
                                <span className="mt-2 font-bold text-orange-800">Caca</span>
                            </div>
                        </div>
                    </div>

                    {/* Shame Badges */}
                    <div className="card bg-red-900/10 backdrop-blur-md border border-red-500/20 p-6 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                            <span>☠️</span> Wall of Shame
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-red-950/30 rounded-xl border border-red-500/10">
                                <div className="text-3xl">🐌</div>
                                <div>
                                    <h4 className="font-bold text-white">Si Paling Sibuk</h4>
                                    <p className="text-xs text-red-300">Jarang mabar 2 minggu ini.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Doni`} className="w-6 h-6 rounded-full" />
                                        <span className="text-sm font-medium text-gray-300">Doni</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-red-950/30 rounded-xl border border-red-500/10">
                                <div className="text-3xl">👻</div>
                                <div>
                                    <h4 className="font-bold text-white">Ghosting Master</h4>
                                    <p className="text-xs text-red-300">Janji main tapi ketiduran.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Eko`} className="w-6 h-6 rounded-full" />
                                        <span className="text-sm font-medium text-gray-300">Eko</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
