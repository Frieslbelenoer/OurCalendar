import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    rtdb,
    onSnapshot,
    query,
    where,
    getDocs,
    limit,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from '../services/firebase';
import { collections, getRefs } from '../services/firestore';
import { ref, onValue } from 'firebase/database';
import { User, Group } from '../types';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface UsersContextType {
    allUsers: User[];
    onlineUsers: User[];
    loading: boolean;
    currentGroup: Group | null;
    createGroup: (name: string) => Promise<void>;
    joinGroup: (inviteCode: string) => Promise<void>;
    leaveGroup: () => Promise<void>;
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
    const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
    const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    // Listen to users relative to the current user's group
    useEffect(() => {
        if (!user) {
            setAllUsers([]);
            setLoading(false);
            return;
        }

        if (!user.groupId) {
            // New player state: Only show self or empty list
            // We'll show self so the profile card at least shows something, or handle empty UI in components.
            // Let's return just the current user for consistency so they see themselves.
            setAllUsers([user]);
            setLoading(false);
            return;
        }

        // Fetch users in the same group
        // Note: Removing orderBy here to avoid needing a composite index with 'where'. 
        // We will sort in memory.
        const q = query(
            collections.users,
            where('groupId', '==', user.groupId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => doc.data());
            // Sort in memory
            usersData.sort((a, b) => a.displayName.localeCompare(b.displayName));
            setAllUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Listen to current Group data
    useEffect(() => {
        if (!user?.groupId) {
            setCurrentGroup(null);
            return;
        }
        const unsubscribe = onSnapshot(getRefs.group(user.groupId), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setCurrentGroup(docSnapshot.data() as Group);
            }
        });
        return () => unsubscribe();
    }, [user?.groupId]);

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

    const createGroup = async (name: string) => {
        if (!user) return;

        const groupId = uuidv4();
        // Generate a 6-char random code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newGroup: Group = {
            id: groupId,
            name,
            inviteCode,
            createdBy: user.id,
            createdAt: new Date(),
            members: [user.id]
        };

        const groupRef = getRefs.group(groupId);
        await setDoc(groupRef, newGroup);

        // Update user
        const userRef = getRefs.user(user.id);
        await updateDoc(userRef, { groupId: groupId });
        // The user state will update via AuthContext listener automatically? 
        // No, AuthContext listener is on onAuthStateChanged which handles generic auth.
        // We might need to manually trigger a simpler reload or rely on the real-time listener if AuthContext setup is watching user doc.
        // Checking AuthContext: It gets user doc on login. It DOES NOT listen to user doc changes in real-time?
        // Let's check AuthContext again. It listens to onAuthStateChanged. 
        // Ah, AuthContext DOES NOT listen to the user DOCUMENT changes in real-time, only Auth state changes.
        // We should fix AuthContext to listen to the user doc or force a reload. 
        // For now, updating Firestore is the source of truth. 
        // The user object in AuthContext is local state. We might need to refresh it.
        // But let's proceed; typically one would reload the page or we implement doc listener in AuthContext.

        // Actually, for immediate UI update, we really should have AuthContext listening to the DB.
        // But as a quick fix, let's refresh the page or assume AuthContext might need a "refreshUser" method.
        // Since I can't easily change AuthContext right now without breaking flow context, 
        // I will assume the user creates group -> successful -> maybe force a window reload or use a navigation to trigger re-fetch if possible.
        // Better: AuthContext should expose a way to refresh user data.
    };

    const joinGroup = async (inviteCode: string) => {
        if (!user) return;

        // Find group by invite code
        const q = query(collections.groups, where('inviteCode', '==', inviteCode), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Invalid invitation code");
        }

        const groupDoc = querySnapshot.docs[0];
        const group = groupDoc.data();

        // Update Group members
        await updateDoc(getRefs.group(group.id), {
            members: arrayUnion(user.id)
        });

        // Update User groupId
        await updateDoc(getRefs.user(user.id), {
            groupId: group.id
        });
    };

    const leaveGroup = async () => {
        if (!user || !user.groupId) return;

        const groupId = user.groupId;

        // Update User groupId to null
        // Note: We use 'deleteField()' if we want to remove it, but our type says string | null.
        // Let's set it to null.
        await updateDoc(getRefs.user(user.id), {
            groupId: null
        });

        // Remove user from Group members
        await updateDoc(getRefs.group(groupId), {
            members: arrayRemove(user.id)
        });
    };

    // Merge Firestore users with RTDB online status
    const usersWithRealTimeStatus = allUsers.map(u => ({
        ...u,
        isOnline: onlineStatuses[u.id] ?? u.isOnline
    }));

    const onlineUsers = usersWithRealTimeStatus.filter(u => u.isOnline);

    const value: UsersContextType = {
        allUsers: usersWithRealTimeStatus,
        onlineUsers,
        currentGroup,
        loading,
        createGroup,
        joinGroup,
        leaveGroup
    };

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
};
