import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day: Date) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";
        return (
            <div className="flex items-center justify-between py-2 mb-2 border-b border-gray-700">
                <button type="button" onClick={prevMonth} className="text-gray-400 hover:text-white p-1 rounded hover:bg-slate-700 transition">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="font-bold text-white capitalize">
                    {format(currentMonth, dateFormat, { locale: id })}
                </span>
                <button type="button" onClick={nextMonth} className="text-gray-400 hover:text-white p-1 rounded hover:bg-slate-700 transition">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = "EEEE";
        const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Monday start

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-xs font-bold text-gray-500 uppercase text-center py-1">
                    {format(addDays(startDate, i), dateFormat, { locale: id }).substring(0, 3)}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-1">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isSelected = value === format(cloneDay, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                days.push(
                    <div
                        key={day.toString()}
                        className={`
                            relative h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer text-sm font-medium transition-all duration-200
                            ${!isCurrentMonth ? "text-gray-600 pointer-events-none" : "text-gray-300 hover:bg-slate-700 hover:text-white"}
                            ${isSelected ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50" : ""}
                            ${isTodayDate && !isSelected ? "border border-purple-500 text-purple-400" : ""}
                        `}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };

    return (
        <div className="relative w-full form-group" ref={containerRef}>
            {label && <label className="text-sm font-medium text-gray-400 mb-1">{label}</label>}
            <button
                type="button"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-left text-white flex items-center justify-between hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <svg width="18" height="18" className="text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>
                        {value ? format(new Date(value), 'dd MMMM yyyy', { locale: id }) : 'Pilih Tanggal'}
                    </span>
                </div>
                <svg width="16" height="16" className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-72 animate-fade-in left-0">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );
};
