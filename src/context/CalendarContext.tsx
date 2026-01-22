import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    arrayUnion,
    arrayRemove,
    getDoc,
    // orderBy, // Removed to avoid composite index requirement with where. Sorting in memory.
} from '../services/firebase';
import { collections, getRefs } from '../services/firestore';
import { CalendarEvent } from '../types';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../services/activity';

interface CalendarContextType {
    events: CalendarEvent[];
    loading: boolean;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    viewMode: 'day' | 'week' | 'month' | 'year';
    setViewMode: (mode: 'day' | 'week' | 'month' | 'year') => void;
    filterMyEvents: boolean;
    setFilterMyEvents: (filter: boolean) => void;
    createEvent: (event: Omit<CalendarEvent, 'id' | 'createdBy' | 'groupId'>) => Promise<void>;
    updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    requestJoinEvent: (id: string, userId: string) => Promise<void>;
    cancelJoinRequest: (id: string, userId: string) => Promise<void>;
    approveJoinRequest: (id: string, userId: string) => Promise<void>;
    rejectJoinRequest: (id: string, userId: string) => Promise<void>;
    leaveEvent: (id: string, userId: string) => Promise<void>;
    getEventsForDate: (date: Date) => CalendarEvent[];
    getEventsForWeek: (startDate: Date) => CalendarEvent[];
    isEventModalOpen: boolean;
    editingEvent: CalendarEvent | null;
    eventModalMode: 'default' | 'view';
    openEventModal: (event?: CalendarEvent | null, mode?: 'default' | 'view') => void;
    closeEventModal: () => void;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [eventModalMode, setEventModalMode] = useState<'default' | 'view'>('default');

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        if (!user.groupId) {
            // New player: No events
            setEvents([]);
            setLoading(false);
            return;
        }

        // Use the typed collection reference
        const q = query(
            collections.events,
            where('groupId', '==', user.groupId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => doc.data());
            // Sort in memory by startTime asc
            eventsData.sort((a, b) => {
                const timeA = a.startTime ? a.startTime.getTime() : 0;
                const timeB = b.startTime ? b.startTime.getTime() : 0;
                return timeA - timeB;
            });
            setEvents(eventsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'groupId'>) => {
        if (!user || !user.groupId) {
            alert("You must belong to a Squad to create events.");
            return;
        }

        const eventId = uuidv4();
        // Use the typed document reference helper
        const eventRef = getRefs.event(eventId);

        // We construct the full event object. 
        // The converter in firestore.ts will handle Date -> Timestamp conversion automatically.
        const newEvent: CalendarEvent = {
            ...eventData,
            id: eventId,
            createdBy: user.id,
            groupId: user.groupId,
            // Ensure these are Dates (they should be from the args)
            startTime: new Date(eventData.startTime),
            endTime: new Date(eventData.endTime),
            // Default values if missing (to satisfy the type if needed, though Omit handles most)
            participants: eventData.participants || [],
            tags: eventData.tags || [],
            isAllDay: eventData.isAllDay || false
        };

        await setDoc(eventRef, newEvent);
        await logActivity(user, 'create', 'event', eventId, newEvent.title, 'New event created');
    };

    const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
        if (!user) return;
        const eventRef = getRefs.event(id);

        // merge: true with setDoc allows partial updates
        // However, we need to be careful with types. setDoc with merge expects Partial<T>
        // and safely converts it.
        await setDoc(eventRef, eventData, { merge: true });
        // Ideally fetch the event to get title, but for update we might not know it if only partial data.
        // Assuming title is not always passed. If passed, use it.
        const title = eventData.title || 'Event';
        await logActivity(user, 'update', 'event', id, title, 'Event updated');
    };

    const deleteEvent = async (id: string) => {
        if (!user) return;
        // We'd ideally need the event title before deleting, but let's just log "Event".
        // Or we assume the caller has the event object.
        const eventRef = getRefs.event(id);
        await deleteDoc(eventRef);
        await logActivity(user, 'delete', 'event', id, 'Event', 'Event deleted');
    };

    const requestJoinEvent = async (id: string, userId: string) => {
        const eventRef = getRefs.event(id);
        await setDoc(eventRef, { pendingParticipants: arrayUnion(userId) }, { merge: true });
        // Note: Don't log here - only log after admin approves
    };

    const cancelJoinRequest = async (id: string, userId: string) => {
        const eventRef = getRefs.event(id);
        await setDoc(eventRef, { pendingParticipants: arrayRemove(userId) }, { merge: true });
    };

    const approveJoinRequest = async (id: string, userId: string) => {
        const eventRef = getRefs.event(id);
        await setDoc(eventRef, {
            pendingParticipants: arrayRemove(userId),
            participants: arrayUnion(userId)
        }, { merge: true });

        // Log activity for the APPROVED user (not the admin)
        const eventData = events.find(e => e.id === id);
        const approvedUserRef = getRefs.user(userId);
        const approvedUserSnap = await getDoc(approvedUserRef);
        if (approvedUserSnap.exists()) {
            const approvedUser = approvedUserSnap.data();
            await logActivity(approvedUser, 'join', 'event', id, eventData?.title || 'Event', 'Berhasil join event');
        }
    };

    const rejectJoinRequest = async (id: string, userId: string) => {
        const eventRef = getRefs.event(id);
        await setDoc(eventRef, { pendingParticipants: arrayRemove(userId) }, { merge: true });
    };

    const leaveEvent = async (id: string, userId: string) => {
        const eventRef = getRefs.event(id);
        await setDoc(eventRef, { participants: arrayRemove(userId) }, { merge: true });

        // Log activity for the user who is leaving
        const eventData = events.find(e => e.id === id);
        if (user && user.id === userId) {
            await logActivity(user, 'leave', 'event', id, eventData?.title || 'Event', 'Gajadi ikut event');
        }
    };

    const getEventsForDate = (date: Date): CalendarEvent[] => {
        return events.filter((event) => {
            const eventDate = new Date(event.startTime);
            return (
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getDate() === date.getDate()
            );
        });
    };

    const getEventsForWeek = (startDate: Date): CalendarEvent[] => {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        return events.filter((event) => {
            const eventDate = new Date(event.startTime);
            return eventDate >= startDate && eventDate < endDate;
        });
    };

    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [filterMyEvents, setFilterMyEvents] = useState(false);

    const value: CalendarContextType = {
        events,
        loading,
        selectedDate,
        setSelectedDate,
        viewMode,
        setViewMode,
        filterMyEvents,
        setFilterMyEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        requestJoinEvent,
        cancelJoinRequest,
        approveJoinRequest,
        rejectJoinRequest,
        leaveEvent,
        getEventsForDate,
        getEventsForWeek,
        isEventModalOpen,
        editingEvent,
        eventModalMode,
        openEventModal: (event?: CalendarEvent | null, mode: 'default' | 'view' = 'default') => {
            setEditingEvent(event || null);
            setEventModalMode(mode);
            setIsEventModalOpen(true);
        },
        closeEventModal: () => {
            setEditingEvent(null);
            setIsEventModalOpen(false);
            setEventModalMode('default');
        }
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};
