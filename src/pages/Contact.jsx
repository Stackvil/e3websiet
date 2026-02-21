import React from 'react';
import { MapPin, Phone, Mail, Clock, ParkingCircle, Bus, Info, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <div className="bg-creamy-white min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6">

                {/* Contact Header */}
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <span className="text-riverside-teal font-bold uppercase tracking-[0.4em] text-xs mb-4 block underline decoration-sunset-orange decoration-4 underline-offset-8">Visit Jaan Entertainment</span>
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 text-charcoal-grey">Get in Touch With <br /><span className="text-sunset-orange">The River.</span></h1>
                    <p className="text-lg text-gray-500 font-body">
                        Located at the heart of Vijayawada's riverfront, Jaan Entertainment Pvt Ltd is easily accessible from any part of the city. We're right opposite the APSRTC Bus Stand.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 mb-20">
                    {/* Contact Details Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50 h-full">
                            <h3 className="text-2xl font-bold mb-10 flex items-center gap-4">
                                <div className="w-10 h-10 bg-sunset-orange/10 rounded-xl flex items-center justify-center text-sunset-orange">
                                    <Info size={24} />
                                </div>
                                Basic Info
                            </h3>

                            <div className="space-y-10">
                                <div className="flex gap-6">
                                    <a href="https://maps.app.goo.gl/hFphRTCW5GM6ttLF9" target="_blank" rel="noopener noreferrer" className="shrink-0">
                                        <MapPin className="text-riverside-teal hover:text-sunset-orange transition-colors" size={28} />
                                    </a>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                        <p className="font-bold text-charcoal-grey leading-relaxed">Opp. APSRTC Bus Stand, Padmavathi Ghat, Krishnalanka, Vijayawada 520013</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <Phone className="text-riverside-teal shrink-0" size={28} />
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                        <p className="font-bold text-charcoal-grey">70369 23456</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <Clock className="text-riverside-teal shrink-0" size={28} />
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Operating Hours</p>
                                        <p className="font-bold text-charcoal-grey">Daily: 9:00 AM – 11:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map & Logistics */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-charcoal-grey rounded-[3rem] overflow-hidden shadow-2xl h-[450px] relative">
                            {/* Mock Map Placeholder */}
                            <img
                                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
                                className="w-full h-full object-cover opacity-60 grayscale"
                                alt="Map"
                            />
                            <div className="absolute inset-0 bg-riverside-teal/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-6 max-w-sm">
                                    <img src="/e3logo.png" alt="E3 Logo" className="w-16 h-16 object-contain rounded-2xl" />
                                    <div>
                                        <h4 className="font-bold text-lg">Jaan Entertainment Vijayawada</h4>
                                        <p className="text-xs text-gray-500 mb-4 font-body">Opp. APSRTC Bus Stand</p>
                                        <a
                                            href="https://maps.app.goo.gl/hFphRTCW5GM6ttLF9"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-sunset-orange text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest inline-block hover:bg-opacity-90 transition-opacity"
                                        >
                                            Open in Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-riverside-teal/30 group">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-charcoal-grey group-hover:bg-riverside-teal group-hover:text-white transition-colors">
                                    <ParkingCircle size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Managed Parking</h4>
                                    <p className="text-sm text-gray-400">Fixed rate of ₹30 for all vehicles.</p>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-riverside-teal/30 group">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-charcoal-grey group-hover:bg-riverside-teal group-hover:text-white transition-colors">
                                    <Bus size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Public Transport</h4>
                                    <p className="text-sm text-gray-400">Right opposite the main PNBS hub.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Contact Form */}
                <section className="bg-sunset-orange text-white rounded-[4rem] p-12 md:p-20 relative overflow-hidden transition-transform hover:scale-[1.01] duration-700">
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mb-48 -mr-48" />
                    <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">Have a Question?</h2>
                            <p className="text-lg opacity-90 font-body mb-8">
                                Whether you're planning a large party or just want to know about today's special stall, our team is ready to help.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-xl font-bold group cursor-pointer">
                                    <Mail className="text-white/60 group-hover:text-white transition-colors" /> hello@jaanentertainment.in
                                </div>
                            </div>
                        </div>
                        <form className="space-y-4 bg-white/10 p-8 rounded-3xl backdrop-blur-md hover:bg-white/15 transition-colors duration-500">
                            <input type="text" placeholder="Full Name" className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-white/40 transition-all placeholder:text-white/60 hover:bg-white/20" />
                            <input type="email" placeholder="Email Address" className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-white/40 transition-all placeholder:text-white/60 hover:bg-white/20" />
                            <textarea placeholder="Your Message" rows="4" className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-white/40 transition-all placeholder:text-white/60 hover:bg-white/20" />
                            <button className="w-full bg-white text-sunset-orange py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl flex items-center justify-center gap-3">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Contact;
