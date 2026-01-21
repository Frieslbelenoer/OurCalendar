import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    auth,
    onAuthStateChanged,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
    setupPresence,
    setDoc,
    getDoc,
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                setFirebaseUser(fbUser);

                // Get or create user document
                const userRef = getRefs.user(fbUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    // With converter, .data() returns typed User object
                    const userData = userSnap.data();
                    setUser(userData);
                } else {
                    // Create new user document
                    const newUser: User = {
                        id: fbUser.uid,
                        email: fbUser.email || '',
                        displayName: fbUser.displayName || 'User',
                        photoURL: fbUser.photoURL,
                        phoneNumber: fbUser.phoneNumber,
                        isOnline: true,
                        // Provide dates directly, converter handles timestamp conversion
                        lastSeen: new Date(),
                        currentActivity: 'Just joined',
                        createdAt: new Date()
                    };

                    await setDoc(userRef, newUser);
                    setUser(newUser);
                }

                // Setup presence
                setupPresence(fbUser.uid);
            } else {
                setFirebaseUser(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSignInWithGoogle = async () => {
        try {
            setError(null);
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Auth Error:", err);
            if (err.code === 'auth/unauthorized-domain') {
                setError(`Domain unauthorized (${window.location.hostname}). Add it to Firebase Console > Auth > Settings > Domains.`);
            } else {
                setError(err.message);
            }
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
