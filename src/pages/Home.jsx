import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Play, Zap, Utensils, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { API_URL } from '../config/api';

import RideCard from '../components/RideCard';
import Sponsors from '../components/Sponsors';
import localProducts from '../data/products.json';

const Home = () => {
    const { addToCart, toggleCart } = useStore();
    const [activities, setActivities] = useState([]);



    useEffect(() => {
        const fetchActivities = async () => {
            let data = [];
            try {
                const res = await fetch(`${API_URL}/e3/rides?all=true`);
                if (!res.ok) throw new Error('API Failed');
                data = await res.json();
            } catch (err) {
                console.warn("Failed to fetch E3 rides from API, using local data", err);
                data = localProducts.filter(item => item.category === 'play');
            }

            if (data) {
                setActivities(data);
            }
        };
        fetchActivities();
    }, []);

    const philosophy = [
        { title: 'Eat', icon: <Utensils className="text-white" size={32} />, color: 'bg-sunset-orange', desc: 'A Gastronomic journey through the best stalls in Vijayawada.' },
        { title: 'Enjoy', icon: <Zap className="text-white" size={32} />, color: 'bg-riverside-teal', desc: 'Soak in the refreshing breeze on the banks of the Krishna River.' },
        { title: 'Entertainment', icon: <Play className="text-white" size={32} />, color: 'bg-charcoal-grey', desc: 'Thriller zones for kids and high-energy gaming for the youth.' },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-auto bg-charcoal-grey">
                {/* Parallax Background Placeholder */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-60"
                    style={{ backgroundImage: 'url("/ai-generated-a-very-large-ferris-wheel-is-seen-free-photo.jpeg")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-grey to-transparent z-10" />

                <div className="relative z-20 container mx-auto flex flex-col px-6 pt-6 pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full text-center mb-6"
                    >
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2 leading-tight">
                            Start Booking Your Fun
                        </h1>
                        <p className="text-slate-300 text-sm">Select a ride below to book instantly</p>
                    </motion.div>

                    <div className="w-full">
                        {/* Changed grid-cols-3 to grid-cols-2 for better mobile layout */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {activities.map((ride, index) => (
                                <motion.div
                                    key={ride._id || ride.id}
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
            <section className="py-16 container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl mb-4 font-heading">The <span className="text-sunset-orange">3 E's</span> Philosophy</h2>
                    <div className="w-20 h-1 bg-riverside-teal mx-auto" />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {philosophy.map((item, i) => (
                        <motion.div
                            key={item.title}
                            whileHover={{ y: -8 }}
                            className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 text-center flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                                {React.cloneElement(item.icon, { size: 28 })}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-2 rounded-lg w-full">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Sponsors Section */}
            <Sponsors />

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
                            E3 Entertainment is widely recognized for its scenic location on the banks of the Krishna River. It features a casual, trendy, and contemporary atmosphere with mostly open-air seating, offering a refreshing breeze and picturesque views, especially after sunset.
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
