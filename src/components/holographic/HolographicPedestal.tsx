'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

export default function HolographicPedestal() {
  const ringRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime()
      // Pulse opacity between 0.3 and 0.7
      const material = ringRef.current.material as { opacity: number }
      material.opacity = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.5))
    }
  })

  return (
    <group position={[0, -1.35, 0]}>
      {/* Altar octagonal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.6, 0.15, 8]} />
        <meshStandardMaterial
          color="#0a0a12"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Anillo imperial-gold con pulso */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <torusGeometry args={[1.5, 0.02, 8, 64]} />
        <meshStandardMaterial
          color="#C9A227"
          emissive="#C9A227"
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  )
}
