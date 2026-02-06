import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, MapPin, Clock, Info, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cart from '../Cart';
import useStore from '../../store/useStore';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user } = useStore();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dine', path: '/dine' },
        ...(user ? [{ name: 'Your Tickets', path: '/tickets' }] : []),
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 py-4 px-6">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-riverside-teal rounded-lg flex items-center justify-center font-bold text-white text-xl">
                        E3
                    </div>
                    <span className="font-heading font-bold text-2xl tracking-tighter text-charcoal-grey">ETHREE</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`font-semibold hover:text-sunset-orange transition-colors ${location.pathname === link.path ? 'text-sunset-orange' : 'text-charcoal-grey'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link to="/login" className="font-semibold text-charcoal-grey hover:text-sunset-orange transition-colors">
                        {user ? (user.name || 'User') : 'Login'}
                    </Link>
                    <Link to="/" className="btn-orange flex items-center gap-2">
                        Book Tickets <Ticket size={18} />
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-semibold"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-semibold">
                                {user ? (user.name || 'User') : 'Login'}
                            </Link>
                            <Link to="/" onClick={() => setIsOpen(false)} className="btn-orange text-center">
                                Book Tickets
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

const FooterInfoBar = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-charcoal-grey text-white py-2 px-6 z-40 text-xs md:text-sm">
            <div className="container mx-auto flex justify-center md:justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Info size={14} className="text-sunset-orange" />
                    <span>Parking: <span className="font-bold">₹30</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-riverside-teal" />
                    <span>Location: <span className="font-bold">Opp PNBS</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-400" />
                    <span>Status: <span className="font-bold uppercase">Open Now</span> until 11 PM</span>
                </div>
            </div>
        </div>
    );
};

import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pb-24 md:pb-12">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-100 pt-12 pb-32 md:pb-24 px-6 mt-auto">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <h2 className="text-2xl font-bold mb-6">ETHREE</h2>
                        <p className="text-gray-500 max-w-sm">
                            Eat, Enjoy, and Entertainment - Vijayawada's premier open-air family hub on the banks of Krishna River.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 uppercase text-gray-400 text-xs tracking-widest">Connect</h3>
                        <ul className="space-y-4 font-semibold">
                            <li>070369 23456</li>
                            <li>Padmavathi Ghat, Vijayawada</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 uppercase text-gray-400 text-xs tracking-widest">Follow</h3>
                        <div className="flex gap-4">
                            {['FB', 'IG', 'TW'].map(s => (
                                <div key={s} className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-400 hover:border-sunset-orange hover:text-sunset-orange transition-all cursor-pointer">
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
            <Cart />
            <div className="hidden md:block">
                <FooterInfoBar />
            </div>
            <BottomNav />
        </div>
    );
};

export default Layout;
