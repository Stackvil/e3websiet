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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mb-8 transition-transform hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-riverside-teal/10 rounded-2xl flex items-center justify-center text-riverside-teal">
                <Icon size={24} />
            </div>
            <h3 className="text-2xl font-bold font-heading text-charcoal-grey">{title}</h3>
        </div>
        <div className="text-gray-600 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const AboutContent = () => (
    <div className="space-y-8">
        <FadeIn delay={0.1}>
            <div className="text-center mb-16">
                <span className="text-sunset-orange font-bold uppercase tracking-[0.3em] text-sm mb-4 block">Our Story</span>
                <h2 className="text-4xl md:text-5xl font-black font-heading text-charcoal-grey mb-6">
                    Eat. Enjoy. <span className="text-riverside-teal">Entertain.</span>
                </h2>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Ethree is a premier combination of a Food Court and Play Zone that brings you the best times with your near and dear ones. Experience diverse cuisines, recreational activities, and cultural arenas all under one roof.
                </p>
            </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-riverside-teal to-teal-700 p-8 rounded-3xl text-white h-full relative overflow-hidden group">
                    <div className="relative z-10">
                        <Store className="w-12 h-12 mb-6 text-teal-200" />
                        <h3 className="text-2xl font-bold mb-4">For Vendors</h3>
                        <p className="text-teal-50 leading-relaxed">
                            Ethree provides you and your business a platform to deal directly with clients. Promote your culinary business and attract thousands of users. Benefit from an enhanced e-Experience where you can receive and view reviews directly from satisfied customers.
                        </p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </div>
            </FadeIn>

            <FadeIn delay={0.3}>
                <div className="bg-gradient-to-br from-sunset-orange to-orange-600 p-8 rounded-3xl text-white h-full relative overflow-hidden group">
                    <div className="relative z-10">
                        <Users className="w-12 h-12 mb-6 text-orange-200" />
                        <h3 className="text-2xl font-bold mb-4">For Users</h3>
                        <p className="text-orange-50 leading-relaxed">
                            We entitle you to a wide range of services suited to your needs. We believe no two stalls are the same, letting you choose exactly what you want—from diverse cuisines to play items and cultural activities. We fit a customized entertainment package designed just for you!
                        </p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </div>
            </FadeIn>
        </div>

        <FadeIn delay={0.4}>
            <SectionCard icon={Building} title="Founder's Vision">
                <p className="text-lg italic border-l-4 border-riverside-teal pl-6 py-2 bg-gray-50/50 rounded-r-xl">
                    "We wanted to have a nice ambience to recreate ourselves from the daily routine workload, for which we have come forward and designed an ample space in which we organized all different cuisines, most varieties of play zone activities which suits all age genders and also a space to promote our local talent."
                </p>
                <div className="flex items-center gap-3 mt-6 pl-6">
                    <div className="w-10 h-10 bg-charcoal-grey rounded-full flex items-center justify-center text-white font-bold">JK</div>
                    <div>
                        <p className="font-bold text-charcoal-grey">Jayanarayana Kureti</p>
                        <p className="text-sm text-gray-400">Founder & CEO, Jaan Entertainment</p>
                    </div>
                </div>
                <div className="mt-8 flex items-center gap-3 text-riverside-teal bg-teal-50 p-4 rounded-xl inline-flex">
                    <MapPin size={20} />
                    <span className="font-medium">Located in the heart of Vijayawada, right opposite the Main Bus Stand on the scenic banks of the Krishna River.</span>
                </div>
            </SectionCard>
        </FadeIn>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-6">
        <FadeIn delay={0.1}>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                This Privacy Policy sets out how <span className="font-bold text-charcoal-grey">ethree</span> uses & protects any information that you give to us when you visit the Website. We are committed to ensuring user privacy is protected. This policy is effective from May 1st, 2019.
            </p>
        </FadeIn>

        <FadeIn delay={0.2}>
            <SectionCard icon={UserCheck} title="What Information We Collect">
                <ul className="grid sm:grid-cols-2 gap-4 mt-4">
                    {['Name', 'Contact information (Email & Postal)', 'Mobile Number', 'Customer surveys and offers data'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 bg-gray-50/80 p-4 rounded-xl">
                            <CheckCircle2 className="text-riverside-teal shrink-0" size={20} />
                            <span className="font-medium text-charcoal-grey">{item}</span>
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </FadeIn>

        <FadeIn delay={0.3}>
            <SectionCard icon={Lock} title="How We Use Your Information">
                <p>We require this information to understand your needs and provide you with better services, in particular for:</p>
                <ul className="space-y-4 mt-4">
                    <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sunset-orange font-bold shrink-0">1</div>
                        <p>Internal record keeping and analytics.</p>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sunset-orange font-bold shrink-0">2</div>
                        <p>Improving our products, services, and customizing the website according to your interests.</p>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sunset-orange font-bold shrink-0">3</div>
                        <p>Periodically sending promotional emails about new products, special offers, or other information we think would be interesting to you.</p>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sunset-orange font-bold shrink-0">4</div>
                        <p>Contacting you for market research purposes via phone, fax, or mail.</p>
                    </li>
                </ul>
            </SectionCard>
        </FadeIn>

        <FadeIn delay={0.4}>
            <SectionCard icon={Shield} title="Security & Control">
                <p className="mb-6">
                    We are committed to ensuring that your information is secure. To prevent unauthorized access or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.
                </p>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <AlertCircle size={18} /> Controlling Your Personal Information
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        We will not sell, distribute, or lease your personal information to third parties unless we have your permission or are required by law to do so. You may request details of personal information which we hold about you under the Information Technology Act 2000. If you believe that any information we are holding is incorrect, please write to us to promptly correct it.
                    </p>
                </div>
            </SectionCard>
        </FadeIn>
    </div>
);

const TermsContent = () => (
    <div className="space-y-6">
        <FadeIn delay={0.1}>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Welcome to <span className="font-bold text-charcoal-grey">ethree.in</span>. Your access to use the information and services is subject exclusively to these Terms and Conditions. By using the website as a registered user, guest, or viewer, you demonstrate that you accept these terms.
            </p>
        </FadeIn>

        <FadeIn delay={0.2}>
            <SectionCard icon={Scale} title="Your Obligations & Access">
                <p>
                    You are responsible for making all arrangements necessary to access our site. This website may only be used for lawful purposes. Ethree reserves the right to withdraw, amend, or stop the service provided without notice and is not liable to any party for modifications or suspensions.
                </p>
                <div className="mt-6 p-4 border-l-4 border-sunset-orange bg-orange-50 rounded-r-xl">
                    <p className="text-sm text-orange-800 font-medium">
                        By using this service, you agree to provide true, accurate, and complete information about yourself. It is your responsibility to update information periodically and keep your account login ID and password secure.
                    </p>
                </div>
            </SectionCard>
        </FadeIn>

        <FadeIn delay={0.3}>
            <SectionCard icon={LinkIcon} title="Content & External Links">
                <p>
                    We provide the Material through the Platforms FOR YOUR PERSONAL AND NON-COMMERCIAL USE ONLY. You may view, copy, and distribute the Materials for internal, informational purposes only. You are prohibited from data mining, scraping, or using processes that send automated queries.
                </p>
                <p className="mt-4">
                    This Website may contain links to other sites not under our control. Ethree assumes no responsibility for the content of such websites and disclaims liability for any loss or damage arising out of their use.
                </p>
            </SectionCard>
        </FadeIn>

        <FadeIn delay={0.4}>
            <SectionCard icon={AlertCircle} title="Limitation of Liability & Disclaimers">
                <div className="space-y-4">
                    <p>
                        <strong>Indemnity:</strong> You agree to indemnify and hold ethree.in and its affiliates harmless from any claim or demand, including attorney fees, made by any third party due to or arising out of your use of the Service or violation of the Terms and Conditions.
                    </p>
                    <p>
                        <strong>Liability:</strong> Ethree shall not be liable for damages of any kind, whether direct, indirect, incidental, punitive, or consequential, resulting from the use or inability to use the service, substitute procurements, or statements/conduct of third parties.
                    </p>
                    <p>
                        <strong>Warranties:</strong> Your use of the service is at your sole risk. Ethree expressly disclaims all warranties of any kind, express or implied. We make no warranty that the service will meet your requirements, be uninterrupted, timely, secure, or error-free.
                    </p>
                </div>
            </SectionCard>
        </FadeIn>
    </div>
);

const LegalModal = ({ doc, onClose }) => {
    // Disable body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const contentMap = {
        'about': {
            title: 'About Us',
            icon: Info,
            component: <AboutContent />
        },
        'privacy': {
            title: 'Privacy Policy',
            icon: Shield,
            component: <PrivacyContent />
        },
        'terms': {
            title: 'Terms of Use',
            icon: Book,
            component: <TermsContent />
        }
    };

    const currentDoc = contentMap[doc] || contentMap['about'];
    const HeaderIcon = currentDoc.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-charcoal-grey/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#f8fafc] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 flex items-center justify-between p-6 md:p-8 bg-white border-b border-gray-100 relative z-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white shadow-md shadow-riverside-teal/10 rounded-xl flex items-center justify-center text-riverside-teal">
                                <HeaderIcon size={24} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black font-heading text-charcoal-grey">
                                {currentDoc.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-sunset-orange transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                        {/* Background Decorations */}
                        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-riverside-teal/5 to-transparent pointer-events-none" />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sunset-orange/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            {currentDoc.component}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LegalModal;
