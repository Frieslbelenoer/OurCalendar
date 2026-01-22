import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    auth,
    onAuthStateChanged,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
    setupPresence,
    onSnapshot,
    setDoc,
    User as FirebaseUser
} from '../services/firebase';
import { getRefs } from '../services/firestore';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserActivity: (activity: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // 1. Listen to Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
            setFirebaseUser(fbUser || null);
            if (!fbUser) {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Listen to User Document (Real-time)
    useEffect(() => {
        if (!firebaseUser) return;

        setLoading(true);
        const userRef = getRefs.user(firebaseUser.uid);

        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                setUser(docSnap.data());
            } else {
                // Create new user document
                const newUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || 'User',
                    photoURL: firebaseUser.photoURL,
                    phoneNumber: firebaseUser.phoneNumber,
                    isOnline: true,
                    lastSeen: new Date(),
                    currentActivity: 'Just joined',
                    createdAt: new Date()
                };

                await setDoc(userRef, newUser);
                // Snapshot listener will fire again with new data
            }
            setLoading(false);
        });

        setupPresence(firebaseUser.uid);

        return () => unsubscribe();
    }, [firebaseUser]);

    const handleSignInWithGoogle = async () => {
        if (isAuthenticating) return; // Prevent double clicks (Rate Limit Principle)

        try {
            setIsAuthenticating(true);
            setError(null);
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Auth Error:", err);
            // Better-Auth style error mapping for security/clarity
            let message = "An unexpected error occurred during sign in.";
            if (err.code === 'auth/unauthorized-domain') {
                message = `Domain unauthorized (${window.location.hostname}). Add it to Firebase Console > Auth > Settings > Domains.`;
            } else if (err.code === 'auth/popup-closed-by-user') {
                message = "The sign-in window was closed before completion.";
            } else if (err.code === 'auth/popup-blocked') {
                message = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
            } else if (err.code === 'auth/network-request-failed') {
                message = "Network error. Please check your internet connection.";
            }
            setError(message);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleSignInWithEmail = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmail(email, password);
        } catch (err: any) {
            console.error("Auth Error:", err);
            if (err.code === 'auth/unauthorized-domain') {
                setError(`Domain unauthorized (${window.location.hostname}). Add it to Firebase Console > Auth > Settings > Domains.`);
            } else {
                setError(err.message);
            }
        }
    };

    const handleSignUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const fbUser = await signUpWithEmail(email, password);

            // Create user document with display name
            const userRef = getRefs.user(fbUser.uid);
            const newUser: User = {
                id: fbUser.uid,
                email: email,
                displayName: displayName,
                photoURL: null,
                phoneNumber: null,
                isOnline: true,
                currentActivity: 'Just joined',
                createdAt: new Date(),
                lastSeen: new Date()
            };

            await setDoc(userRef, newUser);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogout = async () => {
        try {
            if (user) {
                const userRef = getRefs.user(user.id);
                // Partial update for specific fields
                // Note: setDoc with merge allows generic object, but we should be careful.
                // Or we can use updateDoc if strict typing for partial is an issue with converter.
                // However, setDoc with merge is standard. 
                // We'll pass an object that matches structure.
                await setDoc(userRef, { isOnline: false, lastSeen: new Date() } as any, { merge: true });
            }
            await logOut();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const updateUserActivity = async (activity: string) => {
        if (user) {
            try {
                const userRef = getRefs.user(user.id);
                await setDoc(userRef, { currentActivity: activity } as any, { merge: true });
                setUser({ ...user, currentActivity: activity });
            } catch (err: any) {
                console.error('Failed to update activity:', err);
            }
        }
    };

    const value: AuthContextType = {
        user,
        firebaseUser,
        loading,
        error,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        logout: handleLogout,
        updateUserActivity
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
