import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Users, Zap, Trophy, Filter, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import localProducts from '../data/products.json';
import { API_URL } from '../config/api';

const ComboSlideshow = ({ images, name }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 2500); // Change image every 2.5 seconds
        return () => clearInterval(interval);
    }, [images]);

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full h-full relative">
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={index}
                    src={images[index]}
                    alt={`${name} ${index + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>
        </div>
    );
};

const Play = () => {
    const [filter, setFilter] = useState('All');
    const { addToCart, rideItems, setRideItems } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        // Only show loader if we have NO data to show
        if (!rideItems || rideItems.length === 0) {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await fetch(`${API_URL}/e3/rides?all=true`);
            if (res.ok) {
                const apiData = await res.json();
                if (Array.isArray(apiData)) {
                    setRideItems(apiData); // Update global cache, triggers re-render
                }
            } else {
                setError("Failed to load rides from server.");
            }
        } catch (err) {
            console.error("Failed to fetch E3 rides:", err);
            setError("Failed to fetch rides. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setRideItems]);

    const filteredActivities = (filter === 'All'
        ? (rideItems || [])
        : (rideItems || []).filter(a => (a.ageGroup && a.ageGroup.includes(filter)) || a.stall === filter || a.type === filter || a.category === filter)
    )
        .filter(a => a.status !== 'closed'); // Hide closed rides, but show offline ones


    // Removed full-page loading state


    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center gap-4">
                <div className="text-xl font-bold text-red-500">{error}</div>
                <button
                    onClick={fetchActivities}
                    className="px-6 py-2 bg-sunset-orange text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-creamy-white min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 font-body">
                {/* Play Header */}
                <section className="bg-riverside-teal text-white p-12 rounded-[3rem] mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-sunset-orange font-bold uppercase tracking-widest text-sm mb-4 block">Thrill & Adventure</span>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 flex items-center gap-4">
                            Play & Entertainment
                            {loading && <div className="w-8 h-8 border-4 border-sunset-orange border-t-transparent rounded-full animate-spin"></div>}
                        </h1>
                        <p className="text-lg opacity-90 mb-8">
                            From the adrenaline rush of bumping cars to the focused energy of indoor cricket, E3 Entertainment offers a state-of-the-art recreation zone for all ages.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md">
                                <Users size={18} /> Family Friendly
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md">
                                <Trophy size={18} /> Competitive Sports
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-12">
                    {['All', 'Action', 'Sports', 'Rides', 'Gaming', 'Kids', 'Youth'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${filter === f
                                ? 'bg-sunset-orange text-white shadow-lg'
                                : 'bg-white text-charcoal-grey hover:border-sunset-orange border border-gray-100 hover:shadow-md'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Activities Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredActivities.map((activity, i) => (
                            <motion.div
                                key={activity._id || activity.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50 flex flex-col hover:shadow-2xl hover:shadow-riverside-teal/10 hover:-translate-y-2 hover:border-riverside-teal/30 transition-all duration-500 group"
                            >
                                <div className="h-24 overflow-hidden relative">
                                    {activity.images && activity.images.length > 0 ? (
                                        <ComboSlideshow images={activity.images} name={activity.name} />
                                    ) : (
                                        <img src={activity.image} alt={activity.name || activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    )}
                                    <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md font-black text-riverside-teal text-[10px] shadow-sm z-10">
                                        {typeof activity.price === 'number' ? `₹${activity.price}` : activity.price}
                                    </div>
                                    {activity.status === 'closed' && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                                            <p className="text-white font-bold bg-red-500/80 px-2 py-1 rounded text-[10px] transform -rotate-12 border border-red-400">CLOSED</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sunset-orange font-bold uppercase text-[8px] tracking-widest">{activity.stall || activity.type || activity.category}</span>
                                        <span className="text-gray-400 text-[8px] font-bold">{activity.ageGroup}</span>
                                    </div>
                                    <h3 className="text-xs font-bold mb-1 truncate group-hover:text-riverside-teal transition-colors">{activity.name || activity.title}</h3>
                                    {activity.isCombo && (
                                        <div className="mb-2 inline-block px-2 py-0.5 bg-riverside-teal/90 border-2 border-white rounded-md shadow-md">
                                            <p className="text-[9px] text-white font-black text-center whitespace-nowrap uppercase tracking-wide">
                                                Any {activity.rideCount || 5} Rides
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        disabled={activity.status === 'closed'}
                                        onClick={() => addToCart({
                                            id: `play-${activity._id || activity.id}`,
                                            name: activity.name || activity.title,
                                            price: typeof activity.price === 'number' ? activity.price : 0,
                                            image: activity.image,
                                            stall: activity.stall || activity.type || activity.category,
                                            isCombo: activity.isCombo,
                                            count: activity.rideCount
                                        })}
                                        className={`flex items-center justify-between w-full text-[10px] py-1 px-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${activity.status === 'closed'
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'btn-orange hover:shadow-lg'
                                            }`}
                                    >
                                        {activity.status === 'closed' ? 'Closed' : 'Book'} <Ticket size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Play;
