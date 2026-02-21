import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight, User, Info, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { formatTime12h } from '../utils/timeUtils';

const EVENT_SPACE = {
    id: 1,
    name: 'Celebration Zone',
    capacity: '20–50 People',
    price: 1000,
    image: '/event%20place.webp',
    description: 'A versatile open space perfect for birthdays and casual parties.'
};

// ── Slot Cell ─────────────────────────────────────────────────────────────────
const SlotCell = ({ slot, selected, onSelect }) => {
    const isAvailable = slot.status === 'available';
    const isBooked = slot.status === 'booked';
    const isPast = slot.status === 'past';
    const isSelected = selected;

    let cls = 'relative rounded-xl border-2 px-3 py-2.5 text-center text-xs font-bold transition-all duration-200 select-none ';
    if (isSelected) cls += 'bg-riverside-teal border-riverside-teal text-white scale-105 shadow-lg shadow-riverside-teal/30 ';
    else if (isBooked) cls += 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed ';
    else if (isPast) cls += 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed ';
    else cls += 'bg-green-50 border-green-200 text-green-700 hover:bg-green-500 hover:text-white hover:border-green-500 cursor-pointer hover:scale-105 ';

    const label12 = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${ampm}`;
    };

    return (
        <motion.button
            type="button"
            whileTap={isAvailable ? { scale: 0.95 } : {}}
            onClick={() => isAvailable && onSelect(slot)}
            className={cls}
            title={isBooked ? 'Already booked' : isPast ? 'Slot passed' : `Book ${slot.label}`}
        >
            <span className="block leading-tight">{label12(slot.startTime)}</span>
            {isBooked && <span className="block text-[9px] font-normal mt-0.5 opacity-70">Booked</span>}
            {isPast && <span className="block text-[9px] font-normal mt-0.5 opacity-50">Past</span>}
            {isAvailable && !isSelected && <span className="block text-[9px] font-normal mt-0.5 opacity-70">₹1,000</span>}
            {isSelected && <span className="block text-[9px] font-normal mt-0.5">Selected ✓</span>}
        </motion.button>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Events = ({ location = 'E3' }) => {
    const { user, tickets } = useStore();
    const navigate = useNavigate();

    const [selectedRoom, setSelectedRoom] = useState(EVENT_SPACE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/events?location=${location}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) setSelectedRoom(data[0]);
                }
            } catch { /* use fallback */ } finally { setLoading(false); }
        };
        fetchEvents();
    }, [location]);

    // ── Date & Slot state ─────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [inputValue, setInputValue] = useState(today.split('-').reverse().join('/'));
    const dateInputRef = useRef(null);

    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // ── Booking form state ────────────────────────────────────────────────────
    const [name, setName] = useState(user?.name || '');
    const [guestCount, setGuestCount] = useState('');
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => { if (user?.name) setName(user.name); }, [user]);

    // Sync text input display
    useEffect(() => {
        if (selectedDate) setInputValue(selectedDate.split('-').reverse().join('/'));
        setSelectedSlot(null); // reset slot on date change
    }, [selectedDate]);

    const handleDateInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match) {
            const [_, d, m, y] = match;
            const iso = `${y}-${m}-${d}`;
            if (!isNaN(new Date(iso).getTime())) setSelectedDate(iso);
        }
    };

    // ── Fetch slots whenever date or location changes ─────────────────────────
    const fetchSlots = useCallback(async (date) => {
        if (!date) return;
        setSlotsLoading(true);
        setSlots([]);
        try {
            const res = await fetch(`${API_URL}/bookings/slots?location=${location.toLowerCase()}&date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setSlots(data.slots || []);
            }
        } catch {
            // fallback: generate client-side dummy
            const dummy = [];
            for (let h = 9; h < 22; h++) {
                const pad = n => String(n).padStart(2, '0');
                dummy.push({
                    hour: h, startTime: `${pad(h)}:00`, endTime: `${pad(h + 1)}:00`,
                    label: `${pad(h)}:00 – ${pad(h + 1)}:00`,
                    status: [10, 13, 17].includes(h) ? 'booked' : 'available', price: 1000
                });
            }
            setSlots(dummy);
        } finally { setSlotsLoading(false); }
    }, [location]);

    useEffect(() => { fetchSlots(selectedDate); }, [selectedDate, fetchSlots]);

    // ── Legend counts ─────────────────────────────────────────────────────────
    const available = slots.filter(s => s.status === 'available').length;
    const booked = slots.filter(s => s.status === 'booked').length;

    // ── Payment ───────────────────────────────────────────────────────────────
    const initiatePayment = async () => {
        setIsPaymentProcessing(true);
        setBookingError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/orders/${location.toLowerCase()}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    location,
                    items: [{
                        id: selectedRoom?._id || `event-${Date.now()}`,
                        product: selectedRoom?._id,
                        name: `${selectedRoom?.name} Booking`,
                        price: 1000,
                        quantity: 1,
                        image: selectedRoom?.image,
                        details: { date: selectedDate, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, guests: guestCount, hours: 1 }
                    }]
                }),
            });
            const result = await response.json();
            if (result.success && result.access_key) {
                if (result.mode === 'iframe' && window.EasebuzzCheckout) {
                    const eb = new window.EasebuzzCheckout(result.key, result.env);
                    eb.initiatePayment({
                        access_key: result.access_key, onResponse: (r) => {
                            window.location.href = r.status === 'success'
                                ? `/success?orderId=${result.txnid}&location=${location}`
                                : `/failed?orderId=${result.txnid}&location=${location}`;
                        }
                    });
                } else { window.location.href = result.payment_url; }
            } else {
                setBookingError(result.message || 'Payment initiation failed. Try again.');
                setIsPaymentProcessing(false);
            }
        } catch (err) {
            setBookingError(err.message);
            setIsPaymentProcessing(false);
        }
    };

    const handleBook = (e) => {
        e.preventDefault();
        setBookingError('');
        if (!user) { navigate(location === 'E4' ? '/e4/login' : '/login'); return; }
        if (!selectedSlot) { setBookingError('Please select a time slot first.'); return; }
        if (!guestCount) { setBookingError('Please enter expected guest count.'); return; }
        initiatePayment();
    };

    // ── My past bookings ──────────────────────────────────────────────────────
    const myEvents = user ? tickets.filter(t =>
        (!t.userMobile || t.userMobile === user.mobile) &&
        t.items?.some(i => (i.id || '').toString().startsWith('event-') || i.stall === 'Events')
    ) : [];

    return (
        <div className="bg-creamy-white min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-14 items-start">

                    {/* ── Left: Info + Slot Picker ─────────────────────────── */}
                    <div>
                        {/* Header */}
                        <div className="mb-10">
                            <span className="text-sunset-orange font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
                                {location} · Event Space
                            </span>
                            <h1 className="text-5xl font-heading font-bold mb-4">
                                Host Your Special<br />
                                <span className="text-riverside-teal">Moments.</span>
                            </h1>
                            <p className="text-gray-500">
                                Book the venue by the hour. Decoration & arrangements must be handled by the customer.
                            </p>
                            <span className="mt-4 inline-block bg-yellow-100 text-yellow-800 font-bold text-sm px-3 py-1.5 rounded-lg border border-yellow-200">
                                ₹1,000 / Hour · Fixed Rate
                            </span>
                        </div>

                        {/* Space card */}
                        {selectedRoom && (
                            <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-10">
                                <div className="relative h-64 rounded-[2rem] overflow-hidden mb-6 group">
                                    <img
                                        src="/event place.webp"
                                        alt={selectedRoom.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sunset-orange shadow-lg">
                                        ₹1,000<span className="text-xs text-gray-500 font-normal">/hr</span>
                                    </div>
                                </div>
                                <div className="px-3 pb-2 space-y-3">
                                    <h3 className="font-heading font-bold text-2xl text-charcoal-grey">{selectedRoom.name}</h3>
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-sm">
                                            <User className="text-sunset-orange" size={16} />
                                            <span className="font-bold text-charcoal-grey">{selectedRoom.capacity || '20–50 People'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 text-riverside-teal text-sm">
                                            <CheckCircle2 size={16} />
                                            <span className="font-bold">Parties & Birthdays</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex gap-2 text-orange-800 text-xs">
                                        <Info className="shrink-0 mt-0.5" size={14} />
                                        <p><strong>Customer Policy:</strong> We provide the space only. Tables, chairs, decor & cake must be managed by you.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Slot Availability Grid ─── */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            {/* Date picker row */}
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-heading font-bold text-lg text-charcoal-grey">Available Slots</h2>
                                <div className="relative flex items-center gap-2">
                                    <Calendar className="absolute left-3 text-sunset-orange z-10" size={16} onClick={() => dateInputRef.current?.showPicker()} />
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={inputValue}
                                        onChange={handleDateInputChange}
                                        className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-riverside-teal/30 w-34"
                                    />
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        min={today}
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="absolute opacity-0 pointer-events-none w-0 h-0"
                                        tabIndex={-1}
                                    />
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 mb-4 text-xs font-bold">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 border border-green-400 inline-block" /> Available ({available})</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Booked ({booked})</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-riverside-teal inline-block" /> Selected</span>
                            </div>

                            {/* Grid */}
                            {slotsLoading ? (
                                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span className="text-sm font-medium">Loading slots…</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {slots.map(slot => (
                                        <SlotCell
                                            key={slot.hour}
                                            slot={slot}
                                            selected={selectedSlot?.hour === slot.hour}
                                            onSelect={setSelectedSlot}
                                        />
                                    ))}
                                </div>
                            )}

                            {selectedSlot && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between"
                                >
                                    <div className="text-sm font-bold text-riverside-teal">
                                        ✓ Selected: {selectedSlot.label}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSlot(null)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* My scheduled events */}
                        {myEvents.length > 0 && (
                            <div className="mt-10">
                                <h2 className="text-2xl font-heading font-bold text-charcoal-grey mb-4">My Bookings</h2>
                                <div className="space-y-3">
                                    {myEvents.map(ticket =>
                                        ticket.items?.map((item, idx) => (
                                            <div key={`${ticket.id}-${idx}`} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-charcoal-grey">{item.name}</h3>
                                                    {item.details && (
                                                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                            <span className="flex items-center gap-1"><Calendar size={13} className="text-sunset-orange" />{item.details.date?.split('-').reverse().join('/')}</span>
                                                            <span className="flex items-center gap-1"><Clock size={13} className="text-riverside-teal" />{formatTime12h(item.details.startTime)} – {formatTime12h(item.details.endTime)}</span>
                                                        </div>
                                                    )}
                                                    <span className="mt-2 inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Confirmed</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Booking Form ──────────────────────────────── */}
                    <div className="sticky top-32">
                        <div className="bg-charcoal-grey text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-riverside-teal/20 blur-3xl rounded-full -mr-16 -mt-16" />

                            <h2 className="text-3xl font-heading font-bold mb-1">Booking Engine</h2>
                            <p className="text-gray-400 text-sm mb-8">Select a slot on the left, fill in your details, and confirm.</p>

                            {/* Selected slot summary */}
                            <AnimatePresence>
                                {selectedSlot ? (
                                    <motion.div
                                        key="slot-selected"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="mb-6 p-4 bg-riverside-teal/20 border border-riverside-teal/40 rounded-2xl"
                                    >
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Selected Slot</p>
                                        <div className="flex items-center gap-3">
                                            <Clock size={20} className="text-riverside-teal" />
                                            <div>
                                                <p className="font-black text-lg text-white">{selectedSlot.label}</p>
                                                <p className="text-xs text-gray-400">{selectedDate.split('-').reverse().join('/')} · 1 hour</p>
                                            </div>
                                            <span className="ml-auto font-black text-riverside-teal text-xl">₹1,000</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="slot-empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-gray-400 text-sm"
                                    >
                                        ← Pick a green slot from the calendar
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleBook} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Your Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            required
                                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none hover:bg-white/20 transition-all"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Guest count */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Expected Guests</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sunset-orange" size={18} />
                                        <input
                                            type="number"
                                            placeholder="e.g. 25"
                                            required
                                            min="1"
                                            max="50"
                                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-sunset-orange outline-none hover:bg-white/20 transition-all"
                                            value={guestCount}
                                            onChange={e => setGuestCount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Price summary */}
                                <div className="py-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-gray-400 font-medium">Total</span>
                                    <span className="text-2xl font-black text-riverside-teal">
                                        {selectedSlot ? '₹1,000' : '—'}
                                    </span>
                                </div>

                                {bookingError && (
                                    <p className="text-red-400 text-sm font-bold text-center">{bookingError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={!selectedSlot || isPaymentProcessing}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg
                                        ${selectedSlot && !isPaymentProcessing
                                            ? 'bg-sunset-orange hover:bg-orange-500 text-white hover:scale-105 active:scale-95'
                                            : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {isPaymentProcessing
                                        ? <><Loader2 size={20} className="animate-spin" /> Processing…</>
                                        : <>{selectedSlot ? 'Confirm & Pay ₹1,000' : 'Select a Slot First'} <ArrowRight size={20} /></>}
                                </button>
                            </form>

                            <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-500 font-bold">Inquiries</span>
                                    <span className="text-sm font-bold tracking-widest">+91 70369 23456</span>
                                </div>
                                <div className="flex flex-col border-l border-white/10 pl-6">
                                    <span className="text-[10px] uppercase text-gray-500 font-bold">Support</span>
                                    <span className="text-sm font-bold tracking-widest">events@jaanentertainment.in</span>
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
