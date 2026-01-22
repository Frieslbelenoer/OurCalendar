import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collections } from './firestore';
import { ActivityLog } from '../types';
import { query, where, onSnapshot } from './firebase';

export const useRecentActivity = (limitCount = 10) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.groupId) {
            setActivities([]);
            setLoading(false);
            return;
        }

        // We ideally want query(collections.activities, where('groupId'...), orderBy('timestamp', 'desc'), limit(limitCount))
        // But this requires a composite index. 
        // For simplicity during development, we'll try without composite index if possible,
        // or ensure we create one.
        // Actually, let's try reading and sorting in memory if dataset is small, or use the index.
        // The safest "no-index" way is just 'where'. But 'orderBy' is needed for recent.
        // Let's assume we can create the index or just use where and sort client-side (not scalable but works for MVP).

        // Strategy: Query by group, sort client side.
        const q = query(
            collections.activities,
            where('groupId', '==', user.groupId),
            // orderBy('timestamp', 'desc'), // user will need to create index
            // limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data());
            data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setActivities(data.slice(0, limitCount));
            setLoading(false);
        }, (error) => {
            console.error("Activity Listener Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, limitCount]);

    return { activities, loading };
};
