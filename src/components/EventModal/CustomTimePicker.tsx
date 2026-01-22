import React, { useState, useRef, useEffect } from 'react';

interface CustomTimePickerProps {
    value: string; // HH:mm
    onChange: (time: string) => void;
    label?: string;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate hours and minutes
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, ... 55

    const [selectedHour, setSelectedHour] = useState(value.split(':')[0]);
    const [selectedMinute, setSelectedMinute] = useState(value.split(':')[1]);

    // Update internal state when props change
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setSelectedHour(h);
            setSelectedMinute(m);
        }
    }, [value]);

    // Initial scroll
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Scroll to selected
            // This is a bit tricky without id, keeping simple for now
        }
    }, [isOpen]);

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

    const handleSelect = (h: string, m: string) => {
        setSelectedHour(h);
        setSelectedMinute(m);
        onChange(`${h}:${m}`);
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
                    <svg width="18" height="18" className="text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span className="font-mono text-lg tracking-widest">{value}</span>
                </div>
                <svg width="16" height="16" className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-48 animate-fade-in left-0 overflow-hidden flex h-64">
                    {/* Hours Column */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar border-r border-slate-700/50" ref={hoursRef}>
                        <div className="p-2 space-y-1">
                            {hours.map(h => (
                                <div
                                    key={h}
                                    className={`px-3 py-2 text-center rounded-lg cursor-pointer text-sm font-medium transition-colors ${h === selectedHour ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}
                                    onClick={() => handleSelect(h, selectedMinute)}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Minutes Column */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar" ref={minutesRef}>
                        <div className="p-2 space-y-1">
                            {minutes.map(m => (
                                <div
                                    key={m}
                                    className={`px-3 py-2 text-center rounded-lg cursor-pointer text-sm font-medium transition-colors ${m === selectedMinute ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}
                                    onClick={() => handleSelect(selectedHour, m)}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
