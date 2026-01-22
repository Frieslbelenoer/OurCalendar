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
    gamingRole?: string; // e.g. "Support/Healer", "Duelist"
    favoriteGame?: string; // e.g. "Valorant"
    groupId?: string;
}

export interface Group {
    id: string;
    name: string;
    inviteCode: string;
    createdBy: string;
    createdAt: Date;
    members: string[]; // Array of User IDs
}

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    color: EventColor;
    eventType?: 'gaming' | 'hangout' | 'work' | 'other';
    createdBy: string;
    participants: string[];
    meetingLink?: string;
    tags: string[];
    isAllDay: boolean;
    groupId: string;
    coverPhoto?: string;
    pendingParticipants?: string[];
}

export type EventColor =
    | 'green'
    | 'blue'
    | 'red'
    | 'purple'
    | 'orange'
    | 'pink'
    | 'teal'
    | 'gray';

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

export interface ActivityLog {
    id: string;
    type: 'create' | 'update' | 'delete' | 'join' | 'leave';
    entityType: 'event' | 'task';
    entityId: string;
    entityTitle: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    groupId: string;
    timestamp: Date;
    details?: string; // e.g., "changed time", "added description"
}

export interface Comment {
    id: string;
    eventId: string;
    userId: string;
    text: string;
    createdAt: Date;
}
