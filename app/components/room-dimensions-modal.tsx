"use client"

import { useState } from "react"
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

interface RoomDimensionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (width: number, length: number) => void
}

export function RoomDimensionsModal({ open, onOpenChange, onSubmit }: RoomDimensionsModalProps) {
  const [width, setWidth] = useState("12")
  const [length, setLength] = useState("15")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const widthNum = Number.parseFloat(width)
    const lengthNum = Number.parseFloat(length)

    if (isNaN(widthNum) || isNaN(lengthNum)) {
      setError("Please enter valid numbers")
      return
    }

    if (widthNum <= 0 || lengthNum <= 0) {
      setError("Dimensions must be greater than zero")
      return
    }

    if (widthNum > 50 || lengthNum > 50) {
      setError("Maximum dimension is 50 feet")
      return
    }

    setError("")
    onSubmit(widthNum, lengthNum)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Room Dimensions</DialogTitle>
          <DialogDescription>Enter the dimensions of your room in feet.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              Width (ft)
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="col-span-3"
              min="1"
              max="50"
              step="0.5"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="length" className="text-right">
              Length (ft)
            </Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="col-span-3"
              min="1"
              max="50"
              step="0.5"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Create Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

