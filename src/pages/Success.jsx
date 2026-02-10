import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, User } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

import { API_URL } from '../config/api';

const Success = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart, addTicket, tickets, closeCart } = useStore();
    const [orderData, setOrderData] = useState(null);
    const [bookedItems, setBookedItems] = useState([]);
    const processedRef = useRef(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || processedRef.current) return;

            try {
                // Fetch Order Details from Backend
                const response = await fetch(`${API_URL}/payment/status/${orderId}`);
                const result = await response.json();

                if (result.success) {
                    const order = result.order;
                    setOrderData(order);

                    // Reconstruct Items
                    const items = order.items || [];

                    // Generate Tickets (Explode Logic) if not already added
                    // Check if we already have tickets for this order ID (prefix check)
                    const existingTickets = tickets.filter(t => t.id.startsWith(orderId) || t.id.includes(orderId));

                    if (existingTickets.length === 0) {
                        const generatedTickets = [];
                        items.forEach(item => {
                            for (let i = 0; i < item.quantity; i++) {
                                const ticketId = `${orderId}-${generatedTickets.length + 1}`;
                                const newTicket = {
                                    id: ticketId,
                                    date: order.createdAt || new Date().toISOString(),
                                    items: [{ ...item, quantity: 1 }],
                                    total: item.price,
                                    userMobile: order.phone
                                };
                                addTicket(newTicket);
                                generatedTickets.push(newTicket);
                            }
                        });
                        setBookedItems(generatedTickets.flatMap(t => t.items)); // Just for display
                    } else {
                        // Already processed, just display
                        setBookedItems(existingTickets.flatMap(t => t.items));
                    }

                    processedRef.current = true;
                    clearCart();
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            }
        };

        fetchOrder();
        closeCart(); // Ensure cart is closed on success page
    }, [orderId, clearCart, addTicket, closeCart]);

    if (!orderId) return null;

    return (
        <div className="min-h-screen bg-creamy-white flex items-center justify-center p-6 pt-24">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-riverside-teal/10 max-w-lg w-full text-center border border-riverside-teal/5"
            >
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={48} />
                </div>

                <h1 className="text-4xl font-heading font-bold text-charcoal-grey mb-6 tracking-tighter">Order Confirmed!</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Order ID: {orderId}</p>

                <div className="flex justify-center mb-8">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderId}`}
                        alt="Order QR Code"
                        className="rounded-xl border-4 border-white shadow-lg"
                    />
                </div>

                {/* Tickets Section */}
                <div className="space-y-6 mb-8 text-left">
                    <h2 className="text-xl font-bold text-charcoal-grey text-center">Your Tickets</h2>
                    {bookedItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-sunset-orange" />
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: 1 • ₹{item.price}</p>
                                    <p className="text-[10px] uppercase font-bold text-riverside-teal tracking-widest mt-1">Valid for Today</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center border-l border-dashed border-gray-300 pl-4">
                                <span className="text-[10px] font-bold text-gray-400 mt-1">Ticket {index + 1}</span>
                            </div>
                        </div>
                    ))}
                    {bookedItems.length === 0 && <p className="text-center text-gray-400">Loading tickets...</p>}
                </div>

                <div className="space-y-4">
                    <Link to="/tickets" className="w-full btn-orange py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold">
                        View All Tickets <User size={20} />
                    </Link>
                    <Link to="/dine" className="w-full text-riverside-teal font-bold hover:underline flex items-center justify-center gap-2">
                        Browse More Food <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-left border border-gray-100">
                    <h3 className="font-bold text-charcoal-grey mb-2">Next Steps</h3>
                    <ul className="text-sm text-gray-500 space-y-2">
                        <li>• Show your order ID at the respective stall.</li>
                        <li>• Real-time updates will be sent to your profile.</li>
                        <li>• Enjoy your meal on the river bank!</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default Success;
