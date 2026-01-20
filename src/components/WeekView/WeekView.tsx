import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useUsers } from '../../context/UsersContext';
import { CalendarEvent, ViewMode } from '../../types';
import { EventModal } from '../EventModal';
import { EventCard } from '../EventCard';
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    getHours,
    getMinutes,
    differenceInMinutes,
    addWeeks,
    subWeeks
} from 'date-fns';
import './WeekView.css';

const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 8;
const END_HOUR = 18;

export const WeekView: React.FC = () => {
    const { events, selectedDate, setSelectedDate, createEvent } = useCalendar();
    const { allUsers } = useUsers();
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(
        startOfWeek(selectedDate, { weekStartsOn: 1 })
    );

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return isSameDay(eventDate, date);
        });
    };

    const getEventStyle = (event: CalendarEvent) => {
        const startHour = getHours(new Date(event.startTime));
        const startMinutes = getMinutes(new Date(event.startTime));
        const duration = differenceInMinutes(new Date(event.endTime), new Date(event.startTime));

        const topOffset = ((startHour - START_HOUR) * HOUR_HEIGHT) + ((startMinutes / 60) * HOUR_HEIGHT);
        const height = (duration / 60) * HOUR_HEIGHT;

        return {
            top: `${topOffset}px`,
            height: `${Math.max(height, 30)}px`,
        };
    };

    const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const handleAddEvent = () => {
        setSelectedEvent(null);
        setShowEventModal(true);
    };

    const getParticipantAvatars = (participantIds: string[]) => {
        return participantIds
            .map(id => allUsers.find(u => u.id === id))
            .filter(Boolean)
            .slice(0, 4);
    };

    return (
        <div className="week-view">
            <div className="calendar-header">
                <div className="calendar-title">
                    <h1>{format(currentWeekStart, 'MMMM yyyy')}</h1>
                </div>

                <div className="calendar-controls">
                    <div className="timezone-badge">
                        GMT +4
                    </div>

                    <div className="week-navigation">
                        <button onClick={handlePrevWeek} className="week-nav-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6" />
                            </svg>
                        </button>

                        {weekDays.slice(0, 7).map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDate(day)}
                                className={`day-tab ${isSameDay(day, selectedDate) ? 'active' : ''
                                    } ${isSameDay(day, new Date()) ? 'today' : ''
                                    }`}
                            >
                                <span className="day-name">{format(day, 'EEE')}</span>
                                <span className="day-number">{format(day, 'd')}</span>
                            </button>
                        ))}

                        <button onClick={handleNextWeek} className="week-nav-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6" />
                            </svg>
                        </button>
                    </div>

                    <div className="view-mode-toggle">
                        <button
                            className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`mode-btn ${viewMode === 'day' ? 'active' : ''}`}
                            onClick={() => setViewMode('day')}
                        >
                            Day
                        </button>
                    </div>
                </div>
            </div>

            <div className="calendar-grid-container">
                <div className="calendar-grid">
                    {/* Time column */}
                    <div className="time-column">
                        {hours.map(hour => (
                            <div key={hour} className="time-slot" style={{ height: `${HOUR_HEIGHT}px` }}>
                                <span>{format(new Date().setHours(hour, 0), 'h:mm a').toUpperCase()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day, dayIndex) => {
                        const dayEvents = getEventsForDay(day);

                        return (
                            <div
                                key={dayIndex}
                                className={`day-column ${isSameDay(day, new Date()) ? 'today-column' : ''}`}
                            >
                                <div className="day-events-container">
                                    {dayEvents.map(event => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            style={getEventStyle(event)}
                                            participants={getParticipantAvatars(event.participants)}
                                            onClick={() => handleEventClick(event)}
                                        />
                                    ))}
                                </div>

                                {/* Hour grid lines */}
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        className="hour-cell"
                                        style={{ height: `${HOUR_HEIGHT}px` }}
                                    ></div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Add Event FAB */}
                <button className="add-event-fab" onClick={handleAddEvent}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>

            {showEventModal && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setShowEventModal(false)}
                    participants={selectedEvent ? getParticipantAvatars(selectedEvent.participants) : []}
                />
            )}
        </div>
    );
};
