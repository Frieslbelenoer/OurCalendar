import React, { useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
    format, startOfWeek, addDays, isSameDay, differenceInMinutes
} from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarYearView } from '../Calendar/CalendarYearView';
import { CalendarEvent } from '../../types';
import './WeekView.css';

// Component for the Yearly Overview (The "Reference" Style)


const getEventStyleClass = (event: CalendarEvent) => {
    if (event.eventType === 'gaming') return 'ref-event-gaming';
    if (event.eventType === 'hangout') return 'ref-event-hangout';
    if (event.eventType === 'work') return 'ref-event-work';
    return `bg-${event.color}`;
};

// Component for Weekly View (Granular)
const WeeklyTimeGrid: React.FC<{ selectedDate: Date, setViewMode: (m: 'day' | 'week' | 'month') => void }> = ({ selectedDate, setViewMode }) => {
    const { getEventsForWeek, openEventModal } = useCalendar();
    const startObj = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startObj, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Get events for this week
    const weekEvents = getEventsForWeek(startObj);

    // Auto-scroll to 17:00 (5 PM) on mount
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 16 * 60; // Scroll to 16:00 to give some headroom
        }
    }, []);

    const handleBlockTime = (_day: Date, _hour: number) => {
        // Open modal for new event (defaults)
        openEventModal();
    };

    return (
        <div className="ref-granular-wrapper animate-fade-in">
            <div className="ref-granular-header">
                <button onClick={() => setViewMode('month')} className="ref-back-btn">
                    &larr; Kembali ke Tahunan
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">{format(startObj, 'MMMM yyyy')}</h2>
                    <p className="text-sm text-gray-500">
                        {format(startObj, 'd MMM')} - {format(addDays(startObj, 6), 'd MMM yyyy')}
                    </p>
                </div>
                <div style={{ width: '100px' }} className="flex justify-end">
                    <button
                        onClick={() => openEventModal()}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-colors"
                    >
                        + Tambah
                    </button>
                </div>
            </div>

            <div className="ref-granular-scroll-container custom-scrollbar" ref={scrollRef}>
                {/* Header Row (Sticky) */}
                <div className="ref-granular-grid-header">
                    <div className="ref-time-header-spacer"></div>
                    <div className="ref-days-header-track">
                        {weekDays.map((day, i) => {
                            const today = isSameDay(day, new Date());
                            return (
                                <div key={i} className={`ref-day-col-header ${today ? 'is-today' : ''}`}>
                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        {format(day, 'EEE', { locale: id })}
                                    </span>
                                    <span className="ref-day-num-badge">
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body Row (Scrollable Content) */}
                <div className="ref-granular-grid-body">
                    {/* Time Labels */}
                    <div className="ref-time-column">
                        {hours.map(h => (
                            <div key={h} className="ref-time-slot-label">
                                {format(new Date().setHours(h, 0), 'HH:00')}
                            </div>
                        ))}
                    </div>

                    {/* Day Columns & Grid Lines & Events */}
                    <div className="ref-days-track">
                        {weekDays.map((day, i) => {
                            // Filter events for this specific day
                            const dayEvents = weekEvents.filter(e => isSameDay(new Date(e.startTime), day));
                            const isFriday = format(day, 'EEEE') === 'Friday';

                            return (
                                <div key={i} className="ref-day-column">
                                    {/* Grid Lines */}
                                    {hours.map(h => (
                                        <div
                                            key={h}
                                            className="ref-grid-line"
                                            onClick={() => handleBlockTime(day, h)}
                                            title="Klik buat booking jam ini"
                                        ></div>
                                    ))}

                                    {/* Mock Perfect Time Overlay (Friday 20:00 - 23:00) */}
                                    {isFriday && (
                                        <div
                                            className="absolute left-1 right-1 rounded-lg border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10 pointer-events-none flex flex-col items-center justify-center text-center animate-pulse"
                                            style={{
                                                top: `${20 * 60}px`,
                                                height: `${3 * 60}px`,
                                                background: 'rgba(234, 179, 8, 0.15)'
                                            }}
                                        >
                                            <span className="text-yellow-300 font-bold text-[10px] uppercase tracking-widest bg-black/80 px-2 py-1 rounded mb-1 shadow-lg">
                                                🔥 WAKTU MABAR SEMPURNA
                                            </span>
                                            <span className="text-white text-[9px] bg-black/50 px-1 rounded">5/5 Squad Siap</span>
                                        </div>
                                    )}

                                    {/* Events */}
                                    {dayEvents.map(event => {
                                        const start = new Date(event.startTime);
                                        const end = new Date(event.endTime);
                                        // Top position: (hours * 60) + minutes
                                        const top = (start.getHours() * 60) + start.getMinutes();
                                        // Height: duration in minutes
                                        const height = differenceInMinutes(end, start);
                                        // Fallback min height
                                        const finalHeight = Math.max(height, 20);

                                        return (
                                            <div
                                                key={event.id}
                                                className={`ref-event-card ${getEventStyleClass(event)}`}
                                                style={{ top: `${top}px`, height: `${finalHeight}px` }}
                                                title={`${event.title}\n${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEventModal(event);
                                                }}
                                            >
                                                <span className="ref-event-time">
                                                    {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                                                </span>
                                                <span className="ref-event-title">{event.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WeekView: React.FC = () => {
    const {
        selectedDate,
        viewMode,
        setViewMode
    } = useCalendar();

    // We override viewMode logic slightly to default to Year view (component legacy), 
    // but if context says 'week', we show week.
    // If 'month' or 'year', we show the new CalendarYearView.

    if (viewMode === 'week' || viewMode === 'day') {
        return <WeeklyTimeGrid selectedDate={selectedDate} setViewMode={setViewMode} />;
    }

    // Use the new CalendarYearView for month/year modes
    return <CalendarYearView />;
};
