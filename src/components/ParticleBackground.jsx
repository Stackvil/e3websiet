import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Particles = () => {
    const count = 1500
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 50
            p[i * 3 + 1] = (Math.random() - 0.5) * 50
            p[i * 3 + 2] = (Math.random() - 0.5) * 50
        }
        return p
    }, [count])

    const pointsRef = useRef()

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001
            pointsRef.current.rotation.x += 0.0005
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={points}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#10b981"
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    )
}

const ParticleBackground = () => {
    return (
        <div className="fixed inset-0 -z-20 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 20] }}>
                <Particles />
            </Canvas>
        </div>
    )
}

export default ParticleBackground
