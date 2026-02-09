import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const YourTickets = () => {
    const { tickets, user, clearTickets } = useStore();

    // Filter tickets for current user if needed, or just show all if local storage is simple
    // Filter tickets for current user and remove expired ones (older than 24h)
    const userTickets = user ? tickets.filter(t => {
        if (t.userMobile && t.userMobile !== user.mobile) return false;

        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const now = new Date();

        // Check if it's an event ticket
        const eventItem = t.items.find(item =>
            (item.id && typeof item.id === 'string' && item.id.startsWith('event-')) ||
            item.stall === 'Events'
        );

        // Keep event bookings permanently (as per user request)
        if (eventItem) return true;

        // For rides: Hide after 24 hours from purchase
        const referenceDate = new Date(t.date);

        // Validate date parsing
        if (isNaN(referenceDate.getTime())) return true;

        const expiryDate = new Date(referenceDate.getTime() + ONE_DAY_MS);

        return now < expiryDate;
    }) : [];

    const handleDownloadBill = (ticket) => {
        const doc = new jsPDF();

        // Company Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Riverside Teal-ish
        doc.text('Ethree', 105, 20, null, null, 'center');

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Eat. Enjoy. Entertain.', 105, 26, null, null, 'center');

        // Invoice Title
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('INVOICE / RECEIPT', 14, 40);

        // Ticket Details
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`Order ID: #${ticket.id}`, 14, 50);
        doc.text(`Date: ${new Date(ticket.date).toLocaleDateString()}`, 14, 55);

        // Use the name from the ticket (booking) if available, otherwise fallback to user profile
        const customerName = ticket.firstname || ticket.name || (user ? user.name : 'Guest');
        const customerMobile = ticket.phone || ticket.mobile || (user ? user.mobile : '');

        doc.text(`Customer: ${customerName}`, 14, 65);
        if (customerMobile) {
            doc.text(`Mobile: ${customerMobile}`, 14, 70);
        }

        // Helper to format time to 12-hour AM/PM
        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            const [h, m] = timeStr.split(':').map(Number);
            const period = h >= 12 ? 'PM' : 'AM';
            const hours = h % 12 || 12;
            return `${hours}:${m.toString().padStart(2, '0')} ${period}`;
        };

        // Table Data
        const tableBody = ticket.items.map(item => [
            { content: item.name, styles: { fontStyle: 'bold' } },
            item.details ? `${item.details.date} (${formatTime(item.details.startTime)} - ${formatTime(item.details.endTime)})` : 'N/A',
            item.quantity,
            `Rs. ${item.price}`
        ]);

        autoTable(doc, {
            startY: 80,
            head: [['Item', 'Details', 'Qty', 'Price']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 10 },
        });

        // Total
        const finalY = doc.lastAutoTable.finalY || 100;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Amount: Rs. ${ticket.total}`, 14, finalY + 15);
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text('Thank you for choosing Ethree!', 105, finalY + 30, null, null, 'center');

        doc.save(`Ethree_Bill_${ticket.id}.pdf`);
    };

    if (!user || userTickets.length === 0) {
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

    return (
        <div className="min-h-screen bg-creamy-white pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal-grey">Your Tickets</h1>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to clear your ticket history?')) {
                                clearTickets();
                            }
                        }}
                        className="text-red-500 hover:text-red-600 text-sm font-bold border border-red-200 bg-red-50 px-4 py-2 rounded-lg transition-colors hover:bg-red-100"
                    >
                        Clear History
                    </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                    {userTickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col max-w-[13rem] mx-auto w-full"
                        >
                            {/* Prominent QR Code Section */}
                            {/* Conditional Display: Event Bill vs Ride QR */}
                            {ticket.items.some(item => (item.id && typeof item.id === 'string' && item.id.startsWith('event-')) || item.stall === 'Events') ? (
                                <div className="p-4 bg-riverside-teal/5 flex flex-col items-center justify-center border-b-2 border-dashed border-gray-100 relative min-h-[150px]">
                                    {/* Semi-circles for ticket punch effect */}
                                    <div className="absolute bottom-[-8px] left-[-8px] w-4 h-4 bg-creamy-white rounded-full" />
                                    <div className="absolute bottom-[-8px] right-[-8px] w-4 h-4 bg-creamy-white rounded-full" />

                                    <div className="text-center">
                                        <h3 className="text-riverside-teal font-heading font-bold text-lg mb-2">Event Booking</h3>
                                        <p className="text-[9px] text-gray-500 mb-4 uppercase tracking-wider font-bold">Receipt Generated</p>
                                        <button
                                            onClick={() => handleDownloadBill(ticket)}
                                            className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-bold text-charcoal-grey hover:bg-gray-50 flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                            Download Bill
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 bg-white flex flex-col items-center justify-center border-b-2 border-dashed border-gray-100 relative">
                                    {/* Semi-circles for ticket punch effect */}
                                    <div className="absolute bottom-[-8px] left-[-8px] w-4 h-4 bg-creamy-white rounded-full" />
                                    <div className="absolute bottom-[-8px] right-[-8px] w-4 h-4 bg-creamy-white rounded-full" />

                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.id}`}
                                        alt="Ticket QR"
                                        className="w-28 h-28 mix-blend-multiply"
                                    />
                                    <p className="mt-1 text-[7px] text-gray-400 font-bold uppercase tracking-widest">Scan at Entry</p>
                                    {ticket.items.some(i => i.isCombo || i.name.toLowerCase().includes('combo')) && (
                                        <p className="text-[7px] text-sunset-orange font-bold uppercase tracking-widest mt-0.5 text-center">Use this QR any 5 rides</p>
                                    )}
                                </div>
                            )}

                            {/* Ride Details & Cost */}
                            <div className="p-2 bg-gray-50/50 flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                                        {new Date(ticket.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(ticket.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                    <div className="bg-green-100 text-green-600 px-1 py-0.5 rounded text-[7px] font-bold uppercase">Confirmed</div>
                                </div>

                                <div className="space-y-1.5">
                                    {ticket.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-md overflow-hidden shadow-sm">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-charcoal-grey leading-tight text-[10px]">{item.name}</h4>
                                                    <p className="text-[9px] text-gray-400">Qty: {item.quantity}</p>
                                                    {item.details && (
                                                        <p className="text-[9px] text-riverside-teal font-bold mt-0.5">
                                                            {item.details.date} • {(() => {
                                                                const format = (t) => {
                                                                    if (!t) return '';
                                                                    const [h, m] = t.split(':').map(Number);
                                                                    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                                                                };
                                                                return `${format(item.details.startTime)} - ${format(item.details.endTime)}`;
                                                            })()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-bold text-xs text-charcoal-grey">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total Separator */}
                                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-heading font-bold text-gray-500 text-xs">Total</span>
                                    <span className="font-heading font-bold text-lg text-sunset-orange">₹{ticket.total}</span>
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
