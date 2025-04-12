"use client"

import { useState } from "react"
import { Trash2, Move, Maximize, RotateCw, DoorOpenIcon as Door } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BottomToolbarProps {
  onDelete: () => void
  onResize: (scale: number) => void
  onRotate: (angle: number) => void
  onAddDoor: () => void
  onMoveDoor?: (position: number) => void
  onResizeDoor?: (width: number, height: number) => void
  onDeleteDoor?: () => void
  currentScale: number
  currentRotation: number
  isDoor?: boolean
  doorWidth?: number
  doorHeight?: number
  doorPosition?: number
  roomHeight?: number
}

export function BottomToolbar({
  onDelete,
  onResize,
  onRotate,
  onAddDoor,
  onMoveDoor,
  onResizeDoor,
  onDeleteDoor,
  currentScale = 1,
  currentRotation = 0,
  isDoor = false,
  doorWidth = 3,
  doorHeight = 7,
  doorPosition = 0.5,
  roomHeight = 8,
}: BottomToolbarProps) {
  const [activeTab, setActiveTab] = useState<"move" | "resize" | "rotate" | null>("move")

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background border-t p-2 flex flex-col gap-2 z-10">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "move" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setActiveTab(activeTab === "move" ? null : "move")}
                >
                  <Move className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "resize" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setActiveTab(activeTab === "resize" ? null : "resize")}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resize</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isDoor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "rotate" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setActiveTab(activeTab === "rotate" ? null : "rotate")}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rotate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex gap-2">
          {!isDoor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onAddDoor}>
                    <Door className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Door</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="icon" onClick={isDoor ? onDeleteDoor : onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {activeTab === "move" && isDoor && onMoveDoor && (
        <div className="flex items-center gap-4 px-2">
          <span className="text-sm">Position:</span>
          <Slider
            value={[doorPosition || 0.5]}
            min={0.1}
            max={0.9}
            step={0.05}
            onValueChange={(value) => onMoveDoor(value[0])}
            className="flex-1"
          />
        </div>
      )}

      {activeTab === "resize" && !isDoor && (
        <div className="flex items-center gap-4 px-2">
          <span className="text-sm">Size:</span>
          <Slider
            value={[currentScale]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(value) => onResize(value[0])}
            className="flex-1"
          />
        </div>
      )}

      {activeTab === "resize" && isDoor && onResizeDoor && (
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-4">
            <span className="text-sm w-16">Width (ft):</span>
            <Slider
              value={[doorWidth || 3]}
              min={2}
              max={6}
              step={0.5}
              onValueChange={(value) => onResizeDoor(value[0], doorHeight || 7)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm w-16">Height (ft):</span>
            <Slider
              value={[doorHeight || 7]}
              min={6}
              max={roomHeight - 0.5}
              step={0.5}
              onValueChange={(value) => onResizeDoor(doorWidth || 3, value[0])}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {activeTab === "rotate" && !isDoor && (
        <div className="flex items-center gap-4 px-2">
          <span className="text-sm">Rotation:</span>
          <Slider
            value={[currentRotation]}
            min={0}
            max={360}
            step={15}
            onValueChange={(value) => onRotate(value[0])}
            className="flex-1"
          />
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center mt-1">
        Use arrow keys to move {isDoor ? "door" : "furniture"}
      </div>
    </div>
  )
}
