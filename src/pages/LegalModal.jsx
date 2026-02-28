import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Book,
    Info,
    CheckCircle2,
    Building,
    Users,
    MapPin,
    Scale,
    Lock,
    Link as LinkIcon,
    AlertCircle,
    UserCheck,
    Store,
    X
} from 'lucide-react';

const FadeIn = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

const SectionCard = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white/60 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-white/50 shadow-sm transition-transform hover:-translate-y-0.5 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-riverside-teal/10 rounded-lg flex items-center justify-center text-riverside-teal">
                <Icon size={18} />
            </div>
            <h3 className="text-base font-bold font-heading text-charcoal-grey">{title}</h3>
        </div>
        <div className="text-xs text-gray-600 leading-relaxed space-y-2">
            {children}
        </div>
    </div>
);

const AboutContent = () => (
    <div className="space-y-4">
        <FadeIn delay={0.1}>
            <div className="text-center mb-6">
                <span className="text-sunset-orange font-bold uppercase tracking-[0.2em] text-[10px] mb-1 block">Our Story</span>
                <h2 className="text-2xl md:text-3xl font-black font-heading text-charcoal-grey mb-2">
                    Eat. Enjoy. <span className="text-riverside-teal">Entertain.</span>
                </h2>
                <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Ethree is a premier Food Court and Play Zone bringing families together through diverse cuisines and recreation under one roof.
                </p>
            </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-4">
            <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-riverside-teal to-teal-700 p-5 rounded-2xl text-white h-full relative overflow-hidden">
                    <div className="relative z-10">
                        <Store className="w-8 h-8 mb-3 text-teal-200" />
                        <h3 className="text-lg font-bold mb-1">For Vendors</h3>
                        <p className="text-xs text-teal-50/90 leading-tight">
                            Promote your culinary business directly to thousands. Benefit from an enhanced e-Experience with direct customer reviews.
                        </p>
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.3}>
                <div className="bg-gradient-to-br from-sunset-orange to-orange-600 p-5 rounded-2xl text-white h-full relative overflow-hidden">
                    <div className="relative z-10">
                        <Users className="w-8 h-8 mb-3 text-orange-200" />
                        <h3 className="text-lg font-bold mb-1">For Users</h3>
                        <p className="text-xs text-orange-50/90 leading-tight">
                            A wide range of services suited to your needs—from diverse cuisines to customized entertainment packages.
                        </p>
                    </div>
                </div>
            </FadeIn>
        </div>

        <FadeIn delay={0.4}>
            <SectionCard icon={Building} title="Founder's Vision">
                <p className="text-sm italic border-l-3 border-riverside-teal pl-4 py-1 bg-gray-50/50 rounded-r-lg">
                    "We designed an ample space for all cuisines and play zone activities to suit all ages and promote local talent."
                </p>
                <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 bg-charcoal-grey rounded-full flex items-center justify-center text-white text-[10px] font-bold">JK</div>
                    <div>
                        <p className="text-xs font-bold text-charcoal-grey">Jayanarayana Kureti</p>
                        <p className="text-[10px] text-gray-400">Founder & CEO</p>
                    </div>
                </div>
            </SectionCard>
        </FadeIn>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-4">
        <FadeIn delay={0.1}>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                <span className="font-bold text-charcoal-grey">ethree</span> protects any information you give when visiting the Website. Effective from May 1st, 2019.
            </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-4">
            <FadeIn delay={0.2}>
                <SectionCard icon={UserCheck} title="Collected Info" className="h-full">
                    <ul className="space-y-2">
                        {['Name & Mobile', 'Email & Address', 'Survey Data'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-lg">
                                <CheckCircle2 className="text-riverside-teal shrink-0" size={14} />
                                <span className="font-medium text-charcoal-grey text-[11px]">{item}</span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </FadeIn>

            <FadeIn delay={0.3}>
                <SectionCard icon={Shield} title="Security" className="h-full">
                    <p className="text-[11px]">
                        We use suitable physical and electronic procedures to safeguard your info. We won't sell your data unless required by law.
                    </p>
                </SectionCard>
            </FadeIn>
        </div>

        <FadeIn delay={0.4}>
            <SectionCard icon={Lock} title="Usage">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                        'Internal record keeping',
                        'Improving services',
                        'Promotional emails',
                        'Market research'
                    ].map((text, i) => (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center text-sunset-orange font-bold text-[9px] shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-[11px]">{text}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </FadeIn>
    </div>
);

const TermsContent = () => (
    <div className="space-y-4">
        <FadeIn delay={0.1}>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Usage of <span className="font-bold text-charcoal-grey">ethree.in</span> is subject to these Terms. Acceptance is implied by using the site.
            </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-4">
            <FadeIn delay={0.2}>
                <SectionCard icon={Scale} title="Obligations" className="h-full">
                    <p className="text-[11px]">
                        Use for lawful purposes only. You must provide accurate info and keep your login credentials secure.
                    </p>
                </SectionCard>
            </FadeIn>

            <FadeIn delay={0.3}>
                <SectionCard icon={LinkIcon} title="Content" className="h-full">
                    <p className="text-[11px]">
                        Materials are for PERSONAL USE ONLY. No data mining or scraping. We aren't responsible for external links.
                    </p>
                </SectionCard>
            </FadeIn>
        </div>

        <FadeIn delay={0.4}>
            <SectionCard icon={AlertCircle} title="Liability & Refunds">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <p className="text-[11px]"><strong>Indemnity:</strong> You hold us harmless from claims arising from your site usage.</p>
                        <p className="text-[11px]"><strong>Risk:</strong> Service use is at your own risk. We offer no guarantees of error-free service.</p>
                    </div>
                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                        <p className="text-[11px] font-bold text-red-700 flex items-center gap-2 mb-1">
                            <AlertCircle size={14} /> Refund & Return Policy
                        </p>
                        <p className="text-[10px] text-gray-600 leading-relaxed italic">
                            "All bookings and purchases are final. We maintain a strict no-refund and no-return policy once a service has been booked, food has been served, or entry has been granted. Please double-check your order before proceeding."
                        </p>
                    </div>
                </div>
            </SectionCard>
        </FadeIn>
    </div>
);

const LegalModal = ({ doc, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const contentMap = {
        'about': { title: 'About Us', icon: Info, component: <AboutContent /> },
        'privacy': { title: 'Privacy Policy', icon: Shield, component: <PrivacyContent /> },
        'terms': { title: 'Terms of Use', icon: Book, component: <TermsContent /> }
    };

    const currentDoc = contentMap[doc] || contentMap['about'];
    const HeaderIcon = currentDoc.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-charcoal-grey/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-2xl bg-[#f8fafc] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex-shrink-0 flex items-center justify-between p-5 md:p-6 bg-white border-b border-gray-100 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-riverside-teal">
                                <HeaderIcon size={20} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black font-heading text-charcoal-grey">
                                {currentDoc.title}
                            </h2>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-sunset-orange transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 md:p-6 relative hide-scrollbar">
                        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-riverside-teal/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            {currentDoc.component}
                        </div>
                        {doc !== 'about' && (
                            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                                <button onClick={onClose} className="btn-orange px-8 py-2 text-sm uppercase tracking-widest font-bold">Accept</button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LegalModal;
