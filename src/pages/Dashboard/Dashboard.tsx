import React from 'react';
import { WeekView } from '../../components/WeekView';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { updateUserActivity } = useAuth();

    // Update user activity when viewing calendar
    React.useEffect(() => {
        updateUserActivity('Viewing calendar');
    }, []);

    return (
        <div className="dashboard">
            <div className="dashboard-content">
                <WeekView />
            </div>
        </div>
    );
};
