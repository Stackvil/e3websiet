import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Play, Zap, Utensils, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const philosophy = [
        { title: 'Eat', icon: <Utensils className="text-white" size={32} />, color: 'bg-sunset-orange', desc: 'A Gastronomic journey through the best stalls in Vijayawada.' },
        { title: 'Enjoy', icon: <Zap className="text-white" size={32} />, color: 'bg-riverside-teal', desc: 'Soak in the refreshing breeze on the banks of the Krishna River.' },
        { title: 'Entertainment', icon: <Play className="text-white" size={32} />, color: 'bg-charcoal-grey', desc: 'Thriller zones for kids and high-energy gaming for the youth.' },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-screen bg-charcoal-grey overflow-hidden">
                {/* Parallax Background Placeholder */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-60"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=1600&q=80")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-grey to-transparent z-10" />

                <div className="relative z-20 container mx-auto h-full flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-sunset-orange font-bold uppercase tracking-[0.3em] mb-4 block">Welcome to Vijayawada's Premier Hub</span>
                        <h1 className="text-5xl md:text-8xl font-heading font-bold text-white mb-8 leading-none">
                            EAT. ENJOY.<br />
                            <span className="text-riverside-teal">ENTERTAINMENT.</span>
                        </h1>
                        <div className="flex flex-wrap gap-4 justify-center mt-8">
                            <Link to="/dine" className="btn-orange text-lg px-10 py-4 flex items-center gap-2">
                                Order Food <ShoppingCart size={20} />
                            </Link>
                            <Link to="/play" className="bg-white text-charcoal-grey px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all">
                                Explore Play Zone
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Trust Signal Badge */}
                <div className="absolute bottom-24 right-6 md:right-12 z-20">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600 font-bold text-xl">4.3</div>
                        <div>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                            <p className="text-xs font-bold text-gray-500">329+ GOOGLE REVIEWS</p>
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
