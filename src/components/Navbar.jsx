import React, { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API_URL } from '../config/api'
import Logo from './Logo'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef(null)

    const { cart, toggleCart, user, setUser } = useStore()
    const { scrollY } = useScroll()
    const navigate = useNavigate()

    // Dynamic header styles based on scroll
    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setScrolled(latest > 50)
        })
        return () => unsubscribe()
    }, [scrollY])

    // Close profile dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    const navLinks = [
        { name: 'Philosophy', href: '#philosophy' },
        { name: 'Cuisine', href: '#cuisine' },
        { name: 'Recreation', href: '#recreation' },
    ]

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            })
        } catch (e) {
            console.error('Logout failed', e)
        }
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setProfileOpen(false)
        navigate('/')
    }

    // Get display name: first name only, or mobile
    const displayName = user
        ? (user.name ? user.name.split(' ')[0] : `+91 ${user.mobile}`)
        : null

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : user?.mobile?.slice(-2) || '?'

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out bg-black ${scrolled ? 'py-2' : 'py-4'}`}>
            <div className={`container mx-auto flex items-center justify-between transition-all duration-700 ${scrolled ? 'px-8 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full max-w-[1000px]' : ''}`}>

                {/* Logo */}
                <Logo className="scale-100 md:scale-125 origin-left" />

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 hover:text-white transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    {/* Cart */}
                    <motion.button
                        onClick={toggleCart}
                        whileHover={{ scale: 1.1 }}
                        className="relative p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full group"
                    >
                        <ShoppingCart size={20} className="text-white group-hover:text-primary transition-colors" />
                        {cartItemCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-accent-gold text-bg-deep text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                            >
                                {cartItemCount}
                            </motion.span>
                        )}
                    </motion.button>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        {user ? (
                            /* Logged-in: avatar button with dropdown */
                            <button
                                onClick={() => setProfileOpen(v => !v)}
                                className="flex items-center gap-2 p-1 pl-1 pr-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:scale-105 transition-transform"
                            >
                                {/* Avatar circle */}
                                <div className="w-9 h-9 bg-gradient-to-br from-riverside-teal to-teal-700 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                                    {initials}
                                </div>
                                <span className="text-xs font-bold hidden sm:block max-w-[80px] truncate text-white">
                                    {displayName}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`hidden sm:block text-white/40 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                        ) : (
                            /* Logged-out: plain link to /login */
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full group hover:scale-105 transition-transform"
                            >
                                <User size={20} className="text-white group-hover:text-primary transition-colors" />
                            </button>
                        )}

                        {/* Dropdown */}
                        <AnimatePresence>
                            {profileOpen && user && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                                >
                                    {/* User info header */}
                                    <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-riverside-teal to-teal-700 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-charcoal-grey truncate">
                                                {user.name || 'Guest User'}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                +91 {user.mobile}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            <Settings size={16} className="text-gray-400" />
                                            My Profile
                                        </button>

                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => { navigate('/admin'); setProfileOpen(false) }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                            >
                                                <Settings size={16} className="text-riverside-teal" />
                                                Admin Dashboard
                                            </button>
                                        )}

                                        <div className="mx-3 my-1 h-px bg-gray-100" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hamburger (mobile) */}
                    <button
                        className="lg:hidden p-2 text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed inset-0 bg-black z-[-1] flex flex-col items-center justify-center gap-8 lg:hidden"
                    >
                        {navLinks.map((link, i) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setIsOpen(false)}
                                className="text-4xl font-bold uppercase tracking-tighter text-white/80 hover:text-white"
                            >
                                {link.name}
                            </motion.a>
                        ))}

                        {/* Mobile profile/logout */}
                        <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-4 mt-2">
                            {user ? (
                                <>
                                    <p className="text-white/60 text-sm">{user.name || user.mobile}</p>
                                    <button
                                        onClick={() => { navigate('/profile'); setIsOpen(false) }}
                                        className="flex items-center gap-2 text-white font-bold"
                                    >
                                        <User size={18} /> My Profile
                                    </button>
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false) }}
                                        className="flex items-center gap-2 text-red-400 font-bold"
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { navigate('/login'); setIsOpen(false) }}
                                    className="flex items-center gap-2 text-white font-bold"
                                >
                                    <User size={18} /> Login
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
