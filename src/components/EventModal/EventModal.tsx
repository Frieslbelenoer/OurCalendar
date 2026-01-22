import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent, EventColor } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useUsers } from '../../context/UsersContext';
import { format } from 'date-fns';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Comment } from '../../types';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomTimePicker } from './CustomTimePicker';
import { SuccessAnimation } from '../Shared/SuccessAnimation';
import { ConfirmDialog } from '../Shared/ConfirmDialog';
import './EventModal.css';

interface EventModalProps {
    event: CalendarEvent | null;
    onClose: () => void;
    viewMode?: 'default' | 'view';
}

const colorOptions: { value: EventColor; label: string }[] = [
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'red', label: 'Red' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'pink', label: 'Pink' },
    { value: 'teal', label: 'Teal' },
];

export const EventModal: React.FC<EventModalProps> = ({ event, onClose, viewMode = 'default' }) => {
    const { createEvent, updateEvent, deleteEvent, requestJoinEvent, cancelJoinRequest, leaveEvent } = useCalendar();
    const { user } = useAuth();
    const { allUsers } = useUsers();

    // Internal state to allow switching from View to Edit if owner
    const [isInternalEditMode, setIsInternalEditMode] = useState(false);

    const isEditing = !!event;
    const isOwner = isEditing && event ? event.createdBy === user?.id : true; // Creator is admin

    // Show view card if:
    // 1. Forced view mode is 'view' AND we haven't explicitly clicked "Edit" button
    // 2. OR User is NOT owner (always view)
    const isForcedView = viewMode === 'view' && !isInternalEditMode;
    const shouldShowViewCard = !!event && (isForcedView || !isOwner);

    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [date, setDate] = useState(() => {
        if (event && event.startTime) {
            const d = new Date(event.startTime);
            // Defensive check: If date appears to be Epoch (1970), default to Today.
            if (!isNaN(d.getTime()) && d.getFullYear() > 1971) {
                return format(d, 'yyyy-MM-dd');
            }
        }
        return format(new Date(), 'yyyy-MM-dd');
    });
    const [startTime, setStartTime] = useState(
        event ? format(new Date(event.startTime), 'HH:mm') : '09:00'
    );
    const [endTime, setEndTime] = useState(
        event ? format(new Date(event.endTime), 'HH:mm') : '10:00'
    );
    const [color, setColor] = useState<EventColor>(event?.color || 'blue');
    const [meetingLink, setMeetingLink] = useState(event?.meetingLink || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(event?.tags || []);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
        event ? (event.participants || []) : (user ? [user.id] : [])
    );
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (!event?.id) return;

        const q = query(
            collection(db, 'events', event.id, 'comments'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Comment[];
            setComments(loadedComments);
        });

        return () => unsubscribe();
    }, [event?.id]);

    const handlePostComment = async () => {
        if (!newComment.trim() || !user || !event?.id) return;

        try {
            await addDoc(collection(db, 'events', event.id, 'comments'), {
                eventId: event.id,
                userId: user.id,
                text: newComment,
                createdAt: serverTimestamp()
            });
            setNewComment('');
        } catch (err) {
            console.error("Failed to post comment:", err);
            alert("Gagal mengirim komentar");
        }
    };
    const [pendingList, setPendingList] = useState<string[]>(
        event?.pendingParticipants || []
    );
    const [coverPhoto, setCoverPhoto] = useState(event?.coverPhoto || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                alert("Gede banget filenya! Maksimal 1MB ya bestie.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const availableTags = ['Mabar', 'Rapat', 'Curhat', 'Diskusi', 'Review', 'Nongkrong'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            const eventStartTime = new Date(date);
            eventStartTime.setHours(startHour, startMin, 0, 0);

            const eventEndTime = new Date(date);
            eventEndTime.setHours(endHour, endMin, 0, 0);

            const eventData = {
                title,
                description,
                startTime: eventStartTime,
                endTime: eventEndTime,
                color,
                meetingLink,
                tags: selectedTags,
                participants: selectedParticipants,
                isAllDay: false,
                coverPhoto
            };

            if (isEditing && event) {
                await updateEvent(event.id, eventData);
            } else {
                await createEvent(eventData);
            }

            setShowSuccess(true);
        } catch (error) {
            console.error("Submit error:", error);
            alert("Gagal bikin jadwal, coba lagi nanti.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinClick = async () => {
        if (!event || !user) return;

        try {
            const isJoined = selectedParticipants.includes(user.id);
            const isPending = pendingList.includes(user.id);

            if (isJoined) {
                // Leave
                const newParticipants = selectedParticipants.filter(id => id !== user.id);
                setSelectedParticipants(newParticipants);
                await leaveEvent(event.id, user.id);
            } else if (isPending) {
                // Cancel Request
                const newPending = pendingList.filter(id => id !== user.id);
                setPendingList(newPending);
                await cancelJoinRequest(event.id, user.id);
            } else {
                // Request Join
                const newPending = [...pendingList, user.id];
                setPendingList(newPending);
                await requestJoinEvent(event.id, user.id);
            }
        } catch (err) {
            console.error("Join action failed:", err);
            alert("Gagal memproses request. Coba refresh atau cek koneksi.");
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (event) {
            await deleteEvent(event.id);
            setShowDeleteConfirm(false);
            onClose();
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const toggleParticipant = (userId: string) => {
        const ownerId = event ? event.createdBy : user?.id;
        if (userId === ownerId) return; // Lock owner
        setSelectedParticipants(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                {showSuccess && <SuccessAnimation onComplete={onClose} />}
                <div className={`event-modal animate-slide-up ${shouldShowViewCard ? 'view-mode' : ''}`} onClick={e => e.stopPropagation()}>

                    {shouldShowViewCard ? (
                        // --- VIEW ONLY CARD ---

                        // --- VIEW ONLY CARD (User Lain) ---
                        <div className="view-card-content">
                            {/* Cover Image or Color Header */}
                            <div className={`view-card-header ${coverPhoto ? 'has-image' : `bg-${color}`}`} style={coverPhoto ? { backgroundImage: `url(${coverPhoto})` } : {}}>
                                {isOwner && (
                                    <button
                                        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10 backdrop-blur-sm"
                                        onClick={() => setIsInternalEditMode(true)}
                                        title="Ubah Event"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                )}
                                <button className="close-btn-floating" onClick={onClose}>✕</button>
                                {!coverPhoto && <div className="header-pattern"></div>}
                            </div>

                            <div className="view-card-body">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-1 leading-tight">{title}</h2>
                                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
                                            <span className={`px-2 py-0.5 rounded text-white text-xs font-bold bg-${color === 'purple' ? 'purple-600' : color === 'red' ? 'red-600' : 'blue-600'}`}>
                                                {availableTags.find(t => selectedTags.includes(t)) || 'Event'}
                                            </span>
                                            <span>•</span>
                                            <span>{format(new Date(date), 'EEEE, d MMMM yyyy')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-color)]">
                                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Mulai</span>
                                        <span className="text-lg font-bold text-[var(--text-primary)]">{startTime}</span>
                                    </div>
                                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-color)]">
                                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Selesai</span>
                                        <span className="text-lg font-bold text-[var(--text-primary)]">{endTime}</span>
                                    </div>
                                </div>

                                {description && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Description</h3>
                                        <p className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
                                    </div>
                                )}

                                {meetingLink && (
                                    <div className="mb-6">
                                        <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-[var(--accent-purple)] hover:bg-[var(--accent-purple-light)] text-white text-center font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
                                            🔗 Join Meeting
                                        </a>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Squad ({selectedParticipants.length})</h3>
                                    <div className="flex -space-x-2 overflow-hidden py-1 pl-1">
                                        {allUsers.filter(u => selectedParticipants.includes(u.id)).map(user => (
                                            <img
                                                key={user.id}
                                                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                                                alt={user.displayName}
                                                title={user.displayName}
                                                className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-card)] object-cover"
                                            />
                                        ))}
                                        {selectedParticipants.length === 0 && <span className="text-sm text-gray-400 italic">Belum ada yang diajak.</span>}
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-[var(--border-color)] text-center">
                                    <p className="text-xs text-[var(--text-muted)] italic">
                                        "Jadwal ini dibuat oleh {allUsers.find(u => u.id === event?.createdBy)?.displayName || 'Admin'}."
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] sticky bottom-0">
                                    <button
                                        onClick={handleJoinClick}
                                        disabled={event?.createdBy === user?.id && selectedParticipants.includes(user?.id || '')}
                                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg transform active:scale-95 ${selectedParticipants.includes(user?.id || '')
                                            ? event?.createdBy === user?.id
                                                ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                            : pendingList.includes(user?.id || '')
                                                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                : 'bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-purple-light)]'
                                            }`}
                                    >
                                        {selectedParticipants.includes(user?.id || '')
                                            ? event?.createdBy === user?.id
                                                ? 'Lo yang ngajak, gabisa ga ikut'
                                                : 'Gak Jadi Ikut'
                                            : pendingList.includes(user?.id || '')
                                                ? 'Batalin Request'
                                                : 'Gas Join!'}
                                    </button>
                                </div>

                                <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
                                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                                        Obrolan ({comments.length})
                                    </h3>
                                    <div className="max-h-40 overflow-y-auto mb-3 space-y-3 custom-scrollbar">
                                        {comments.map(comment => {
                                            const author = allUsers.find(u => u.id === comment.userId);
                                            return (
                                                <div key={comment.id} className="flex gap-3">
                                                    <img
                                                        src={author?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.displayName || 'User'}`}
                                                        alt={author?.displayName}
                                                        className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-xs text-[var(--text-primary)]">{author?.displayName || 'Unknown'}</span>
                                                            <span className="text-[10px] text-[var(--text-muted)]">
                                                                {comment.createdAt ? format(comment.createdAt, 'HH:mm') : ''}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)] p-2 rounded-r-lg rounded-bl-lg">
                                                            {comment.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {comments.length === 0 && (
                                            <p className="text-center text-xs text-[var(--text-muted)] italic py-2">Belum ada komentar. Jadilah yang pertama!</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                                            placeholder="Tulis komentar..."
                                            onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                                        />
                                        <button
                                            onClick={handlePostComment}
                                            disabled={!newComment.trim()}
                                            className="bg-[var(--accent-purple)] text-white px-4 rounded-xl hover:bg-[var(--accent-purple-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            ➤
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- ADMIN EDIT / CREATE FORM ---
                        <>
                            <div className="modal-header">
                                <h2>{isEditing ? 'Ubah Acara' : 'Bikin Acara Baru'}</h2>
                                <button className="close-btn" onClick={onClose}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                <fieldset disabled={!isOwner} className="contents">

                                    {/* Cover Photo Upload for Admin */}
                                    <div className="form-group">
                                        <label>Cover Foto (Opsional)</label>
                                        <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-4 text-center hover:bg-[var(--bg-tertiary)] transition-colors relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {coverPhoto ? (
                                                <div className="relative h-32 w-full rounded-lg overflow-hidden">
                                                    <img src={coverPhoto} alt="Cover" className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">
                                                        Ganti Foto
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-[var(--text-muted)] py-4">
                                                    <div className="text-2xl mb-2">🖼️</div>
                                                    <span className="text-xs font-medium">Klik buat upload cover (Max 1MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="title">Nama Acaranya</label>
                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            className="input"
                                            placeholder="Mabar / Nongkrong / Rapat"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            required
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <CustomDatePicker
                                            label="Kapan?"
                                            value={date}
                                            onChange={setDate}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <CustomTimePicker
                                            label="Mulai Jam"
                                            value={startTime}
                                            onChange={setStartTime}
                                        />
                                        <CustomTimePicker
                                            label="Keluar Jam"
                                            value={endTime}
                                            onChange={setEndTime}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="meetingLink">Link Mabar/Meet (Opsional)</label>
                                        <div className="input-with-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                            </svg>
                                            <input
                                                id="meetingLink"
                                                type="url"
                                                className="input"
                                                placeholder="https://meet.google.com/..."
                                                value={meetingLink}
                                                onChange={e => setMeetingLink(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Warna Warni</label>
                                        <div className="color-picker">
                                            {colorOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`color-option color-${opt.value} ${color === opt.value ? 'selected' : ''}`}
                                                    onClick={() => setColor(opt.value)}
                                                    title={opt.label}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Kategori</label>
                                        <div className="tags-container">
                                            {availableTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                                    onClick={() => toggleTag(tag)}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Yg Diajak</label>
                                        <div className="participants-list">
                                            {allUsers.slice(0, 8).map(user => (
                                                <div
                                                    key={user.id}
                                                    className={`participant-option ${selectedParticipants.includes(user.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleParticipant(user.id)}
                                                >
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.displayName} className="avatar avatar-sm" width="32" height="32" />
                                                    ) : (
                                                        <div className="avatar avatar-sm avatar-placeholder">
                                                            {user.displayName?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span>{user.displayName}</span>
                                                    {selectedParticipants.includes(user.id) && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="20,6 9,17 4,12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description">Catatan Tambahan (Opsional)</label>
                                        <textarea
                                            id="description"
                                            className="input textarea"
                                            placeholder="Jangan lupa bawa snack..."
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                </fieldset>
                                <div className="modal-actions">
                                    {isOwner && isEditing && (
                                        <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                            Hapus Aja
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                                        {isOwner ? 'Gak Jadi' : 'Tutup'}
                                    </button>
                                    {isOwner && (
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? 'Lagi Proses...' : isEditing ? 'Simpan Perubahan' : 'Gas Bikin!'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Hapus Acara"
                message="Yakin mau apus acaranya? Ini gak bisa di-undo lho."
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
                confirmText="Hapus"
                cancelText="Batal"
            />
        </>
    );
};
