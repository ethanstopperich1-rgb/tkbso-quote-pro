import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bath, ChefHat, Ruler, Box } from "lucide-react";

export interface DimensionData {
  roomType: "bathroom" | "kitchen" | "closet" | "other";
  roomLength?: number;
  roomWidth?: number;
  ceilingHeight?: number;
  showerLength?: number;
  showerWidth?: number;
  showerHeight?: number;
  countertopSqft?: number;
  countertopLinearFt?: number;
}

interface DimensionInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingFields: string[];
  roomType?: "bathroom" | "kitchen" | "closet" | "other";
  onSubmit: (data: DimensionData) => void;
}

export function DimensionInputModal({
  open,
  onOpenChange,
  missingFields,
  roomType = "bathroom",
  onSubmit,
}: DimensionInputModalProps) {
  const [activeTab, setActiveTab] = useState<string>(roomType);
  const [dimensions, setDimensions] = useState<DimensionData>({
    roomType: roomType,
    ceilingHeight: 8,
  });

  const updateDimension = (field: keyof DimensionData, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setDimensions((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = () => {
    onSubmit({ ...dimensions, roomType: activeTab as DimensionData["roomType"] });
    onOpenChange(false);
  };

  const getMissingFieldsText = () => {
    if (missingFields.length === 0) return "Enter room dimensions for accurate pricing.";
    return `Missing: ${missingFields.join(", ")}. Please provide measurements.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Enter Dimensions
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {getMissingFieldsText()}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bathroom" className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              Bathroom
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="flex items-center gap-1.5">
              <ChefHat className="h-4 w-4" />
              Kitchen
            </TabsTrigger>
            <TabsTrigger value="closet" className="flex items-center gap-1.5">
              <Box className="h-4 w-4" />
              Closet
            </TabsTrigger>
          </TabsList>

          {/* Bathroom Dimensions */}
          <TabsContent value="bathroom" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bath-length" className="text-xs font-medium">
                  Room Length (ft)
                </Label>
                <Input
                  id="bath-length"
                  type="number"
                  placeholder="8"
                  value={dimensions.roomLength ?? ""}
                  onChange={(e) => updateDimension("roomLength", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bath-width" className="text-xs font-medium">
                  Room Width (ft)
                </Label>
                <Input
                  id="bath-width"
                  type="number"
                  placeholder="5"
                  value={dimensions.roomWidth ?? ""}
                  onChange={(e) => updateDimension("roomWidth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bath-height" className="text-xs font-medium">
                  Ceiling (ft)
                </Label>
                <Input
                  id="bath-height"
                  type="number"
                  placeholder="8"
                  value={dimensions.ceilingHeight ?? ""}
                  onChange={(e) => updateDimension("ceilingHeight", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Shower Dimensions (if applicable)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="shower-length" className="text-xs font-medium">
                    Length (ft)
                  </Label>
                  <Input
                    id="shower-length"
                    type="number"
                    placeholder="5"
                    value={dimensions.showerLength ?? ""}
                    onChange={(e) => updateDimension("showerLength", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shower-width" className="text-xs font-medium">
                    Width (ft)
                  </Label>
                  <Input
                    id="shower-width"
                    type="number"
                    placeholder="3"
                    value={dimensions.showerWidth ?? ""}
                    onChange={(e) => updateDimension("showerWidth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shower-height" className="text-xs font-medium">
                    Height (ft)
                  </Label>
                  <Input
                    id="shower-height"
                    type="number"
                    placeholder="8"
                    value={dimensions.showerHeight ?? ""}
                    onChange={(e) => updateDimension("showerHeight", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Calculated preview */}
            {(dimensions.roomLength && dimensions.roomWidth) && (
              <div className="bg-muted/50 rounded-lg p-3 border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Calculated Areas</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Room:</span>{" "}
                    <span className="font-medium">{dimensions.roomLength * dimensions.roomWidth} sq ft</span>
                  </div>
                  {dimensions.showerLength && dimensions.showerWidth && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Shower Floor:</span>{" "}
                        <span className="font-medium">{dimensions.showerLength * dimensions.showerWidth} sq ft</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Shower Walls:</span>{" "}
                        <span className="font-medium">
                          {Math.round(
                            2 * (dimensions.showerLength + dimensions.showerWidth) *
                            (dimensions.showerHeight || dimensions.ceilingHeight || 8)
                          )} sq ft
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Kitchen Dimensions */}
          <TabsContent value="kitchen" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kitchen-length" className="text-xs font-medium">
                  Room Length (ft)
                </Label>
                <Input
                  id="kitchen-length"
                  type="number"
                  placeholder="12"
                  value={dimensions.roomLength ?? ""}
                  onChange={(e) => updateDimension("roomLength", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-width" className="text-xs font-medium">
                  Room Width (ft)
                </Label>
                <Input
                  id="kitchen-width"
                  type="number"
                  placeholder="10"
                  value={dimensions.roomWidth ?? ""}
                  onChange={(e) => updateDimension("roomWidth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-height" className="text-xs font-medium">
                  Ceiling (ft)
                </Label>
                <Input
                  id="kitchen-height"
                  type="number"
                  placeholder="9"
                  value={dimensions.ceilingHeight ?? ""}
                  onChange={(e) => updateDimension("ceilingHeight", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Countertop Measurements
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="counter-sqft" className="text-xs font-medium">
                    Countertop (sq ft)
                  </Label>
                  <Input
                    id="counter-sqft"
                    type="number"
                    placeholder="40"
                    value={dimensions.countertopSqft ?? ""}
                    onChange={(e) => updateDimension("countertopSqft", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counter-lf" className="text-xs font-medium">
                    Linear Feet
                  </Label>
                  <Input
                    id="counter-lf"
                    type="number"
                    placeholder="18"
                    value={dimensions.countertopLinearFt ?? ""}
                    onChange={(e) => updateDimension("countertopLinearFt", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Calculated preview */}
            {(dimensions.roomLength && dimensions.roomWidth) && (
              <div className="bg-muted/50 rounded-lg p-3 border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Calculated Areas</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kitchen:</span>{" "}
                    <span className="font-medium">{dimensions.roomLength * dimensions.roomWidth} sq ft</span>
                  </div>
                  {dimensions.countertopSqft && (
                    <div>
                      <span className="text-muted-foreground">Countertop:</span>{" "}
                      <span className="font-medium">{dimensions.countertopSqft} sq ft</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Closet Dimensions */}
          <TabsContent value="closet" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="closet-length" className="text-xs font-medium">
                  Length (ft)
                </Label>
                <Input
                  id="closet-length"
                  type="number"
                  placeholder="8"
                  value={dimensions.roomLength ?? ""}
                  onChange={(e) => updateDimension("roomLength", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closet-width" className="text-xs font-medium">
                  Width (ft)
                </Label>
                <Input
                  id="closet-width"
                  type="number"
                  placeholder="6"
                  value={dimensions.roomWidth ?? ""}
                  onChange={(e) => updateDimension("roomWidth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closet-height" className="text-xs font-medium">
                  Ceiling (ft)
                </Label>
                <Input
                  id="closet-height"
                  type="number"
                  placeholder="8"
                  value={dimensions.ceilingHeight ?? ""}
                  onChange={(e) => updateDimension("ceilingHeight", e.target.value)}
                />
              </div>
            </div>

            {/* Calculated preview */}
            {(dimensions.roomLength && dimensions.roomWidth) && (
              <div className="bg-muted/50 rounded-lg p-3 border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Calculated Areas</p>
                <div className="text-sm">
                  <span className="text-muted-foreground">Closet:</span>{" "}
                  <span className="font-medium">{dimensions.roomLength * dimensions.roomWidth} sq ft</span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Apply Dimensions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
