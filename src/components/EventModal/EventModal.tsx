import React, { useState } from 'react';
import { CalendarEvent, EventColor } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useUsers } from '../../context/UsersContext';
import { format } from 'date-fns';
import './EventModal.css';

interface EventModalProps {
    event: CalendarEvent | null;
    onClose: () => void;
}

const colorOptions: { value: EventColor; label: string }[] = [
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'red', label: 'Red' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'pink', label: 'Pink' },
    { value: 'teal', label: 'Teal' },
];

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
    const { createEvent, updateEvent, deleteEvent } = useCalendar();
    const { allUsers } = useUsers();
    const isEditing = !!event;

    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [date, setDate] = useState(
        event ? format(new Date(event.startTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    );
    const [startTime, setStartTime] = useState(
        event ? format(new Date(event.startTime), 'HH:mm') : '09:00'
    );
    const [endTime, setEndTime] = useState(
        event ? format(new Date(event.endTime), 'HH:mm') : '10:00'
    );
    const [color, setColor] = useState<EventColor>(event?.color || 'blue');
    const [meetingLink, setMeetingLink] = useState(event?.meetingLink || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(event?.tags || []);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
        event?.participants || []
    );

    const availableTags = ['Meeting', 'Team', 'Planning', 'Discussion', 'Review', 'Workshop'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const eventStartTime = new Date(date);
        eventStartTime.setHours(startHour, startMin, 0, 0);

        const eventEndTime = new Date(date);
        eventEndTime.setHours(endHour, endMin, 0, 0);

        const eventData = {
            title,
            description,
            startTime: eventStartTime,
            endTime: eventEndTime,
            color,
            meetingLink,
            tags: selectedTags,
            participants: selectedParticipants,
            isAllDay: false
        };

        if (isEditing && event) {
            await updateEvent(event.id, eventData);
        } else {
            await createEvent(eventData);
        }

        onClose();
    };

    const handleDelete = async () => {
        if (event && window.confirm('Are you sure you want to delete this event?')) {
            await deleteEvent(event.id);
            onClose();
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const toggleParticipant = (userId: string) => {
        setSelectedParticipants(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="event-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Event' : 'New Event'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title">Event Title</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            className="input"
                            placeholder="Meeting with the team"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                type="date"
                                className="input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startTime">Start Time</label>
                            <input
                                id="startTime"
                                type="time"
                                className="input"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endTime">End Time</label>
                            <input
                                id="endTime"
                                type="time"
                                className="input"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="meetingLink">Meeting Link (optional)</label>
                        <div className="input-with-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            <input
                                id="meetingLink"
                                type="url"
                                className="input"
                                placeholder="https://meet.google.com/..."
                                value={meetingLink}
                                onChange={e => setMeetingLink(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            {colorOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`color-option color-${opt.value} ${color === opt.value ? 'selected' : ''}`}
                                    onClick={() => setColor(opt.value)}
                                    title={opt.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tags</label>
                        <div className="tags-container">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Participants</label>
                        <div className="participants-list">
                            {allUsers.slice(0, 8).map(user => (
                                <div
                                    key={user.id}
                                    className={`participant-option ${selectedParticipants.includes(user.id) ? 'selected' : ''}`}
                                    onClick={() => toggleParticipant(user.id)}
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName} className="avatar avatar-sm" width="32" height="32" />
                                    ) : (
                                        <div className="avatar avatar-sm avatar-placeholder">
                                            {user.displayName?.charAt(0)}
                                        </div>
                                    )}
                                    <span>{user.displayName}</span>
                                    {selectedParticipants.includes(user.id) && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20,6 9,17 4,12" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Notes (optional)</label>
                        <textarea
                            id="description"
                            className="input textarea"
                            placeholder="Add notes..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        {isEditing && (
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
