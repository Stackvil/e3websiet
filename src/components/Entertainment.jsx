import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Ticket, Zap, Trophy, PlayCircle, ArrowUpRight } from 'lucide-react'

const Entertainment = () => {
    const activities = [
        {
            title: "KIDS' KINGDOM",
            tag: "VIBRANT",
            desc: "An architectural marvel of fun featuring zero-gravity trampolines, neon bumper arenas, and panoramic observation towers.",
            icon: <Zap size={32} />,
            image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80"
        },
        {
            title: "ELITE GAMING",
            tag: "ADRENALINE",
            desc: "A competitive theater for digital athletes, equipped with the latest virtual reality ecosystems and pro-grade cricket simulators.",
            icon: <Trophy size={32} />,
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
        }
    ]

    return (
        <section id="recreation" className="section-spacing relative">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-32">
                    <span className="text-primary font-black tracking-[0.5em] uppercase text-[10px] mb-8">HIGH-ENERGY RECREATION</span>
                    <h2 className="text-7xl md:text-9xl font-black mb-10 tracking-tighter leading-none">
                        PURE <span className="serif text-primary">Velocity.</span>
                    </h2>
                    <p className="max-w-xl text-text-secondary text-xl font-light leading-relaxed">
                        From the visceral thrill of our physical zones to the limitless potential of virtual worlds.
                    </p>
                </div>

                <div className="elite-grid gap-y-32">
                    {activities.map((activity, i) => (
                        <motion.div
                            key={activity.title}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="col-span-12 group"
                        >
                            <div className="relative aspect-[21/9] rounded-[4rem] overflow-hidden premium-glass p-3">
                                <div className="absolute inset-0 bg-gradient-to-r from-bg-deep/80 via-bg-deep/20 to-transparent z-10" />
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className="w-full h-full object-cover rounded-[3.5rem] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2000ms]"
                                />

                                <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 lg:px-24">
                                    <span className="text-accent-gold font-black text-[10px] tracking-[0.4em] mb-6 block">{activity.tag} ZONE</span>
                                    <h3 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">{activity.title}</h3>
                                    <p className="text-text-secondary max-w-lg text-lg mb-12 font-light">{activity.desc}</p>
                                    <div className="flex gap-8">
                                        <button className="btn-premium">RESERVE NOW <ArrowUpRight size={16} /></button>
                                        <button className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase hover:text-primary transition-all">
                                            Gallery <div className="w-8 h-[1px] bg-white/20" />
                                        </button>
                                    </div>
                                </div>

                                {/* Decorative large icon on background */}
                                <div className="absolute right-24 bottom-24 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden lg:block">
                                    {React.cloneElement(activity.icon, { size: 150 })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Cultural Stage - Distinct Highlight */}
                <div className="mt-40 elite-grid items-center">
                    <div className="col-span-12 lg:col-span-6 order-2 lg:order-1">
                        <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px] mb-8 block">PLATFORM 01</span>
                        <h3 className="text-5xl font-black mb-8 italic serif tracking-tight">The River-bed Stage</h3>
                        <p className="text-text-secondary text-lg mb-12 font-light leading-relaxed">
                            A panoramic cultural hub where local talent orchestrates the city's pulse. From weekend unplugged sessions to grand scale performances under the moonlight.
                        </p>
                        <button className="flex items-center gap-6 group">
                            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                                <PlayCircle size={24} className="group-hover:text-bg-deep" />
                            </div>
                            <span className="text-xs font-black tracking-[0.3em] uppercase">Season Schedule</span>
                        </button>
                    </div>
                    <div className="col-span-12 lg:col-span-6 mb-16 lg:mb-0 order-1 lg:order-2">
                        <div className="aspect-[4/3] rounded-[3rem] overflow-hidden premium-glass p-3">
                            <img
                                src="https://images.unsplash.com/photo-1549333353-c20bfb159779?auto=format&fit=crop&w=1000&q=80"
                                alt="Cultural Stage"
                                className="w-full h-full object-cover rounded-[2.5rem]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Entertainment
