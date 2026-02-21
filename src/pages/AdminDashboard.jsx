import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { LayoutDashboard, Calendar, Users, Utensils, Power, Gamepad2, Ticket, Package, X, RefreshCw, Download, Trash2, User, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import { formatTime12h } from '../utils/timeUtils';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../config/api';
import { compressImage } from '../utils/imageUtils';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [bookings, setBookings] = useState([]);

    // Access global store
    const { setUser, user, dineItems, rideItems, setDineItems, setRideItems } = useStore();

    // Initialize products with cached data from store
    const [products, setProducts] = useState([...(rideItems || []), ...(dineItems || [])]);

    // E4 state


    const [sponsors, setSponsors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'dine', price: '', description: '', image: '', menuImages: [], status: 'open' });
    const [transactions, setTransactions] = useState([]);
    const [platformStats, setPlatformStats] = useState({ web: 0, mobile: 0 });
    const [dailySales, setDailySales] = useState({ today: { total: 0, count: 0, allOrdersCount: 0, orders: [] }, history: [] });
    const [poaData, setPoaData] = useState({ e3: null });
    const [poaError, setPoaError] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);
    // const [filterType, setFilterType] = useState('all'); // 'all', 'rides', 'events', 'other'
    const [filterType, setFilterType] = useState('all'); // 'all', 'rides', 'events'

    // Add cuisine to initial state if editing doesn't provide it
    const defaultForm = { name: '', category: 'dine', price: '', description: '', image: '', images: [], menuImages: [], status: 'open', cuisine: '', ageGroup: 'All', stall: '', isCombo: false, rideCount: '', contactNumber: '' };
    const navigate = useNavigate();
    // setUser is already destructured above


    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No authentication token found. Please login again.");
            // Don't auto-logout immediately to avoid loop if storage broken, but stop fetch
            setBookings([]);
            setTransactions([]);
            return;
        }
        const headers = { 'x-auth-token': token };
        try {
            console.log("Fetching admin data with token...");

            // 1. Fetch Products from E3 endpoints
            try {
                // If we have cached data, ensure it is set (though useState init handles this on mount)
                if (products.length === 0 && (rideItems?.length > 0 || dineItems?.length > 0)) {
                    setProducts([...(rideItems || []), ...(dineItems || [])]);
                }

                const [e3RidesRes, e3DineRes] = await Promise.all([
                    fetch(`${API_URL}/e3/rides`),
                    fetch(`${API_URL}/e3/dine`)
                ]);

                const allProducts = [];

                if (e3RidesRes.ok) {
                    const e3Rides = await e3RidesRes.json();
                    if (Array.isArray(e3Rides)) {
                        setRideItems(e3Rides); // Update global cache
                        allProducts.push(...e3Rides);
                    }
                }

                if (e3DineRes.ok) {
                    const e3Dine = await e3DineRes.json();
                    console.log("Fetched E3 Dine items:", e3Dine);
                    if (Array.isArray(e3Dine)) {
                        setDineItems(e3Dine); // Update global cache
                        allProducts.push(...e3Dine);
                    }
                }

                // Update local view with fresh data
                if (allProducts.length > 0) {
                    setProducts(allProducts);
                    console.log("Total Fetched Products (Rides + Dine):", allProducts.length);
                }
            } catch (productsErr) {
                console.error("E3 Products fetch failed", productsErr);
                // Do NOT clear products on error, keep cached version
            }


            // 2. Fetch Bookings (Safely)
            try {
                const bookingsRes = await fetch(`${API_URL}/bookings`, { headers });
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    console.log("Bookings data:", bookingsData);
                    if (Array.isArray(bookingsData)) setBookings(bookingsData);
                } else {
                    console.error("Bookings fetch failed with status:", bookingsRes.status);
                    // If 404/500, we might get JSON error, treat as empty
                    setBookings([]);
                }
            } catch (bookingErr) {
                console.error("Bookings network error:", bookingErr);
                setBookings([]);
            }

            // 3. Fetch Transactions
            const transactionsRes = await fetch(`${API_URL}/orders/all`, { headers });
            if (transactionsRes.ok) {
                const transactionsData = await transactionsRes.json();
                setTransactions(transactionsData);
            }

            // 3b. Fetch Daily Sales
            try {
                const dailyRes = await fetch(`${API_URL}/orders/daily`, { headers });
                if (dailyRes.ok) {
                    const dailyData = await dailyRes.json();
                    setDailySales(dailyData);
                }
            } catch (dailyErr) {
                console.error('Daily sales fetch error:', dailyErr);
            }

            // 4. Fetch Sponsors
            const sponsorsRes = await fetch(`${API_URL}/sponsors`);
            if (sponsorsRes.ok) {
                const sponsorsData = await sponsorsRes.json();
                setSponsors(sponsorsData);
            }

            // 5. Fetch E3 Platform Analytics
            try {
                const statsRes = await fetch(`${API_URL}/analytics/e3/stats`, { headers });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setPlatformStats(statsData);
                }
            } catch (statsErr) {
                console.error("E3 Analytics fetch error:", statsErr);
            }

            // 6. Fetch POA data (E3 only)
            try {
                const poaE3Res = await fetch(`${API_URL}/poa/e3`, { headers: { 'Authorization': `Bearer ${token}` } });
                const e3 = poaE3Res.ok ? await poaE3Res.json() : null;
                setPoaData({ e3 });
            } catch (poaErr) {
                setPoaError('Could not load POA data');
                console.error('POA fetch error:', poaErr);
            }

        } catch (err) {
            console.error('Global Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        const defaultCategory = activeTab === 'rides' ? 'play' : 'dine';
        setFormData(item ? { menuImages: [], status: 'open', cuisine: item.cuisine || '', ageGroup: item.ageGroup || 'All', stall: item.stall || '', isCombo: item.isCombo || false, rideCount: item.rideCount || '', images: item.images || [], contactNumber: item.contactNumber || '', ...item } : { ...defaultForm, category: defaultCategory });
        setShowModal(true);
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        const token = localStorage.getItem('token');

        // Find the item to determine its category
        const item = products.find(p => p._id === id);
        if (!item) {
            alert('Item not found');
            return;
        }

        // Determine the correct endpoint based on category
        let endpoint = '';
        if (item.category === 'play') {
            endpoint = `/e3/rides/${id}`;
        } else if (item.category === 'dine') {
            endpoint = `/e3/dine/${id}`;
        } else {
            alert('Unknown item category');
            return;
        }

        try {
            console.log('Token used for delete:', token);
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
                alert('Item deleted successfully');
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to delete item');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert(`Error deleting item: ${err.message}`);
        }
    };

    const handleToggleRideStatus = async (ride) => {
        const token = localStorage.getItem('token');
        const newStatus = (ride.status === 'closed' || ride.status === 'off') ? 'on' : 'off';

        try {
            const res = await fetch(`${API_URL}/e3/rides/${ride._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    ...ride,
                    status: newStatus
                })
            });

            if (res.ok) {
                const updatedRide = await res.json();
                setProducts(products.map(p => p._id === ride._id ? updatedRide : p));
                setRideItems(rideItems.map(r => r._id === ride._id ? updatedRide : r));
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Toggle E3 ride status error:', err);
            alert(`Error updating ride status: ${err.message}`);
        }
    };

    const handleToggleE4RideStatus = async (ride) => {
        const token = localStorage.getItem('token');
        const newStatus = (ride.status === 'closed' || ride.status === 'off') ? 'on' : 'off';

        try {
            const res = await fetch(`${API_URL}/e4/rides/${ride._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    ...ride,
                    status: newStatus
                })
            });

            if (res.ok) {
                const updatedRide = await res.json();
                setE4Products(e4Products.map(p => p._id === ride._id ? updatedRide : p));
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Toggle E4 ride status error:', err);
            alert(`Error updating E4 ride status: ${err.message}`);
        }
    };

    const handleDownloadReceipt = (booking) => {
        const doc = new jsPDF();

        // Company Header
        doc.setFontSize(22);
        doc.setTextColor(255, 107, 107); // Sunset Orange
        doc.text('Jaan Entertainment Pvt Ltd', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('123 Adventure Lane, Fun City, India', 105, 26, { align: 'center' });
        doc.text('support@jaanentertainment.in | +91 98765 43210', 105, 31, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Receipt Title
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Event Booking Receipt', 105, 45, { align: 'center' });

        // Customer Details
        doc.setFontSize(12);
        doc.text('Customer Details:', 20, 60);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(`Name: ${booking.name || 'Valued Customer'}`, 25, 68);
        doc.text(`Email: ${booking.email || 'N/A'}`, 25, 74);
        doc.text(`Mobile: ${booking.mobile || 'N/A'}`, 25, 80);

        // Booking Details
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Booking Information:', 110, 60);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(`Event: ${booking.facility}`, 115, 68);
        doc.text(`Booking ID: #${(booking.bookingId || '').slice(-6).toUpperCase()}`, 115, 74);
        doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`, 115, 80);

        // Time (already formatted string usually, but format if needed)
        // If booking.time is "start - end" string, use it directly.
        // Or re-format if backend sends raw times? Backend sends formatted string "h:mm A - h:mm A".
        // But AdminDashboard displays formatTime12h(booking.time).
        // If booking.time is ALREADY formatted "2:30 PM - 3:30 PM", then formatTime12h() returns it AS IS.
        // So safe to assume booking.time is display ready or needs simple formatting check.
        // Time (already formatted string)
        const timeStr = booking.time;
        doc.text(`Time Slot: ${timeStr}`, 115, 86);

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 95, 170, 10, 'F');
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.font = 'helvetica';
        doc.setFont(undefined, 'bold');
        doc.text('Description', 25, 101);
        doc.text('Guests', 130, 101);
        doc.text('Price', 160, 101);

        // Table Content
        doc.setFont(undefined, 'normal');
        doc.text(`${booking.facility}`, 25, 112);
        doc.text(`${booking.quantity || 1}`, 130, 112);
        doc.text(`Rs. ${booking.price}`, 160, 112);

        // Total
        doc.line(20, 120, 190, 120);
        doc.setFont(undefined, 'bold');
        doc.text('Total Amount:', 130, 128);
        doc.text(`Rs. ${booking.price}`, 160, 128);

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Thank you for choosing Jaan Entertainment!', 105, 145, { align: 'center' });
        doc.text('Please present this receipt at the venue entry.', 105, 150, { align: 'center' });

        doc.save(`Receipt_${(booking.facility || 'Event').replace(/\s+/g, '_')}_${(booking.bookingId || 'ID').slice(-4)}.pdf`);
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Determine endpoint based on category
        let endpoint = '';
        if (formData.category === 'play') endpoint = '/e3/rides';
        else if (formData.category === 'dine') endpoint = '/e3/dine';
        else endpoint = '/e3/rides'; // Default fallback, though should be strict

        const url = editingItem
            ? `${API_URL}${endpoint}/${editingItem._id}` // Note: Backend update routes might not exist yet, but assuming standard REST
            : `${API_URL}${endpoint}`;

        // Backend currently only has POST for Create. PUT/Update might be missing or different.
        // For now, let's focus on CREATE which is what the user asked for.

        const method = editingItem ? 'PUT' : 'POST';

        // Transform payload to match Schema
        const payload = {
            name: formData.name,
            price: Number(formData.price),
            image: formData.image,
            status: formData.status === 'open' ? 'on' : 'off', // Frontend 'open/closed' -> Backend 'on/off'
        };

        if (formData.category === 'play') {
            payload.category = 'play';
            payload.desc = formData.description;
            // Map "Ride Category" to 'type'
            payload.type = formData.stall || 'Ride';
            payload.ageGroup = formData.ageGroup || 'All';
            if (formData.isCombo) {
                payload.isCombo = true;
                payload.rideCount = Number(formData.rideCount);
                payload.type = 'Combo'; // Force type for combos
                payload.images = formData.images || []; // Send multiple images
            }
        } else {
            payload.category = 'dine';
            payload.cuisine = formData.cuisine || 'General';
            // Treat the Name input as the Stall Name for Dine items
            payload.stall = formData.name;
            payload.open = formData.status === 'open';
            payload.menuImages = formData.menuImages || [];
            payload.contactNumber = formData.contactNumber || '';
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save');
            }

            const savedItem = await res.json();
            if (editingItem) {
                setProducts(products.map(p => p._id === savedItem._id ? savedItem : p));
            } else {
                setProducts([...products, savedItem]);
            }
            setShowModal(false);
            // Refresh data to be sure
            fetchData();
        } catch (err) {
            console.error(err);
            alert(`Error saving item: ${err.message}`);
        }
    };

    // Sponsor Handlers
    const handleDeleteSponsor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/sponsors/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setSponsors(sponsors.filter(s => s._id !== id));
        } catch (err) {
            alert('Error deleting sponsor');
        }
    };

    const handleSaveSponsor = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/sponsors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    name: formData.name,
                    image: formData.image,
                    website: formData.description, // Mapping description to website
                    tier: formData.category // Mapping category to tier
                })
            });

            if (res.ok) {
                const newSponsor = await res.json();
                setSponsors([...sponsors, newSponsor]);
                setShowModal(false);
            } else {
                alert('Failed to save sponsor');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving sponsor');
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/bookings/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                // Remove from state
                setBookings(bookings.filter(b => b.id !== id));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete booking');
            }
        } catch (err) {
            console.error('Error deleting booking:', err);
            alert('Error deleting booking');
        }
    };

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
        { id: 'poa', label: 'POA', icon: Package },
        { id: 'dine', label: 'Dine', icon: Utensils },
        { id: 'rides', label: 'E3 Rides', icon: Gamepad2 },
        { id: 'bookings', label: 'Event Bookings', icon: Calendar },
    ];

    const getVisibleProducts = () => {
        if (activeTab === 'rides') {
            return products
                .filter(p => p.category === 'play')
                .sort((a, b) => (b.isCombo ? 1 : 0) - (a.isCombo ? 1 : 0));
        }
        if (activeTab === 'dine') return products.filter(p => p.category === 'dine' || !p.category);
        return [];
    };

    const visibleProducts = getVisibleProducts();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r h-[calc(100vh-80px)] fixed left-0">
                <div className="p-6">
                    <h2 className="text-xl font-heading font-bold text-charcoal-grey">Admin Panel</h2>
                </div>
                <nav className="mt-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-6 py-4 transition-colors ${activeTab === tab.id
                                ? 'bg-riverside-teal/10 text-riverside-teal border-r-4 border-riverside-teal'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Profile + Logout — pinned to sidebar bottom */}
                <div className="absolute bottom-0 left-0 w-64 border-t border-gray-100 bg-white">
                    {/* User info */}
                    <div className="flex items-center gap-3 px-5 py-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-riverside-teal to-teal-700 flex items-center justify-center text-white font-black text-sm shrink-0">
                            {user?.name
                                ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                : (user?.mobile?.slice(-2) || 'A')}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-charcoal-grey truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[11px] text-gray-400 truncate">+91 {user?.mobile || ''}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 pb-4 flex flex-col gap-1">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <User size={16} className="text-gray-400" />
                            My Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-charcoal-grey">
                                {tabs.find(t => t.id === activeTab).label}
                            </h1>
                            <p className="text-gray-500 mt-2">Manage your Jaan Entertainment operations seamlessly.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-red-500 hover:text-red-600 font-medium"
                        >
                            <Power className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </header>



                    {/* ── POA Tab ─────────────────────────────────────────── */}
                    {activeTab === 'poa' && (() => {
                        const statusBadge = (s) => {
                            const map = {
                                running: 'bg-green-100 text-green-700',
                                open: 'bg-green-100 text-green-700',
                                maintenance: 'bg-amber-100 text-amber-700',
                                offline: 'bg-red-100 text-red-600',
                                closed: 'bg-red-100 text-red-600',
                                completed: 'bg-green-100 text-green-700',
                                pending: 'bg-amber-100 text-amber-700',
                                failed: 'bg-red-100 text-red-600',
                            };
                            return (
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${map[s] || 'bg-gray-100 text-gray-500'}`}>
                                    {s}
                                </span>
                            );
                        };

                        const alertIcon = (type) => {
                            if (type === 'warning') return '⚠️';
                            if (type === 'success') return '✅';
                            return 'ℹ️';
                        };
                        const alertBg = (type) => {
                            if (type === 'warning') return 'bg-amber-50 border-amber-200 text-amber-800';
                            if (type === 'success') return 'bg-green-50 border-green-200 text-green-800';
                            return 'bg-blue-50 border-blue-200 text-blue-800';
                        };

                        const Panel = ({ data, color }) => {
                            if (!data) return (
                                <div className="flex-1 bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium">
                                    Loading {color} data…
                                </div>
                            );
                            const currency = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

                            return (
                                <div className="flex-1 min-w-0 space-y-5">
                                    {/* Location header */}
                                    <div className={`rounded-2xl p-5 text-white ${color === 'E3' ? 'bg-gradient-to-r from-riverside-teal to-teal-600' : 'bg-gradient-to-r from-sunset-orange to-orange-600'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-black">{data.location}</h3>
                                                <p className="text-white/70 text-xs mt-0.5">Updated {new Date(data.lastUpdated).toLocaleTimeString()}</p>
                                            </div>
                                            <span className="text-3xl font-black">{currency(data.summary.totalRevenue)}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            {[
                                                { label: 'Orders', value: data.summary.totalOrders },
                                                { label: 'Visitors', value: data.summary.totalVisitors },
                                                { label: 'Avg Order', value: currency(data.summary.avgOrderValue) },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-white/10 rounded-xl p-2">
                                                    <div className="text-lg font-black">{value}</div>
                                                    <div className="text-[10px] text-white/70 uppercase tracking-wider">{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Alerts */}
                                    {data.alerts.length > 0 && (
                                        <div className="space-y-2">
                                            {data.alerts.map((a, i) => (
                                                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${alertBg(a.type)}`}>
                                                    <span>{alertIcon(a.type)}</span>
                                                    {a.message}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Recent Orders */}
                                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center">
                                            <h4 className="font-bold text-sm text-charcoal-grey">Recent Orders</h4>
                                            <span className="text-xs text-gray-400">{data.recentOrders.length} shown</span>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {data.recentOrders.map((o) => (
                                                <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-bold text-xs text-charcoal-grey truncate">{o.customer}</span>
                                                            <span className="text-[10px] text-gray-400 shrink-0">{o.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 truncate">{o.items.join(', ')}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="font-black text-sm text-charcoal-grey">{currency(o.amount)}</div>
                                                        <div className="mt-0.5">{statusBadge(o.status)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rides Status */}
                                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-50">
                                            <h4 className="font-bold text-sm text-charcoal-grey">
                                                Rides — <span className="text-green-600">{data.summary.activeRides} active</span>
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-px bg-gray-50">
                                            {data.rideStatus.map((r) => (
                                                <div key={r.name} className="bg-white px-4 py-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-xs text-charcoal-grey truncate">{r.name}</span>
                                                        {statusBadge(r.status)}
                                                    </div>
                                                    {r.waitTime !== '-' && (
                                                        <p className="text-[10px] text-gray-400">Wait: {r.waitTime} · Cap: {r.capacity}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stall Revenue */}
                                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center">
                                            <h4 className="font-bold text-sm text-charcoal-grey">
                                                Stalls — <span className="text-green-600">{data.summary.openStalls} open</span>
                                            </h4>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {data.stallStatus.map((s) => (
                                                <div key={s.name} className="px-5 py-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-xs text-charcoal-grey">{s.name}</p>
                                                        <p className="text-[10px] text-gray-400">{s.orders} orders</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-sm text-charcoal-grey">{currency(s.revenue)}</span>
                                                        {statusBadge(s.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <div>
                                {poaError && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                                        ⚠️ {poaError}
                                    </div>
                                )}
                                <div className="flex gap-6 items-start">
                                    <Panel data={poaData.e3} color="E3" />
                                </div>
                            </div>
                        );
                    })()}

                    {activeTab === 'bookings' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={fetchData}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-riverside-teal font-bold transition-colors bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm"
                                >
                                    <RefreshCw size={16} />
                                    Refresh List
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white p-6 rounded-xl border shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-riverside-teal/10 text-riverside-teal rounded-full text-xs font-bold font-heading">
                                                {booking.facility}
                                            </span>
                                            <span className="text-gray-400 text-sm">#{booking.bookingId || booking.id}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-charcoal-grey">{booking.name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{booking.date} • {booking.time}</p>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleDownloadReceipt(booking)}
                                                className="flex-1 bg-riverside-teal/10 text-riverside-teal py-2 rounded-lg text-sm font-bold hover:bg-riverside-teal hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Receipt
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                className="bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete Booking"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'dine' && (
                        <div>
                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={() => handleEditItem(null)} // Open modal for new item
                                    className="bg-riverside-teal text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center"
                                >
                                    <Utensils className="w-5 h-5 mr-2" />
                                    Add New Item
                                </button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {visibleProducts.map((item) => (
                                    <div key={item._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative hover:shadow-md transition-all">
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />


                                        </div>

                                        <div className="p-4">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-charcoal-grey truncate">{item.stall || item.name}</h3>
                                                {item.contactNumber && (
                                                    <p className="text-charcoal-grey text-xs font-bold mt-1 font-mono">
                                                        📞 {item.contactNumber}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-charcoal-grey hover:bg-riverside-teal hover:text-white transition-colors border border-gray-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rides' && (
                        <div>
                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={() => handleEditItem(null)}
                                    className="bg-riverside-teal text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center"
                                >
                                    <Package className="w-5 h-5 mr-2" />
                                    Add New Ride
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingItem(null);
                                        setFormData({ ...defaultForm, category: 'play', isCombo: true });
                                        setShowModal(true);
                                    }}
                                    className="ml-4 bg-sunset-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center"
                                >
                                    <Package className="w-5 h-5 mr-2" />
                                    Add Combo
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {visibleProducts.map((ride) => (
                                    <div key={ride._id} className="bg-white backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group flex flex-col aspect-square w-full shadow-sm relative">
                                        <div className="h-[65%] overflow-hidden relative">
                                            <img
                                                src={ride.image}
                                                alt={ride.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-sunset-orange border border-sunset-orange/50 shadow-lg">
                                                ₹{ride.price}
                                            </div>
                                            {(ride.status === 'closed' || ride.status === 'off') && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                    <p className="text-white font-bold bg-red-500/80 px-4 py-2 rounded-lg text-sm border border-red-400">CLOSED</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2 flex flex-col h-[35%] justify-between bg-charcoal-grey">
                                            <div className="flex flex-col items-center justify-center flex-grow">
                                                <h3 className="text-white font-bold text-xs leading-tight text-center line-clamp-2">{ride.name}</h3>
                                                {ride.isCombo && (
                                                    <div className="mt-1 px-2 py-0.5 bg-sunset-orange/90 border-2 border-white/80 rounded-md shadow-lg">
                                                        <p className="text-[9px] text-white font-black text-center whitespace-nowrap uppercase tracking-wide">
                                                            Any {ride.rideCount || 5} Rides
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ON/OFF Toggle + Actions */}
                                            <div className="flex flex-col gap-1 mt-1">
                                                {/* Status Toggle Row */}
                                                <button
                                                    onClick={() => handleToggleRideStatus(ride)}
                                                    title={ride.status === 'off' || ride.status === 'closed' ? 'Turn Ride ON' : 'Turn Ride OFF'}
                                                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-black transition-all border ${ride.status === 'off' || ride.status === 'closed'
                                                        ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                                                        : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                                                        }`}
                                                >
                                                    <span className="uppercase tracking-widest">
                                                        {ride.status === 'off' || ride.status === 'closed' ? 'OFF' : 'ON'}
                                                    </span>
                                                    {/* Visual pill toggle */}
                                                    <span className={`relative inline-flex w-7 h-3.5 rounded-full transition-colors ${ride.status === 'off' || ride.status === 'closed' ? 'bg-red-500/40' : 'bg-green-500/60'
                                                        }`}>
                                                        <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full shadow transition-all ${ride.status === 'off' || ride.status === 'closed'
                                                            ? 'left-0.5 bg-red-400'
                                                            : 'left-4 bg-green-400'
                                                            }`} />
                                                    </span>
                                                </button>

                                                {/* Edit / Delete Row */}
                                                <div className="grid grid-cols-2 gap-1">
                                                    <button
                                                        onClick={() => handleEditItem(ride)}
                                                        className="bg-riverside-teal/20 hover:bg-riverside-teal/30 text-riverside-teal py-1 rounded-md text-[10px] font-bold transition-colors border border-riverside-teal/50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(ride._id)}
                                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1 rounded-md text-[10px] font-bold transition-colors border border-red-500/50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {activeTab === 'analytics' && (() => {
                        const filteredTransactions = transactions.filter(tx => {
                            const status = (tx.status || '').toLowerCase();
                            const paymentStatus = (tx.paymentStatus || '').toLowerCase();
                            const isPaid = paymentStatus === 'paid' || paymentStatus === 'success' || paymentStatus === 'completed' || status === 'confirmed' || status === 'success' || status === 'completed';

                            if (!isPaid) return false;

                            // Filter Logic
                            if (filterType === 'all') return true;

                            const hasEvent = tx.items && tx.items.some(i => (i.stall === 'Events' || (i.id && i.id.toString().startsWith('event-'))));
                            const hasRide = tx.items && tx.items.some(i => (i.type === 'ride' || (i.id && i.id.toString().startsWith('ride-')) || (i.id && i.id.toString().startsWith('play-'))));

                            if (filterType === 'events') return hasEvent;
                            if (filterType === 'rides') return hasRide && !hasEvent; // Prioritize event if mixed? Or show in both? Let's say strictly rides here.
                            // if (filterType === 'other') return !hasEvent && !hasRide;

                            return true;
                        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                        const totalAmount = filteredTransactions.reduce((acc, tx) => acc + (Number(tx.totalAmount) || Number(tx.amount) || 0), 0);

                        // Platform Stats Calculation (If API fails, fallback to rudimentary calculation from logs/DB if needed, but we rely on API)
                        const totalUsers = platformStats.total || (platformStats.web + platformStats.mobile) || 1;
                        const webPercent = Math.round(((platformStats.web || 0) / totalUsers) * 100) || 0;
                        const mobilePercent = Math.round(((platformStats.mobile || 0) / totalUsers) * 100) || 0;

                        const generatePDF = () => {
                            try {
                                const doc = new jsPDF();
                                doc.setFontSize(18);
                                doc.text('Jaan Entertainment - Transaction Report', 14, 22);
                                doc.setFontSize(11);
                                doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

                                const grouped = filteredTransactions.reduce((groups, tx) => {
                                    const date = new Date(tx.createdAt).toLocaleDateString();
                                    if (!groups[date]) groups[date] = [];
                                    groups[date].push(tx);
                                    return groups;
                                }, {});

                                let yPos = 40;
                                Object.keys(grouped).forEach(date => {
                                    const dateTrans = grouped[date];
                                    const dayTotal = dateTrans.reduce((sum, tx) => sum + (tx.totalAmount || tx.amount || 0), 0);

                                    if (yPos > 250) { doc.addPage(); yPos = 20; }
                                    doc.setFontSize(14);
                                    doc.setTextColor(0, 128, 128);
                                    doc.text(`${date} - Total: Rs. ${dayTotal}`, 14, yPos);
                                    yPos += 10;

                                    const tableData = dateTrans.map(tx => [
                                        `#${tx._id.slice(-6).toUpperCase()}`,
                                        new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                                        tx.items ? tx.items.map(i => `${i.quantity}x ${i.name}`).join(', ').substring(0, 50) + (tx.items.length > 2 ? '...' : '') : 'N/A',
                                        `Rs. ${tx.totalAmount || tx.amount}`
                                    ]);

                                    autoTable(doc, {
                                        startY: yPos,
                                        head: [['Order ID', 'Time', 'Items', 'Amount']],
                                        body: tableData,
                                        theme: 'grid',
                                        headStyles: { fillColor: [41, 128, 185] },
                                        styles: { fontSize: 8 },
                                        margin: { left: 14, right: 14 }
                                    });
                                    yPos = doc.lastAutoTable.finalY + 15;
                                });

                                doc.setFontSize(16);
                                doc.setTextColor(255, 69, 0);
                                doc.text(`Grand Total Revenue: Rs. ${totalAmount}`, 14, yPos);
                                doc.save('jaan_entertainment_transactions.pdf');
                            } catch (err) {
                                console.error("PDF Generation Error:", err);
                                alert("Failed to generate PDF.");
                            }
                        };

                        return (
                            <>
                                {/* ══════════════════════════════════════ */}
                                {/* ── Daily Sales Section ── */}
                                {/* ══════════════════════════════════════ */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-bold font-heading text-charcoal-grey">📅 Daily Sales</h2>
                                            <p className="text-xs text-gray-400 mt-0.5">Today's performance &amp; 14-day history</p>
                                        </div>
                                        <button
                                            onClick={fetchData}
                                            className="flex items-center gap-2 text-xs text-gray-500 hover:text-riverside-teal font-bold transition-colors bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm"
                                        >
                                            <RefreshCw size={13} /> Refresh
                                        </button>
                                    </div>

                                    {/* Today Hero Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                        {/* Today Revenue */}
                                        <div className="md:col-span-1 bg-gradient-to-br from-riverside-teal to-teal-600 rounded-2xl p-6 text-white shadow-md">
                                            <p className="text-xs uppercase tracking-widest font-bold opacity-75">Today's Revenue</p>
                                            <p className="text-4xl font-black mt-1">₹{(dailySales.today?.total || 0).toLocaleString('en-IN')}</p>
                                            <div className="flex gap-4 mt-3 text-sm font-bold opacity-90">
                                                <span>✅ {dailySales.today?.count || 0} paid</span>
                                                <span>📋 {dailySales.today?.allOrdersCount || 0} total orders</span>
                                            </div>
                                            <p className="text-xs mt-2 opacity-60">
                                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>

                                        {/* 14-Day Bar Chart */}
                                        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-3">Last 14 Days</p>
                                            {(() => {
                                                const hist = dailySales.history || [];
                                                const maxVal = Math.max(...hist.map(d => d.total), 1);
                                                return (
                                                    <div className="flex items-end gap-1 h-24">
                                                        {hist.map((day, i) => {
                                                            const isToday = day.date === new Date().toLocaleDateString('en-CA');
                                                            const heightPct = Math.max((day.total / maxVal) * 100, day.total > 0 ? 8 : 2);
                                                            const label = new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                                            return (
                                                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                                    {/* Tooltip */}
                                                                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                                                                        <div className="bg-charcoal-grey text-white text-[10px] font-bold rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                                                                            ₹{day.total.toLocaleString('en-IN')}<br />{day.count} orders
                                                                        </div>
                                                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-charcoal-grey" />
                                                                    </div>
                                                                    <div
                                                                        className={`w-full rounded-t-sm transition-all ${isToday
                                                                            ? 'bg-riverside-teal'
                                                                            : day.total > 0
                                                                                ? 'bg-sunset-orange/70 group-hover:bg-sunset-orange'
                                                                                : 'bg-gray-100'
                                                                            }`}
                                                                        style={{ height: `${heightPct}%` }}
                                                                    />
                                                                    <p className={`text-[8px] font-bold rotate-0 leading-none ${isToday ? 'text-riverside-teal' : 'text-gray-400'
                                                                        }`}>
                                                                        {isToday ? 'Today' : label.split(' ')[0]}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                            <div className="flex justify-between text-[9px] text-gray-300 mt-2 font-bold">
                                                <span>{dailySales.history?.[0]?.date ? new Date(dailySales.history[0].date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}</span>
                                                <span>Today</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Today's Orders Table */}
                                    {(dailySales.today?.orders?.length > 0) && (
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-charcoal-grey">Today's Orders</h3>
                                                <span className="text-xs text-gray-400">{dailySales.today.orders.length} orders</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="border-b border-gray-100">
                                                        <tr>
                                                            <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                                                            <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                                                            <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                                                            <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                                            <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {dailySales.today.orders.map((o) => {
                                                            const s = (o.status || '').toLowerCase();
                                                            const isPaidOrder = s === 'confirmed' || s === 'success' || s === 'completed' || s === 'placed';
                                                            return (
                                                                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-5 py-3 text-xs font-mono text-gray-900 font-medium">#{(o._id || '').slice(-6).toUpperCase()}</td>
                                                                    <td className="px-5 py-3 text-xs text-gray-500">
                                                                        {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                    </td>
                                                                    <td className="px-5 py-3 text-xs text-gray-700">
                                                                        {o.items ? o.items.map(i => `${i.quantity || 1}x ${i.name}`).join(', ').substring(0, 50) : 'N/A'}
                                                                    </td>
                                                                    <td className="px-5 py-3 text-xs font-bold text-riverside-teal">₹{o.amount || o.totalAmount || 0}</td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${isPaidOrder
                                                                            ? 'bg-green-50 text-green-600 border-green-200'
                                                                            : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                                                            }`}>
                                                                            {o.status || 'pending'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {(dailySales.today?.orders?.length === 0) && (
                                        <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                                            <p className="font-bold text-sm">No orders yet today</p>
                                            <p className="text-xs mt-1">Orders will appear here as they come in</p>
                                        </div>
                                    )}
                                </div>

                                {/* ── E3 Summary Stat Cards ── */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {/* Total Rides */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-sunset-orange/10 flex items-center justify-center flex-shrink-0">
                                            <Gamepad2 className="w-6 h-6 text-sunset-orange" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Rides</p>
                                            <p className="text-2xl font-bold text-charcoal-grey">{products.filter(p => p.category === 'play').length}</p>
                                        </div>
                                    </div>
                                    {/* Active Rides */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                            <Power className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Rides Active</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {products.filter(p => p.category === 'play' && p.status !== 'off' && p.status !== 'closed').length}
                                                <span className="text-sm text-gray-400 font-normal ml-1">/ {products.filter(p => p.category === 'play').length}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {/* Active Dine Items */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-riverside-teal/10 flex items-center justify-center flex-shrink-0">
                                            <Utensils className="w-6 h-6 text-riverside-teal" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Dine Items</p>
                                            <p className="text-2xl font-bold text-charcoal-grey">{products.filter(p => p.category === 'dine' || !p.category).length}</p>
                                        </div>
                                    </div>
                                    {/* Total Revenue */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <Ticket className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">E3 Revenue</p>
                                            <p className="text-2xl font-bold text-charcoal-grey">₹{totalAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Platform Stats from /analytics/e3/stats ── */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-base font-bold font-heading text-charcoal-grey">E3 Platform Usage</h3>
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">via /analytics/e3/stats</span>
                                        </div>
                                        <div className="flex items-center justify-around mb-5">
                                            <div className="text-center">
                                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                                                    <LayoutDashboard className="w-7 h-7 text-blue-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-charcoal-grey">{platformStats.web || 0}</p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Web</p>
                                            </div>
                                            <div className="h-12 w-px bg-gray-200" />
                                            <div className="text-center">
                                                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2">
                                                    <Users className="w-7 h-7 text-purple-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-charcoal-grey">{platformStats.mobile || 0}</p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Mobile</p>
                                            </div>
                                            <div className="h-12 w-px bg-gray-200" />
                                            <div className="text-center">
                                                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                                                    <LayoutDashboard className="w-7 h-7 text-gray-400" />
                                                </div>
                                                <p className="text-2xl font-bold text-charcoal-grey">{platformStats.total || 0}</p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Total</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                                            <div className="bg-blue-500 h-full transition-all" style={{ width: `${webPercent}%` }} />
                                            <div className="bg-purple-500 h-full transition-all" style={{ width: `${mobilePercent}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                            <span>🌐 Web: {webPercent}%</span>
                                            <span>📱 Mobile: {mobilePercent}%</span>
                                        </div>
                                    </div>

                                    {/* Ride Status Breakdown */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="text-base font-bold font-heading text-charcoal-grey mb-4">Ride Status</h3>
                                        {(() => {
                                            const allRides = products.filter(p => p.category === 'play');
                                            const onCount = allRides.filter(r => r.status !== 'off' && r.status !== 'closed').length;
                                            const offCount = allRides.length - onCount;
                                            const onPct = allRides.length ? Math.round((onCount / allRides.length) * 100) : 0;
                                            return (
                                                <>
                                                    <div className="flex flex-col gap-3">
                                                        <div>
                                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                                <span className="text-green-600">🟢 Online ({onCount})</span>
                                                                <span>{onPct}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                                <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${onPct}%` }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                                <span className="text-red-500">🔴 Offline ({offCount})</span>
                                                                <span>{100 - onPct}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                                <div className="bg-red-400 h-2.5 rounded-full transition-all" style={{ width: `${100 - onPct}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-4 text-center">{allRides.length} E3 rides total</p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* ── Transactions Table ── */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-lg font-bold font-heading text-charcoal-grey">Ride &amp; Event Bookings</h2>
                                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                                {['all', 'rides', 'events'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => { setFilterType(type); setVisibleCount(10); }}
                                                        className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-colors ${filterType === type ? 'bg-riverside-teal text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Total Revenue</p>
                                                <p className="text-xl font-bold text-riverside-teal">₹{totalAmount}</p>
                                            </div>
                                            <button onClick={generatePDF} className="bg-charcoal-grey text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90 transition-colors text-xs uppercase tracking-wide">
                                                <Download size={16} /> Export PDF
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Order ID</th>
                                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Items</th>
                                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredTransactions.slice(0, visibleCount).map((tx) => (
                                                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">#{tx._id.slice(-6).toUpperCase()}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {tx.items ? tx.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'No items'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-riverside-teal">₹{tx.totalAmount || tx.amount}</td>
                                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-green-50 text-green-600 border-green-200">Confirmed</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {visibleCount < filteredTransactions.length && (
                                        <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50">
                                            <button
                                                onClick={() => setVisibleCount(prev => prev + 10)}
                                                className="text-sm font-bold text-riverside-teal hover:text-charcoal-grey transition-colors flex items-center gap-2"
                                            >
                                                View More <span className="text-xs">({filteredTransactions.length - visibleCount} remaining)</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}



                    {/* Sponsors Section */}
                    {
                        activeTab === 'sponsors' && (
                            <div>
                                <div className="mb-6 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setEditingItem(null);
                                            setFormData({ name: '', category: 'Partner', price: '', description: '', image: '', menuImages: [], status: 'open' });
                                            setShowModal(true);
                                        }}
                                        className="bg-riverside-teal text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center"
                                    >
                                        <Users className="w-5 h-5 mr-2" />
                                        Add New Sponsor
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {sponsors.map((sponsor) => (
                                        <div key={sponsor._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative">
                                            <div className="h-32 p-4 flex items-center justify-center bg-gray-50">
                                                <img src={sponsor.image} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-charcoal-grey">{sponsor.name}</h3>
                                                <p className="text-xs text-gray-500 mb-2">{sponsor.tier || 'Partner'}</p>
                                                <button
                                                    onClick={() => handleDeleteSponsor(sponsor._id)}
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }



                    {/* Inventory/Sponsor Modal */}
                    {
                        showModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-8 max-w-md w-full">
                                    <h3 className="text-xl font-bold mb-6">{editingItem ? 'Edit Item' : (formData.isCombo ? 'Add New Combo' : 'Add New Item')}</h3>
                                    <form onSubmit={activeTab === 'sponsors' ? handleSaveSponsor : handleSaveItem} className="space-y-4">
                                        <input
                                            placeholder={activeTab === 'sponsors' ? "Sponsor Name" : (formData.isCombo ? "Combo Name (e.g. Super Saver)" : (formData.category === 'dine' ? "Stall Name" : "Item Name"))}
                                            className="w-full border p-2 rounded"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />

                                        {formData.isCombo && (
                                            <input
                                                type="number"
                                                placeholder="How many rides? (e.g. 5)"
                                                className="w-full border p-2 rounded"
                                                value={formData.rideCount}
                                                onChange={e => setFormData({ ...formData, rideCount: e.target.value })}
                                                required
                                            />
                                        )}

                                        {activeTab === 'sponsors' ? (
                                            <>
                                                <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                    <option value="Partner">Partner</option>
                                                    <option value="Gold">Gold</option>
                                                    <option value="Silver">Silver</option>
                                                </select>
                                                <input placeholder="Website URL (Optional)" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                            </>
                                        ) : (
                                            <>
                                                {!formData.isCombo && (
                                                    <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                        <option value="dine">Dine (Food)</option>
                                                        <option value="play">Play (Rides)</option>
                                                        <option value="events">Event</option>
                                                    </select>
                                                )}
                                                {formData.category === 'dine' && (
                                                    <input
                                                        type="text"
                                                        placeholder="Contact Number"
                                                        className="w-full border p-2 rounded"
                                                        value={formData.contactNumber || ''}
                                                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                                    />
                                                )}
                                                {formData.category !== 'dine' && (
                                                    <input
                                                        type="number"
                                                        placeholder="Price (₹)"
                                                        className="w-full border p-2 rounded"
                                                        value={formData.price}
                                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                        required
                                                    />
                                                )}
                                                {formData.category === 'play' && !formData.isCombo && (
                                                    <>
                                                        <select
                                                            className="w-full border p-2 rounded"
                                                            value={formData.ageGroup || 'All'}
                                                            onChange={e => setFormData({ ...formData, ageGroup: e.target.value })}
                                                        >
                                                            <option value="All">All Ages</option>
                                                            <option value="Kids">Kids</option>
                                                            <option value="Toddlers">Toddlers</option>
                                                            <option value="Youth">Youth</option>
                                                            <option value="Family">Family</option>
                                                            <option value="7+ years">7+ years</option>
                                                            <option value="10+">10+</option>
                                                        </select>

                                                    </>
                                                )}
                                                {formData.category !== 'dine' && (
                                                    <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                                )}
                                            </>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <input placeholder="Image URL (Main Cover)" className="w-full border p-2 rounded" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                                            {/* Image Upload Logic Placeholder - Kept simple for now for stability */}
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded p-2 text-center text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                                                    <span>Upload Main Cover (Auto-compressed)</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            try {
                                                                const compressed = await compressImage(file, 800, 0.7);
                                                                setFormData({ ...formData, image: compressed });
                                                            } catch (err) {
                                                                console.error("Image compression failed:", err);
                                                                alert("Failed to process image. Please try another.");
                                                            }
                                                        }
                                                    }} />
                                                </label>
                                                {formData.image && formData.image.startsWith('data:') && (
                                                    <div className="w-10 h-10 rounded overflow-hidden border">
                                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Combo Multiple Images Upload */}
                                        {formData.isCombo && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-gray-700">Combo Images (Slideshow)</label>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {(formData.images || []).map((img, idx) => (
                                                        <div key={idx} className="w-16 h-16 rounded overflow-hidden border relative group">
                                                            <img src={img} alt={`Combo ${idx}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className="w-16 h-16 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                                                        <span className="text-2xl">+</span>
                                                        <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                                                            const files = Array.from(e.target.files);
                                                            try {
                                                                // Process all files in parallel
                                                                const compressedImages = await Promise.all(
                                                                    files.map(file => compressImage(file, 800, 0.7))
                                                                );
                                                                setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...compressedImages] }));
                                                            } catch (err) {
                                                                console.error("Batch compression failed:", err);
                                                                alert("Failed to process one or more images.");
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dine Menu Images */}
                                        {formData.category === 'dine' && activeTab !== 'sponsors' && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-gray-700">Menu Pages</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="border p-2 rounded block w-full text-sm text-slate-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-riverside-teal/10 file:text-riverside-teal
                                                        hover:file:bg-riverside-teal/20"
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files);
                                                        try {
                                                            const compressedList = await Promise.all(
                                                                files.map(file => compressImage(file, 800, 0.6))
                                                            );
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                menuImages: [...(prev.menuImages || []), ...compressedList]
                                                            }));
                                                        } catch (err) {
                                                            console.error("Menu compression failed", err);
                                                            alert("Failed to process menu images. Please try fewer images.");
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-4 mt-6">
                                            <button type="submit" className="flex-1 bg-riverside-teal text-white py-2 rounded font-bold">Save</button>
                                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded font-bold">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }
                </motion.div >
            </div >
        </div >
    );
};

export default AdminDashboard;
