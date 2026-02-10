import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, User, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const EVENT_SPACE = {
    id: 1,
    name: 'Celebration Zone',
    capacity: '20-50 People',
    price: 1000, // Per Hour
    image: '/event%20place.webp',
    description: 'A versatile open space perfect for birthdays and casual parties.'
};

const Events = () => {
    const { addToCart, toggleCart, user, tickets } = useStore();
    const navigate = useNavigate();
    // Simplified to single space as per request, but keeping structure if expansion needed later
    const selectedRoom = EVENT_SPACE;

    const [selectedDate, setSelectedDate] = useState('');
    const [inputValue, setInputValue] = useState('');
    const dateInputRef = useRef(null);

    // Sync input value when selectedDate changes (e.g. from picker)
    useEffect(() => {
        if (selectedDate) {
            setInputValue(selectedDate.split('-').reverse().join('/'));
        }
    }, [selectedDate]);

    // Handle manual text input
    const handleDateInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        // Simple validation for dd/mm/yyyy
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = val.match(dateRegex);

        if (match) {
            const [_, day, month, year] = match;
            const isoDate = `${year}-${month}-${day}`;
            // Validate logical date (e.g. not 31/02)
            const dateObj = new Date(isoDate);
            if (!isNaN(dateObj.getTime())) {
                setSelectedDate(isoDate);
            }
        }
    };

    const [startTime, setStartTime] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [name, setName] = useState('');

    // Pre-fill name if user is logged in
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);
    const [booked, setBooked] = useState(false);
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [durationHours, setDurationHours] = useState(1);

    const [availabilityStatus, setAvailabilityStatus] = useState(null); // 'checking', 'available', 'unavailable'

    // Calculate price whenever duration changes
    useEffect(() => {
        setCalculatedPrice(durationHours > 0 ? durationHours * EVENT_SPACE.price : 0);
    }, [durationHours]);

    const calculateEndTime = (start, duration) => {
        if (!start || !duration) return '';
        const [h, m] = start.split(':').map(Number);
        const endH = (h + parseInt(duration)) % 24;
        return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const checkAvailability = async (e) => {
        if (e) e.preventDefault();

        if (!user) {
            alert('Please login to check availability and book events.');
            navigate('/login');
            return;
        }

        const endTime = calculateEndTime(startTime, durationHours);

        if (!selectedDate || !startTime || !endTime) {
            alert('Please select date, start time and duration');
            return;
        }

        setAvailabilityStatus('checking');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            // Using logic similar to defined structure, ensure consistent API usage
            const res = await fetch(`${API_URL}/api/bookings/check-availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    startTime,
                    endTime,
                    roomName: selectedRoom.name
                })
            });
            // Handle mock/real response
            if (res.ok) {
                const data = await res.json();
                if (data.available) {
                    setAvailabilityStatus('available');
                } else {
                    setAvailabilityStatus('unavailable');
                }
            } else {
                console.error("Availability check failed:", res.status);
                alert("Could not check availability. Please try again.");
                setAvailabilityStatus(null); // Reset to allow retry
            }
        } catch (err) {
            console.error("Network error checking availability:", err);
            alert("Network error. Please check your connection.");
            setAvailabilityStatus(null);
        }
    };

    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // Filter tickets for current user events
    const myEvents = user ? tickets.filter(t =>
        (!t.userMobile || t.userMobile === user.mobile) &&
        t.items.some(item =>
            (item.product && item.product.toString().startsWith('event-')) ||
            (item.id && item.id.toString().startsWith('event-')) ||
            item.stall === 'Events'
        )
    ) : [];

    const initiatePayment = async () => {
        setIsPaymentProcessing(true);
        const endTime = calculateEndTime(startTime, durationHours);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/payment/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: calculatedPrice,
                    firstname: name || user?.name?.split(' ')[0] || 'Guest',
                    email: user?.email || 'guest@example.com',
                    phone: user?.mobile || '9999999999',
                    productinfo: `Event Booking ${selectedRoom.name}`,
                    items: [{
                        id: `event-${selectedRoom.id}-${Date.now()}`,
                        name: `${selectedRoom.name} Booking`,
                        price: calculatedPrice,
                        quantity: 1,
                        image: selectedRoom.image,
                        stall: 'Events',
                        details: {
                            date: selectedDate,
                            startTime,
                            endTime,
                            guests: guestCount,
                            hours: durationHours
                        }
                    }]
                }),
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.payment_url;
            } else {
                alert('Payment Initiation Failed: ' + result.message);
                setIsPaymentProcessing(false);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert(`Payment Error: ${error.message}`);
            setIsPaymentProcessing(false);
        }
    };

    const handleBook = (e) => {
        e.preventDefault();
        if (availabilityStatus !== 'available') {
            checkAvailability();
            return;
        }

        if (calculatedPrice <= 0) {
            alert("Invalid duration");
            return;
        }

        initiatePayment();
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
                                <strong className="block mt-4 text-charcoal-grey">Note: Decoration and arrangements to be managed by the customer only.</strong>
                                <span className="text-sm rounded-md bg-yellow-100 px-2 py-1 text-yellow-800 font-bold mt-2 inline-block">
                                    Fixed Rate: ₹1000 / Hour
                                </span>
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-8 group">
                                    <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sunset-orange shadow-lg">
                                        ₹{selectedRoom.price}<span className="text-xs text-gray-500 font-normal">/hr</span>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-riverside-teal font-bold uppercase tracking-widest text-xs mb-1 block">Selected Space</span>
                                            <h3 className="font-heading font-bold text-3xl text-charcoal-grey">{selectedRoom.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                                            <User className="text-sunset-orange" size={20} />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacity</p>
                                                <p className="font-bold text-charcoal-grey">{selectedRoom.capacity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-teal-50 px-5 py-3 rounded-xl border border-teal-100 text-riverside-teal">
                                            <CheckCircle2 size={20} />
                                            <span className="font-bold text-sm">Hourly Parties & Birthdays</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 text-orange-800 text-sm">
                                        <Info className="shrink-0" size={20} />
                                        <p>
                                            <strong>Customer Policy:</strong> We provide only the space.
                                            Tables, chairs, decorations, cake, and specific arrangements must be handled by the customer.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* My Scheduled Events Section */}
                        {myEvents.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-2xl font-heading font-bold text-charcoal-grey mb-6">My Scheduled Events</h2>
                                <div className="space-y-4">
                                    {myEvents.map(ticket => (
                                        ticket.items.map((item, idx) => (
                                            <div key={`${ticket.id}-${idx}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-lg text-charcoal-grey">{item.name}</h3>
                                                    {item.details && (
                                                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} className="text-sunset-orange" />
                                                                <span>{item.details.date.split('-').reverse().join('/')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={14} className="text-riverside-teal" />
                                                                <span>
                                                                    {(() => {
                                                                        const format = (t) => {
                                                                            if (!t) return '';
                                                                            const [h, m] = t.split(':').map(Number);
                                                                            return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                                                                        };
                                                                        return `${format(item.details.startTime)} - ${format(item.details.endTime)}`;
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Confirmed</span>
                                                        <span className="text-xs text-gray-400">Order ID: {ticket.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Booking Form Container */}
                    <div className="sticky top-32">
                        <div className="bg-charcoal-grey text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden transition-transform hover:scale-[1.01] duration-700">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-riverside-teal/20 blur-3xl rounded-full -mr-16 -mt-16" />

                            <h2 className="text-3xl font-heading font-bold mb-2">Booking Engine</h2>
                            <p className="text-gray-400 text-sm mb-8">Book spaces for your limited-hour events.</p>

                            <form onSubmit={handleBook} className="space-y-6">
                                <div>
                                    <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            required
                                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Date</label>
                                        <div className="relative">
                                            <Calendar
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange z-20 cursor-pointer hover:text-orange-600 transition-colors"
                                                size={18}
                                                onClick={() => dateInputRef.current?.showPicker()}
                                            />
                                            {/* Visual Input (Editable) */}
                                            <input
                                                type="text"
                                                placeholder="dd/mm/yyyy"
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
                                                value={inputValue}
                                                onChange={handleDateInputChange}
                                            />
                                            {/* Hidden Date Input for Picker */}
                                            <input
                                                ref={dateInputRef}
                                                type="date"
                                                tabIndex={-1}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
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
                                                required
                                                min="1"
                                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none transition-all hover:bg-white/20"
                                                value={guestCount}
                                                onChange={(e) => setGuestCount(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
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
                                </div>

                                <div className="py-4 border-t border-white/10">
                                    <div className="flex justify-between items-center text-xl text-riverside-teal font-heading font-bold">
                                        <span>Price</span>
                                        <span>₹{calculatedPrice}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {availabilityStatus === 'unavailable' && (
                                        <p className="text-red-500 font-bold text-center">Slot Not Available. Please choose another time.</p>
                                    )}
                                    {availabilityStatus === 'available' && (
                                        <p className="text-green-500 font-bold text-center">Slot Available! Proceed to Book.</p>
                                    )}

                                    <button
                                        type="submit"
                                        onClick={availabilityStatus === 'available' ? handleBook : checkAvailability}
                                        disabled={availabilityStatus === 'checking' || isPaymentProcessing}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg ${availabilityStatus === 'available'
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : 'bg-sunset-orange hover:bg-opacity-90 text-white'
                                            }`}
                                    >
                                        {availabilityStatus === 'checking' ? 'Checking...' : (isPaymentProcessing ? 'Processing Payment...' : (availabilityStatus === 'available' ? 'Confirm & Book' : 'Check Availability'))} <ArrowRight size={20} />
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
