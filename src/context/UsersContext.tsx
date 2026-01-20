import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    rtdb,
    onSnapshot,
    query,
    orderBy
} from '../services/firebase';
import { collections } from '../services/firestore';
import { ref, onValue } from 'firebase/database';
import { User } from '../types';
import { useAuth } from './AuthContext';

interface UsersContextType {
    allUsers: User[];
    onlineUsers: User[];
    loading: boolean;
}

const UsersContext = createContext<UsersContextType | null>(null);

export const useUsers = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers must be used within a UsersProvider');
    }
    return context;
};

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    // Listen to all users from Firestore
    useEffect(() => {
        if (!user) {
            setAllUsers([]);
            setLoading(false);
            return;
        }

        // Use typed collection
        const q = query(collections.users, orderBy('displayName', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // The converter automatically handles data extraction and type conversion
            const usersData = snapshot.docs.map(doc => doc.data());
            setAllUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Listen to real-time presence from RTDB
    useEffect(() => {
        if (!user) return;

        const statusRef = ref(rtdb, '/status');

        const unsubscribe = onValue(statusRef, (snapshot) => {
            const statuses: Record<string, boolean> = {};
            snapshot.forEach((child) => {
                const data = child.val();
                statuses[child.key!] = data.state === 'online';
            });
            setOnlineStatuses(statuses);
        });

        return () => unsubscribe();
    }, [user]);

    // Merge Firestore users with RTDB online status
    const usersWithRealTimeStatus = allUsers.map(u => ({
        ...u,
        isOnline: onlineStatuses[u.id] ?? u.isOnline
    }));

    const onlineUsers = usersWithRealTimeStatus.filter(u => u.isOnline);

    const value: UsersContextType = {
        allUsers: usersWithRealTimeStatus,
        onlineUsers,
        loading
    };

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
};
