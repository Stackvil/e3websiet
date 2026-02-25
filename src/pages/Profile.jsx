import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Award, Gift, LogOut, Edit2, Save, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { fetchWithAuth } from '../utils/apiFetch';

const Profile = () => {
    const { user, setUser } = useStore();          // ← removed non-existent 'logout'
    const navigate = useNavigate();

    // ── Edit state ────────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

    // ── Fetch fresh profile once on mount ────────────────────────────────────
    // NOTE: user is intentionally NOT in the deps array — prevents infinite loop
    // (fetchProfile calls setUser which would re-trigger the effect otherwise)
    const fetchProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/profile`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    }, [setUser]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // empty deps = runs once on mount

    // ── Dismiss toast after 3 s ───────────────────────────────────────────────
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const handleStartEdit = () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetchWithAuth(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: editName, email: editEmail })
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                localStorage.setItem('user', JSON.stringify(updated));
                setIsEditing(false);
                setToast({ type: 'success', msg: 'Profile updated successfully!' });
            } else {
                const err = await res.json();
                setToast({ type: 'error', msg: err.message || 'Failed to update profile.' });
            }
        } catch (err) {
            setToast({ type: 'error', msg: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleClaimReward = async () => {
        if (user?.reward_points < 500) return;
        setClaiming(true);
        try {
            const location = user.location?.toLowerCase() || 'e3';
            const res = await fetchWithAuth(`${API_URL}/orders/${location}/claim-reward`, {
                method: 'POST'
            });

            if (res.ok) {
                // Refresh profile to show deducted points
                await fetchProfile();
                setToast({ type: 'success', msg: 'Free Ride Ticket Claimed 🎉 Check Your Tickets!' });
            } else {
                const err = await res.json();
                setToast({ type: 'error', msg: err.message || 'Failed to claim reward.' });
            }
        } catch (err) {
            setToast({ type: 'error', msg: 'Network error. Please try again.' });
        } finally {
            setClaiming(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) { /* silent */ }
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : (user.mobile?.slice(-2) || 'U');

    return (
        <div className="min-h-screen bg-creamy-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">

            {/* ── Toast notification ──────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm
                            ${toast.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-600'}`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 size={18} />
                            : <AlertCircle size={18} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                    {/* ── Header banner ─────────────────────────────────────── */}
                    <div className="bg-gradient-to-r from-riverside-teal to-teal-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                {/* Avatar */}
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-black border-2 border-white/40 shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black mb-0.5">{user.name || 'Guest User'}</h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                                            {user.role || 'Member'}
                                        </span>
                                        {user.location && (
                                            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                                                {user.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={handleStartEdit}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-4 py-2.5 rounded-xl font-bold transition-all text-sm shrink-0"
                                >
                                    <Edit2 size={15} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Body ──────────────────────────────────────────────── */}
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-10">

                            {/* ── Left: Personal info / edit form ─────────── */}
                            <div>
                                {isEditing ? (
                                    <form onSubmit={handleSave} className="space-y-5">
                                        <h2 className="text-lg font-black text-charcoal-grey border-b border-gray-100 pb-3 mb-5">
                                            Edit Information
                                        </h2>

                                        {/* Name */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    required
                                                    placeholder="Your full name"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-gray-100 focus:border-riverside-teal transition-colors text-charcoal-grey"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={editEmail}
                                                    onChange={e => setEditEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-gray-100 focus:border-riverside-teal transition-colors text-charcoal-grey"
                                                />
                                            </div>
                                        </div>

                                        {/* Mobile (read-only) */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Mobile Number <span className="normal-case font-normal text-gray-400">(cannot be changed)</span>
                                            </label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                                <input
                                                    type="tel"
                                                    value={user.mobile || ''}
                                                    disabled
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl font-medium border-2 border-gray-100 text-gray-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200"
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 py-3 bg-riverside-teal text-white font-bold rounded-xl hover:bg-teal-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {saving
                                                    ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                                                    : <><Save size={16} /> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black text-charcoal-grey border-b border-gray-100 pb-3">
                                            Personal Information
                                        </h3>

                                        {[
                                            { icon: <User size={18} />, label: 'Full Name', value: user.name || '—' },
                                            { icon: <Mail size={18} />, label: 'Email', value: user.email || '—' },
                                            { icon: <Phone size={18} />, label: 'Mobile', value: user.mobile ? `+91 ${user.mobile}` : '—' },
                                        ].map(({ icon, label, value }) => (
                                            <div key={label} className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-teal-50 rounded-full flex items-center justify-center text-riverside-teal shrink-0">
                                                    {icon}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                                                    <p className="font-semibold text-charcoal-grey">{value}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={handleStartEdit}
                                            className="mt-2 flex items-center gap-2 text-sm text-riverside-teal font-bold hover:underline"
                                        >
                                            <Edit2 size={14} /> Edit name or email
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ── Right: Rewards ──────────────────────────── */}
                            <div className="space-y-5">
                                <h3 className="text-lg font-black text-charcoal-grey border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <Award className="text-amber-400" size={20} /> Rewards & Points
                                </h3>

                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-bl-full opacity-20 -mr-6 -mt-6" />
                                    <div className="relative z-10">
                                        <p className="text-indigo-500 font-bold text-xs uppercase tracking-widest mb-1">Current Balance</p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                                {user.reward_points || 0}
                                            </span>
                                            <span className="text-gray-500 font-medium">Points</span>
                                        </div>
                                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-indigo-100 flex items-start gap-2">
                                            <Gift className="text-purple-500 shrink-0 mt-0.5" size={16} />
                                            {user.reward_points >= 500 ? (
                                                <div className="flex-1 flex flex-col gap-2">
                                                    <p className="text-xs text-gray-800 font-bold leading-snug">
                                                        You've unlocked a <strong className="text-purple-600">Free Ride Ticket</strong>! 🎟️
                                                    </p>
                                                    <button
                                                        onClick={handleClaimReward}
                                                        disabled={claiming}
                                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {claiming ? <Loader2 size={14} className="animate-spin" /> : 'Claim Free Ride Now'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-600 leading-snug">
                                                    Earn <strong className="text-indigo-600">500 Points</strong> to unlock a <strong className="text-purple-600">Free Ride Ticket</strong> 🎟️
                                                    <br />
                                                    <span className="text-[10px] text-gray-400 font-medium">({500 - (user.reward_points || 0)} more points needed)</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex gap-3 items-center">
                                    <span className="text-xl shrink-0">💡</span>
                                    <p className="text-xs text-gray-600">
                                        Earn <strong className="text-orange-600">10 Points</strong> for every transaction above <strong className="text-orange-600">₹300</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer: Logout ───────────────────────────────── */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100 text-sm"
                            >
                                <LogOut size={16} /> Logout
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
