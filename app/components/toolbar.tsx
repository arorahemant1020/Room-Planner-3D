"use client"

import { Home, RefreshCw, Undo, Redo } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ToolbarProps {
  onResetRoom?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo: boolean
  canRedo: boolean
}

export function Toolbar({ onResetRoom, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  return (
    <header className="flex items-center h-14 gap-2 px-4 border-b">
      <Button variant="ghost" size="icon">
        <Home className="w-4 h-4" />
      </Button>
      <h1 className="text-lg font-semibold ml-2">3D Room Planner</h1>
      <Separator orientation="vertical" className="h-6 ml-4" />
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        className={!canUndo ? "opacity-50 cursor-not-allowed" : ""}
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        className={!canRedo ? "opacity-50 cursor-not-allowed" : ""}
      >
        <Redo className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2 ml-auto">
        {onResetRoom && (
          <Button variant="outline" size="sm" onClick={onResetRoom}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Room
          </Button>
        )}
      </div>
    </header>
  )
}

