import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Users, Zap, Trophy, Filter, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export const ACTIVITIES = [
    {
        id: 1,
        title: 'Bumping Cars',
        price: 150,
        ageGroup: '7+ years',
        category: 'Action',
        image: '/bumping%20cars%20single/IMG_8417.jpg',
        desc: 'High-octane fun for kids and adults alike in our bumping car arena.'
    },
    {
        id: 2,
        title: 'Trampoline Zone',
        price: 200,
        ageGroup: 'Kids',
        category: 'Action',
        image: '/trampoline/trampoline.webp',
        desc: 'Anti-gravity world with giant trampolines and foam pits for ultimate fun.'
    },
    {
        id: 3,
        title: '360 Cycle',
        price: 120,
        ageGroup: 'Kids',
        category: 'Rides',
        image: '/360%20cycle/360-degree-cycle-500x500.webp',
        desc: 'Experience the thrill of cycling in a full 360-degree loop.'
    },
    {
        id: 4,
        title: 'Columbus Mini',
        price: 150,
        ageGroup: 'Kids',
        category: 'Rides',
        image: '/columbus%20mini/IMG_8407.jpg',
        desc: 'A mini version of the classic swinging ship ride for little adventurers.'
    },
    {
        id: 5,
        title: 'Joker Ride',
        price: 120,
        ageGroup: 'Kids',
        category: 'Rides',
        image: '/joker%20ride/IMG_8400.jpg',
        desc: 'A fun and colorful ride that brings smiles to every face.'
    },
    {
        id: 6,
        title: 'Free Fall',
        price: 200,
        ageGroup: 'Youth',
        category: 'Adventure',
        image: '/free%20fall/IMG_8381.jpg',
        desc: 'Experience the adrenaline rush of a sudden drop in safety.'
    },
    {
        id: 7,
        title: 'Sun & Moon',
        price: 150,
        ageGroup: 'Family',
        category: 'Rides',
        image: '/sun%20&%20moon/IMG_8389.jpg',
        desc: 'A delightful ride for the whole family to enjoy together.'
    },
    {
        id: 8,
        title: 'Train Ride',
        price: 100,
        ageGroup: 'All Ages',
        category: 'Rides',
        image: '/train%20ticket/IMG_8410.jpg',
        desc: 'All aboard! A scenic train journey around the park.'
    },
    {
        id: 9,
        title: 'Kids Soft Play',
        price: 250,
        ageGroup: 'Toddlers',
        category: 'Kids',
        image: '/soft%20play/WhatsApp_Image_2025-06-14_at_4.04.53_PM.jpeg',
        desc: 'Safe and soft play area designed specifically for little ones.'
    },
    {
        id: 10,
        title: 'Bull Ride',
        price: 100,
        ageGroup: '10+',
        category: 'Rides',
        image: '/bull%20ride/IMG_8384.jpg',
        desc: 'Hold on tight and test your balance on the mechanical bull.'
    },
    {
        id: 11,
        title: 'Balloon Shooting',
        price: 150,
        ageGroup: '10+',
        category: 'Action',
        image: '/baloon%20shooting/IMG_8435.jpg',
        desc: 'Test your aim and precision at our shooting range.'
    },
    {
        id: 12,
        title: 'Bungee Jump',
        price: 200,
        ageGroup: '8+',
        category: 'Adventure',
        image: '/Bungee%20jump/bungee-jumping-trampoline.jpeg',
        desc: 'Jump high and flip safely on our bungee trampolines.'
    },
    {
        id: 13,
        title: 'Paddle Boat',
        price: 150,
        ageGroup: 'Kids',
        category: 'Rides',
        image: '/paddle%20boat/paddle-boat.webp',
        desc: 'Gentle boating fun on the water for kids.'
    },
    {
        id: 14,
        title: 'Mini Wheel',
        price: 250,
        ageGroup: 'All Ages',
        category: 'Rides',
        image: '/mini%20wheel%20ride/1.avif',
        desc: 'Classic views from the top of our mini ferris wheel.'
    },
    {
        id: 15,
        title: 'Bouncy Castle',
        price: 150,
        ageGroup: 'Kids',
        category: 'Kids',
        image: '/bouncy/WhatsApp_Image_2025-06-14_at_4.02.45_PM.jpeg',
        desc: 'Jump, bounce, and play in our colorful inflatable castle.'
    },
    {
        id: 16,
        title: 'Basket Ball',
        price: 100,
        ageGroup: 'All Ages',
        category: 'Sports',
        image: '/basket%20ball/images.jpg',
        desc: 'Shoot some hoops and challenge your friends.'
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredActivities.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50 flex flex-col hover:shadow-xl transition-shadow group"
                            >
                                <div className="h-24 overflow-hidden relative">
                                    <img src={activity.image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md font-black text-riverside-teal text-[10px]">
                                        {typeof activity.price === 'number' ? `₹${activity.price}` : activity.price}
                                    </div>
                                </div>
                                <div className="p-2 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sunset-orange font-bold uppercase text-[8px] tracking-widest">{activity.category}</span>
                                        <span className="text-gray-400 text-[8px] font-bold">{activity.ageGroup}</span>
                                    </div>
                                    <h3 className="text-xs font-bold mb-2 truncate">{activity.title}</h3>
                                    <button
                                        onClick={() => addToCart({
                                            id: `play-${activity.id}`,
                                            name: activity.title,
                                            price: typeof activity.price === 'number' ? activity.price : 0,
                                            image: activity.image,
                                            stall: activity.category
                                        })}
                                        className="flex items-center justify-between w-full btn-orange text-[10px] py-1 px-2 rounded-md"
                                    >
                                        Book <Ticket size={12} />
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
