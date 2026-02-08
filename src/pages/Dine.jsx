import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ShoppingCart, Clock, Filter, ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';

// Map stall names to their menu images in public/menus
const menuImages = {
    'Darbar Mandi': [
        '/menus/darbar/01_Darbar Menu.jpg.jpeg',
        '/menus/darbar/02_Darbar Menu.jpg.jpeg'
    ],
    'The Food Jail': [
        '/menus/jail/01_The Food Jail.jpg.jpeg',
        '/menus/jail/02_The Food Jail.jpg.jpeg'
    ],
    'Aaruchulu': [
        '/menus/aaruchulu/IDLI_20260203_005915_0000 (1)_page-0001.jpg',
        '/menus/aaruchulu/IDLI_20260203_005915_0000 (1)_page-0002.jpg',
        '/menus/aaruchulu/IDLI_20260203_005915_0000 (1)_page-0003.jpg',
        '/menus/aaruchulu/IDLI_20260203_005915_0000 (1)_page-0004.jpg'
    ],
    "Pub'Gs": [
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0001.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0002.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0003.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0004.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0005.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0006.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0007.jpg',
        '/menus/pubg/01 Food Plaza 2 Pages in 13x19 Front 04-12-2025 - 10 Books (1)_page-0008.jpg'
    ],
    'Alpha Hotel': [
        '/menus/Alfa/Alfa Menu 01_Back Side_Grey.jpg.jpeg',
        '/menus/Alfa/Alfa Menu 01_Front Side_Grey.jpg.jpeg',
        '/menus/Alfa/Alfa Menu 02_Back Side_Orange.jpg.jpeg',
        '/menus/Alfa/Alfa Menu 02_Front Side_Orange.jpg.jpeg',
        '/menus/Alfa/Alfa_Veg_Menu.jpg.jpeg'
    ],
    'Bawarchi': [
        '/menus/Bawarchi/Bawarchi Menu_1.jpg.jpeg',
        '/menus/Bawarchi/Bawarchi Menu_2.jpg.jpeg',
        '/menus/Bawarchi/Bawarchi Menu_3.jpg.jpeg',
        '/menus/Bawarchi/Bawarchi Menu_4.jpg.jpeg'
    ],
    'Burma': [
        '/menus/barma/WhatsApp Image 2026-02-02 at 11.00.35 AM (1).jpeg'
    ],
    'House of Pulaos': [
        '/menus/pulaos/WhatsApp Image 2026-02-02 at 11.00.35 AM.jpeg'
    ],
    'Punjabi Tadka': [
        '/menus/panjabi tadka/01_PTE Menu.jpg.jpeg',
        '/menus/panjabi tadka/02_PTE Menu.jpg.jpeg'
    ],
    'Red Chillis': [
        '/menus/red chillis/Red Chillis_Menu_1.jpg.jpeg',
        '/menus/red chillis/Red Chillis_Menu_2.jpg.jpeg',
        '/menus/red chillis/Red Chillis_Menu_3.jpg.jpeg'
    ]
};

const Dine = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const { addToCart, cart, toggleCart } = useStore();
    const [selectedMenu, setSelectedMenu] = useState(null); // { stallName: string, images: string[] }

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

    const handleViewMenu = (item) => {
        // Check if item has dynamic menuImages attached first
        let images = [];
        if (item.menuImages && item.menuImages.length > 0) {
            images = item.menuImages;
        } else {
            // Fallback to hardcoded mapping
            images = menuImages[item.stall || item.name];
        }

        if (images && images.length > 0) {
            setSelectedMenu({ stallName: item.stall || item.name, images, currentIndex: 0 });
        } else {
            alert('Menu not available for this stall yet.');
        }
    };

    const nextImage = () => {
        if (!selectedMenu) return;
        setSelectedMenu(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.images.length
        }));
    };

    const prevImage = () => {
        if (!selectedMenu) return;
        setSelectedMenu(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
        }));
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-creamy-white min-h-screen pt-16 pb-12">
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
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-riverside-teal focus:ring-2 focus:ring-riverside-teal/20 transition-all duration-300 hover:border-riverside-teal"
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
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative transition-all duration-500 hover:shadow-2xl hover:shadow-riverside-teal/20 hover:-translate-y-2"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-700" />
                                </div>

                                <div className="p-3">
                                    <div className="mb-2">
                                        <h3 className="text-sm font-bold leading-tight truncate text-charcoal-grey group-hover:text-riverside-teal transition-colors">{item.stall}</h3>
                                        <p className="text-gray-400 text-[10px] leading-tight line-clamp-1">{item.cuisine || item.category} Cuisine</p>
                                    </div>

                                    <button
                                        onClick={() => handleViewMenu(item)}
                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs bg-gray-100 text-charcoal-grey hover:bg-sunset-orange hover:text-white transition-all duration-300 hover:tracking-widest"
                                    >
                                        View Menu
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Menu Viewer Modal */}
            <AnimatePresence>
                {selectedMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                        onClick={() => setSelectedMenu(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-transparent max-w-4xl max-h-[90vh] flex flex-col items-center relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedMenu(null)}
                                className="absolute -top-12 right-0 text-white hover:text-sunset-orange transition-colors"
                            >
                                <X size={32} />
                            </button>

                            <div className="relative rounded-xl overflow-hidden shadow-2xl">
                                <img
                                    src={selectedMenu.images[selectedMenu.currentIndex]}
                                    alt={`${selectedMenu.stallName} Menu`}
                                    className="max-h-[80vh] max-w-full object-contain bg-white"
                                />

                                {selectedMenu.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-sunset-orange transition-colors"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-sunset-orange transition-colors"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full text-white text-xs font-bold">
                                            {selectedMenu.currentIndex + 1} / {selectedMenu.images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                            <h3 className="text-white font-bold text-xl mt-4 font-heading">{selectedMenu.stallName}</h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
