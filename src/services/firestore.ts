import {
    collection,
    doc,
    Timestamp,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { User, CalendarEvent } from '../types';

// Generic helper for Date <-> Timestamp conversion
const dateToTimestamp = (date: Date | null | undefined): Timestamp | null => {
    if (!date) return null;
    return Timestamp.fromDate(date);
};

const timestampToDate = (timestamp: any): Date | null => {
    if (!timestamp || !timestamp.toDate) return null;
    return timestamp.toDate();
};

export const userConverter: FirestoreDataConverter<User> = {
    toFirestore(user: User): DocumentData {
        return {
            ...user,
            lastSeen: dateToTimestamp(user.lastSeen),
            // If createdAt is missing, use server time or current time. 
            // Ideally should be set once.
            createdAt: user.createdAt ? dateToTimestamp(user.createdAt) : Timestamp.now(),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): User {
        const data = snapshot.data(options);
        return {
            ...data,
            id: snapshot.id,
            lastSeen: timestampToDate(data.lastSeen),
            createdAt: timestampToDate(data.createdAt) || new Date(),
        } as User;
    }
};

export const eventConverter: FirestoreDataConverter<CalendarEvent> = {
    toFirestore(event: CalendarEvent): DocumentData {
        return {
            ...event,
            // Ensure dates are converted to Timestamps for storage
            startTime: dateToTimestamp(event.startTime),
            endTime: dateToTimestamp(event.endTime),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CalendarEvent {
        const data = snapshot.data(options);
        return {
            ...data,
            id: snapshot.id,
            // Convert back to Date for the app to use
            startTime: timestampToDate(data.startTime) as Date,
            endTime: timestampToDate(data.endTime) as Date,
        } as CalendarEvent;
    }
};

// Typed Collections
// Use these instead of raw collection() calls
export const collections = {
    users: collection(db, 'users').withConverter(userConverter),
    events: collection(db, 'events').withConverter(eventConverter),
};

// Typed Document References
// Use these instead of raw doc() calls
export const getRefs = {
    user: (id: string) => doc(db, 'users', id).withConverter(userConverter),
    event: (id: string) => doc(db, 'events', id).withConverter(eventConverter),
};
