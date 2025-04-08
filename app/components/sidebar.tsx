"use client"

import { useState } from "react"
import { ChevronLeft, Sofa, Bed, Table, RockingChairIcon as Chair, Lamp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const furnitureItems = {
  "Living Room": [
    { id: "sofa", name: "Sofa", icon: Sofa },
    { id: "chair", name: "Chair", icon: Chair },
    { id: "table", name: "Coffee Table", icon: Table },
    { id: "lamp", name: "Floor Lamp", icon: Lamp },
  ],
  Bedroom: [
    { id: "bed", name: "Bed", icon: Bed },
    { id: "bedside-table", name: "Bedside Table", icon: Table },
    { id: "desk-lamp", name: "Desk Lamp", icon: Lamp },
  ],
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`relative border-r bg-background transition-all duration-300 ${isCollapsed ? "w-16" : "w-80"}`}>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className={`font-semibold ${isCollapsed ? "hidden" : "block"}`}>Furniture</h2>
        </div>
        <Separator />
        <Tabs defaultValue="Living Room" className="flex-1">
          <div className="p-4">
            <TabsList className={`${isCollapsed ? "hidden" : "block"}`}>
              <TabsTrigger value="Living Room">Living Room</TabsTrigger>
              <TabsTrigger value="Bedroom">Bedroom</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            {Object.entries(furnitureItems).map(([category, items]) => (
              <TabsContent key={category} value={category} className="m-0 p-4 space-y-4">
                {items.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start gap-2 ${isCollapsed ? "px-4" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("furniture", item.id)
                    }}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                ))}
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 z-10 bg-background border rounded-full"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
      </Button>
    </div>
  )
}

