'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Mesh, ShaderMaterial, TextureLoader, MathUtils, Texture, SRGBColorSpace } from 'three'
import {
  holographicVertexShader,
  holographicFragmentShader,
} from './holographicShader'

interface HolographicImagePlaneProps {
  imageUrl: string
  allImageUrls: string[]
}

export default function HolographicImagePlane({
  imageUrl,
  allImageUrls,
}: HolographicImagePlaneProps) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const { pointer } = useThree()
  const textureCache = useRef<Map<string, Texture>>(new Map())
  const currentUrlRef = useRef(imageUrl)
  const fadingRef = useRef(false)

  const uniforms = useMemo(
    () => ({
      uTexture: { value: new Texture() },
      uTime: { value: 0 },
      uOpacity: { value: 1.0 },
    }),
    []
  )

  // Preload all image textures on mount
  useEffect(() => {
    const loader = new TextureLoader()
    allImageUrls.forEach((url) => {
      if (!textureCache.current.has(url)) {
        loader.loadAsync(url).then((tex) => {
          tex.colorSpace = SRGBColorSpace
          textureCache.current.set(url, tex)
        })
      }
    })
  }, [allImageUrls])

  // Load / change texture with fade
  useEffect(() => {
    const loader = new TextureLoader()

    const applyTexture = (tex: Texture) => {
      tex.colorSpace = SRGBColorSpace
      textureCache.current.set(imageUrl, tex)

      if (currentUrlRef.current !== imageUrl) {
        // Fade out, swap, fade in
        fadingRef.current = true
        currentUrlRef.current = imageUrl
      }

      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = tex
        materialRef.current.needsUpdate = true
      }
    }

    const cached = textureCache.current.get(imageUrl)
    if (cached) {
      applyTexture(cached)
    } else {
      loader.loadAsync(imageUrl).then(applyTexture)
    }
  }, [imageUrl])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()

      // Handle fade transition
      if (fadingRef.current) {
        const op = materialRef.current.uniforms.uOpacity.value
        if (op > 0.85) {
          // Already faded back in — done
          materialRef.current.uniforms.uOpacity.value = MathUtils.lerp(op, 1.0, 0.08)
          if (op > 0.99) fadingRef.current = false
        }
      }
    }

    // Mouse-follow tilt
    if (meshRef.current) {
      const targetRotY = pointer.x * 0.08
      const targetRotX = -pointer.y * 0.08
      meshRef.current.rotation.y = MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotY,
        0.05
      )
      meshRef.current.rotation.x = MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotX,
        0.05
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.4, 2.4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={holographicVertexShader}
        fragmentShader={holographicFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}
