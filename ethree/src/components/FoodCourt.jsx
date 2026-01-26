import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ShoppingBag, ArrowRight, Star, Heart } from 'lucide-react'
import useStore from '../store/useStore'

const STALLS = [
    { id: 'all', name: 'Elite Signature' },
    { id: 'arabian', name: 'Arabian' },
    { id: 'north', name: 'Continental' },
    { id: 'chinese', name: 'Oriental' },
    { id: 'south', name: 'Authentic' },
]

const MENU_ITEMS = [
    {
        id: 1,
        name: 'Royale Arabic Mandi',
        price: 350,
        category: 'arabian',
        stall: 'Darbar Mandi',
        rating: 4.9,
        calories: '450 kcal',
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 2,
        name: 'Artisan Truffle Momo',
        price: 180,
        category: 'chinese',
        stall: 'Wow! Momo',
        rating: 4.8,
        calories: '280 kcal',
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        name: 'Smoked Butter Chicken',
        price: 280,
        category: 'north',
        stall: 'The Food Jail',
        rating: 4.7,
        calories: '520 kcal',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 4,
        name: 'Crimson Apollo Fish',
        price: 320,
        category: 'north',
        stall: "Pub'Gs",
        rating: 4.9,
        calories: '310 kcal',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 5,
        name: 'Dumont Gold Gelato',
        price: 150,
        category: 'dessert',
        stall: 'Dumont E3',
        rating: 4.8,
        calories: '180 kcal',
        image: 'https://images.unsplash.com/photo-1563805039227-9472dc0ca15e?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 6,
        name: 'Signature Spice Dosa',
        price: 90,
        category: 'south',
        stall: 'Ethree Tiffins',
        rating: 4.6,
        calories: '210 kcal',
        image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80'
    },
]

const FoodCourt = () => {
    const [activeCategory, setActiveCategory] = useState('all')
    const { addToCart } = useStore()

    const filteredItems = activeCategory === 'all'
        ? MENU_ITEMS
        : MENU_ITEMS.filter(item => item.category === activeCategory)

    return (
        <section id="cuisine" className="section-spacing">
            <div className="container">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
                    <div className="max-w-2xl">
                        <span className="text-primary font-black tracking-[0.5em] uppercase text-[10px] mb-8 block">GASTRONOMIC THEATER</span>
                        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">THE <span className="serif text-primary">Table.</span></h2>
                        <p className="text-text-secondary text-lg font-light max-w-lg">
                            Discover a symphony of flavors curated from the most prestigious stalls in the region.
                        </p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {STALLS.map(stall => (
                            <button
                                key={stall.id}
                                onClick={() => setActiveCategory(stall.id)}
                                className={`px-10 py-4 rounded-full whitespace-nowrap transition-all uppercase text-[10px] tracking-widest font-black border ${activeCategory === stall.id
                                        ? 'bg-white border-white text-bg-deep'
                                        : 'border-white/10 hover:border-primary text-text-secondary'
                                    }`}
                            >
                                {stall.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="elite-grid gap-y-16">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="col-span-12 md:col-span-6 lg:col-span-4"
                            >
                                <div className="group relative">
                                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden premium-glass p-3 mb-8">
                                        <div className="absolute top-8 right-8 z-30">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                className="w-12 h-12 rounded-full premium-glass flex items-center justify-center text-white/40 hover:text-red-500 transition-colors"
                                            >
                                                <Heart size={20} />
                                            </motion.button>
                                        </div>

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-[2rem] grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                        />

                                        <div className="absolute bottom-8 left-8 right-8 z-30 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="w-full py-4 bg-white text-bg-deep rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3"
                                            >
                                                Add to selection <ShoppingBag size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-black text-primary tracking-widest uppercase mb-2 block">{item.stall}</span>
                                                <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">{item.name}</h3>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 text-accent-gold">
                                                        <Star size={12} fill="currentColor" />
                                                        <span className="text-[10px] font-bold">{item.rating}</span>
                                                    </div>
                                                    <span className="text-[10px] text-text-dim uppercase font-bold tracking-widest">{item.calories}</span>
                                                </div>
                                            </div>
                                            <span className="text-3xl font-light text-primary">₹{item.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}

export default FoodCourt
