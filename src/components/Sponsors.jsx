import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config/api';

const Sponsors = () => {
    const [sponsors, setSponsors] = useState([]);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const res = await fetch(`${API_URL}/sponsors`);
                if (res.ok) {
                    const data = await res.json();
                    setSponsors(data);
                }
            } catch (err) {
                console.error("Failed to fetch sponsors", err);
            }
        };
        fetchSponsors();
    }, []);

    if (sponsors.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-2xl font-heading font-bold text-gray-400 mb-8 uppercase tracking-widest">Our Partners</h2>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale hover:grayscale-0 transition-all duration-500">
                    {sponsors.map((sponsor, index) => (
                        <motion.div
                            key={sponsor._id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center group"
                        >
                            <img
                                src={sponsor.image}
                                alt={sponsor.name}
                                className="h-12 md:h-16 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                            {/* Optional: Show name on hover if logo is unclear, or just rely on image */}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Sponsors;
