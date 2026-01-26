import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Play, Zap, Utensils, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { ACTIVITIES } from './Play';
import RideCard from '../components/RideCard';

const Home = () => {
    const { addToCart, toggleCart } = useStore();
    const featuredRide = ACTIVITIES[0]; // Kept just in case or can be removed if not used elsewhere

    // Handlers moved to RideCard component to manage individual quantity states
    const philosophy = [
        { title: 'Eat', icon: <Utensils className="text-white" size={32} />, color: 'bg-sunset-orange', desc: 'A Gastronomic journey through the best stalls in Vijayawada.' },
        { title: 'Enjoy', icon: <Zap className="text-white" size={32} />, color: 'bg-riverside-teal', desc: 'Soak in the refreshing breeze on the banks of the Krishna River.' },
        { title: 'Entertainment', icon: <Play className="text-white" size={32} />, color: 'bg-charcoal-grey', desc: 'Thriller zones for kids and high-energy gaming for the youth.' },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative min-h-screen bg-charcoal-grey">
                {/* Parallax Background Placeholder */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-60"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=1600&q=80")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-grey to-transparent z-10" />

                <div className="relative z-20 container mx-auto flex flex-col justify-center px-6 py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 leading-tight">
                            Start Booking Your Fun
                        </h1>
                        <p className="text-slate-300 text-lg">Select a ride below to book instantly</p>
                    </motion.div>

                    <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {ACTIVITIES.map((ride, index) => (
                                <motion.div
                                    key={ride.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <RideCard ride={ride} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section - The 3 E's */}
            <section className="py-24 container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl mb-4 font-heading">The <span className="text-sunset-orange">3 E's</span> Philosophy</h2>
                    <div className="w-24 h-1 bg-riverside-teal mx-auto" />
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {philosophy.map((item, i) => (
                        <motion.div
                            key={item.title}
                            whileHover={{ y: -10 }}
                            className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center"
                        >
                            <div className={`${item.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                            <p className="text-gray-500 mb-8">{item.desc}</p>
                            <Link to={item.title === 'Eat' ? '/dine' : item.title === 'Enjoy' ? '/contact' : '/play'} className="text-charcoal-grey font-bold flex items-center gap-2 hover:text-sunset-orange transition-colors">
                                Learn More <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Riverside Section - Parallax style background */}
            <section className="relative py-32 overflow-hidden flex items-center text-white">
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center brightness-75 transition-all duration-700 hover:scale-105"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544648151-50e50257077e?auto=format&fit=crop&w=1600&q=80")' }}
                />
                <div className="absolute inset-0 bg-riverside-teal/40 z-10" />

                <div className="relative z-20 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8">Scenic Riverside Experience</h2>
                        <p className="text-lg leading-relaxed mb-10 opacity-90">
                            Ethree is widely recognized for its scenic location on the banks of the Krishna River. It features a casual, trendy, and contemporary atmosphere with mostly open-air seating, offering a refreshing breeze and picturesque views, especially after sunset.
                        </p>
                        <Link to="/contact" className="inline-block border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-riverside-teal transition-all">
                            View Map & Directions
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
