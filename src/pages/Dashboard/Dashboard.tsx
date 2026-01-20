import React from 'react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { WeekView } from '../../components/WeekView';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { user, updateUserActivity } = useAuth();
    const currentMonth = format(new Date(), 'MMMM yyyy');

    // Update user activity when viewing calendar
    React.useEffect(() => {
        updateUserActivity('Viewing calendar');
    }, []);

    return (
        <div className="dashboard">
            <Header currentMonth={currentMonth} />
            <div className="dashboard-content">
                <Sidebar />
                <WeekView />
            </div>
        </div>
    );
};
