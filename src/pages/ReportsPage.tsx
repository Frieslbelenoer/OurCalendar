import React from 'react';

export const ReportsPage: React.FC = () => {
    return (
        <div className="p-8 h-full overflow-y-auto w-full animate-fade-in custom-scrollbar">
            <div className="max-w-6xl mx-auto pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-white">Statistik Circle</h1>
                    <p className="text-secondary text-lg font-light">Belum ada data nih, mabar dulu lah!</p>
                </header>

                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-slate-800/40 rounded-3xl border border-slate-700/50">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-white mb-2">Masih Kosong Melompong</h3>
                    <p className="max-w-md mx-auto">
                        Data statistik bakal muncul kalo kalian udah sering mabar dan nongkrong bareng.
                        Gas bikin event sekarang!
                    </p>
                </div>
            </div>
        </div>
    );
};
