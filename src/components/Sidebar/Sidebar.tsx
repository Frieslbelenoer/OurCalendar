import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UsersContext';
import { useCalendar } from '../../context/CalendarContext';
import { MiniCalendar } from '../MiniCalendar';
import { format, isToday } from 'date-fns';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const { allUsers, onlineUsers } = useUsers();
    const { events, selectedDate } = useCalendar();
    const [showAllUsers, setShowAllUsers] = useState(false);

    // Get today's events
    const todayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return isToday(eventDate);
    }).slice(0, 4);

    // Time breakdown data
    const timeBreakdown = [
        { category: 'Meetings', color: 'var(--event-green)', percentage: 45 },
        { category: 'Projects', color: 'var(--event-blue)', percentage: 30 },
        { category: 'Events', color: 'var(--event-red)', percentage: 15 },
        { category: 'Reviews', color: 'var(--event-purple)', percentage: 10 },
    ];

    const displayUsers = showAllUsers ? allUsers : allUsers.slice(0, 6);

    return (
        <aside className="sidebar">
            {/* Mini Calendar */}
            <div className="sidebar-section">
                <MiniCalendar />
            </div>

            {/* Upcoming Events Today */}
            <div className="sidebar-section">
                <div className="section-header">
                    <h3>Upcoming events today</h3>
                    <button className="view-all-btn">View all</button>
                </div>
                <div className="events-list">
                    {todayEvents.length > 0 ? (
                        todayEvents.map(event => (
                            <div key={event.id} className="event-item">
                                <div className={`event-indicator ${event.color}`}></div>
                                <div className="event-details">
                                    <span className="event-title">{event.title}</span>
                                    <span className="event-time">
                                        {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-events">No events scheduled for today</p>
                    )}
                </div>
            </div>

            {/* Time Breakdown */}
            <div className="sidebar-section">
                <div className="section-header">
                    <h3>Time breakdown</h3>
                    <button className="view-all-btn">View all</button>
                </div>
                <div className="time-breakdown">
                    {timeBreakdown.map((item, index) => (
                        <div key={index} className="breakdown-item">
                            <div className="breakdown-label">
                                <span className="breakdown-category">{item.category}</span>
                            </div>
                            <div className="breakdown-bar">
                                <div
                                    className="breakdown-fill"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
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
                                    <img src={member.photoURL} alt={member.displayName} className="avatar avatar-sm" />
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
                        className="show-more-btn"
                        onClick={() => setShowAllUsers(!showAllUsers)}
                    >
                        {showAllUsers ? 'Show less' : `Show ${allUsers.length - 6} more`}
                    </button>
                )}
            </div>

            {/* My Calendars */}
            <div className="sidebar-section">
                <div className="section-header collapsible">
                    <h3>My calendars</h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6,9 12,15 18,9" />
                    </svg>
                </div>
            </div>
        </aside>
    );
};
