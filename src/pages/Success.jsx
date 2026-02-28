import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, ArrowRight, Download, X,
    Ticket, MapPin, Calendar, Hash, ShieldCheck
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { API_URL } from '../config/api';

const Success = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart, addTicket, tickets, closeCart } = useStore();
    const [orderData, setOrderData] = useState(null);
    const [bookedItems, setBookedItems] = useState([]);
    const [showInvoice, setShowInvoice] = useState(false);
    const processedRef = useRef(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || processedRef.current) return;
            try {
                const response = await fetch(`${API_URL}/payment/status/${orderId}`);
                const result = await response.json();
                if (result.success) {
                    const order = result.order;
                    setOrderData(order);
                    const items = order.items || [];
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
                        setBookedItems(generatedTickets.flatMap(t => t.items));
                    } else {
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
        closeCart();
    }, [orderId, clearCart, addTicket, closeCart]);

    if (!orderId) return null;

    const orderDate = orderData?.createdAt
        ? new Date(orderData.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const totalAmount = orderData?.amount ||
        bookedItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

    const isEventOrder = (orderData?.items || bookedItems).some(item =>
        (item.id && item.id.toString().startsWith('event-')) ||
        (item.name && item.name.toLowerCase().includes('booking')) ||
        item.stall === 'Events'
    );

    return (
        <div className="min-h-screen bg-creamy-white flex items-center justify-center p-6 pt-24">
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] shadow-2xl shadow-riverside-teal/10 max-w-lg w-full border border-riverside-teal/5 overflow-hidden"
            >
                {/* ── Green Banner ── */}
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-10 text-center text-white">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckCircle size={44} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">
                        {isEventOrder ? 'Congratulations! Your event is booked' : 'Your rides are confirmed!'}
                    </h1>
                    <p className="text-green-100 mt-1 text-sm">Check your tickets in your tickets page</p>
                    <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-block">
                        <span className="font-mono font-bold text-sm tracking-widest">{orderId}</span>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* ── Action Buttons ── */}
                    <div className="space-y-4 pt-4">
                        <Link
                            to="/tickets"
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-riverside-teal text-white font-bold text-lg hover:bg-teal-600 transition-all shadow-xl shadow-teal-100"
                        >
                            <Ticket size={22} /> {isEventOrder ? 'Your Event Details' : 'See Your Tickets'}
                        </Link>
                        <Link
                            to="/"
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] border-2 border-gray-100 text-charcoal-grey font-bold text-base hover:border-riverside-teal hover:text-riverside-teal transition-all"
                        >
                            Back to Home <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* ══════════════════════════════════
                INVOICE MODAL
            ══════════════════════════════════ */}
            <AnimatePresence>
                {showInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={() => setShowInvoice(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Invoice Header */}
                            <div className="bg-[#1D2B44] text-white p-8 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-sunset-orange rounded-xl flex items-center justify-center font-black text-lg">E3</div>
                                        <div>
                                            <p className="font-bold text-lg leading-none">JAAN ENTERTAINMENT</p>
                                            <p className="text-blue-300 text-xs">Pvt Ltd</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs">Opp. APSRTC Bus Stand, Padmavathi Ghat,</p>
                                    <p className="text-gray-400 text-xs">Vijayawada, AP – 520013</p>
                                    <p className="text-gray-400 text-xs mt-1">📞 +91 70369 23456</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white tracking-tight">INVOICE</p>
                                    <p className="text-blue-300 text-xs mt-1">Tax Invoice / Receipt</p>
                                    <button
                                        onClick={() => setShowInvoice(false)}
                                        className="mt-4 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Invoice Body */}
                            <div className="overflow-y-auto flex-1 p-8 space-y-6">

                                {/* Order Meta */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                            <Hash size={12} /> Invoice No.
                                        </p>
                                        <p className="font-mono font-bold text-charcoal-grey text-sm break-all">{orderId}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                            <Calendar size={12} /> Date & Time
                                        </p>
                                        <p className="font-bold text-charcoal-grey text-sm">{orderDate}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                            <MapPin size={12} /> Venue
                                        </p>
                                        <p className="font-bold text-charcoal-grey text-[11px] leading-tight">Opp. APSRTC Bus Stand, Padmavathi Ghat, Krishnalanka, Vijayawada 520013</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                            <ShieldCheck size={12} /> Status
                                        </p>
                                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                            Paid ✓
                                        </span>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div>
                                    <h3 className="font-bold text-charcoal-grey uppercase text-xs tracking-widest mb-3">Booking Details</h3>
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest">
                                                <tr>
                                                    <th className="text-left p-4 font-bold">#</th>
                                                    <th className="text-left p-4 font-bold">Item</th>
                                                    <th className="text-center p-4 font-bold">Qty</th>
                                                    <th className="text-right p-4 font-bold">Price</th>
                                                    <th className="text-right p-4 font-bold">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(orderData?.items || bookedItems).map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="p-4 text-gray-400">{i + 1}</td>
                                                        <td className="p-4">
                                                            <p className="font-bold text-charcoal-grey">{item.name}</p>
                                                            {item.stall && <p className="text-xs text-gray-400">{item.stall}</p>}
                                                        </td>
                                                        <td className="p-4 text-center text-gray-600">{item.quantity || 1}</td>
                                                        <td className="p-4 text-right text-gray-600">₹{item.price}</td>
                                                        <td className="p-4 text-right font-bold text-charcoal-grey">₹{item.price * (item.quantity || 1)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-[#1D2B44] text-white rounded-2xl p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Total Amount Paid</p>
                                        <p className="text-3xl font-black mt-1">₹{totalAmount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Payment via</p>
                                        <p className="font-bold text-sm mt-0.5">Easebuzz</p>
                                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Verified</span>
                                    </div>
                                </div>

                                {/* Per-ticket QR Grid inside invoice */}
                                {bookedItems.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-charcoal-grey uppercase text-xs tracking-widest mb-3">
                                            Ticket QR Codes — Show at Entry
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {bookedItems.map((item, index) => {
                                                const ticketId = `${orderId}-${index + 1}`;
                                                return (
                                                    <div key={index} className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center border border-gray-100">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${ticketId}&margin=4`}
                                                            alt={`QR ${index + 1}`}
                                                            className="rounded-xl border-2 border-white shadow"
                                                        />
                                                        <p className="text-[10px] font-bold text-charcoal-grey mt-2 text-center truncate w-full">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">#{index + 1}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Main Order QR */}
                                <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-5">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${orderId}&margin=5`}
                                        alt="Order QR"
                                        className="rounded-xl border-2 border-white shadow"
                                    />
                                    <div>
                                        <p className="font-bold text-charcoal-grey text-sm">Master Order QR</p>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">Scan at the main entry gate. Valid only for the date of purchase. Non-transferable.</p>
                                        <p className="text-[10px] font-mono text-gray-400 mt-1">{orderId}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <p className="text-center text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
                                    Thank you for visiting Jaan Entertainment! 🎉 This is a computer-generated invoice and does not require a signature.<br />
                                    © {new Date().getFullYear()} Jaan Entertainment Pvt Ltd. All Rights Reserved.
                                </p>
                            </div>

                            <div className="p-5 border-t border-gray-100 flex">
                                <button
                                    onClick={() => setShowInvoice(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-100 text-charcoal-grey rounded-2xl font-bold text-sm hover:border-gray-300 transition"
                                >
                                    <X size={16} /> Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Success;
