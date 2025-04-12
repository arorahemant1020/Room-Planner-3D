"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface DoorPlacementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (wall: "north" | "south" | "east" | "west", position: number, width: number, height: number) => void
  roomHeight: number
}

export function DoorPlacementModal({ open, onOpenChange, onSubmit, roomHeight }: DoorPlacementModalProps) {
  const [wall, setWall] = useState<"north" | "south" | "east" | "west">("south")
  const [position, setPosition] = useState(0.5) // 0-1 position along the wall
  const [width, setWidth] = useState(3) // in feet
  const [height, setHeight] = useState(7) // in feet
  const [error, setError] = useState("")

  // Update height if it exceeds room height when roomHeight changes
  useEffect(() => {
    if (height > roomHeight - 0.5) {
      setHeight(Math.max(6, roomHeight - 0.5))
    }
  }, [roomHeight])

  const handleSubmit = () => {
    if (width < 2 || width > 6) {
      setError("Door width must be between 2 and 6 feet")
      return
    }

    if (height < 6 || height > roomHeight - 0.5) {
      setError(`Door height must be between 6 and ${roomHeight - 0.5} feet (0.5 feet below ceiling)`)
      return
    }

    setError("")
    onSubmit(wall, position, width, height)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Door</DialogTitle>
          <DialogDescription>Select a wall and position for your door.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wall" className="text-right">
              Wall
            </Label>
            <Select value={wall} onValueChange={(value) => setWall(value as "north" | "south" | "east" | "west")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a wall" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north">North (Back)</SelectItem>
                <SelectItem value="south">South (Front)</SelectItem>
                <SelectItem value="east">East (Right)</SelectItem>
                <SelectItem value="west">West (Left)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Position</Label>
            <div className="col-span-3">
              <Slider
                value={[position]}
                min={0.1}
                max={0.9}
                step={0.05}
                onValueChange={(value) => setPosition(value[0])}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              Width (ft)
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="col-span-3"
              min="2"
              max="6"
              step="0.5"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              Height (ft)
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="col-span-3"
              min="6"
              max={roomHeight - 0.5}
              step="0.5"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Door</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
