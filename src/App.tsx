import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CalendarProvider } from './context/CalendarContext';
import { UsersProvider } from './context/UsersContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { HomePage } from './pages/HomePage';
import { TeamPage } from './pages/TeamPage';
import { ReportsPage } from './pages/ReportsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Layout } from './components/Layout/Layout';
import './styles/index.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">
                        <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="#6366F1" />
                            <path d="M8 10C8 8.89543 8.89543 8 10 8H22C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V10Z" stroke="white" strokeWidth="1.5" />
                            <line x1="8" y1="13" x2="24" y2="13" stroke="white" strokeWidth="1.5" />
                            <circle cx="12" cy="17" r="1.5" fill="#22C55E" />
                            <circle cx="16" cy="17" r="1.5" fill="#3B82F6" />
                            <circle cx="20" cy="17" r="1.5" fill="#EF4444" />
                        </svg>
                    </div>
                    <div className="loading-spinner-large"></div>
                    <p>Loading OurCalendar...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-spinner-large"></div>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <UsersProvider>
                            <CalendarProvider>
                                <Layout />
                            </CalendarProvider>
                        </UsersProvider>
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Navigate to="/calendar" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/calendar" element={<Dashboard />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

// App with Providers
import { ThemeProvider } from './context/ThemeContext';

// App with Providers
export const App: React.FC = () => {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;
