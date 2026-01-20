import React from 'react';
import { CalendarEvent, User } from '../../types';
import { format } from 'date-fns';
import './EventCard.css';

interface EventCardProps {
    event: CalendarEvent;
    style: React.CSSProperties;
    participants: (User | undefined)[];
    onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
    event,
    style,
    participants,
    onClick
}) => {
    const validParticipants = participants.filter(Boolean) as User[];

    return (
        <div
            className={`event-card event-${event.color}`}
            style={style}
            onClick={onClick}
        >
            <div className="event-card-content">
                <h4 className="event-card-title">{event.title}</h4>
                <span className="event-card-time">
                    {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                </span>

                {validParticipants.length > 0 && (
                    <div className="event-participants">
                        {validParticipants.slice(0, 3).map((participant, index) => (
                            <div key={participant.id} className="participant-avatar" style={{ zIndex: 3 - index }}>
                                {participant.photoURL ? (
                                    <img src={participant.photoURL} alt={participant.displayName} />
                                ) : (
                                    <span>{participant.displayName?.charAt(0)}</span>
                                )}
                            </div>
                        ))}
                        {validParticipants.length > 3 && (
                            <div className="participant-count">
                                +{validParticipants.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
