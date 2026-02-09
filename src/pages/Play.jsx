import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Users, Zap, Trophy, Filter, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import localProducts from '../data/products.json';

const Play = () => {
    const { addToCart } = useStore();
    const [filter, setFilter] = useState('All');
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        setLoading(true);
        setError(null);
        let data = [];
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/products`);
            if (!res.ok) throw new Error('Failed to fetch data');
            data = await res.json();
        } catch (err) {
            console.error("Failed to fetch activities, using fallback", err);
            data = localProducts;
        } finally {
            if (data && data.length > 0) {
                const playItems = data.filter(item => item.category === 'play');
                setActivities(playItems);
            } else {
                setError("Failed to load rides. Please ensure the server is running.");
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const filteredActivities = filter === 'All'
        ? activities
        : activities.filter(a => (a.ageGroup && a.ageGroup.includes(filter)) || a.stall === filter || a.category === filter);

    if (loading) {
        return <div className="min-h-screen pt-24 pb-12 flex justify-center items-center"><div className="text-xl font-bold text-riverside-teal animate-pulse">Loading Fun...</div></div>;
    }

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
                        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Play & Entertainment</h1>
                        <p className="text-lg opacity-90 mb-8">
                            From the adrenaline rush of bumping cars to the focused energy of indoor cricket, Ethree offers a state-of-the-art recreation zone for all ages.
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
                                    <img src={activity.image} alt={activity.name || activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md font-black text-riverside-teal text-[10px] shadow-sm">
                                        {typeof activity.price === 'number' ? `₹${activity.price}` : activity.price}
                                    </div>
                                    {activity.status === 'closed' && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                            <p className="text-white font-bold bg-red-500/80 px-2 py-1 rounded text-[10px] transform -rotate-12 border border-red-400">CLOSED</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sunset-orange font-bold uppercase text-[8px] tracking-widest">{activity.stall || activity.category}</span>
                                        <span className="text-gray-400 text-[8px] font-bold">{activity.ageGroup}</span>
                                    </div>
                                    <h3 className="text-xs font-bold mb-1 truncate group-hover:text-riverside-teal transition-colors">{activity.name || activity.title}</h3>
                                    {activity.isCombo && <p className="text-[10px] text-riverside-teal font-bold mb-2">Any 5 Rides</p>}
                                    <button
                                        disabled={activity.status === 'closed'}
                                        onClick={() => addToCart({
                                            id: `play-${activity._id || activity.id}`,
                                            name: activity.name || activity.title,
                                            price: typeof activity.price === 'number' ? activity.price : 0,
                                            image: activity.image,
                                            stall: activity.stall || activity.category
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
