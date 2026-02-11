import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { LayoutDashboard, Calendar, Users, Utensils, Power, Gamepad2, Ticket, Package, X, RefreshCw, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../config/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [bookings, setBookings] = useState([]);
    const [products, setProducts] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'dine', price: '', description: '', image: '', menuImages: [], status: 'open' });
    const [transactions, setTransactions] = useState([]);
    const [platformStats, setPlatformStats] = useState({ web: 0, mobile: 0 });
    const [visibleCount, setVisibleCount] = useState(10);
    // const [filterType, setFilterType] = useState('all'); // 'all', 'rides', 'events', 'other'
    const [filterType, setFilterType] = useState('all'); // 'all', 'rides', 'events'
    const navigate = useNavigate();
    const { setUser } = useStore();


    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        try {
            console.log("Fetching admin data...");

            // 1. Fetch Products from E3 endpoints only
            try {
                const [e3RidesRes, e3DineRes] = await Promise.all([
                    fetch(`${API_URL}/api/e3/rides`),
                    fetch(`${API_URL}/api/e3/dine`)
                ]);

                const allProducts = [];

                if (e3RidesRes.ok) {
                    const e3Rides = await e3RidesRes.json();
                    allProducts.push(...e3Rides);
                }

                if (e3DineRes.ok) {
                    const e3Dine = await e3DineRes.json();
                    console.log("Fetched E3 Dine items:", e3Dine); // Added log
                    allProducts.push(...e3Dine);
                }

                setProducts(allProducts);
                console.log("Total Fetched Products (Rides + Dine):", allProducts.length, allProducts); // Enhanced log
            } catch (productsErr) {
                console.error("E3 Products fetch failed", productsErr);
                setProducts([]);
            }

            // 2. Fetch Bookings (Safely)
            try {
                const bookingsRes = await fetch(`${API_URL}/api/bookings`, { headers });
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
            const transactionsRes = await fetch(`${API_URL}/api/orders/all`, { headers });
            if (transactionsRes.ok) {
                const transactionsData = await transactionsRes.json();
                setTransactions(transactionsData);
            }

            // 4. Fetch Sponsors
            const sponsorsRes = await fetch(`${API_URL}/api/sponsors`);
            if (sponsorsRes.ok) {
                const sponsorsData = await sponsorsRes.json();
                setSponsors(sponsorsData);
            }

            // 5. Fetch Platform Analytics
            try {
                const statsRes = await fetch(`${API_URL}/api/analytics/stats`, { headers });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setPlatformStats(statsData);
                }
            } catch (statsErr) {
                console.error("Analytics fetch error:", statsErr);
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
        setFormData(item ? { menuImages: [], status: 'open', ...item } : { name: '', category: defaultCategory, price: '', description: '', image: '', menuImages: [], status: 'open' });
        setShowModal(true);
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert('Error deleting item');
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Determine endpoint based on category
        let endpoint = '';
        if (formData.category === 'play') endpoint = '/api/e3/rides';
        else if (formData.category === 'dine') endpoint = '/api/e3/dine';
        else endpoint = '/api/e3/rides'; // Default fallback, though should be strict

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
            payload.desc = formData.description; // Map description -> desc
            payload.type = 'Ride'; // Default type
            payload.ageGroup = 'All'; // Default
        } else {
            payload.category = 'dine';
            // Dine schema has 'cuisine', 'stall', etc.
            payload.cuisine = 'General';
            payload.stall = formData.name;
            payload.open = formData.status === 'open';
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
            await fetch(`${API_URL}/api/sponsors/${id}`, {
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
            const res = await fetch(`${API_URL}/api/sponsors`, {
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

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
        { id: 'dine', label: 'Dine', icon: Utensils },
        { id: 'rides', label: 'Rides', icon: Gamepad2 },
        { id: 'bookings', label: 'Event Bookings', icon: Calendar },
    ];

    const getVisibleProducts = () => {
        if (activeTab === 'rides') return products.filter(p => p.category === 'play');
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
                            <p className="text-gray-500 mt-2">Manage your Ethree operations seamlessly.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-red-500 hover:text-red-600 font-medium"
                        >
                            <Power className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </header>



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

                                            {item.status === 'off' && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <p className="text-white font-bold bg-red-500/80 px-3 py-1 rounded text-xs">Closed</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-charcoal-grey truncate">{item.stall || item.name}</h3>
                                                <p className="text-gray-400 text-xs truncate capitalize">{item.cuisine || item.category} Cuisine</p>
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
                                            {ride.status === 'closed' && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                    <p className="text-white font-bold bg-red-500/80 px-4 py-2 rounded-lg text-sm border border-red-400">CLOSED</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2 flex flex-col h-[35%] justify-between bg-charcoal-grey">
                                            <div className="flex flex-col items-center justify-center flex-grow">
                                                <h3 className="text-white font-bold text-xs leading-tight text-center line-clamp-2">{ride.name}</h3>
                                                {ride.isCombo && <p className="text-[10px] text-sunset-orange font-bold text-center mt-0.5">Any 5 Rides</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-1">
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

                        const totalAmount = filteredTransactions.reduce((acc, tx) => acc + (tx.totalAmount || tx.amount || 0), 0);

                        // Platform Stats Calculation (If API fails, fallback to rudimentary calculation from logs/DB if needed, but we rely on API)
                        const totalUsers = platformStats.total || (platformStats.web + platformStats.mobile) || 1;
                        const webPercent = Math.round(((platformStats.web || 0) / totalUsers) * 100) || 0;
                        const mobilePercent = Math.round(((platformStats.mobile || 0) / totalUsers) * 100) || 0;

                        const generatePDF = () => {
                            try {
                                const doc = new jsPDF();
                                doc.setFontSize(18);
                                doc.text('Ethree - Transaction Report', 14, 22);
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
                                doc.save('ethree_transactions.pdf');
                            } catch (err) {
                                console.error("PDF Generation Error:", err);
                                alert("Failed to generate PDF.");
                            }
                        };

                        return (
                            <>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-lg font-bold font-heading text-charcoal-grey">Ride & Event Bookings</h2>
                                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                                {/* {['all', 'rides', 'events', 'other'].map(type => ( */}
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

                                {/* Platform Analytics Card */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="text-lg font-bold font-heading text-charcoal-grey mb-4">Platform Usage</h3>
                                        <div className="flex items-center justify-center gap-8 mb-6">
                                            <div className="text-center">
                                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2 text-blue-500">
                                                    <LayoutDashboard size={32} />
                                                </div>
                                                <p className="font-bold text-2xl text-charcoal-grey">{platformStats.web || 0}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Web</p>
                                            </div>
                                            <div className="h-12 w-px bg-gray-200"></div>
                                            <div className="text-center">
                                                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2 text-purple-500">
                                                    <Users size={32} />
                                                </div>
                                                <p className="font-bold text-2xl text-charcoal-grey">{platformStats.mobile || 0}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                                            <div className="bg-blue-500 h-full" style={{ width: `${webPercent}%` }}></div>
                                            <div className="bg-purple-500 h-full" style={{ width: `${mobilePercent}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>Web: {webPercent}%</span>
                                            <span>Mobile: {mobilePercent}%</span>
                                        </div>
                                    </div>

                                    {/* Placeholder for Ticket Stats or other metrics */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4 text-green-500">
                                            <Ticket size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold font-heading text-charcoal-grey">Total Tickets Sold</h3>
                                        <p className="text-4xl font-bold text-riverside-teal mt-2">{bookings.length + filteredTransactions.length}</p>
                                        <p className="text-sm text-gray-500 mt-1">Across all platforms</p>
                                    </div>
                                </div>
                            </>
                        );
                    })()}

                    {/* Bookings Section */}
                    {
                        activeTab === 'bookings' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white p-6 rounded-xl border shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-riverside-teal/10 text-riverside-teal rounded-full text-xs font-bold font-heading">{booking.facility}</span>
                                            <span className="text-gray-400 text-sm">#{booking.bookingId || booking.id}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-charcoal-grey">{booking.name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{booking.date} • {booking.time}</p>
                                    </div>
                                ))}
                            </div>
                        )
                    }

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
                                    <h3 className="text-xl font-bold mb-6">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                                    <form onSubmit={activeTab === 'sponsors' ? handleSaveSponsor : handleSaveItem} className="space-y-4">
                                        <input placeholder="Name" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />

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
                                                <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                    <option value="dine">Dine (Food)</option>
                                                    <option value="play">Play (Rides)</option>
                                                    <option value="events">Event</option>
                                                </select>
                                                {formData.category !== 'dine' && (
                                                    <input type="number" placeholder="Price" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                                )}
                                                <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                            </>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <input placeholder="Image URL" className="w-full border p-2 rounded" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                                            {/* Image Upload Logic Placeholder - Kept simple for now for stability */}
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded p-2 text-center text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                                                    <span>Upload Image</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setFormData({ ...formData, image: reader.result });
                                                            reader.readAsDataURL(file);
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

                                        {/* Dine Menu Images */}
                                        {formData.category === 'dine' && activeTab !== 'sponsors' && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-gray-700">Menu Pages</label>
                                                <input type="file" accept="image/*" multiple className="border p-2 rounded" onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    Promise.all(files.map(f => new Promise((resolve) => {
                                                        const r = new FileReader();
                                                        r.onload = () => resolve(r.result);
                                                        r.readAsDataURL(f);
                                                    }))).then(imgs => setFormData(prev => ({ ...prev, menuImages: [...prev.menuImages, ...imgs] })));
                                                }} />
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
