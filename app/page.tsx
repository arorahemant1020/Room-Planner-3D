"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

import { Toolbar } from "./components/toolbar"
import { Sidebar } from "./components/sidebar"

// Dynamically import the Canvas component to avoid SSR issues
const Scene = dynamic(() => import("./components/scene"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
})

export default function Home() {
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const handleResetRoom = () => {
    setShowRoomModal(true)
    // The actual reset happens in the Scene component
    window.location.reload()
  }

  // Listen for history state changes
  useEffect(() => {
    const handleHistoryChange = (e: CustomEvent) => {
      setCanUndo(e.detail.canUndo)
      setCanRedo(e.detail.canRedo)
    }

    window.addEventListener("room-planner:history-change", handleHistoryChange as EventListener)

    return () => {
      window.removeEventListener("room-planner:history-change", handleHistoryChange as EventListener)
    }
  }, [])

  return (
    <div className="flex flex-col w-full h-screen">
      <Toolbar
        onResetRoom={handleResetRoom}
        onUndo={() => window.dispatchEvent(new CustomEvent("room-planner:undo"))}
        onRedo={() => window.dispatchEvent(new CustomEvent("room-planner:redo"))}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex-1 bg-muted">
          <Suspense
            fallback={
              <div className="flex items-center justify-center w-full h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }
          >
            <Scene />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

