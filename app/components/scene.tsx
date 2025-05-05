"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Grid, PerspectiveCamera, Environment, TransformControls } from "@react-three/drei"
import type * as THREE from "three"

import { Furniture } from "./furniture"
import { Room } from "./room"
import { RoomDimensionsModal } from "./room-dimensions-modal"
import { BottomToolbar } from "./bottom-toolbar"
import { DoorPlacementModal } from "./door-placement-modal"

// Convert feet to meters for the 3D scene (1 foot = 0.3048 meters)
const FEET_TO_METERS = 0.3048

// Simple UUID generator function to replace the uuid library
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

type FurnitureItem = {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  selected: boolean
  scale: number
}

type Door = {
  id: string
  wall: "north" | "south" | "east" | "west"
  position: number // 0-1 position along the wall
  width: number
  height: number
  selected?: boolean
}

type HistoryAction = {
  type: "add" | "remove" | "move" | "resize" | "rotate" | "add-door" | "remove-door" | "move-door" | "resize-door"
  furniture: FurnitureItem[]
  doors: Door[]
}

// Camera controller to focus on room
function CameraController({ width, length, height }: { width: number; length: number; height: number }) {
  const { camera } = useThree()

  useEffect(() => {
    // Position camera to view the entire room
    const maxDimension = Math.max(width, length) * FEET_TO_METERS
    camera.position.set(maxDimension, maxDimension * 0.8, maxDimension)
    camera.lookAt(0, 0, 0)
  }, [camera, width, length, height])

  return null
}

export default function Scene() {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null)
  const [roomWidth, setRoomWidth] = useState<number>(12)
  const [roomLength, setRoomLength] = useState<number>(15)
  const [roomHeight, setRoomHeight] = useState<number>(8) // Default 8 feet
  const [showRoomModal, setShowRoomModal] = useState<boolean>(true)
  const [showDoorModal, setShowDoorModal] = useState<boolean>(false)
  const [roomCreated, setRoomCreated] = useState<boolean>(false)
  const [doors, setDoors] = useState<Door[]>([])
  const [history, setHistory] = useState<HistoryAction[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [canUndo, setCanUndo] = useState<boolean>(false)
  const [canRedo, setCanRedo] = useState<boolean>(false)
  const planeRef = useRef<THREE.Mesh>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const transformControlRef = useRef<any>(null)

  // Add action to history
  const addToHistory = (action: HistoryAction) => {
    // If we're not at the end of the history, remove future actions
    const newHistory = history.slice(0, historyIndex + 1)
    setHistory([...newHistory, action])
    setHistoryIndex(newHistory.length)
    setCanUndo(true)
    setCanRedo(false)

    // Dispatch event to update toolbar
    window.dispatchEvent(
      new CustomEvent("room-planner:history-change", {
        detail: { canUndo: true, canRedo: false },
      }),
    )
  }

  // Undo action
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const prevAction = history[historyIndex - 1]
      if (prevAction) {
        setFurniture(prevAction.furniture)
        setDoors(prevAction.doors)
      } else {
        setFurniture([])
        setDoors([])
      }
      setHistoryIndex(historyIndex - 1)
      setCanRedo(true)
      setCanUndo(historyIndex - 1 >= 0)

      // Dispatch event to update toolbar
      window.dispatchEvent(
        new CustomEvent("room-planner:history-change", {
          detail: { canUndo: historyIndex - 1 >= 0, canRedo: true },
        }),
      )
    }
  }

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextAction = history[historyIndex + 1]
      setFurniture(nextAction.furniture)
      setDoors(nextAction.doors)
      setHistoryIndex(historyIndex + 1)
      setCanUndo(true)
      setCanRedo(historyIndex + 1 < history.length - 1)

      // Dispatch event to update toolbar
      window.dispatchEvent(
        new CustomEvent("room-planner:history-change", {
          detail: { canUndo: true, canRedo: historyIndex + 1 < history.length - 1 },
        }),
      )
    }
  }

  // Set up event listeners for undo/redo
  useEffect(() => {
    const handleUndoEvent = () => handleUndo()
    const handleRedoEvent = () => handleRedo()

    window.addEventListener("room-planner:undo", handleUndoEvent)
    window.addEventListener("room-planner:redo", handleRedoEvent)

    return () => {
      window.removeEventListener("room-planner:undo", handleUndoEvent)
      window.removeEventListener("room-planner:redo", handleRedoEvent)
    }
  }, [history, historyIndex])

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys if something is selected
      if (selectedId !== null) {
        const step = 0.1 * FEET_TO_METERS // Move 0.1 feet at a time
        const selectedFurniture = furniture[selectedId]

        if (!selectedFurniture) return

        const newPosition: [number, number, number] = [...selectedFurniture.position] as [number, number, number]

        switch (e.key) {
          case "ArrowUp":
            newPosition[2] -= step
            e.preventDefault()
            break
          case "ArrowDown":
            newPosition[2] += step
            e.preventDefault()
            break
          case "ArrowLeft":
            newPosition[0] -= step
            e.preventDefault()
            break
          case "ArrowRight":
            newPosition[0] += step
            e.preventDefault()
            break
        }

        // room boundaries
        const roomWidthMeters = roomWidth * FEET_TO_METERS
        const roomLengthMeters = roomLength * FEET_TO_METERS
        const margin = 0.5 * FEET_TO_METERS

        newPosition[0] = Math.max(-roomWidthMeters / 2 + margin, Math.min(roomWidthMeters / 2 - margin, newPosition[0]))
        newPosition[2] = Math.max(
          -roomLengthMeters / 2 + margin,
          Math.min(roomLengthMeters / 2 - margin, newPosition[2]),
        )

        // Update furniture position
        if (newPosition[0] !== selectedFurniture.position[0] || newPosition[2] !== selectedFurniture.position[2]) {
          const newFurniture = furniture.map((item, i) => {
            if (i === selectedId) {
              return {
                ...item,
                position: newPosition,
              }
            }
            return item
          })

          setFurniture(newFurniture)
        }
      }

      // Handle door movement with arrow keys
      if (selectedDoorId !== null) {
        const step = 0.05 
        const selectedDoor = doors.find((door) => door.id === selectedDoorId)

        if (!selectedDoor) return

        let newPosition = selectedDoor.position

        switch (e.key) {
          case "ArrowLeft":
            newPosition = Math.max(0.1, newPosition - step)
            e.preventDefault()
            break
          case "ArrowRight":
            newPosition = Math.min(0.9, newPosition + step)
            e.preventDefault()
            break
        }

        // Update door position
        if (newPosition !== selectedDoor.position) {
          const newDoors = doors.map((door) => {
            if (door.id === selectedDoorId) {
              return {
                ...door,
                position: newPosition,
              }
            }
            return door
          })

          setDoors(newDoors)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [furniture, selectedId, doors, selectedDoorId, roomWidth, roomLength])

  const handleCreateRoom = (width: number, length: number, height: number) => {
    setRoomWidth(width)
    setRoomLength(length)
    setRoomHeight(height)
    setRoomCreated(true)

    
    if (doors.length > 0) {
      const adjustedDoors = doors.map((door) => {
        
        if (door.height >= height) {
          return { ...door, height: Math.max(6, height - 0.5) }
        }
        return door
      })

      if (JSON.stringify(doors) !== JSON.stringify(adjustedDoors)) {
        setDoors(adjustedDoors)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!roomCreated) return

    const furnitureId = e.dataTransfer.getData("furniture")
    if (!furnitureId) return

    const canvas = e.currentTarget as HTMLElement
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1
    const y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1

    const roomWidthMeters = roomWidth * FEET_TO_METERS
    const roomLengthMeters = roomLength * FEET_TO_METERS

    // Ensure the furniture is placed inside the room
    // Map from -1,1 to room dimensions, but keep a margin from the walls
    const margin = 0.5 * FEET_TO_METERS
    const posX = ((x * roomWidthMeters) / 2) * 0.8 // Scale down to 80% of room width
    const posZ = ((y * roomLengthMeters) / 2) * 0.8 // Scale down to 80% of room length

    // Clamp position to room boundaries
    const clampedX = Math.max(-roomWidthMeters / 2 + margin, Math.min(roomWidthMeters / 2 - margin, posX))
    const clampedZ = Math.max(-roomLengthMeters / 2 + margin, Math.min(roomLengthMeters / 2 - margin, posZ))

    // Add new furniture with initial rotation and scale
    const newFurniture: FurnitureItem[] = [
      ...furniture,
      {
        id: furnitureId,
        position: [clampedX, 0.01, clampedZ] as [number, number, number], 
        rotation: [0, 0, 0] as [number, number, number], 
        selected: false,
        scale: 1.0, // Default scale
      },
    ]

    setFurniture(newFurniture)

    // Add to history
    addToHistory({
      type: "add",
      furniture: newFurniture,
      doors,
    })
  }

  const handleSelect = (index: number) => {
    // Store the current position before deselecting
    if (selectedId !== null && selectedId !== index) {
      // Make sure we capture the final position from the transform control
      if (transformControlRef.current) {
        const obj = transformControlRef.current.object
        if (obj) {
          // Create a new furniture array with the updated position
          const currentFurniture = [...furniture]
          currentFurniture[selectedId] = {
            ...currentFurniture[selectedId],
            position: [obj.position.x, obj.position.y, obj.position.z] as [number, number, number],
            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number],
          }
          
          // Update the furniture state with the new positions
          setFurniture(currentFurniture)
          
          // Add to history
          addToHistory({
            type: "move",
            furniture: currentFurniture,
            doors,
          })
        }
      }
    }
  
    // Deselect any selected door
    setSelectedDoorId(null)
    setDoors(doors.map((door) => ({ ...door, selected: false })))
  
    // Select or deselect furniture
    setSelectedId(selectedId === index ? null : index)
    setFurniture(
      furniture.map((item, i) => ({
        ...item,
        selected: i === index && selectedId !== index,
      }))
    )
  }

  const handleSelectDoor = (id: string) => {
    // Deselect any selected furniture
    setSelectedId(null)
    setFurniture(furniture.map((item) => ({ ...item, selected: false })))

    // Select or deselect door
    setSelectedDoorId(selectedDoorId === id ? null : id)
    setDoors(
      doors.map((door) => ({
        ...door,
        selected: door.id === id && selectedDoorId !== id,
      })),
    )
  }

  const handleTransform = (
    transform: { position?: [number, number, number]; rotation?: [number, number, number] },
    index: number,
  ) => {
    if (transform.position) {
      // Clamp position to room boundaries (in meters)
      const roomWidthMeters = roomWidth * FEET_TO_METERS
      const roomLengthMeters = roomLength * FEET_TO_METERS
      const margin = 0.5 * FEET_TO_METERS

      const [x, y, z] = transform.position
      const clampedX = Math.max(-roomWidthMeters / 2 + margin, Math.min(roomWidthMeters / 2 - margin, x))
      const clampedZ = Math.max(-roomLengthMeters / 2 + margin, Math.min(roomLengthMeters / 2 - margin, z))
      transform.position = [clampedX, y, clampedZ] as [number, number, number]
    }

    const newFurniture = furniture.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          ...transform,
        }
      }
      return item
    })

    setFurniture(newFurniture)

    if (transform.position) {
      addToHistory({
        type: "move",
        furniture: newFurniture,
        doors,
      })
    }
  }

  const handleDeleteFurniture = () => {
    if (selectedId !== null) {
      const newFurniture = furniture.filter((_, i) => i !== selectedId)
      setFurniture(newFurniture)
      setSelectedId(null)

      // Add to history
      addToHistory({
        type: "remove",
        furniture: newFurniture,
        doors,
      })
    }
  }

  const handleResizeFurniture = (scale: number) => {
    if (selectedId !== null) {
      const newFurniture = furniture.map((item, i) => {
        if (i === selectedId) {
          return {
            ...item,
            scale,
          }
        }
        return item
      })

      setFurniture(newFurniture)

      // Add to history
      addToHistory({
        type: "resize",
        furniture: newFurniture,
        doors,
      })
    }
  }

  const handleRotateFurniture = (angleDegrees: number) => {
    if (selectedId !== null) {
      const angleRadians = (angleDegrees * Math.PI) / 180

      const newFurniture = furniture.map((item, i) => {
        if (i === selectedId) {
          return {
            ...item,
            rotation: [0, angleRadians, 0] as [number, number, number],
          }
        }
        return item
      })

      setFurniture(newFurniture)

      // Add to history
      addToHistory({
        type: "rotate",
        furniture: newFurniture,
        doors,
      })
    }
  }

  const handleAddDoor = () => {
    setShowDoorModal(true)
  }

  const handleCreateDoor = (
    wall: "north" | "south" | "east" | "west",
    position: number,
    width: number,
    height: number,
  ) => {
    // Ensure door height is strictly less than room height
    const doorHeight = Math.min(height, roomHeight - 0.5)

    // Additional validation to guarantee the condition
    if (doorHeight >= roomHeight) {
      console.warn("Door height must be less than room height")
      return
    }

    const newDoor: Door = {
      id: generateUUID(),
      wall,
      position,
      width,
      height: doorHeight,
      selected: false,
    }

    const newDoors = [...doors, newDoor]
    setDoors(newDoors)

    // Add to history
    addToHistory({
      type: "add-door",
      furniture,
      doors: newDoors,
    })
  }

  const handleMoveDoor = (position: number) => {
    if (selectedDoorId) {
      const newDoors = doors.map((door) => {
        if (door.id === selectedDoorId) {
          return {
            ...door,
            position,
          }
        }
        return door
      })

      setDoors(newDoors)

      // Add to history
      addToHistory({
        type: "move-door",
        furniture,
        doors: newDoors,
      })
    }
  }

  const handleResizeDoor = (width: number, height: number) => {
    if (selectedDoorId) {
      // Ensure door height is strictly less than room height
      const doorHeight = Math.min(height, roomHeight - 0.5)

      // Additional validation to guarantee the condition
      if (doorHeight >= roomHeight) {
        console.warn("Door height must be less than room height")
        return
      }

      const newDoors = doors.map((door) => {
        if (door.id === selectedDoorId) {
          return {
            ...door,
            width,
            height: doorHeight,
          }
        }
        return door
      })

      setDoors(newDoors)

      // Add to history
      addToHistory({
        type: "resize-door",
        furniture,
        doors: newDoors,
      })
    }
  }

  const handleDeleteDoor = () => {
    if (selectedDoorId) {
      const newDoors = doors.filter((door) => door.id !== selectedDoorId)
      setDoors(newDoors)
      setSelectedDoorId(null)

      // Add to history
      addToHistory({
        type: "remove-door",
        furniture,
        doors: newDoors,
      })
    }
  }

  // Get the current selected furniture item
  const selectedFurniture = selectedId !== null ? furniture[selectedId] : null

  // Get the current selected door
  const selectedDoor = selectedDoorId !== null ? doors.find((door) => door.id === selectedDoorId) : null

  // Calculate the rotation in degrees for the bottom toolbar
  const currentRotationDegrees = selectedFurniture ? (selectedFurniture.rotation[1] * 180) / Math.PI : 0

  return (
    <>
      <RoomDimensionsModal open={showRoomModal} onOpenChange={setShowRoomModal} onSubmit={handleCreateRoom} />

      <DoorPlacementModal
        open={showDoorModal}
        onOpenChange={setShowDoorModal}
        onSubmit={handleCreateDoor}
        roomHeight={roomHeight}
      />

      <div ref={canvasRef} className="w-full h-full relative" onDragOver={handleDragOver} onDrop={handleDrop}>
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
          {roomCreated && <CameraController width={roomWidth} length={roomLength} height={roomHeight} />}

          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
            // Hide the navigation controls (N logo)
            enablePan={true}
            screenSpacePanning={true}
          />

          {/* Always show the grid */}
          <Grid
            args={[30, 30]}
            cellSize={1}
            cellThickness={1}
            cellColor="#6e6e6e"
            sectionSize={3}
            sectionThickness={1.5}
            sectionColor="#9d4b4b"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />

          {/* Show the room if created */}
          {roomCreated && (
            <Room
              width={roomWidth}
              length={roomLength}
              height={roomHeight}
              doors={doors}
              onSelectDoor={handleSelectDoor}
            />
          )}

          <ambientLight intensity={0.5} />
          <directionalLight position={[2.5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={2048}>
            <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10, 0.1, 50]} />
          </directionalLight>
          <Environment preset="apartment" />

          {furniture.map((item, index) => (
            <group key={`${item.id}-${index}`}>
              {item.selected && (
                <TransformControls
                  ref={transformControlRef}
                  mode="translate"
                  showX={true}
                  showY={false}
                  showZ={true}
                  size={0.5}
                  position={item.position}
                  rotation={item.rotation}
                  onObjectChange={(e?: THREE.Event) => {
                    if (!e) return
                    // We need to cast e.target to any since THREE.Event doesn't have the right type definition
                    const target = e.target as any
                    if (target && target.object) {
                      const obj = target.object as THREE.Object3D
                      handleTransform(
                        {
                          position: [obj.position.x, obj.position.y, obj.position.z] as [number, number, number],
                          rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number],
                        },
                        index,
                      )
                    }
                  }}
                >
                  <Furniture
                    type={item.id}
                    position={item.position}
                    rotation={item.rotation}
                    onClick={() => handleSelect(index)}
                    selected={item.selected}
                    roomDimensions={{ width: roomWidth, length: roomLength }}
                    scale={item.scale}
                  />
                </TransformControls>
              )}
              {!item.selected && (
                <Furniture
                  type={item.id}
                  position={item.position}
                  rotation={item.rotation}
                  onClick={() => handleSelect(index)}
                  selected={item.selected}
                  roomDimensions={{ width: roomWidth, length: roomLength }}
                  scale={item.scale}
                />
              )}
            </group>
          ))}
        </Canvas>

        {/* Bottom toolbar - show when furniture or door is selected */}
        {selectedId !== null && selectedFurniture && (
          <BottomToolbar
            onDelete={handleDeleteFurniture}
            onResize={handleResizeFurniture}
            onRotate={handleRotateFurniture}
            onAddDoor={handleAddDoor}
            currentScale={selectedFurniture.scale}
            currentRotation={currentRotationDegrees}
          />
        )}

        {selectedDoorId !== null && selectedDoor && (
          <BottomToolbar
            onDelete={handleDeleteFurniture}
            onResize={handleResizeFurniture}
            onRotate={handleRotateFurniture}
            onAddDoor={handleAddDoor}
            onMoveDoor={handleMoveDoor}
            onResizeDoor={handleResizeDoor}
            onDeleteDoor={handleDeleteDoor}
            currentScale={1}
            currentRotation={0}
            isDoor={true}
            doorWidth={selectedDoor.width}
            doorHeight={selectedDoor.height}
            doorPosition={selectedDoor.position}
            roomHeight={roomHeight}
          />
        )}
      </div>
    </>
  )
}
