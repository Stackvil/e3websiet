import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dine from './pages/Dine';
import Play from './pages/Play';
import Events from './pages/Events';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import YourTickets from './pages/YourTickets';
import Success from './pages/Success';
import Failed from './pages/Failed';
import Profile from './pages/Profile';
import CookieConsent from './components/CookieConsent';
import { API_URL } from './config/api';
import useStore from './store/useStore';

function App() {
    const { setUser } = useStore();

    useEffect(() => {
        const restoreSession = async () => {
            const localUser = localStorage.getItem('user');
            if (localUser) {
                try {
                    setUser(JSON.parse(localUser));
                } catch (e) {
                    console.error("Error parsing user data", e);
                    localStorage.removeItem('user');
                }
            }

            try {
                // Attempt to refresh token using httpOnly cookie
                const res = await fetch(`${API_URL}/auth/refresh-token`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                }
            } catch (err) {
                // Silent fail for session restore
            }
        };

        restoreSession();
    }, [setUser]);

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dine" element={<Dine />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/tickets" element={<YourTickets />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/failed" element={<Failed />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Layout>
            <CookieConsent />
        </Router>
    );
}

export default App;
