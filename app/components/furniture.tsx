"use client"

import { useRef, useEffect } from "react"
import { useGLTF } from "@react-three/drei"
import type * as THREE from "three"

// Convert feet to meters for the 3D scene (1 foot = 0.3048 meters)
const FEET_TO_METERS = 0.3048

// Define furniture types with their scales, rotations, and model paths
const FURNITURE_CONFIGS: Record<
  string,
  {
    // Scale is relative to a 10x10 foot room
    relativeScale: [number, number, number]
    yOffset: number
    modelPath: string
  }
> = {
  sofa: {
    relativeScale: [0.065, 0.052, 0.055], // 2ft x 1ft x 1ft in a 10ft room
    yOffset: 0,
    modelPath: "/assets/3d/sofa.glb", 
  },
  chair: {
    relativeScale: [0.04, 0.04, 0.04], // 1ft x 1ft x 1ft in a 10ft room
    yOffset: 0,
    modelPath: "/assets/3d/chair.glb", 
  },
  table: {
    relativeScale: [1, 1, 1], // 1.5ft x 0.8ft x 1.5ft in a 10ft room
    yOffset: 0,
    modelPath: "/assets/3d/table.glb", 
  },
  bed: {
    relativeScale: [0.03, 0.04, 0.03], // 3.5ft x 0.5ft x 2ft in a 10ft room
    yOffset: 0,
    modelPath: "/assets/3d/bed.glb", 
  },
  lamp: {
    relativeScale: [0.05, 0.15, 0.05], // 0.5ft x 1.5ft x 0.5ft in a 10ft room
    yOffset: 0,
    modelPath: "/assets/3d/lamp.glb", 
  },
}

interface FurnitureProps {
  type: string
  position: [number, number, number]
  rotation: [number, number, number]
  onClick?: () => void
  selected?: boolean
  roomDimensions?: { width: number; length: number }
  scale?: number
}

export function Furniture({
  type,
  position,
  rotation,
  onClick,
  selected,
  roomDimensions = { width: 10, length: 10 }, // Default to 10x10 feet
  scale = 1.0,
}: FurnitureProps) {
  const meshRef = useRef<THREE.Group>(null)
  const config = FURNITURE_CONFIGS[type as keyof typeof FURNITURE_CONFIGS]


  const { scene } = useGLTF(config?.modelPath || "/assets/3d/bed.glb")

  // Calculate the actual scale based on room dimensions
  // This adjusts the furniture size relative to the room size
  const avgRoomDimension = (roomDimensions.width + roomDimensions.length) / 2
  const scaleFactor = avgRoomDimension / 10 // Relative to a 10x10 foot room

  // Apply the user-defined scale factor on top of the calculated scale
  const actualScale =
    (config?.relativeScale.map((s) => s * scaleFactor * FEET_TO_METERS * scale) as [number, number, number]) ||
    ([0.1, 0.1, 0.1] as [number, number, number])


  useEffect(() => {
    if (meshRef.current) {
      const clone = scene.clone()
      meshRef.current.clear()
      meshRef.current.add(clone)
    }
  }, [scene])

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      scale={actualScale}
    >
      {selected && <meshStandardMaterial attach="material" color="#9d4b4b" />}
    </group>
  )
}

