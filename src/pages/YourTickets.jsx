import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, Calendar, Clock, MapPin, ArrowRight, AlertCircle,
    Download, Printer, X, Hash, ShieldCheck
} from 'lucide-react';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';
import { fetchWithAuth } from '../utils/apiFetch';
import jsPDF from 'jspdf';
import { formatTime12h } from '../utils/timeUtils';

const YourTickets = () => {
    const { user } = useStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
    const [activeTab, setActiveTab] = useState('rides');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const location = user.location?.toLowerCase() || 'e3';
                const res = await fetchWithAuth(`${API_URL}/orders/${location}`);
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

    const generateReceipt = (ticket) => {
        const doc = new jsPDF();

        // Company Header
        doc.setFontSize(22);
        doc.setTextColor(255, 107, 107); // Sunset Orange
        doc.text('ethree', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('123 Adventure Lane, Fun City, India', 105, 26, { align: 'center' });
        doc.text('support@e3entertainment.in | +91 70369 23456', 105, 31, { align: 'center' });

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
        doc.text(`Name: ${user?.name || 'Valued Customer'}`, 25, 68);
        doc.text(`Email: ${user?.email || 'N/A'}`, 25, 74);
        doc.text(`Mobile: ${user?.mobile || 'N/A'}`, 25, 80);

        // Booking Details
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Booking Information:', 110, 60);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(`Event: ${ticket.name}`, 115, 68);
        doc.text(`Booking ID: #${ticket.orderId.slice(-6).toUpperCase()}`, 115, 74);
        doc.text(`Date: ${new Date(ticket.orderDate).toLocaleDateString()}`, 115, 80);

        if (ticket.details?.startTime) {
            const start = formatTime12h(ticket.details.startTime);
            const end = ticket.details.endTime ? formatTime12h(ticket.details.endTime) : '';
            doc.text(`Time Slot: ${start} ${end ? '- ' + end : ''}`, 115, 86);
        }

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 95, 170, 10, 'F');
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.font = 'helvetica';
        doc.setFont(undefined, 'bold');
        doc.text('Description', 25, 101);
        doc.text('Qty', 130, 101);
        doc.text('Price', 160, 101);

        // Table Content
        doc.setFont(undefined, 'normal');
        doc.text(`${ticket.name}`, 25, 112);
        doc.text('1', 130, 112);
        doc.text(`Rs. ${ticket.price}`, 160, 112);

        // Total
        doc.line(20, 120, 190, 120);
        doc.setFont(undefined, 'bold');
        doc.text('Total Amount:', 130, 128);
        doc.text(`Rs. ${ticket.price}`, 160, 128);

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Thank you for booking with ethree!', 105, 145, { align: 'center' });
        doc.text('Please present this receipt at the venue entry.', 105, 150, { align: 'center' });

        doc.save(`Receipt_${ticket.name.replace(/\s+/g, '_')}_${ticket.orderId.slice(-4)}.pdf`);
    };

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

    // Group orders to display as containers
    const groupedOrders = orders.map(order => {
        const orderTickets = (order.items || []).flatMap((item, itemIdx) => {
            // Priority 1: Explicit ride count from metadata
            let ridesPerCombo = item.details?.rideCount || 1;

            // Priority 2: If no explicit count but has "combo" in name, try to parse a number
            if (!item.details?.rideCount && item.name && item.name.toLowerCase().includes('combo')) {
                const match = item.name.match(/(\d+)\s*(rides?|items?|pack|tickets?)/i);
                if (match) {
                    ridesPerCombo = parseInt(match[1]);
                } else {
                    // Default to 1 for generic "Combo" items to avoid over-counting
                    ridesPerCombo = 1;
                }
            }

            const totalTickets = (item.quantity || 1) * ridesPerCombo;
            const isComboItem = ridesPerCombo > 1;

            return Array.from({ length: totalTickets }).map((_, globalIdx) => {
                const qtyIdx = Math.floor(globalIdx / ridesPerCombo);
                const comboIdx = globalIdx % ridesPerCombo;

                return {
                    ...item,
                    orderId: order._id,
                    orderDate: order.createdAt,
                    status: order.status,
                    uniqueQrId: `${order._id}-${item.id || item.product || itemIdx}-${qtyIdx}${isComboItem ? `-combo${comboIdx + 1}` : ''}`,
                    displayComboIndex: isComboItem ? comboIdx + 1 : null,
                    totalComboRides: isComboItem ? ridesPerCombo : null
                };
            });
        });

        return {
            ...order,
            tickets: orderTickets
        };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Categorize orders into Rides vs Events
    const categorizedOrders = groupedOrders.reduce((acc, order) => {
        const isEventOrder = (order.items || []).some(item => {
            const itemName = (item.name || '').toLowerCase();
            return itemName.includes('booking') ||
                itemName.includes('event') ||
                itemName.includes('dining') ||
                itemName.includes('suite') ||
                itemName.includes('lounge');
        });

        if (isEventOrder) {
            acc.events.push(order);
        } else {
            acc.rides.push(order);
        }
        return acc;
    }, { rides: [], events: [] });

    const activeOrders = activeTab === 'rides' ? (categorizedOrders.rides || []) : (categorizedOrders.events || []);

    return (
        <div className="min-h-screen bg-[#F1F3F6] pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowRight className="rotate-180" size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-charcoal-grey uppercase tracking-tight">My Account</h1>
                </div>

                {/* Status Bar / Subheader */}
                <div className="mb-6">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Past Orders</p>

                    {/* Tab Switcher - Swiggy Style */}
                    <div className="bg-white p-1.5 rounded-2xl flex gap-1 shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('rides')}
                            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'rides' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {activeTab === 'rides' && (
                                <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-black rounded-xl" />
                            )}
                            <span className="relative z-10">Rides</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'events' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {activeTab === 'events' && (
                                <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-black rounded-xl" />
                            )}
                            <span className="relative z-10">Events</span>
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {activeOrders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm"
                            >
                                <Ticket size={48} className="text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold text-sm">No {activeTab} found</p>
                            </motion.div>
                        ) : (
                            activeOrders.map((order) => {
                                const orderDateObj = new Date(order.createdAt);
                                const isExpanded = expandedOrder === order._id;

                                return (
                                    <motion.div
                                        key={order._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
                                    >
                                        {/* Card Header */}
                                        <div className="p-5 flex items-start justify-between border-b border-gray-50">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                                                    <div className="w-8 h-8 rounded-lg bg-sunset-orange/10 flex items-center justify-center text-sunset-orange font-black text-xs">
                                                        E3
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-charcoal-grey text-lg leading-tight">ethree</h3>
                                                    <p className="text-xs text-gray-400 font-medium mt-0.5">{user?.location || 'Vijayawada'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase">
                                                <span>Paid</span>
                                                <ShieldCheck size={14} />
                                            </div>
                                        </div>

                                        {/* Item List */}
                                        <div className="p-5 pt-4 space-y-2">
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} className="flex gap-3 text-[13px]">
                                                    <span className="text-gray-400 font-medium">{item.quantity || 1}x</span>
                                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Divider */}
                                        <div className="mx-5 border-t border-gray-50"></div>

                                        {/* Order Meta Footer */}
                                        <div className="p-5 flex flex-col gap-5">
                                            <div className="text-[11px] font-bold text-gray-400 space-x-1">
                                                <span>ORDERED:</span>
                                                <span className="text-gray-700">
                                                    {orderDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}, {orderDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <span>BILL TOTAL:</span>
                                                <span className="text-gray-700">₹{order.amount || order.totalAmount}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setSelectedOrderForInvoice(order)}
                                                    className="flex-1 py-3 text-sm font-bold text-charcoal-grey border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors uppercase tracking-tight"
                                                >
                                                    Invoice
                                                </button>
                                                <button
                                                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                                    className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all uppercase tracking-tight ${isExpanded
                                                        ? 'bg-gray-100 text-charcoal-grey'
                                                        : 'bg-riverside-teal text-white shadow-lg shadow-teal-50 hover:bg-teal-600'
                                                        }`}
                                                >
                                                    {isExpanded ? 'Hide' : 'View Tickets'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Tickets Section */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-gray-50/50 border-t border-dashed border-gray-100"
                                                >
                                                    <div className="p-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
                                                        {order.tickets.map((ticket) => {
                                                            const isEvent = (ticket.name || '').toLowerCase().includes('booking') ||
                                                                (ticket.name || '').toLowerCase().includes('event') ||
                                                                (ticket.id && ticket.id.toString().toLowerCase().includes('event'));

                                                            const timeDiff = new Date() - new Date(ticket.orderDate);
                                                            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                                                            const isExpired = daysDiff >= 7;

                                                            return (
                                                                <div key={ticket.uniqueQrId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                                                    <div className="w-16 h-16 shrink-0 bg-white p-1 border rounded-xl flex items-center justify-center">
                                                                        {isExpired ? (
                                                                            <AlertCircle size={24} className="text-red-400" />
                                                                        ) : isEvent ? (
                                                                            <Calendar size={24} className="text-blue-500" />
                                                                        ) : (
                                                                            <img
                                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.uniqueQrId}`}
                                                                                alt="QR"
                                                                                className="w-full h-full mix-blend-multiply"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-bold text-charcoal-grey text-xs truncate uppercase tracking-tighter">{ticket.name}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <p className="text-[10px] font-bold text-gray-400">₹{ticket.price}</p>
                                                                            {isExpired && <span className="text-[9px] font-black text-red-500 uppercase">Expired</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Invoice Modal ── */}
            <AnimatePresence>
                {selectedOrderForInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={() => setSelectedOrderForInvoice(null)}
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
                                            <p className="font-bold text-lg leading-none uppercase">ethree</p>
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
                                        onClick={() => setSelectedOrderForInvoice(null)}
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
                                        <p className="font-mono font-bold text-charcoal-grey text-sm break-all">{selectedOrderForInvoice._id}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                            <Calendar size={12} /> Date & Time
                                        </p>
                                        <p className="font-bold text-charcoal-grey text-sm">
                                            {new Date(selectedOrderForInvoice.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                            <MapPin size={12} /> Venue
                                        </p>
                                        <p className="font-bold text-charcoal-grey text-sm">ethree, Vijayawada</p>
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
                                                {(selectedOrderForInvoice.items || []).map((item, i) => (
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
                                        <p className="text-3xl font-black mt-1">₹{selectedOrderForInvoice.amount || selectedOrderForInvoice.totalAmount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Payment via</p>
                                        <p className="font-bold text-sm mt-0.5">Easebuzz</p>
                                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Verified</span>
                                    </div>
                                </div>


                                {/* Footer */}
                                <p className="text-center text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
                                    Thank you for visiting ethree! 🎉 This is a computer-generated invoice and does not require a signature.<br />
                                    © {new Date().getFullYear()} ethree Pvt Ltd. All Rights Reserved.
                                </p>
                            </div>

                            {/* Print / Close */}
                            <div className="p-5 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-charcoal-grey text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition"
                                >
                                    <Printer size={16} /> Print Invoice
                                </button>
                                <button
                                    onClick={() => setSelectedOrderForInvoice(null)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-100 text-charcoal-grey rounded-2xl font-bold text-sm hover:border-gray-300 transition"
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

export default YourTickets;
