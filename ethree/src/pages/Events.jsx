import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const ROOMS = [
    { id: 1, name: 'VIP Dining Suite', capacity: '10-15 People', price: 2000, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80' },
    { id: 2, name: 'Grand Function Hall', capacity: '50-100 People', price: 15000, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80' },
    { id: 3, name: 'Serenity Massage Zone', capacity: 'Per Person', price: 800, image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6eef34?auto=format&fit=crop&w=600&q=80' },
];

const Events = () => {
    const { addToCart, toggleCart } = useStore();
    const navigate = useNavigate();
    const [selectedRoom, setSelectedRoom] = useState(ROOMS[0].name);
    const [selectedDate, setSelectedDate] = useState('');
    const [booked, setBooked] = useState(false);

    const handleBook = (e) => {
        e.preventDefault();
        const room = ROOMS.find(r => r.name === selectedRoom);
        addToCart({
            id: `event-${room.id}`,
            name: `${room.name} Booking`,
            price: room.price,
            image: room.image,
            stall: 'Events',
            details: { date: selectedDate }
        });
        setBooked(true);
        setTimeout(() => {
            setBooked(false);
            toggleCart();
        }, 1000);
    };

    return (
        <div className="bg-creamy-white min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Info & Listing */}
                    <div>
                        <div className="mb-12">
                            <span className="text-sunset-orange font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Event Management</span>
                            <h1 className="text-5xl font-heading font-bold mb-6">Host Your Special<br /><span className="text-riverside-teal">Moments.</span></h1>
                            <p className="text-gray-500 text-lg">
                                From intimate family dinners to grand corporate gatherings, Ethree provides versatile spaces equipped with modern amenities and a stunning river view.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {ROOMS.map(room => (
                                <div key={room.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex gap-6 group hover:shadow-md transition-shadow">
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                                        <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-xl">{room.name}</h3>
                                            <span className="text-sunset-orange font-bold text-lg">₹{room.price}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">Capacity: {room.capacity}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-riverside-teal bg-teal-50 px-3 py-1 rounded-full w-fit">
                                            <CheckCircle2 size={14} /> Available for Booking
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Booking Form Container */}
                    <div className="sticky top-32">
                        <div className="bg-charcoal-grey text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-riverside-teal/20 blur-3xl rounded-full -mr-16 -mt-16" />

                            <h2 className="text-3xl font-heading font-bold mb-8">Booking Engine</h2>

                            <form onSubmit={handleBook} className="space-y-6">
                                <div>
                                    <select
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all"
                                    >
                                        {ROOMS.map(r => <option key={r.id} className="text-charcoal-grey" value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Expected Guests</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-sunset-orange hover:bg-opacity-90 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
                                    >
                                        {booked ? 'Submitting...' : 'Confirm Reservation'} <ArrowRight size={20} />
                                    </button>
                                </div>
                            </form>

                            <AnimatePresence>
                                {booked && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-6 p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-center"
                                    >
                                        <p className="font-bold text-green-400">Request Sent Successfully!</p>
                                        <p className="text-xs text-gray-400 mt-1">Our manager will call you within 24 hours.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-12 flex items-center gap-6 border-t border-white/10 pt-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-500 font-bold">Inquiries</span>
                                    <span className="text-sm font-bold tracking-widest">+91 70369 23456</span>
                                </div>
                                <div className="flex flex-col border-l border-white/10 pl-6">
                                    <span className="text-[10px] uppercase text-gray-500 font-bold">Support</span>
                                    <span className="text-sm font-bold tracking-widest">events@ethree.in</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Events;
