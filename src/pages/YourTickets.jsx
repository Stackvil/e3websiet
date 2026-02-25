import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
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
        doc.text('E3 Entertainment', 105, 20, { align: 'center' });

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
        doc.text('Thank you for booking with E3 Entertainment!', 105, 145, { align: 'center' });
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

    // Flatten orders into individual tickets based on quantity and combo multipliers
    const tickets = orders.flatMap(order =>
        (order.items || []).flatMap((item, itemIdx) => {
            const isComboItem = item.details?.isCombo || (item.name && item.name.toLowerCase().includes('combo'));
            const ridesPerCombo = isComboItem ? (item.details?.rideCount || 5) : 1;
            const totalTickets = (item.quantity || 1) * ridesPerCombo;

            return Array.from({ length: totalTickets }).map((_, globalIdx) => {
                // Determine which purchased bundle this belongs to (e.g. qty 2 means 10 tickets total)
                const qtyIdx = Math.floor(globalIdx / ridesPerCombo);
                // Determine which ride inside the combo this is (e.g. ride 1 of 5)
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
        })
    ).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    return (
        <div className="min-h-screen bg-creamy-white pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal-grey">Your Tickets</h1>
                </div>

                {/* Important Notice Banner */}
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <p className="text-sm font-medium text-gray-700">
                        <strong className="text-orange-700 uppercase tracking-widest text-xs">Important Note:</strong><br />
                        All unredeemed tickets will automatically <strong className="text-orange-700">expire 7 days</strong> from the date of purchase. Expired tickets cannot be used.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {tickets.map((ticket) => {
                        const isEvent = ticket.name.toLowerCase().includes('booking') || ticket.name.toLowerCase().includes('event') || (ticket.id && ticket.id.toString().toLowerCase().includes('event'));
                        const orderDateObj = ticket.orderDate ? new Date(ticket.orderDate) : new Date();
                        const timeDiff = new Date() - orderDateObj;
                        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                        const isExpired = daysDiff >= 7;

                        // Show warning when 2 days or less are remaining (so if daysDiff is 5 or more)
                        const daysLeft = Math.ceil(7 - daysDiff);
                        const isExpiringSoon = daysLeft <= 2 && daysLeft > 0;

                        return (
                            <motion.div
                                key={ticket.uniqueQrId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-white rounded-xl overflow-hidden shadow-lg border flex flex-col w-full relative ${isExpired ? 'border-red-100 grayscale-[0.5]' : 'border-gray-100'}`}
                            >
                                {/* QR Code Section OR Receipt Section */}
                                <div className="p-6 bg-white flex flex-col items-center justify-center border-b-2 border-dashed border-gray-100 relative min-h-[160px]">
                                    <div className="absolute bottom-[-8px] left-[-8px] w-4 h-4 bg-creamy-white rounded-full z-10" />
                                    <div className="absolute bottom-[-8px] right-[-8px] w-4 h-4 bg-creamy-white rounded-full z-10" />

                                    {isExpired ? (
                                        <div className="text-center flex flex-col items-center justify-center h-full w-full py-4 bg-gray-50/50 rounded-xl">
                                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-3">
                                                <AlertCircle size={24} />
                                            </div>
                                            <p className="text-sm text-red-500 font-bold uppercase tracking-wider mb-1">Expired</p>
                                            <p className="text-[10px] text-gray-500 font-medium px-4 leading-tight">This ticket has surpassed its 7-day validity window.</p>
                                        </div>
                                    ) : !isEvent ? (
                                        <>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.uniqueQrId}`}
                                                alt="Ticket QR"
                                                className="w-40 h-40 mix-blend-multiply"
                                            />
                                            <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                                                {ticket.uniqueQrId.substring(0, 16)}...
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center flex flex-col items-center justify-center h-full">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3">
                                                <Calendar size={32} />
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold mb-3">Event Booking</p>
                                            <button
                                                onClick={() => generateReceipt(ticket)}
                                                className="bg-riverside-teal text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-opacity-90 shadow-md transition-all flex items-center gap-1"
                                            >
                                                Download Receipt
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Ticket Details */}
                                <div className="p-4 bg-gray-50/50 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-charcoal-grey text-lg leading-tight mb-1">{ticket.name}</h3>

                                        {/* Expiring Soon Text */}
                                        {isExpiringSoon && (
                                            <p className="mb-2 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-flex items-center gap-1 border border-orange-100">
                                                <AlertCircle size={12} /> Expiring soon ({Math.ceil(7 - daysDiff)} days left)
                                            </p>
                                        )}

                                        {/* Combo Validity Text */}
                                        {ticket.displayComboIndex && !isExpired && (
                                            <p className="mt-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block border border-green-100">
                                                Combo Ticket: Ride {ticket.displayComboIndex} of {ticket.totalComboRides}
                                            </p>
                                        )}

                                        {ticket.details && !ticket.displayComboIndex && (
                                            <p className="text-xs text-riverside-teal font-bold mt-1">
                                                {ticket.details.date} {formatTime12h(ticket.details.startTime)} {ticket.details.endTime ? `- ${formatTime12h(ticket.details.endTime)}` : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Price</span>
                                            <span className="font-bold text-gray-700">₹{ticket.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                                            <span>Ordered</span>
                                            <span>
                                                {new Date(ticket.orderDate).toLocaleDateString()} at {new Date(ticket.orderDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};

export default YourTickets;
