
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const YourTickets = () => {
    const { user } = useStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/orders`, {
                    headers: {
                        'x-auth-token': token
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-creamy-white pt-24 pb-12 px-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-charcoal-grey">Please Login</h2>
                <p className="text-gray-500 mb-4">You need to be logged in to view your tickets.</p>
                <Link to="/login" className="btn-orange px-6 py-2 rounded-xl">Login</Link>
            </div>
        );
    }

    if (loading) {
        return <div className="min-h-screen pt-24 text-center">Loading tickets...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-creamy-white pt-24 pb-12 px-6 flex flex-col items-center justify-center text-center">
                <Ticket size={64} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-heading font-bold text-charcoal-grey mb-2">No Tickets Found</h2>
                <p className="text-gray-500 mb-8 max-w-xs">You haven't booked any tickets yet. Start exploring our rides!</p>
                <Link to="/" className="btn-orange px-8 py-3 rounded-xl flex items-center gap-2">
                    Book Now <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    // Flatten orders into tickets for display
    // Each order is essentially a "ticket" group, but for UI consistency with previous design, we can treat each order as a card
    // Or iterate items. The previous design treated items within a ticket.
    // Let's treat each Order as a Ticket Card for simplicity.

    return (
        <div className="min-h-screen bg-creamy-white pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal-grey">Your Tickets</h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col w-full"
                        >
                            {/* QR Code Section */}
                            <div className="p-4 bg-white flex flex-col items-center justify-center border-b-2 border-dashed border-gray-100 relative">
                                <div className="absolute bottom-[-8px] left-[-8px] w-4 h-4 bg-creamy-white rounded-full" />
                                <div className="absolute bottom-[-8px] right-[-8px] w-4 h-4 bg-creamy-white rounded-full" />

                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order._id}`}
                                    alt="Order QR"
                                    className="w-32 h-32 mix-blend-multiply"
                                />
                                <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID: {order._id.substring(0, 8)}...</p>
                                <span className={`mt-1 text-xs font-bold px-2 py-0.5 rounded ${order.status === 'success' || order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </div>

                            {/* Order Details */}
                            <div className="p-4 bg-gray-50/50 flex-grow">
                                <div className="mb-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div>
                                                <p className="font-bold text-charcoal-grey line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                {item.details && (
                                                    <p className="text-[10px] text-riverside-teal mt-0.5">
                                                        {item.details.date} {item.details.startTime}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-600">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-heading font-bold text-gray-500 text-xs">Total</span>
                                    <span className="font-heading font-bold text-lg text-sunset-orange">₹{order.amount || order.totalAmount}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YourTickets;
