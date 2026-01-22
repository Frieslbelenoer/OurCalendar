import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, error } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="bg-gradient-1"></div>
                <div className="bg-gradient-2"></div>
                <div className="bg-gradient-3"></div>
            </div>

            <div className="login-container animate-slide-up">
                <div className="login-header">
                    <div className="login-logo">
                        <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="#6366F1" />
                            <path d="M8 10C8 8.89543 8.89543 8 10 8H22C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V10Z" stroke="white" strokeWidth="1.5" />
                            <line x1="8" y1="13" x2="24" y2="13" stroke="white" strokeWidth="1.5" />
                            <circle cx="12" cy="17" r="1.5" fill="#22C55E" />
                            <circle cx="16" cy="17" r="1.5" fill="#3B82F6" />
                            <circle cx="20" cy="17" r="1.5" fill="#EF4444" />
                        </svg>
                    </div>
                    <h1>Basecamp Kita</h1>
                    <p>Tempat Nongkrong & Mabar Tanpa Drama</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="displayName">Nama Panggung</label>
                            <input
                                id="displayName"
                                type="text"
                                className="input"
                                placeholder="Panggilan lu siapa?"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Lo</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="Email yang aktif ya"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Sandi Rahasia</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="Jangan kasih tau orang lain"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            isSignUp ? 'Gas Bikin Akun!' : 'Gas Masuk!'
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>atau login pake</span>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="btn btn-secondary google-btn"
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Gas Pake Google
                </button>

                <p className="login-toggle">
                    {isSignUp ? 'Udah punya akun?' : "Belum punya akun?"}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="toggle-btn"
                    >
                        {isSignUp ? 'Masuk Sini' : 'Daftar Dulu'}
                    </button>
                </p>
            </div>
        </div>
    );
};
