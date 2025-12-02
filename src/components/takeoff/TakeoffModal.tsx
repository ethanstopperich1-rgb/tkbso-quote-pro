import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { TakeoffCanvas } from "./TakeoffCanvas";
import { toast } from "sonner";

interface TakeoffModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: { sqft: number; perimeter: number }) => void;
}

export function TakeoffModal({ open, onClose, onComplete }: TakeoffModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [roomLabel, setRoomLabel] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    toast.success("Image loaded! Now calibrate the scale.");
  };

  const handleMeasurementComplete = (data: {
    sqft: number;
    perimeter: number;
    polygonCoords: { x: number; y: number }[];
    scaleRatio: number;
  }) => {
    toast.success("Measurement complete! Syncing to estimator...");
    onComplete({
      sqft: data.sqft,
      perimeter: data.perimeter,
    });
    
    // Keep modal open so user can see the result
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageFile(null);
    setRoomLabel("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Visual Takeoff Tool</span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageUrl ? (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload Floor Plan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to browse
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="max-w-sm mx-auto"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="roomLabel">Room Label (optional)</Label>
                  <Input
                    id="roomLabel"
                    placeholder="e.g., Master Bathroom"
                    value={roomLabel}
                    onChange={(e) => setRoomLabel(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (imageUrl) URL.revokeObjectURL(imageUrl);
                    setImageUrl(null);
                    setImageFile(null);
                  }}
                >
                  Change Image
                </Button>
              </div>

              <TakeoffCanvas
                imageUrl={imageUrl}
                onMeasurementComplete={handleMeasurementComplete}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
