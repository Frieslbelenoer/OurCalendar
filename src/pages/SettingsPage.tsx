import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { db, doc, updateDoc, auth } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [notifications, setNotifications] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setPhotoURL(user.photoURL || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!auth.currentUser || !user) return;
        setIsLoading(true);
        setMessage(null);

        try {
            // Update Auth Profile using the raw Firebase User object
            await updateProfile(auth.currentUser, {
                displayName,
                photoURL
            });

            // Update Firestore Document to keep sync
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                displayName,
                photoURL
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto w-full animate-fade-in custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-8 pb-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Settings</h1>
                    <p className="text-secondary text-lg font-light">Manage your account preferences and workspace settings.</p>
                </header>

                {/* Profile Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wider text-xs mb-4 px-1">Profile Information</h2>
                    <div className="card bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-xl">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-700/50 bg-slate-800 shadow-2xl transition-all duration-300 group-hover:border-purple-500/50">
                                        {photoURL ? (
                                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" width="112" height="112" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white">
                                                {displayName?.charAt(0) || user?.email?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                                        <span className="text-xs font-medium text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">Change</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="flex-1 w-full space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Display Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                            autoComplete="name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Avatar</label>
                                        <div className="flex flex-col gap-3">
                                            {/* Hidden Input for Form Submission */}
                                            <input
                                                type="hidden"
                                                value={photoURL}
                                                readOnly
                                            />

                                            <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                                                <p className="text-sm text-gray-400 flex-1">
                                                    Click "Randomize" until you find an avatar that suits your vibe.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        const seed = Math.random().toString(36).substring(7);
                                                        setPhotoURL(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
                                                    }}
                                                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 text-sm font-bold flex items-center gap-2 transform active:scale-95"
                                                    type="button"
                                                >
                                                    <span>🎲</span> Randomize
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                                        <div className="input flex items-center justify-between opacity-70 cursor-not-allowed bg-opacity-50">
                                            <span>{user?.email}</span>
                                            <svg width="16" height="16" className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-slate-700/50 mt-2">
                                    <div className="h-6">
                                        {message && (
                                            <span className={`text-sm font-medium animate-fade-in ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {message.text}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        type="button"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isLoading && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-wider text-xs mb-4 px-1">App Preferences</h2>
                    <div className="card bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-700/50">
                        <div className="p-6 flex items-center justify-between group hover:bg-slate-700/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-purple-400">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Dark Mode</h4>
                                    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Adjust the interface theme</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isDark}
                                aria-label="Toggle Dark Mode"
                                onClick={toggleTheme}
                                className="toggle-switch"
                            >
                                <div className="toggle-switch-handle"></div>
                            </button>
                        </div>

                        <div className="p-6 flex items-center justify-between group hover:bg-slate-700/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-blue-400">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Notifications</h4>
                                    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Get alerts for upcoming events</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={notifications}
                                aria-label="Toggle Notifications"
                                onClick={() => setNotifications(!notifications)}
                                className="toggle-switch"
                            >
                                <div className="toggle-switch-handle"></div>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
