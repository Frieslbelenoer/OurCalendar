import { getRefs } from './firestore';
import { ActivityLog, User } from '../types';
import { setDoc } from './firebase'; // standard export from firestore
import { v4 as uuidv4 } from 'uuid';

export const logActivity = async (
    user: User,
    type: ActivityLog['type'],
    entityType: ActivityLog['entityType'],
    entityId: string,
    entityTitle: string,
    details?: string
) => {
    if (!user.groupId) return;

    const activityId = uuidv4();
    const activityRef = getRefs.activity(activityId);

    const newActivity: ActivityLog = {
        id: activityId,
        type,
        entityType,
        entityId,
        entityTitle,
        userId: user.id,
        userName: user.displayName,
        userPhotoURL: user.photoURL || undefined,
        groupId: user.groupId,
        timestamp: new Date(),
        details
    };

    try {
        await setDoc(activityRef, newActivity);
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};
