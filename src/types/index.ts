export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    phoneNumber: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
    currentActivity: string;
    createdAt: Date;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    color: EventColor;
    createdBy: string;
    participants: string[];
    meetingLink?: string;
    tags: string[];
    isAllDay: boolean;
}

export type EventColor =
    | 'green'
    | 'blue'
    | 'red'
    | 'purple'
    | 'orange'
    | 'pink'
    | 'teal';

export interface TimeBreakdown {
    category: string;
    color: string;
    percentage: number;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface UserActivity {
    userId: string;
    activity: string;
    timestamp: Date;
}
