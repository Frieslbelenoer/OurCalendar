import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UsersContext';
import { useCalendar } from '../../context/CalendarContext';
import { MiniCalendar } from '../MiniCalendar';
import { format, isSameMonth, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRecentActivity } from '../../services/useRecentActivity';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const { allUsers, onlineUsers } = useUsers();
    const { events, selectedDate, openEventModal } = useCalendar();
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const handleActivityClick = (act: any) => {
        if (act.entityType === 'event' && act.type !== 'delete') {
            const event = events.find(e => e.id === act.entityId);
            if (event) {
                openEventModal(event);
            } else {
                alert("Jadwal ini udah ga ada di data lokal, coba refresh atau mungkin udah diapus.");
            }
        }
    };

    // Get events for the selected month
    const monthEvents = React.useMemo(() => {
        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return isSameMonth(eventDate, selectedDate);
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [events, selectedDate]);

    const myEvents = React.useMemo(() => {
        return events.filter(e => e.createdBy === user?.id)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [events, user]);

    // Time breakdown data
    const { activities } = useRecentActivity(5);

    const displayUsers = showAllUsers ? allUsers : allUsers.slice(0, 6);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button
                className="sidebar-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            <div className="sidebar-content-wrapper">
                <div className="sidebar-inner">
                    <div className="p-4 pb-0">
                        <button
                            type="button"
                            onClick={() => openEventModal()}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Tambah Jadwal
                        </button>
                    </div>

                    {/* Mini Calendar */}
                    <div className="sidebar-section">
                        <MiniCalendar />
                    </div>

                    {/* Upcoming Events Month */}
                    <div className="sidebar-section">
                        <div className="section-header">
                            <h3>Ada Apa Bulan Ini?</h3>
                            <button type="button" className="view-all-btn">Liat Semua</button>
                        </div>
                        <div className="events-list">
                            {monthEvents.length > 0 ? (
                                monthEvents.slice(0, 5).map(event => (
                                    <div key={event.id} className="event-item">
                                        <div className={`event-indicator ${event.color || 'blue'}`}></div>
                                        <div className="event-details">
                                            <span className="event-title">{event.title}</span>
                                            <span className="event-time">
                                                {format(new Date(event.startTime), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-events">Belum ada agenda nih, gabut?</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="sidebar-section">
                        <div className="section-header">
                            <h3>Barusan Update</h3>
                        </div>
                        <div className="activity-list space-y-3">
                            {activities.length > 0 ? (
                                activities.map(act => (
                                    <div
                                        key={act.id}
                                        className="flex gap-3 items-start p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group/item"
                                        onClick={() => handleActivityClick(act)}
                                    >
                                        {act.userPhotoURL ? (
                                            <img src={act.userPhotoURL} alt={act.userName} className="w-8 h-8 rounded-full border border-[var(--border-color)] object-cover shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] shrink-0">
                                                {act.userName.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[var(--text-secondary)] leading-tight">
                                                <span className="font-bold text-[var(--text-primary)]">{act.userName.split(' ')[0]}</span>
                                                <span className="text-[var(--text-muted)]">
                                                    {act.type === 'create' && ' nambahin '}
                                                    {act.type === 'update' && ' ngedit '}
                                                    {act.type === 'delete' && ' ngehapus '}
                                                    {act.type === 'join' && ' ikutan '}
                                                    {act.type === 'leave' && ' gajadi ikut '}
                                                </span>
                                                <span className={`font-medium ${(act.type === 'delete' || act.type === 'leave') ? 'text-[var(--cal-red-text)]' : 'text-[var(--accent-purple)]'}`}>
                                                    {act.entityTitle}
                                                </span>
                                            </p>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                                {formatDistanceToNow(act.timestamp, { addSuffix: true, locale: id })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic p-2">Belum ada pergerakan...</p>
                            )}
                        </div>
                    </div>

                    {/* Team Members / Online Users */}
                    <div className="sidebar-section team-section">
                        <div className="section-header">
                            <h3>Team Members</h3>
                            <span className="online-count">{onlineUsers.length} online</span>
                        </div>
                        <div className="team-list">
                            {displayUsers.map(member => (
                                <div
                                    key={member.id}
                                    className={`team-member ${member.id === user?.id ? 'is-you' : ''}`}
                                >
                                    <div className="member-avatar-wrapper">
                                        {member.photoURL ? (
                                            <img src={member.photoURL} alt={member.displayName} className="avatar avatar-sm" width="32" height="32" />
                                        ) : (
                                            <div className="avatar avatar-sm avatar-placeholder">
                                                {member.displayName?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <span className={member.isOnline ? 'online-indicator' : 'offline-indicator'}></span>
                                    </div>
                                    <div className="member-info">
                                        <span className="member-name">
                                            {member.displayName}
                                            {member.id === user?.id && <span className="you-tag">(You)</span>}
                                        </span>
                                        <span className="member-activity">{member.currentActivity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {allUsers.length > 6 && (
                            <button
                                type="button"
                                className="show-more-btn"
                                onClick={() => setShowAllUsers(!showAllUsers)}
                            >
                                {showAllUsers ? 'Show less' : `Show ${allUsers.length - 6} more`}
                            </button>
                        )}
                    </div>

                    {/* My Calendars */}
                    {/* Jadwal Lo Section */}
                    <div className="sidebar-section">
                        <div className="section-header">
                            <h3>Jadwal Lo</h3>
                        </div>
                        <div className="events-list">
                            {myEvents.length > 0 ? (
                                myEvents.slice(0, 5).map(event => (
                                    <div
                                        key={event.id}
                                        className="event-item cursor-pointer hover:bg-[var(--bg-hover)] rounded-md transition-colors px-1"
                                        onClick={() => openEventModal(event)}
                                    >
                                        <div className={`event-indicator ${event.color || 'blue'}`}></div>
                                        <div className="event-details">
                                            <span className="event-title text-[var(--text-primary)]">{event.title}</span>
                                            <span className="event-time text-[var(--text-muted)]">
                                                {format(new Date(event.startTime), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-events">Belum ada jadwal yang lu buat.</p>
                            )}
                            {myEvents.length > 5 && (
                                <button className="view-all-btn mt-2">Liat Semua ({myEvents.length})</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
