import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { EventModal } from '../EventModal'; // Import EventModal
import { useCalendar } from '../../context/CalendarContext'; // Import useCalendar
import { format } from 'date-fns';

export const Layout: React.FC = () => {
    const { isEventModalOpen, editingEvent, closeEventModal } = useCalendar();
    // Current month for header (can be dynamic based on global state later if needed)
    const currentMonth = format(new Date(), 'MMMM yyyy');

    return (
        <div className="app-container flex-col">
            <Header currentMonth={currentMonth} />
            <div className="main-content flex">
                <Sidebar />
                <div className="page-content flex-1 overflow-hidden relative">
                    <Outlet />
                </div>
            </div>

            {isEventModalOpen && (
                <EventModal
                    event={editingEvent}
                    onClose={closeEventModal}
                />
            )}
        </div>
    );
};
