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
    { id: 101, name: 'Darbar Special', price: 450, category: 'Arabian', stall: 'Darbar Mandi', image: '/shops/darbar.png', open: true },
    { id: 102, name: 'Wow! Momo Platter', price: 190, category: 'Chinese', stall: 'Wow! Momo', image: '/shops/wow momo.png', open: true },
    { id: 103, name: 'Jail Theme Special', price: 320, category: 'North Indian', stall: 'The Food Jail', image: '/shops/food jail.png', open: true },
    { id: 104, name: 'Tiffins Combo', price: 110, category: 'South Indian', stall: 'Aaruchulu', image: '/shops/aaruchulu.png', open: true },
    { id: 105, name: 'Ice Cream Scoop', price: 150, category: 'Dessert', stall: 'Dumont E3', image: '/shops/dumont.png', open: true },
    { id: 106, name: 'Pub Special', price: 340, category: 'North Indian', stall: "Pub'Gs", image: '/shops/pubgs.png', open: true },
    { id: 107, name: 'Waffle Deluxe', price: 200, category: 'Dessert', stall: 'Waffle Cafe', image: '/shops/Waffle cafe.jpeg', open: true },
    { id: 108, name: 'Alpha Biryani', price: 280, category: 'North Indian', stall: 'Alpha Hotel', image: '/shops/alpha.png', open: true },
    { id: 109, name: 'Bawarchi Biryani', price: 300, category: 'North Indian', stall: 'Bawarchi', image: '/shops/bawarchi.png', open: true },
    { id: 110, name: 'Burma Dishes', price: 220, category: 'Chinese', stall: 'Burma', image: '/shops/burma.png', open: true },
    { id: 111, name: 'Cool Refreshers', price: 80, category: 'Beverages', stall: 'Cool Drinks', image: '/shops/coca cola.png', open: true },
    { id: 112, name: 'Royal Falooda', price: 120, category: 'Dessert', stall: 'Falooda', image: '/shops/punjabi falooda kulfi.png', open: true },
    { id: 113, name: 'Fruit Salad', price: 100, category: 'Healthy', stall: 'Fruit Me Up', image: '/shops/fruit mesh up.png', open: true },
    { id: 114, name: 'Grilled Rolls', price: 180, category: 'Arabian', stall: 'Grills & Rolls', image: '/shops/grills & rolls.png', open: true },
    { id: 115, name: 'Pulao Special', price: 250, category: 'North Indian', stall: 'House of Pulaos', image: '/shops/house of pulaos.png', open: true },
    { id: 116, name: 'Fried Chicken', price: 350, category: 'Fast Food', stall: 'KFC', image: '/shops/kfc.png', open: true },
    { id: 117, name: 'Pizza Slice', price: 220, category: 'Fast Food', stall: 'Planet Pizza', image: '/shops/planet pizza.png', open: true },
    { id: 118, name: 'Punjabi Thali', price: 260, category: 'North Indian', stall: 'Punjabi Tadka', image: '/shops/punjabi tadka.png', open: true },
    { id: 119, name: 'Red Bucket Special', price: 290, category: 'North Indian', stall: 'Red Bucket', image: '/shops/the red bucket biriyani.png', open: true },
    { id: 120, name: 'Spicy Chillis', price: 210, category: 'Chinese', stall: 'Red Chillis', image: '/shops/red chillis.png', open: true },
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


                {/* Menu Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
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
                                        <p className="text-gray-400 text-[10px] leading-tight line-clamp-1">{item.category} Cuisine</p>
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
