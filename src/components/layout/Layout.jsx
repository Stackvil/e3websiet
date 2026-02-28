import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, MapPin, Clock, Info, Ticket, Facebook, Instagram, Youtube, Twitter, UserRound, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cart from '../Cart';
import Logo from '../Logo';
import useStore from '../../store/useStore';
import LegalModal from '../../pages/LegalModal';

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
    const colors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#818CF8', '#2DD4BF', '#FB923C'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user } = useStore();
    const displayName = user ? (user.role === 'admin' ? 'Admin' : (user.name || 'User')) : null;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dine', path: '/dine' },
        { name: 'Event Booking', path: '/events' },
        ...(user ? [{ name: 'Your Tickets', path: '/tickets' }] : []),
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-black py-1 px-6 border-b border-white/10">
            <div className="container mx-auto flex justify-between items-center max-w-7xl">
                <Link to="/" className="flex items-center gap-2">
                    <Logo className="scale-90 md:scale-110" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`font-semibold transition-all duration-300 hover:scale-105 inline-block relative group ${location.pathname === link.path ? 'text-sunset-orange' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-sunset-orange transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
                        </Link>
                    ))}
                    <Link to={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/login'} className={`font-semibold transition-all duration-300 hover:scale-105 ${user ? '' : 'text-white/80 hover:text-white'}`}>
                        {user ? (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1D2B44] text-white shadow-md border-2 border-white relative group transition-all duration-300 pointer-events-auto"
                                title={displayName}
                            >
                                <UserRound size={22} className="relative z-10 transition-transform group-hover:scale-110" />
                            </motion.div>
                        ) : 'Login'}
                    </Link>
                    {location.pathname !== '/' && (
                        <Link to="/" className="btn-orange flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform duration-300 shadow-lg hover:shadow-orange-500/30">
                            Book Ride <Ticket size={18} />
                        </Link>
                    )}
                </nav>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
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
                        className="md:hidden bg-black overflow-hidden border-t border-white/10"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-lg font-semibold ${location.pathname === link.path ? 'text-sunset-orange' : 'text-white/80 hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link to={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/login'} onClick={() => setIsOpen(false)} className="text-lg font-semibold flex items-center gap-3 text-charcoal-grey">
                                {user && (
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1D2B44] text-white"
                                    >
                                        <UserRound size={16} />
                                    </div>
                                )}
                                {user ? (user.role === 'admin' ? 'Admin' : (user.name || 'User')) : 'Login'}
                            </Link>
                            {location.pathname !== '/' && (
                                <Link to="/" onClick={() => setIsOpen(false)} className="btn-orange text-center">
                                    Book Ride
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header >
    );
};

const FooterInfoBar = ({ isAdmin }) => {
    return (
        <div className={`fixed bottom-0 bg-charcoal-grey text-white py-2 px-6 z-40 text-xs md:text-sm transition-all duration-300 ${isAdmin ? 'md:left-64 md:right-0' : 'left-0 w-full'
            }`}>
            <div className="container mx-auto flex justify-center md:justify-between items-center flex-wrap gap-4">
                {/* <div className="flex items-center gap-2"> */}
                {/* <Info size={14} className="text-sunset-orange" /> */}
                {/* <span>Parking: <span className="font-bold">₹30</span></span> */}
                {/* </div> */}
                <a href="https://maps.app.goo.gl/hFphRTCW5GM6ttLF9" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline hover:text-riverside-teal transition-colors">
                    <MapPin size={14} className="text-riverside-teal" />
                    <span>Location: <span className="font-bold">Opposite APSRTC Bus Stand, Krishnalanka, Vijayawada – 520013, Andhra Pradesh. </span></span>
                </a>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-400" />
                    <span>Status: <span className="font-bold uppercase">Open Now</span> until 12 PM</span>
                </div>
            </div>
        </div>
    );
};

import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const [legalDoc, setLegalDoc] = useState(null);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pb-24 md:pb-12">
                {children}
            </main>
            <footer className={`bg-white border-t border-gray-100 pt-16 pb-32 md:pb-24 px-6 mt-auto transition-all duration-300 ${isAdmin ? 'md:ml-64' : ''}`}>
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <Link to="/" className="inline-block mb-8 group">
                            <Logo className="scale-90 origin-left transition-transform group-hover:scale-95" />
                        </Link>
                        <p className="text-gray-500 max-w-sm leading-relaxed text-sm font-medium">
                            Eat, Enjoy, and Entertainment - Vijayawada's premier open-air family hub on the banks of Krishna River. Experience the ultimate outdoor experience.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-8 uppercase text-sunset-orange text-[10px] tracking-[0.2em]">Connect</h3>
                        <ul className="space-y-5 font-bold text-sm text-charcoal-grey">
                            <li className="flex items-center gap-3 group cursor-default transition-colors hover:text-sunset-orange">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sunset-orange group-hover:bg-sunset-orange group-hover:text-white transition-all">
                                    <Phone size={14} />
                                </div>
                                +91 70369 23456
                            </li>
                            <li className="flex items-center gap-3 group cursor-default transition-colors hover:text-riverside-teal">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-riverside-teal group-hover:bg-riverside-teal group-hover:text-white transition-all">
                                    <MapPin size={14} />
                                </div>
                                Padmavathi Ghat, Vijayawada
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-8 uppercase text-riverside-teal text-[10px] tracking-[0.2em]">Follow</h3>
                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, link: 'https://facebook.com', color: 'hover:text-white hover:bg-[#1877F2] hover:border-transparent' },
                                { Icon: Instagram, link: 'https://instagram.com', color: 'hover:text-white hover:bg-gradient-to-tr from-[#FFB700] via-[#FF0069] to-[#7638FF] hover:border-transparent' },
                                { Icon: Youtube, link: 'https://youtube.com', color: 'hover:text-white hover:bg-[#FF0000] hover:border-transparent' },
                                { Icon: Twitter, link: 'https://twitter.com', color: 'hover:text-white hover:bg-[#1DA1F2] hover:border-transparent' }
                            ].map(({ Icon, link, color }, i) => (
                                <a
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:-rotate-6 bg-white hover:shadow-lg ${color}`}
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="container mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <p className="text-gray-400 text-[11px] font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>© {new Date().getFullYear()} <span className="font-black text-charcoal-grey">Jaan Entertainment Pvt Ltd</span>.</span>
                            <span className="hidden sm:inline text-gray-200">|</span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full hover:bg-white hover:border-sunset-orange/30 group transition-all duration-300">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Developed by</span>
                                <a href="https://www.stackvil.com/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-gray-600 group-hover:text-sunset-orange transition-colors">Stackvil Technology</a>
                            </span>
                        </p>
                        <p className="text-gray-400 text-[10px] font-medium italic opacity-80">
                            * All bookings and purchases are final. We maintain a strict no-refund and no-return policy once a service has been booked or food has been served.
                        </p>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <button onClick={() => setLegalDoc('privacy')} className="hover:text-sunset-orange transition-colors">Privacy</button>
                        <button onClick={() => setLegalDoc('terms')} className="hover:text-sunset-orange transition-colors">Terms</button>
                        <button onClick={() => setLegalDoc('about')} className="hover:text-sunset-orange transition-colors">About</button>
                    </div>
                </div>
            </footer>
            <Cart />
            <div className="hidden md:block">
                <FooterInfoBar isAdmin={isAdmin} />
            </div>
            <BottomNav />
            {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
        </div>
    );
};

export default Layout;
