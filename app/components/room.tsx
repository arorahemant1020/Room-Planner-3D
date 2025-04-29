"use client"

interface RoomProps {
  width: number
  length: number
  height: number
  onAddDoor?: (wall: "north" | "south" | "east" | "west", position: number) => void
  doors?: Array<{
    id: string
    wall: "north" | "south" | "east" | "west"
    position: number
    width: number
    height: number
    selected?: boolean
  }>
  onSelectDoor?: (id: string) => void
}

// Convert feet to meters for the 3D scene (1 foot = 0.3048 meters)
const FEET_TO_METERS = 0.3048

export function Room({ width, length, height, doors = [], onSelectDoor }: RoomProps) {
  // Convert feet to meters for the 3D scene
  const widthMeters = width * FEET_TO_METERS
  const lengthMeters = length * FEET_TO_METERS
  const heightMeters = height * FEET_TO_METERS

  const wallThickness = 0.1 * FEET_TO_METERS

  // Lift the room slightly to hide the grid
  const roomElevation = 0.01

  return (
    <group position={[0, roomElevation, 0]}>
      {/* Floor - solid to hide grid lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[widthMeters, lengthMeters]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
      </mesh>

      
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, heightMeters, 0]} receiveShadow>
        <planeGeometry args={[widthMeters, lengthMeters]} />
        <meshStandardMaterial color="#f8f8f8" transparent opacity={0.5} />
      </mesh>

      {/* Walls */}
      {/* North wall (Z-) */}
      <mesh position={[0, heightMeters / 2, -lengthMeters / 2]} castShadow receiveShadow>
        <boxGeometry args={[widthMeters, heightMeters, wallThickness]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.9} roughness={0.7} />
      </mesh>

      {/* South wall (Z+) */}
      <mesh position={[0, heightMeters / 2, lengthMeters / 2]} castShadow receiveShadow>
        <boxGeometry args={[widthMeters, heightMeters, wallThickness]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.9} roughness={0.7} />
      </mesh>

      {/* West wall (X-) */}
      <mesh position={[-widthMeters / 2, heightMeters / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[lengthMeters, heightMeters, wallThickness]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.9} roughness={0.7} />
      </mesh>

      {/* East wall (X+) */}
      <mesh position={[widthMeters / 2, heightMeters / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[lengthMeters, heightMeters, wallThickness]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.9} roughness={0.7} />
      </mesh>

      {/* Render doors */}
      {doors.map((door) => {
        const doorWidthMeters = door.width * FEET_TO_METERS
        const doorHeightMeters = door.height * FEET_TO_METERS

        let position: [number, number, number] = [0, 0, 0]
        let rotation: [number, number, number] = [0, 0, 0]

        // Calculate position based on wall and position (0-1)
        switch (door.wall) {
          case "north":
            // Position along the north wall (back)
            position = [door.position * widthMeters - widthMeters / 2, doorHeightMeters / 2, -lengthMeters / 2]
            break
          case "south":
            // Position along the south wall (front)
            position = [door.position * widthMeters - widthMeters / 2, doorHeightMeters / 2, lengthMeters / 2]
            rotation = [0, Math.PI, 0]
            break
          case "west":
            // Position along the west wall (left)
            position = [-widthMeters / 2, doorHeightMeters / 2, door.position * lengthMeters - lengthMeters / 2]
            rotation = [0, -Math.PI / 2, 0]
            break
          case "east":
            // Position along the east wall (right)
            position = [widthMeters / 2, doorHeightMeters / 2, door.position * lengthMeters - lengthMeters / 2]
            rotation = [0, Math.PI / 2, 0]
            break
        }

        return (
          <group
            key={door.id}
            position={position}
            rotation={rotation}
            onClick={(e) => {
              e.stopPropagation()
              if (onSelectDoor) onSelectDoor(door.id)
            }}
          >
            {/* Door frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[doorWidthMeters, doorHeightMeters, wallThickness * 1.5]} />
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </mesh>

            {/* Door (slightly offset to avoid z-fighting) */}
            <mesh position={[0, 0, wallThickness * 0.6]}>
              <boxGeometry args={[doorWidthMeters * 0.9, doorHeightMeters * 0.95, wallThickness * 0.5]} />
              <meshStandardMaterial color={door.selected ? "#ff9999" : "#A0522D"} roughness={0.6} />
            </mesh>

            {/* Door handle */}
            <mesh position={[doorWidthMeters * 0.3, 0, wallThickness * 0.9]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
