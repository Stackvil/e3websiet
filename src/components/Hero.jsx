import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment, MeshWobbleMaterial, ContactShadows, PresentationControls } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const Sculpture = () => {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
        }
    })

    return (
        <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        >
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh ref={meshRef}>
                    <torusKnotGeometry args={[1.5, 0.4, 256, 32]} />
                    <MeshDistortMaterial
                        color="#10b981"
                        speed={4}
                        distort={0.4}
                        radius={1}
                        roughness={0}
                        metalness={1}
                        emissive="#065f46"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </Float>
            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.15} far={6} color="#000000" />
        </PresentationControls>
    )
}

const Hero = () => {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const opacity = useTransform(scrollY, [0, 300], [1, 0])

    return (
        <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">
            {/* 3D Scene - Higher quality abstract sculpture */}
            <div className="absolute inset-0 z-0 mask-bottom">
                <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#10b981" />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#fbbf24" />
                    <Sculpture />
                    <Environment preset="night" />
                </Canvas>
            </div>

            {/* Content Layer */}
            <div className="container relative z-10 text-center">
                <motion.div
                    style={{ y: y1, opacity }}
                    className="flex flex-col items-center"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-xs uppercase tracking-[0.6em] text-primary font-bold mb-6"
                    >
                        A Family Entertainment Center
                    </motion.span>

                    <h1 className="text-6xl md:text-9xl font-black mb-4 leading-[0.9] tracking-tighter">
                        EAT. ENJOY.<br />
                        <span className="serif text-primary">Entertainment.</span>
                    </h1>

                    <p className="max-w-xl text-text-secondary text-lg mb-12 font-light leading-relaxed">
                        Experience the scenic beauty of Krishna Riverbed combined with world-class cuisines and elite gaming zones.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <motion.a
                            href="#food"
                            className="btn-premium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Stalls <ArrowRight size={16} />
                        </motion.a>

                        <a href="#entertainment" className="text-xs uppercase tracking-[0.2em] font-bold py-4 px-8 border-b border-white/20 hover:border-primary transition-all">
                            Recreation Zone
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Interactive Scroll Decor */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <span className="text-[10px] tracking-[0.3em] uppercase text-text-dim rotate-90 origin-left translate-x-3 mb-6">Scroll</span>
                <div className="w-[1px] h-20 bg-gradient-to-b from-primary to-transparent" />
            </div>
        </section>
    )
}

export default Hero
