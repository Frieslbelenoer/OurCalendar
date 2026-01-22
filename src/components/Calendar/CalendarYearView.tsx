import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
    addYears, subYears, format, startOfYear, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addMonths, addDays, isSameDay, isSameMonth, getYear
} from 'date-fns';
import { id } from 'date-fns/locale';
import { getHolidays, Holiday } from '../../services/holidays';
import './CalendarYearView.css';
import '../WeekView/WeekView.css';

interface RollingDigitProps {
    value: string;
    direction: 'up' | 'down';
}

const RollingDigit: React.FC<RollingDigitProps> = ({ value, direction }) => {
    const [current, setCurrent] = useState(value);
    const [previous, setPrevious] = useState<string | null>(null);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        if (value !== current) {
            setPrevious(current);
            setCurrent(value);
            setAnimKey(prev => prev + 1);
        }
    }, [value, current]);

    return (
        <div className="digit-wrapper">
            {previous !== null && (
                <span
                    key={`prev-${animKey}`}
                    className={`digit exit-${direction}`}
                >
                    {previous}
                </span>
            )}
            <span
                key={`curr-${animKey}`}
                className={`digit ${previous !== null ? `enter-${direction}` : ''}`}
                onAnimationEnd={() => setPrevious(null)}
            >
                {current}
            </span>
        </div>
    );
};

export const CalendarYearView: React.FC = () => {
    const { selectedDate, setSelectedDate, setViewMode, openEventModal, events } = useCalendar();
    const [direction, setDirection] = useState<'up' | 'down'>('up');
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        setHolidays(getHolidays(getYear(selectedDate)));
    }, [selectedDate]);

    // Split year into array of characters
    const yearString = format(selectedDate, 'yyyy');
    const yearDigits = yearString.split('');

    const handlePrevYear = () => {
        setDirection('down');
        setSelectedDate(subYears(selectedDate, 1));
    };

    const handleNextYear = () => {
        setDirection('up');
        setSelectedDate(addYears(selectedDate, 1));
    };

    const yearStart = startOfYear(selectedDate);
    const monthsToRender = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

    const renderMonth = (baseDate: Date) => {
        const monthStart = startOfMonth(baseDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const rows = [];
        let days = [];
        let day = startDate;
        const monthName = format(monthStart, 'MMMM', { locale: id });

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                days.push(day);
                day = addDays(day, 1);
            }
            rows.push(days);
            days = [];
        }

        return (
            <div className="ref-month-wrapper" key={monthStart.toString()}>
                <div className="ref-month-container">
                    <div className="ref-month-header">
                        <span className="ref-month-name">{monthName}</span>
                    </div>
                    <div className="ref-days-header">
                        <div className="ref-header-spacer"></div>
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                            <div key={d} className={`ref-header-cell ${i === 0 ? 'text-red' : ''}`}>
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="ref-days-grid">
                        {rows.map((week, wIndex) => (
                            <div key={wIndex} className="ref-week-row">
                                <div className="ref-week-num">{format(week[0], 'w')}</div>
                                {week.map((d, dIndex) => {
                                    const isSunday = dIndex === 0;
                                    const isHoliday = holidays.find(h => isSameDay(h.start, d));
                                    const isCurrentMonth = isSameMonth(d, monthStart);
                                    const isToday = isSameDay(d, new Date());

                                    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), d));
                                    const hasEvent = dayEvents.length > 0;
                                    const eventColor = hasEvent ? `var(--event-${dayEvents[0].color})` : undefined;

                                    let className = 'ref-day-cell ';
                                    if (!isCurrentMonth) className += 'text-grey ';
                                    else if (isSunday || isHoliday) className += 'text-red ';
                                    else className += 'text-cal-primary ';
                                    if (isToday) className += 'is-today ';

                                    return (
                                        <div
                                            key={dIndex}
                                            className={className}
                                            style={eventColor && isCurrentMonth ? { color: eventColor, fontWeight: 'bold' } : {}}
                                            onClick={() => {
                                                setSelectedDate(d);
                                                setViewMode('week'); // Switch to Week View on click for granularity
                                            }}
                                        >
                                            <span className="day-value">{format(d, 'd')}</span>
                                            {hasEvent && isCurrentMonth && (
                                                <div className="event-dot" style={{ backgroundColor: eventColor }}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="ref-month-events-list">
                        {holidays.filter(h => isSameMonth(h.start, monthStart)).map((h, i) => (
                            <div key={`h-${i}`} className="ref-month-holiday-item">
                                <span className="ref-holiday-date">{format(h.start, 'd', { locale: id })}</span>
                                <span className="ref-holiday-name text-red-400">{h.name}</span>
                            </div>
                        ))}
                        {events.filter(e => isSameMonth(new Date(e.startTime), monthStart)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 3).map((e) => (
                            <div key={`e-${e.id}`} className="ref-month-holiday-item">
                                <span className="ref-holiday-date">{format(new Date(e.startTime), 'd', { locale: id })}</span>
                                <span className="ref-holiday-name text-purple-400">{e.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="ref-calendar-wrapper animate-fade-in">
            <div className="ref-calendar-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                <div className="year-navigation-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button
                        className="nav-btn year-nav-btn"
                        onClick={handlePrevYear}
                        aria-label="Tahun Lalu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    <div className="year-display-stacked">
                        <div className="year-row-top">
                            <RollingDigit value={yearDigits[0]} direction={direction} />
                            <RollingDigit value={yearDigits[1]} direction={direction} />
                        </div>
                        <div className="year-row-bottom">
                            <RollingDigit value={yearDigits[2]} direction={direction} />
                            <RollingDigit value={yearDigits[3]} direction={direction} />
                        </div>
                    </div>

                    <button
                        className="nav-btn year-nav-btn"
                        onClick={handleNextYear}
                        aria-label="Tahun Depan"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>

                <button
                    onClick={() => openEventModal()}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-colors"
                >
                    + Tambah
                </button>
            </div>

            <div className="ref-months-grid">
                {monthsToRender.map(date => renderMonth(date))}
            </div>
        </div>
    );
};
