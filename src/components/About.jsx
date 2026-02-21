import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Star, Waves, ShieldCheck, Map, ArrowRight } from 'lucide-react'

const About = () => {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100])

    return (
        <section id="philosophy" ref={containerRef} className="section-spacing container overflow-hidden">
            <div className="elite-grid">
                {/* Typographic Column */}
                <div className="col-span-12 lg:col-span-5 flex flex-col justify-center mb-16 lg:mb-0">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="text-primary font-black tracking-[0.5em] uppercase text-[10px] mb-8 block">
                            The Riverfront Philosophy
                        </span>
                        <h2 className="text-6xl md:text-8xl font-black mb-10 leading-[0.85] tracking-tighter">
                            BEYOND THE <br />
                            <span className="serif text-primary">Horizon.</span>
                        </h2>
                        <p className="text-text-secondary text-xl font-light leading-relaxed mb-12 max-w-md">
                            Situated at Padmavathi Ghat, Jaan Entertainment Pvt Ltd is where the urban energy of Vijayawada harmoniously blends with the natural serenity of the Krishna River.
                        </p>

                        <div className="space-y-12">
                            {[
                                { title: 'GASTRONOMY', icon: <Star />, desc: 'Elite stalls representing global culinary standards.' },
                                { title: 'SERENITY', icon: <Waves />, desc: 'Open-air theater with refreshing river breezes.' },
                                { title: 'EXCITEMENT', icon: <ShieldCheck />, desc: 'State-of-the-art recreation for every generation.' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-8 group">
                                    <div className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-full group-hover:border-primary transition-all duration-500">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black tracking-[0.3em] text-white/40 mb-1">{item.title}</h4>
                                        <p className="text-sm font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Visual Column - Refined Alignment */}
                <div className="col-span-12 lg:col-span-7 flex items-center justify-center">
                    <div className="relative w-full max-w-2xl px-6">
                        <motion.div
                            style={{ y: y1 }}
                            className="aspect-[3/4] rounded-[3rem] overflow-hidden premium-glass p-3 relative z-20"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1544648151-50e50257077e?auto=format&fit=crop&w=1000&q=80"
                                alt="Architecture"
                                className="w-full h-full object-cover rounded-[2.5rem] grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                        </motion.div>

                        <motion.div
                            style={{ y: y2 }}
                            className="absolute -bottom-20 -right-4 w-2/3 aspect-square rounded-full overflow-hidden premium-glass p-3 z-10 hidden md:block"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=800&q=80"
                                alt="Atmosphere"
                                className="w-full h-full object-cover rounded-full opacity-40"
                            />
                        </motion.div>

                        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                            <h3 className="text-[12vw] font-black text-white/5 whitespace-nowrap leading-none rotate-90">
                                SCENE 01
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
