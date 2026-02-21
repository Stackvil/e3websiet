import React, { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API_URL } from '../config/api'

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
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out ${scrolled ? 'py-4' : 'py-8'}`}>
            <div className={`container mx-auto flex items-center justify-between transition-all duration-700 ${scrolled ? 'px-8 py-3 premium-glass rounded-full max-w-[1000px]' : ''}`}>

                {/* Logo */}
                <motion.div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/')}
                >
                    {/* Icon badge */}
                    <div className="relative w-12 h-12 shrink-0">
                        {/* Spinning gradient ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-xl"
                            style={{
                                background: 'conic-gradient(from 0deg, #f97316, #fbbf24, #10b981, #0d9488, #f97316)',
                                padding: '2px',
                                borderRadius: '14px',
                            }}
                        >
                            <div className="w-full h-full rounded-[12px] bg-gray-900" />
                        </motion.div>

                        {/* Inner badge */}
                        <div
                            className="absolute inset-[2px] rounded-[12px] flex items-center justify-center overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%)',
                            }}
                        >
                            {/* Shimmer sweep */}
                            <motion.div
                                animate={{ x: ['-120%', '220%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                                className="absolute inset-0 w-1/2"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                                    transform: 'skewX(-15deg)',
                                }}
                            />
                            <span
                                className="font-black text-lg relative z-10 tracking-tight"
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: 'none',
                                    lineHeight: 1,
                                }}
                            >
                                E3
                            </span>
                        </div>

                        {/* Glow underneath */}
                        <div
                            className="absolute inset-0 rounded-xl opacity-40 blur-md -z-10"
                            style={{ background: 'linear-gradient(135deg, #f97316, #10b981)' }}
                        />
                    </div>

                    {/* Wordmark */}
                    <div className="flex flex-col leading-none gap-[3px]">
                        <div className="flex items-baseline gap-[1px]">
                            <span
                                className="font-black text-[1.15rem] tracking-[-0.02em]"
                                style={{
                                    background: 'linear-gradient(90deg, #ffffff 0%, #e2e8f0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                J
                            </span>
                            <span
                                className="font-black text-[1.15rem] tracking-[-0.02em]"
                                style={{
                                    background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                A
                            </span>
                            <span
                                className="font-black text-[1.15rem] tracking-[-0.02em]"
                                style={{
                                    background: 'linear-gradient(90deg, #ffffff 0%, #e2e8f0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                AN
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span
                                className="text-[6.5px] font-bold tracking-[0.15em] uppercase"
                                style={{ color: '#94a3b8' }}
                            >
                                ENTERTAINMENT PVT LTD
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary transition-colors relative group"
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
                        className="relative p-3 premium-glass rounded-full border-none group"
                    >
                        <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
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
                                className="flex items-center gap-2 p-1 pl-1 pr-3 premium-glass rounded-full border-none hover:scale-105 transition-transform"
                            >
                                {/* Avatar circle */}
                                <div className="w-9 h-9 bg-gradient-to-br from-riverside-teal to-teal-700 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                                    {initials}
                                </div>
                                <span className="text-xs font-bold hidden sm:block max-w-[80px] truncate">
                                    {displayName}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`hidden sm:block text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                        ) : (
                            /* Logged-out: plain link to /login */
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 p-3 premium-glass rounded-full border-none group hover:scale-105 transition-transform"
                            >
                                <User size={20} className="group-hover:text-primary transition-colors" />
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
                        className="lg:hidden p-2"
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
                        className="fixed inset-0 bg-bg-deep z-[-1] flex flex-col items-center justify-center gap-8 lg:hidden"
                    >
                        {navLinks.map((link, i) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setIsOpen(false)}
                                className="text-4xl font-bold uppercase tracking-tighter hover:text-primary"
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
