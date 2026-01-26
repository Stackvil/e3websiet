import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ShoppingCart, Clock, Filter, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';

const STALLS = [
    { id: 'all', name: 'All Stalls', category: 'all' },
    { id: 'north', name: 'North Indian', category: 'North Indian' },
    { id: 'arabian', name: 'Arabian', category: 'Arabian' },
    { id: 'chinese', name: 'Oriental', category: 'Chinese' },
    { id: 'south', name: 'Tiffins', category: 'South Indian' },
];

const MENU_DATA = [
    { id: 101, name: 'Darbar Mandi Special', price: 450, category: 'Arabian', stall: 'Darbar Mandi', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=400&q=80', open: true },
    { id: 102, name: 'Wow! Chicken Momo', price: 190, category: 'Chinese', stall: 'Wow! Momo', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=400&q=80', open: true },
    { id: 103, name: 'Smoked Butter Chicken', price: 320, category: 'North Indian', stall: 'The Food Jail', image: 'https://images.unsplash.com/photo-1603894584214-5da0a4-d13deed9?auto=format&fit=crop&w=400&q=80', open: true },
    { id: 104, name: 'Guntur Karam Dosa', price: 110, category: 'South Indian', stall: 'Ethree Tiffins', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80', open: true },
    { id: 105, name: 'Premium Malai Kulfi', price: 150, category: 'Dessert', stall: 'Dumont E3', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80', open: true },
    { id: 106, name: 'Apollo Spicy Fish', price: 340, category: 'North Indian', stall: "Pub'Gs", image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80', open: false },
];

const Dine = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { addToCart, cart, toggleCart } = useStore();

    const filteredItems = MENU_DATA.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.stall.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-creamy-white min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6">
                {/* Header Area */}
                <div className="bg-white p-8 rounded-3xl shadow-sm mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-gray-100">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-charcoal-grey mb-2 uppercase">Culinary Court</h1>
                        <p className="text-gray-500">Discover Vijayawada's first open-air multi-vendor experience.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-grow md:max-w-xl">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search stalls or dishes..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-sunset-orange transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-charcoal-grey text-white px-6 py-3 rounded-xl font-bold">
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                </div>

                {/* Categories / Stalls */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-12 no-scrollbar">
                    {STALLS.map(stall => (
                        <button
                            key={stall.id}
                            onClick={() => setActiveCategory(stall.category)}
                            className={`px-8 py-3 rounded-full whitespace-nowrap transition-all font-bold ${(activeCategory === stall.category)
                                    ? 'bg-riverside-teal text-white shadow-lg'
                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-riverside-teal'
                                }`}
                        >
                            {stall.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 group relative"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${item.open ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                                            }`}>
                                            {item.open ? 'Open Now' : 'Closed'}
                                        </span>
                                    </div>
                                    {!item.open && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                            <p className="text-white font-bold bg-charcoal-grey/80 px-6 py-2 rounded-lg">Coming back at 9 AM</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-riverside-teal font-bold uppercase text-[10px] tracking-widest">{item.stall}</span>
                                            <h3 className="text-2xl font-bold mt-1">{item.name}</h3>
                                        </div>
                                        <span className="text-2xl font-heading font-bold text-sunset-orange">₹{item.price}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Experience authentic {item.category} culinary expertise in every bite.</p>

                                    <button
                                        disabled={!item.open}
                                        onClick={() => addToCart(item)}
                                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${item.open
                                                ? 'btn-orange'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Plus size={20} /> Add to Cart
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Cart Button (Mobile) */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-24 right-6 z-40 lg:hidden"
                    >
                        <button
                            onClick={toggleCart}
                            className="bg-sunset-orange text-white p-6 rounded-full shadow-2xl relative"
                        >
                            <ShoppingBag size={32} />
                            <span className="absolute top-0 right-0 bg-white text-sunset-orange w-8 h-8 rounded-full flex items-center justify-center font-black border-4 border-sunset-orange">
                                {cartCount}
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dine;
