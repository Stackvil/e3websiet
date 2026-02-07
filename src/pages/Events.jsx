import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, User, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [booked, setBooked] = useState(false);

    const nextRoom = () => {
        const currentIndex = ROOMS.findIndex(r => r.name === selectedRoom);
        const next = ROOMS[(currentIndex + 1) % ROOMS.length];
        setSelectedRoom(next.name);
    };

    const prevRoom = () => {
        const currentIndex = ROOMS.findIndex(r => r.name === selectedRoom);
        const prev = ROOMS[(currentIndex - 1 + ROOMS.length) % ROOMS.length];
        setSelectedRoom(prev.name);
    };

    const handleBook = (e) => {
        e.preventDefault();
        const room = ROOMS.find(r => r.name === selectedRoom);
        addToCart({
            id: `event-${room.id}`,
            name: `${room.name} Booking`,
            price: room.price,
            image: room.image,
            stall: 'Events',
            details: { date: selectedDate, startTime, endTime }
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
                                <br /><span className="text-sm font-bold text-sunset-orange mt-2 block">Now available for hourly bookings for birthdays and parties!</span>
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {ROOMS.filter(r => r.name === selectedRoom).map(room => (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-8 group">
                                            <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sunset-orange shadow-lg">
                                                ₹{room.price}<span className="text-xs text-gray-500 font-normal">/hr</span>
                                            </div>

                                            {/* Navigation Arrows */}
                                            <div className="absolute inset-0 flex justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); prevRoom(); }}
                                                    className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-sunset-orange transition-colors"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); nextRoom(); }}
                                                    className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-sunset-orange transition-colors"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-riverside-teal font-bold uppercase tracking-widest text-xs mb-1 block">Selected Space</span>
                                                    <h3 className="font-heading font-bold text-3xl text-charcoal-grey">{room.name}</h3>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 border-t border-gray-100 pt-6">
                                                <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                                                    <User className="text-sunset-orange" size={20} />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacity</p>
                                                        <p className="font-bold text-charcoal-grey">{room.capacity}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-teal-50 px-5 py-3 rounded-xl border border-teal-100 text-riverside-teal">
                                                    <CheckCircle2 size={20} />
                                                    <span className="font-bold text-sm">Available for Hourly Booking</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-500 leading-relaxed pt-2">
                                                Perfect for birthdays, get-togethers, and special celebrations.
                                                Book this space instantly by filling out the form.
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Booking Form Container */}
                    <div className="sticky top-32">
                        <div className="bg-charcoal-grey text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-transform hover:scale-[1.01] duration-700">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-riverside-teal/20 blur-3xl rounded-full -mr-16 -mt-16" />

                            <h2 className="text-3xl font-heading font-bold mb-2">Booking Engine</h2>
                            <p className="text-gray-400 text-sm mb-8">Book spaces for your limited-hour events.</p>

                            <form onSubmit={handleBook} className="space-y-6">

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
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
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Start Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                            <input
                                                type="time"
                                                required
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">End Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                            <input
                                                type="time"
                                                required
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-sunset-orange hover:bg-opacity-90 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
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
