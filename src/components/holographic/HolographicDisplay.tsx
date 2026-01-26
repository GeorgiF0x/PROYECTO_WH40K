'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import HolographicImagePlane from './HolographicImagePlane'

interface HolographicDisplayProps {
  imageUrl: string
  allImageUrls: string[]
}

export default function HolographicDisplay({
  imageUrl,
  allImageUrls,
}: HolographicDisplayProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Luz neutra para ver la mini tal cual */}
      <ambientLight intensity={1.0} />

      <Suspense fallback={null}>
        <Float speed={1.5} floatIntensity={0.15} rotationIntensity={0}>
          <HolographicImagePlane
            imageUrl={imageUrl}
            allImageUrls={allImageUrls}
          />
        </Float>

        <Sparkles
          count={20}
          scale={3}
          size={1}
          color="#C9A227"
          opacity={0.15}
          speed={0.3}
        />
      </Suspense>
    </Canvas>
  )
}
