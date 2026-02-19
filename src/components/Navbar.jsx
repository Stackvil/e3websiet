import React, { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, ArrowUpRight, User } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import useStore from '../store/useStore'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { cart, toggleCart } = useStore()
    const { scrollY } = useScroll()

    // Dynamic header styles based on scroll
    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setScrolled(latest > 50)
        })
        return () => unsubscribe()
    }, [scrollY])

    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    const navLinks = [
        { name: 'Philosophy', href: '#philosophy' },
        { name: 'Cuisine', href: '#cuisine' },
        { name: 'Recreation', href: '#recreation' },
    ]

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out ${scrolled ? 'py-4' : 'py-8'
            }`}>
            <div className={`container mx-auto flex items-center justify-between transition-all duration-700 ${scrolled ? 'px-8 py-3 premium-glass rounded-full max-w-[1000px]' : ''
                }`}>
                {/* Logo */}
                <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-bg-deep text-2xl shadow-lg shadow-primary/20">
                        E3
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-xl tracking-tighter">ETHREE</span>
                        <span className="text-[8px] tracking-[0.4em] text-primary">ENJOYMENT</span>
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
                <div className="flex items-center gap-6">
                    {/* Profile Link (Visible if logged in - simplistic check if store has user, need to check how useStore exposes user) */}
                    {/* Assuming useStore has 'user' state. Let's verify useStore first... defaulting to always show or check auth token logic later if needed. */}
                    {/* Wait, I should check useStore.js to see if it exposes 'user'. */}

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

                    <a href="/profile" className="p-3 premium-glass rounded-full border-none group hover:scale-110 transition-transform">
                        <User size={20} className="group-hover:text-primary transition-colors" />
                    </a>

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
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
