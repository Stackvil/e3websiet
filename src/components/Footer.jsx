import React from 'react'
import { Phone, MapPin, Instagram, Facebook, Twitter, Mail, ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="bg-bg-deep pt-32 pb-16 border-t border-white/5 relative">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center font-black text-bg-deep text-3xl shadow-2xl shadow-primary/20">
                                E3
                            </div>
                            <span className="font-bold text-4xl tracking-tighter">JAAN ENTERTAINMENT</span>
                        </div>
                        <p className="text-text-secondary text-xl font-light max-w-lg mb-12 leading-relaxed">
                            Located on the Padmavathi Ghat, Krishnalanka. We are the premier destination for families and youth who seek the best in food and entertainment.
                        </p>
                        <div className="flex gap-6">
                            {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ y: -5, color: '#10b981' }}
                                    className="w-14 h-14 premium-glass rounded-full flex items-center justify-center transition-colors"
                                >
                                    <Icon size={20} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[0.4em] text-primary mb-10">Navigation</h4>
                        <ul className="space-y-6">
                            {['Home', 'Philosophy', 'Cuisine', 'Recreation'].map((link) => (
                                <li key={link}>
                                    <a href={`#${link.toLowerCase()}`} className="text-text-secondary hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[0.4em] text-primary mb-10">Connect</h4>
                        <div className="space-y-8">
                            <a href="https://maps.app.goo.gl/hFphRTCW5GM6ttLF9" target="_blank" rel="noopener noreferrer" className="flex gap-4 hover:text-primary transition-colors">
                                <MapPin className="text-primary flex-shrink-0" size={20} />
                                <span className="text-text-secondary text-sm leading-relaxed">
                                    Opp. APSRTC Bus Stand, Padmavathi Ghat, Vijayawada, AP 520013
                                </span>
                            </a>
                            <div className="flex items-center gap-4">
                                <Phone className="text-primary flex-shrink-0" size={20} />
                                <span className="text-text-secondary text-sm font-bold tracking-widest">
                                    +91 70369 23456
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-widest text-text-dim">
                            © {new Date().getFullYear()} Jaan Entertainment Pvt Ltd. All Rights Reserved.
                        </p>
                        <p className="text-[10px] text-text-dim/80 max-w-2xl">
                            By using this site, you agree to our <a href="#" className="hover:text-primary underline">Terms & Conditions</a>. All payments for dining, rides, and event bookings are strictly non-refundable once the service is availed or consumed.
                        </p>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black text-primary hover:gap-6 transition-all"
                    >
                        Back to top <ArrowUp size={16} />
                    </button>
                </div>
            </div>

            {/* Large Decorative Text */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.02]">
                <h2 className="text-[25vw] font-black leading-none translate-y-1/2 whitespace-nowrap">
                    VIJAYAWADA ELITE
                </h2>
            </div>
        </footer>
    )
}

export default Footer
