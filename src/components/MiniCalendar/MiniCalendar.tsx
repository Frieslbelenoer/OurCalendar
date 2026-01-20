import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths
} from 'date-fns';
import './MiniCalendar.css';

export const MiniCalendar: React.FC = () => {
    const { selectedDate, setSelectedDate, events } = useCalendar();
    const [currentMonth, setCurrentMonth] = React.useState(selectedDate);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const hasEvents = (date: Date) => {
        return events.some(event => {
            const eventDate = new Date(event.startTime);
            return isSameDay(eventDate, date);
        });
    };

    return (
        <div className="mini-calendar">
            <div className="mini-calendar-header">
                <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
                <div className="mini-calendar-nav">
                    <button onClick={prevMonth} className="nav-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                    </button>
                    <button onClick={nextMonth} className="nav-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,18 15,12 9,6" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mini-calendar-grid">
                {weekDays.map((day, index) => (
                    <div key={index} className="weekday-header">{day}</div>
                ))}

                {days.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`day-cell ${!isSameMonth(day, currentMonth) ? 'other-month' : ''
                            } ${isToday(day) ? 'today' : ''
                            } ${isSameDay(day, selectedDate) ? 'selected' : ''
                            }`}
                    >
                        <span>{format(day, 'd')}</span>
                        {hasEvents(day) && <span className="event-dot"></span>}
                    </button>
                ))}
            </div>
        </div>
    );
};
