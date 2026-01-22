import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    arrayUnion,
    arrayRemove,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import {
    getDatabase,
    ref,
    set,
    onValue,
    onDisconnect,
    serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig } from '../config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const analytics = getAnalytics(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Auth Functions
// Auth Functions
export const signInWithGoogle = async () => {
    try {
        // Apply Better Auth principle: Explicit Session Strategy
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        // Map types strictly if possible, or re-throw sanitized error
        throw error;
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Email sign-in error:', error);
        throw error;
    }
};

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Email sign-up error:', error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign-out error:', error);
        throw error;
    }
};

// User Presence System
export const setupPresence = (userId: string) => {
    const userStatusRef = ref(rtdb, `/status/${userId}`);
    const userStatusFirestoreRef = doc(db, 'users', userId);

    const isOfflineForRTDB = {
        state: 'offline',
        lastChanged: rtdbServerTimestamp()
    };

    const isOnlineForRTDB = {
        state: 'online',
        lastChanged: rtdbServerTimestamp()
    };

    const connectedRef = ref(rtdb, '.info/connected');

    onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }

        onDisconnect(userStatusRef).set(isOfflineForRTDB).then(() => {
            set(userStatusRef, isOnlineForRTDB);
            updateDoc(userStatusFirestoreRef, {
                isOnline: true,
                lastSeen: serverTimestamp()
            }).catch(console.error);
        });
    });
};

// Firestore exports
export {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    arrayUnion,
    arrayRemove,
    Timestamp,
    serverTimestamp,
    onAuthStateChanged
};

export type { User };
