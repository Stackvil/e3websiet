import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';

const YourTickets = () => {
    const { tickets, user, clearTickets } = useStore();

    // Filter tickets for current user if needed, or just show all if local storage is simple
    const userTickets = user ? tickets.filter(t => !t.userMobile || t.userMobile === user.mobile) : [];

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
                            </div>

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
                                                            {item.details.date} • {item.details.startTime}-{item.details.endTime}
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
