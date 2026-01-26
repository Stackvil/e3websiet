import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Users, Zap, Trophy, Filter, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

const ACTIVITIES = [
    {
        id: 1,
        title: 'Bumping Cars',
        price: 150,
        ageGroup: '7+ years',
        category: 'Action',
        image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
        desc: 'High-octane fun for kids and adults alike in our bumper car arena.'
    },
    {
        id: 2,
        title: 'Indoor Cricket',
        price: 500,
        ageGroup: 'Youth',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
        desc: 'Professional-grade indoor cricket pitches with high-speed simulators.'
    },
    {
        id: 3,
        title: 'Trampoline Zone',
        price: 200,
        ageGroup: 'Kids',
        category: 'Action',
        image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=600&q=80',
        desc: 'Anti-gravity world with giant trampolines and foam pits for ultimate fun.'
    },
    {
        id: 4,
        title: 'Circling Tower',
        price: 120,
        ageGroup: 'Kids',
        category: 'Rides',
        image: 'https://images.unsplash.com/photo-1533740566848-5f7d3e04e3d7?auto=format&fit=crop&w=600&q=80',
        desc: 'Panoramic views of the Krishna river from our safe and exciting circling tower.'
    },
    {
        id: 5,
        title: 'Arcade Arena',
        price: 'Coin-based',
        ageGroup: 'All Ages',
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
        desc: 'Modern VR games and classic arcades for every gamer.'
    }
];

const Play = () => {
    const { addToCart } = useStore();
    const [filter, setFilter] = useState('All');

    const filteredActivities = filter === 'All'
        ? ACTIVITIES
        : ACTIVITIES.filter(a => a.ageGroup.includes(filter) || a.category === filter);

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
                            className={`px-6 py-2 rounded-full font-bold transition-all ${filter === f
                                ? 'bg-sunset-orange text-white shadow-lg'
                                : 'bg-white text-charcoal-grey hover:border-sunset-orange border border-gray-100'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Activities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredActivities.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-50 flex flex-col hover:shadow-xl transition-shadow group"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img src={activity.image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-riverside-teal">
                                        {typeof activity.price === 'number' ? `₹${activity.price}` : activity.price}
                                    </div>
                                </div>
                                <div className="p-8 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sunset-orange font-bold uppercase text-xs tracking-widest">{activity.category}</span>
                                        <span className="text-gray-400 text-xs font-bold">{activity.ageGroup}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{activity.title}</h3>
                                    <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">{activity.desc}</p>
                                    <button
                                        onClick={() => addToCart({
                                            id: `play-${activity.id}`,
                                            name: activity.title,
                                            price: typeof activity.price === 'number' ? activity.price : 0,
                                            image: activity.image,
                                            stall: activity.category
                                        })}
                                        className="flex items-center justify-between w-full btn-orange"
                                    >
                                        Book Ticket <Ticket size={18} />
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
