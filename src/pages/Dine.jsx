import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ShoppingCart, Clock, Filter, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';





const Dine = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const { addToCart, cart, toggleCart } = useStore();

    useEffect(() => {
        const fetchDineItems = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/products');
                const data = await res.json();
                // Filter for dine items and fallback to local category if cuisine is missing (for legacy or mixed data)
                const dineItems = data.filter(item => item.category === 'dine' || item.category === 'food');
                setMenuItems(dineItems);
            } catch (err) {
                console.error("Failed to fetch dine items", err);
            }
        };
        fetchDineItems();
    }, []);

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.stall && item.stall.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-creamy-white min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6">


                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-charcoal-grey">Dine & Delight</h1>
                        <p className="text-gray-500">Explore the best food stalls at Ethree</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search stalls..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-riverside-teal"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>



                {/* Menu Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item._id || item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-700" />
                                    {!item.open && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                            <p className="text-white font-bold bg-charcoal-grey/80 px-3 py-1 rounded text-xs">Closed</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3">
                                    <div className="mb-2">
                                        <h3 className="text-sm font-bold leading-tight truncate text-charcoal-grey">{item.stall}</h3>
                                        <p className="text-gray-400 text-[10px] leading-tight line-clamp-1">{item.cuisine || item.category} Cuisine</p>
                                    </div>

                                    <button
                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs bg-gray-100 text-charcoal-grey hover:bg-sunset-orange hover:text-white transition-all"
                                    >
                                        View Menu
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
