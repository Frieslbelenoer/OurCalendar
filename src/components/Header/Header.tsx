import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

interface HeaderProps {
    currentMonth: string;
}

export const Header: React.FC<HeaderProps> = ({ currentMonth }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Mock notifications
    const notifications = [
        { id: 1, text: "Kamisato Nil nambahin 'Mabar Valorant'", time: "2 min lalu", type: "add" },
        { id: 2, text: "Jadwal Review Projek diupdate", time: "1 jam lalu", type: "update" },
        { id: 3, text: "Ada komen baru di 'Design Sprint'", time: "3 jam lalu", type: "comment" }
    ];

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        navigate('/settings');
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="#6366F1" />
                        <path d="M8 10C8 8.89543 8.89543 8 10 8H22C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V10Z" stroke="white" strokeWidth="1.5" />
                        <line x1="8" y1="13" x2="24" y2="13" stroke="white" strokeWidth="1.5" />
                        <circle cx="12" cy="17" r="1.5" fill="#22C55E" />
                        <circle cx="16" cy="17" r="1.5" fill="#3B82F6" />
                        <circle cx="20" cy="17" r="1.5" fill="#EF4444" />
                    </svg>
                    <span className="logo-text">Basecamp Kita</span>
                </div>
            </div>

            <nav className="header-nav">
                <NavLink to="/home" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Basecamp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                </NavLink>
                <NavLink to="/calendar" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Jadwal Mabar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </NavLink>
                <NavLink to="/team" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Laporan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </NavLink>
                <NavLink to="/messages" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Chat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Pengaturan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </NavLink>
            </nav>

            <div className="header-right">
                <button className="nav-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </button>
                <div className="relative" ref={notificationRef}>
                    <button
                        className={`nav-btn notification-btn ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notification-dot"></span>
                    </button>

                    {showNotifications && (
                        <div className="notification-popup animate-fade-in">
                            <div className="notification-header">
                                <h3>Notifikasi</h3>
                                <button className="mark-read-btn">Udah Baca Semua</button>
                            </div>
                            <div className="notification-list">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="notification-item">
                                        <div className={`notification-icon ${notif.type}`}>
                                            {notif.type === 'add' ? '+' : notif.type === 'update' ? '✎' : '💬'}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-text">{notif.text}</p>
                                            <span className="notification-time">{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className="nav-btn theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label="Ganti tema"
                >
                    {theme === 'dark' ? (
                        <svg key="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    ) : (
                        <svg key="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    )}
                </button>

                <div className="user-profile" onClick={handleProfileClick}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="avatar" />
                    ) : (
                        <div className="avatar avatar-placeholder">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="user-info">
                        <span className="user-name">{user?.displayName}</span>
                        <span className="user-role">Member</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
