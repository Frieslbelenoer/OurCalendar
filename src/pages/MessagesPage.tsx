import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, orderBy, onSnapshot, serverTimestamp } from '../services/firebase';
import { addDoc } from 'firebase/firestore'; // Import addDoc directly
import { format } from 'date-fns';

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderPhoto: string;
    createdAt: any;
}

export const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Subscribe to messages
    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(msgs);
            // Scroll to bottom on new message
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => unsubscribe();
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'messages'), {
                text: newMessage,
                senderId: user.id,
                senderName: user.displayName,
                senderPhoto: user.photoURL,
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col animate-slide-up bg-opacity-50" style={{ height: 'calc(100vh - 80px)' }}> {/* Adjust height for layout */}
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-slate-900/50 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-purple-400">#</span> Bacotan Umum
                    </h2>
                    <p className="text-xs text-secondary">Tempat diskusi jadwal mabar & gosip</p>
                </div>
                <div className="text-xs text-secondary">
                    {messages.length} chat
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                                {msg.senderPhoto ? (
                                    <img src={msg.senderPhoto} alt={msg.senderName} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        {msg.senderName?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-300">{isMe ? 'Lu' : msg.senderName}</span>
                                    <span className="text-xs text-gray-500">
                                        {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'h:mm a') : 'Barusan'}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-lg text-sm ${isMe
                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-slate-900/50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik sesuatu yang unfaedah..."
                        className="flex-1 bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Kirim
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
