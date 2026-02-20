import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// SƏHİFƏLƏRİN İMPORTU
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard'; // Bayaq yaratdığımız Dashboard faylı
import TripDetails from './pages/TripDetails';
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Profile from "./pages/Profile.jsx";
import Landing from "./pages/Landing.jsx";

function App() {
    // Yaddaşda token varmı yoxlayırıq
    const isAuthenticated = !!localStorage.getItem('token');

    // QORUNAN YOL MƏNTİQİ: Yalnız tokeni olanlar keçə bilər
    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" replace />;
    };

    return (
        <Router>
            <div className="min-h-screen bg-slate-900 font-sans antialiased text-slate-100">
                <Routes>

                    {/* İCTİMAİ (PUBLIC) YOLLAR */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/trip/:id" element={<TripDetails />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* QORUNAN (PRIVATE) YOL */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* STANDART YÖNLƏNDİRMƏLƏR */}
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;