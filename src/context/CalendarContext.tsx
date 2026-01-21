import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
} from '../services/firebase';
import { collections, getRefs } from '../services/firestore';
import { CalendarEvent, EventColor } from '../types';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface CalendarContextType {
    events: CalendarEvent[];
    loading: boolean;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    viewMode: 'day' | 'week' | 'month';
    setViewMode: (mode: 'day' | 'week' | 'month') => void;
    filterMyEvents: boolean;
    setFilterMyEvents: (filter: boolean) => void;
    createEvent: (event: Omit<CalendarEvent, 'id' | 'createdBy'>) => Promise<void>;
    updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    getEventsForDate: (date: Date) => CalendarEvent[];
    getEventsForWeek: (startDate: Date) => CalendarEvent[];
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

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        // Use the typed collection reference
        const q = query(collections.events, orderBy('startTime', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // The converter automatically handles data separation
            // snapshot.docs is Array<QueryDocumentSnapshot<CalendarEvent>>
            // doc.data() returns CalendarEvent directly with correct Date objects!
            const eventsData = snapshot.docs.map(doc => doc.data());
            setEvents(eventsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy'>) => {
        if (!user) return;

        const eventId = uuidv4();
        // Use the typed document reference helper
        const eventRef = getRefs.event(eventId);

        // We construct the full event object. 
        // The converter in firestore.ts will handle Date -> Timestamp conversion automatically.
        const newEvent: CalendarEvent = {
            ...eventData,
            id: eventId,
            createdBy: user.id,
            // Ensure these are Dates (they should be from the args)
            startTime: new Date(eventData.startTime),
            endTime: new Date(eventData.endTime),
            // Default values if missing (to satisfy the type if needed, though Omit handles most)
            participants: eventData.participants || [],
            tags: eventData.tags || [],
            isAllDay: eventData.isAllDay || false
        };

        await setDoc(eventRef, newEvent);
    };

    const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
        const eventRef = getRefs.event(id);

        // merge: true with setDoc allows partial updates
        // However, we need to be careful with types. setDoc with merge expects Partial<T>
        // and safely converts it.
        await setDoc(eventRef, eventData, { merge: true });
    };

    const deleteEvent = async (id: string) => {
        const eventRef = getRefs.event(id);
        await deleteDoc(eventRef);
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

    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
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
        getEventsForDate,
        getEventsForWeek
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};
