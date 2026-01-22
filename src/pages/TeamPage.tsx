import React from 'react';
import { useUsers } from '../context/UsersContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export const TeamPage: React.FC = () => {
    const { allUsers } = useUsers();

    // Mock roles for now as backend might not have them populated yet
    const getRole = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('budi')) return { role: 'Tukang Maju', game: 'Valorant' };
        if (n.includes('fernando') || n.includes('user')) return { role: 'Babu Tim', game: 'Mobile Legends' };
        if (n.includes('hartono')) return { role: 'Kang Ngendok', game: 'PUBG' };
        return { role: 'Serba Bisa', game: 'Apa Aja Gas' };
    };

    return (
        <div className="p-8 h-full overflow-y-auto animate-fade-in custom-scrollbar">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-white">Anggota Circle</h1>
                    <p className="text-secondary text-lg font-light">
                        {allUsers.filter(u => u.isOnline).length} Onlen • {allUsers.length} Member
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allUsers.map((user) => {
                        const { role, game } = getRole(user.displayName);

                        return (
                            <div key={user.id} className="card group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30">
                                {/* Poke Button (Top Left) */}
                                <button
                                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-700/50 hover:bg-yellow-400 hover:text-black text-yellow-500 flex items-center justify-center transition-all shadow-sm transform hover:scale-110 active:scale-95 z-20"
                                    title="Colek member ini"
                                >
                                    <span className="text-lg">⚡</span>
                                </button>

                                {/* Online Status (Top Right) */}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`flex h-3 w-3 rounded-full ${user.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></span>
                                </div>

                                <div className="flex flex-col items-center text-center mt-2">
                                    <div className="relative mb-4">
                                        <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden ring-4 ring-slate-800 group-hover:ring-purple-500/30 transition-all">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                                                    {user.displayName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{user.displayName}</h3>
                                    <p className="text-xs text-gray-400 mb-4 font-mono">
                                        {user.isOnline ? 'Lagi Mabar' : user.lastSeen ? `Terakhir Onlen ${formatDistanceToNow(user.lastSeen, { addSuffix: true, locale: id })}` : 'Turu'}
                                    </p>

                                    <div className="w-full space-y-2">
                                        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50 flex items-center justify-between px-3">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Role</span>
                                            <span className="text-sm font-medium text-purple-300">{role}</span>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50 flex items-center justify-between px-3">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Game</span>
                                            <span className="text-sm font-medium text-cyan-300">{game}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
