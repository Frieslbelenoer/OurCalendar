import {
    collection,
    doc,
    Timestamp,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData,
    WithFieldValue,
    PartialWithFieldValue,
    SetOptions
} from 'firebase/firestore';
import { db } from './firebase';
import { User, CalendarEvent, Group, ActivityLog } from '../types';

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
    toFirestore(modelObject: WithFieldValue<User> | PartialWithFieldValue<User>, _options?: SetOptions): DocumentData {
        const user = modelObject as Partial<User>;
        const data = { ...user } as DocumentData;
        if (user.lastSeen instanceof Date) data.lastSeen = dateToTimestamp(user.lastSeen);
        if (user.createdAt instanceof Date) data.createdAt = dateToTimestamp(user.createdAt);
        return data;
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
    toFirestore(modelObject: WithFieldValue<CalendarEvent> | PartialWithFieldValue<CalendarEvent>, _options?: SetOptions): DocumentData {
        const event = modelObject as Partial<CalendarEvent>;
        const data = { ...event } as DocumentData;
        if (event.startTime instanceof Date) data.startTime = dateToTimestamp(event.startTime);
        if (event.endTime instanceof Date) data.endTime = dateToTimestamp(event.endTime);
        return data;
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

export const groupConverter: FirestoreDataConverter<Group> = {
    toFirestore(group: Group): DocumentData {
        return {
            ...group,
            createdAt: dateToTimestamp(group.createdAt),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Group {
        const data = snapshot.data(options);
        return {
            ...data,
            id: snapshot.id,
            createdAt: timestampToDate(data.createdAt) || new Date(),
        } as Group;
    }
};

export const activityConverter: FirestoreDataConverter<ActivityLog> = {
    toFirestore(log: ActivityLog): DocumentData {
        return {
            ...log,
            timestamp: dateToTimestamp(log.timestamp),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ActivityLog {
        const data = snapshot.data(options);
        return {
            ...data,
            id: snapshot.id,
            timestamp: timestampToDate(data.timestamp) || new Date(),
        } as ActivityLog;
    }
};

// Typed Collections
// Use these instead of raw collection() calls
export const collections = {
    users: collection(db, 'users').withConverter(userConverter),
    events: collection(db, 'events').withConverter(eventConverter),
    groups: collection(db, 'groups').withConverter(groupConverter),
    activities: collection(db, 'activities').withConverter(activityConverter),
};

// Typed Document References
// Use these instead of raw doc() calls
export const getRefs = {
    user: (id: string) => doc(db, 'users', id).withConverter(userConverter),
    event: (id: string) => doc(db, 'events', id).withConverter(eventConverter),
    group: (id: string) => doc(db, 'groups', id).withConverter(groupConverter),
    activity: (id: string) => doc(db, 'activities', id).withConverter(activityConverter),
};
