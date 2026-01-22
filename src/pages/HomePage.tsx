import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UsersContext';
import { CalendarEvent } from '../types';

import { format, isAfter, subDays, isSameDay } from 'date-fns';
import { useCalendar } from '../context/CalendarContext';
import { ConfirmDialog } from '../components/Shared/ConfirmDialog';
import '../styles/index.css';

export const HomePage: React.FC = () => {
    const { user } = useAuth();
    const { allUsers, currentGroup, createGroup, joinGroup } = useUsers(); // For feed simulation

    const [groupName, setGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
    const { events, openEventModal, updateEvent, approveJoinRequest, rejectJoinRequest, deleteEvent } = useCalendar();
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'default';
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, variant: 'default' });

    const showConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'default' = 'default') => {
        setConfirmDialog({ isOpen: true, title, message, onConfirm, variant });
    };

    const closeConfirm = () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    };

    const handleToggleDeleteMode = () => {
        setIsDeleteMode((prev) => !prev);
        setSelectedForDelete([]);
    };

    const handleSelectEvent = (id: string) => {
        setSelectedForDelete(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBatchDelete = async () => {
        if (!selectedForDelete.length) return;
        showConfirm(
            'Hapus Jadwal',
            `Yakin mau hapus ${selectedForDelete.length} jadwal sekaligus? Gak bisa di-undo lho!`,
            async () => {
                closeConfirm();
                setIsSubmitting(true);
                try {
                    for (const id of selectedForDelete) {
                        await deleteEvent(id);
                    }
                    setSelectedForDelete([]);
                    setIsDeleteMode(false);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSubmitting(false);
                }
            },
            'danger'
        );
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        setIsSubmitting(true);
        setError(null);
        try {
            await createGroup(groupName);
            // AuthContext listener will update user.groupId and re-render this component
        } catch (err: any) {
            setError("Failed to create squad: " + err.message);
            setIsSubmitting(false);
        }
    };

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setIsSubmitting(true);
        setError(null);
        try {
            await joinGroup(inviteCode.toUpperCase());
            // AuthContext listener will update user.groupId and re-render this component
        } catch (err: any) {
            setError("Failed to join squad: " + err.message);
            setIsSubmitting(false);
        }
    };

    const handleImFree = () => {
        // In real app: Trigger notification
        alert("📢 SQUAD NOTIFIED: You are FREE! Prepare for invite spam.");
    };

    const safeFormatDate = (dateVal: any, pattern: string) => {
        try {
            if (!dateVal) return format(new Date(), pattern);
            const d = new Date(dateVal);
            if (isNaN(d.getTime()) || d.getFullYear() <= 1971) return format(new Date(), pattern);
            return format(d, pattern);
        } catch (e) {
            return format(new Date(), pattern);
        }
    };

    const handleApproveJoin = async (evt: CalendarEvent, userId: string) => {
        if (!evt) return;
        try {
            await approveJoinRequest(evt.id, userId);
        } catch (err) {
            console.error(err);
            alert("Gagal approve, cek console.");
        }
    };

    const handleRejectJoin = async (evt: CalendarEvent, userId: string) => {
        if (!evt) return;
        try {
            await rejectJoinRequest(evt.id, userId);
        } catch (err) {
            console.error(err);
            alert("Gagal reject, sori.");
        }
    };

    // -------------------------------------------------------------------------
    // VIEW 1: NEW PLAYER (No Squad - Masih Solo Player)
    // -------------------------------------------------------------------------
    if (user && !user.groupId) {
        return (
            <div className="flex items-center justify-center min-h-full p-6 animate-fade-in bg-slate-50/50">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                    {/* Intro / Create Section */}
                    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col justify-center">
                        <div className="mb-8">
                            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
                                HALO, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">{user.displayName?.split(' ')[0]}</span>!
                            </h1>
                            <p className="text-slate-500 text-lg">Masih solo player nih? Biar hidup lu gak garing, mending bikin circle baru atau join circle bestie lu sekarang!</p>
                        </div>

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bikin Circle Baru</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Contoh: Tim Hore Hore"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !groupName}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {isSubmitting ? 'LAGI PROSES...' : 'GAS BIKIN!'}
                            </button>
                        </form>
                    </div>

                    {/* Join Section */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10 mb-8">
                            <h2 className="text-2xl font-bold mb-2">Punya Kode Invite?</h2>
                            <p className="text-indigo-100">Coba minta kode 6 digit ke ketum circle lu, terus masukin sini.</p>
                        </div>

                        <form onSubmit={handleJoinGroup} className="relative z-10 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Kode Invite</label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    placeholder="X7K9P2"
                                    maxLength={6}
                                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white font-mono text-center tracking-[0.5em] focus:outline-none focus:bg-white/30 transition-all placeholder:text-white/40 font-bold uppercase"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || inviteCode.length < 6}
                                className="w-full py-4 bg-white text-indigo-600 font-black rounded-xl hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {isSubmitting ? 'LAGI CONNECT...' : 'JOIN SEKARANG'}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white text-sm text-center font-medium backdrop-blur-sm">
                                {error}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // VIEW 2: DASHBOARD (Udah Punya Circle)
    // -------------------------------------------------------------------------


    // -------------------------------------------------------------------------
    // VIEW 2: DASHBOARD (Udah Punya Circle)
    // -------------------------------------------------------------------------
    return (
        <div className="p-6 h-full overflow-y-auto w-full animate-fade-in custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* 1. Header (Compact) */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Basecamp Kita
                        </h1>
                        <p className="text-gray-400 text-sm">Wazzup, {user?.displayName?.split(' ')[0]}! Apa kabar hari ini?</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                        <p className="text-xs font-mono text-purple-400 border border-purple-500/30 px-2 py-1 rounded bg-purple-900/10">
                            JAM SERVER: {format(new Date(), 'HH:mm')}
                        </p>
                    </div>
                </div>

                {/* 2. The Marv Crew (Profiles) - Full Width Horizontal */}
                <div className="flex flex-col gap-8 py-8 mb-8 relative">
                    <div className="flex flex-wrap items-start justify-center gap-6 px-4">
                        {allUsers.map((crewMember, index) => {
                            const styles = [
                                { bg: 'from-cyan-400 to-teal-500', shadow: 'rgba(34,211,238,0.4)', text: 'text-teal-400', role: 'SUHU IT' },
                                { bg: 'from-purple-500 to-indigo-600', shadow: 'rgba(167,139,250,0.3)', text: 'text-indigo-400', role: 'KANG CODING' },
                                { bg: 'from-pink-500 to-rose-600', shadow: 'rgba(251,113,133,0.3)', text: 'text-rose-400', role: 'SI PALIING ART' },
                                { bg: 'from-amber-400 to-orange-500', shadow: 'rgba(251,191,36,0.3)', text: 'text-amber-400', role: 'DUKUN BACKEND' },
                                { bg: 'from-emerald-400 to-green-500', shadow: 'rgba(52,211,153,0.3)', text: 'text-emerald-400', role: 'MEMBER GABUT' },
                            ];
                            const style = styles[index % styles.length];

                            return (
                                <div key={crewMember.id} className="flex flex-col items-center group cursor-pointer w-32 md:w-36 transition-transform hover:-translate-y-1 duration-300">
                                    <div className={`relative w-24 h-24 rounded-full p-1 bg-gradient-to-b ${style.bg} shadow-[0_0_20px_${style.shadow}] mb-3 group-hover:scale-105 transition-transform`}>
                                        <img
                                            src={crewMember.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${crewMember.displayName}`}
                                            className="w-full h-full rounded-full bg-slate-900 object-cover border-4 border-slate-900"
                                            alt={crewMember.displayName}
                                        />
                                        {crewMember.isOnline && (
                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-white tracking-tight text-center leading-tight min-h-[2.5rem] line-clamp-2 flex items-center justify-center w-full px-1">
                                        {crewMember.displayName}
                                    </h3>
                                    <p className={`text-[9px] font-bold ${style.text} tracking-[0.15em] uppercase mt-1 text-center whitespace-nowrap`}>{style.role}</p>
                                </div>
                            );
                        })}

                        {/* ADD BUTTON */}
                        <div className="flex flex-col items-center group cursor-pointer w-32 md:w-36 transition-transform hover:-translate-y-1 duration-300" onClick={() => setShowInviteModal(true)}>
                            <div className="relative w-24 h-24 rounded-full p-1 bg-slate-800 border-2 border-dashed border-gray-500 hover:border-white transition-colors flex items-center justify-center mb-3">
                                <span className="text-4xl text-gray-500 group-hover:text-white transition-colors">+</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 group-hover:text-white tracking-tight text-center leading-tight mt-2">
                                Undang Teman
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 3. Middle Grid: Feed | Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Col 1: Live Feed - Span 7 */}
                    {/* Col 1: Live Feed - Span 7 */}
                    <div className="lg:col-span-7 card bg-[var(--bg-card)] backdrop-blur border border-[var(--border-color)] p-6 rounded-2xl shadow-lg flex flex-col overflow-hidden h-full min-h-[300px]">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Update Circle
                        </h3>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {events.filter(e => isAfter(new Date(e.startTime), subDays(new Date(), 1))) // Show future + 1 day past
                                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                .length > 0 ? (
                                events.filter(e => isAfter(new Date(e.startTime), subDays(new Date(), 1)))
                                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                    .map(evt => {
                                        const creator = allUsers.find(u => u.id === evt.createdBy);
                                        return (

                                            <div key={evt.id} onClick={() => openEventModal(evt, 'view')} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-purple-500/50 transition-colors group cursor-pointer">
                                                {/* Date Badge */}
                                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] shrink-0">
                                                    <span className="text-xs font-bold text-red-400 uppercase leading-none">{format(new Date(evt.startTime), 'MMM')}</span>
                                                    <span className="text-xl font-black text-[var(--text-primary)] leading-none mt-1">{format(new Date(evt.startTime), 'd')}</span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-[var(--text-primary)] font-bold truncate group-hover:text-purple-400 transition-colors">{evt.title}</h4>
                                                        {evt.tags && evt.tags[0] && (
                                                            <span className="text-[10px] bg-slate-800 text-gray-400 px-1.5 py-0.5 rounded border border-slate-700">{evt.tags[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                            {format(new Date(evt.startTime), 'HH:mm')}
                                                        </span>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                            <img src={creator?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator?.displayName}`} className="w-4 h-4 rounded-full" alt="Creator" />
                                                            <span>{creator?.displayName?.split(' ')[0]}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                {isSameDay(new Date(evt.startTime), new Date()) && (
                                                    <div className="shrink-0">
                                                        <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded-full animate-pulse">HARI INI</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <p className="text-sm">Sepi amat nih, belum ada drama.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Col 2: Lobby Chat - Span 5 */}
                    <div className="lg:col-span-5 card bg-slate-800/40 backdrop-blur border border-slate-700/50 p-6 rounded-2xl shadow-lg flex flex-col relative overflow-hidden h-full min-h-[300px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10 shrink-0">
                            <span className="text-lg">💬</span> Bacotan Circle
                        </h3>
                        <div className="space-y-3 mb-4 flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2 flex flex-col justify-center items-center">
                            {/* Empty State */}
                            <div className="text-center text-gray-500">
                                <span className="text-4xl mb-2 block">🤐</span>
                                <p className="text-xs">Belum ada yang bacot.</p>
                            </div>
                        </div>
                        <div className="relative z-10 mt-auto shrink-0">
                            <input type="text" placeholder="Tulis sesuatu..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                        </div>
                    </div>
                </div>

                {/* 2.5 Acara Lo (My Managed Events Dashboard) */}
                {user && events.some(e => e.createdBy === user.id) && (
                    <div className="mb-8 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>👑</span> Acara Lo
                                <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                                    {events.filter(e => e.createdBy === user.id).length} Event
                                </span>
                            </h2>
                            <div className="flex gap-2">
                                {isDeleteMode && selectedForDelete.length > 0 && (
                                    <button
                                        onClick={handleBatchDelete}
                                        disabled={isSubmitting}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-red-900/50"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Hapus ({selectedForDelete.length})
                                    </button>
                                )}
                                <button
                                    onClick={handleToggleDeleteMode}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${isDeleteMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-transparent text-gray-400 border-slate-700 hover:border-slate-500'}`}
                                >
                                    {isDeleteMode ? 'Batal Hapus' : 'Mode Hapus'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {events.filter(e => e.createdBy === user.id).map(evt => {
                                const pendingCount = (evt.pendingParticipants || []).length;
                                const isSelected = selectedForDelete.includes(evt.id);

                                return (
                                    <div
                                        key={evt.id}
                                        onClick={() => isDeleteMode ? handleSelectEvent(evt.id) : undefined}
                                        className={`card p-5 rounded-2xl shadow-lg relative overflow-hidden transition-all duration-200 ${isDeleteMode
                                            ? 'cursor-pointer hover:bg-slate-800/80 border-2'
                                            : 'group bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-purple)]'
                                            } ${isSelected ? 'border-red-500 bg-red-900/10' : 'border-[var(--border-color)]'}`}
                                    >

                                        {!isDeleteMode && (
                                            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); openEventModal(evt, 'default'); }} className="p-2 hover:bg-slate-700 rounded-full text-gray-400 hover:text-white" title="Edit">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                            </div>
                                        )}

                                        {isDeleteMode && (
                                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-500'}`}>
                                                {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full bg-${evt.color === 'purple' ? 'purple-500' : evt.color === 'red' ? 'red-500' : 'blue-500'}`}></span>
                                                <span className="text-xs font-bold text-gray-400 uppercase">{safeFormatDate(evt.startTime, 'MMM d, HH:mm')}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white leading-tight">{evt.title}</h3>
                                        </div>

                                        {!isDeleteMode && pendingCount > 0 ? (
                                            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                                                        <span>⚠️</span> Butuh Approval ({pendingCount})
                                                    </span>
                                                </div>
                                                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                                    {(evt.pendingParticipants || []).map(uid => {
                                                        const applicant = allUsers.find(u => u.id === uid);
                                                        return (
                                                            <div key={uid} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <img
                                                                        src={applicant?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant?.displayName}`}
                                                                        className="w-6 h-6 rounded-full border border-slate-600"
                                                                        alt={applicant?.displayName}
                                                                    />
                                                                    <span className="text-xs font-bold text-gray-300 truncate max-w-[80px]" title={applicant?.displayName}>
                                                                        {applicant?.displayName?.split(' ')[0]}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-1 shrink-0">
                                                                    <button
                                                                        onClick={() => handleApproveJoin(evt, uid)}
                                                                        className="w-6 h-6 flex items-center justify-center bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white rounded border border-green-500/30 transition-all"
                                                                        title="Terima"
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectJoin(evt, uid)}
                                                                        className="w-6 h-6 flex items-center justify-center bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded border border-red-500/30 transition-all"
                                                                        title="Tolak"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : !isDeleteMode && (
                                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-[var(--bg-tertiary)] p-2 rounded-lg">
                                                <span>✅</span>
                                                <span>Aman, gada request baru.</span>
                                            </div>
                                        )}
                                        {isDeleteMode && (
                                            <div className="mt-4 text-xs text-gray-400 text-center italic">
                                                {isSelected ? 'Jadwal ini bakal diapus.' : 'Klik buat pilih hapus.'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Bottom Grid: Big Hype + Quick Action */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Next Hype (Span 8) */}
                    <div className="lg:col-span-8 card relative overflow-hidden rounded-2xl border border-slate-700/50 group shadow-lg bg-slate-900/50">
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                                    <span>🔥</span> AGENDA MABAR
                                </h2>
                                <button onClick={() => openEventModal(null, 'default')} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                                    + Buat Acara
                                </button>
                            </div>

                            {events.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
                                    <span className="text-4xl mb-2">🦗</span>
                                    <p className="text-gray-500 font-medium">Belum ada jadwal main, sepi bet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                                    {events.map(evt => (
                                        <div key={evt.id} onClick={() => openEventModal(evt, 'view')} className="card bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700 hover:border-purple-500/50 p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-${evt.color === 'purple' ? 'purple-500' : evt.color === 'red' ? 'red-500' : 'blue-500'}/20 flex items-center justify-center text-xl`}>
                                                    {evt.color === 'purple' ? '👿' : evt.color === 'red' ? '🥵' : '🥶'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{evt.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span>📅 {safeFormatDate(evt.startTime, 'd MMM, HH:mm')}</span>
                                                        <span>•</span>
                                                        <span>👤 {evt.participants?.length || 0} Player</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-white">Cek Detail &rarr;</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Action (Span 4) */}
                    <div className="lg:col-span-4 h-full">
                        <button
                            type="button"
                            onClick={handleImFree}
                            className="w-full h-full min-h-[180px] rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 hover:from-lime-300 hover:to-green-400 border-4 border-green-300/30 shadow-[0_0_40px_rgba(74,222,128,0.3)] flex flex-col items-center justify-center gap-2 group transition-all transform hover:-translate-y-1 active:scale-95 relative overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">📢</span>
                            <span className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                                GAS MABAR!
                            </span>
                            <span className="text-slate-800 font-bold bg-white/20 px-3 py-1 rounded-full text-xs">
                                Spam "Gue Kosong Nih!"
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-900/50">
                                ✉️
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Undang Member Baru</h3>
                            <p className="text-gray-400 text-sm">Kasih kode ini ke temen lu biar mereka bisa join circle ini.</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6 flex flex-col items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">KODE INVITE</span>
                            <div className="text-4xl font-mono font-black text-white tracking-[0.2em] mb-4 text-center">
                                {currentGroup?.inviteCode || 'LOADING'}
                            </div>
                            <button
                                onClick={() => {
                                    if (currentGroup?.inviteCode) {
                                        navigator.clipboard.writeText(currentGroup.inviteCode);
                                        alert('Kode berhasil dicopy!');
                                    }
                                }}
                                className="text-purple-400 text-xs font-bold hover:text-purple-300 flex items-center gap-1"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                COPY CODE
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                Share Lwat WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirm}
                variant={confirmDialog.variant}
                confirmText="Yakin"
                cancelText="Batal"
            />
        </div>
    );
};
