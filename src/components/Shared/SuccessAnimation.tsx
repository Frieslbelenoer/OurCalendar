import React, { useEffect, useState } from 'react';
import './SuccessAnimation.css';

interface SuccessAnimationProps {
    onComplete: () => void;
}

const successMessages = [
    "Jadwal secured, bestie! 💅",
    "No wacana, gas terus! 🚀",
    "Auto join, jangan skip! 🔥",
    "Udah kecatet, aman! ✨",
    "Valid no debat! 💯",
    "Menyala abangkuh! 🔥"
];

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ onComplete }) => {
    const [message] = useState(() => successMessages[Math.floor(Math.random() * successMessages.length)]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="success-overlay">
            <div className="success-content">
                <div className="checkmark-circle">
                    <div className="checkmark draw"></div>
                </div>
                <h2 className="success-text">{message}</h2>
            </div>
        </div>
    );
};
