import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, Calendar, Users, Package, Power } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [ordersRes, bookingsRes] = await Promise.all([
                    fetch('http://localhost:5001/api/orders/all', { headers: { 'x-auth-token': token } }), // I need to add /all endpoint
                    fetch('http://localhost:5001/api/bookings', { headers: { 'x-auth-token': token } })
                ]);
                const ordersData = await ordersRes.json();
                const bookingsData = await bookingsRes.json();
                if (Array.isArray(ordersData)) setOrders(ordersData);
                if (Array.isArray(bookingsData)) setBookings(bookingsData);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };
        fetchData();

        // Mock fallback if API fails or empty
        setTimeout(() => {
            if (orders.length === 0) {
                setOrders([
                    { id: 'ORD001', user: 'Sharmila', status: 'preparing', total: 450, items: 'Momo x2, Mandi x1' },
                    { id: 'ORD002', user: 'Vikas', status: 'placed', total: 220, items: 'Burger x1' },
                ]);
            }
        }, 1000);
    }, []);

    const tabs = [
        { id: 'orders', label: 'Live Orders', icon: ShoppingCart },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex pt-20">
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
                        <button className="flex items-center text-red-500 hover:text-red-600 font-medium">
                            <Power className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </header>

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-charcoal-grey">Order ID</th>
                                        <th className="px-6 py-4 font-semibold text-charcoal-grey">Customer</th>
                                        <th className="px-6 py-4 font-semibold text-charcoal-grey">Items</th>
                                        <th className="px-6 py-4 font-semibold text-charcoal-grey">Total</th>
                                        <th className="px-6 py-4 font-semibold text-charcoal-grey">Status</th>
                                        <th className="px-6 py-4 font-semibold text-charcoal-grey">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium">{order.id}</td>
                                            <td className="px-6 py-4">{order.user}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{order.items}</td>
                                            <td className="px-6 py-4 font-semibold">₹{order.total}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-riverside-teal hover:underline font-medium">Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white p-6 rounded-xl border shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-riverside-teal/10 text-riverside-teal rounded-full text-xs font-bold font-heading">
                                            {booking.facility}
                                        </span>
                                        <span className="text-gray-400 text-sm">#{booking.id}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-charcoal-grey">{booking.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{booking.date}</p>
                                    <div className="mt-6 flex gap-2">
                                        <button className="flex-1 bg-riverside-teal text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors">Confirm</button>
                                        <button className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
