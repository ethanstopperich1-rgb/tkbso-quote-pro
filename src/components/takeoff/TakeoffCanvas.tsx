import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Line, Polygon, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, Trash2, Save, Undo } from "lucide-react";
import { toast } from "sonner";

interface TakeoffCanvasProps {
  imageUrl: string;
  onMeasurementComplete: (data: {
    sqft: number;
    perimeter: number;
    polygonCoords: { x: number; y: number }[];
    scaleRatio: number;
  }) => void;
}

type CalibrationPoint = { x: number; y: number };
type Mode = "calibrate" | "measure" | "idle";

export function TakeoffCanvas({ imageUrl, onMeasurementComplete }: TakeoffCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [knownDistance, setKnownDistance] = useState<string>("");
  const [scaleRatio, setScaleRatio] = useState<number | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<CalibrationPoint[]>([]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f8fafc",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load image
  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (!fabricCanvas) return;
      
      // Scale image to fit canvas
      const scale = Math.min(
        fabricCanvas.width! / img.width!,
        fabricCanvas.height! / img.height!
      );
      img.scale(scale);
      img.selectable = false;
      
      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.sendObjectToBack(img);
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas, imageUrl]);

  // Handle canvas clicks
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleClick = (e: any) => {
      const pointer = fabricCanvas.getPointer(e.e);
      
      if (mode === "calibrate") {
        handleCalibrationClick(pointer.x, pointer.y);
      } else if (mode === "measure") {
        handleMeasureClick(pointer.x, pointer.y);
      }
    };

    fabricCanvas.on("mouse:down", handleClick);
    return () => {
      fabricCanvas.off("mouse:down", handleClick);
    };
  }, [fabricCanvas, mode, calibrationPoints, polygonPoints, scaleRatio]);

  const handleCalibrationClick = (x: number, y: number) => {
    if (calibrationPoints.length >= 2) return;

    const newPoints = [...calibrationPoints, { x, y }];
    setCalibrationPoints(newPoints);

    // Draw point
    const circle = new Circle({
      left: x - 5,
      top: y - 5,
      radius: 5,
      fill: "#0EA5E9",
      selectable: false,
    });
    fabricCanvas?.add(circle);

    // Draw line between points
    if (newPoints.length === 2) {
      const line = new Line(
        [newPoints[0].x, newPoints[0].y, newPoints[1].x, newPoints[1].y],
        {
          stroke: "#0EA5E9",
          strokeWidth: 2,
          selectable: false,
        }
      );
      fabricCanvas?.add(line);
      fabricCanvas?.renderAll();
    }
  };

  const handleMeasureClick = (x: number, y: number) => {
    if (!scaleRatio) {
      toast.error("Please calibrate scale first");
      return;
    }

    const newPoints = [...polygonPoints, { x, y }];
    setPolygonPoints(newPoints);

    // Draw point
    const circle = new Circle({
      left: x - 5,
      top: y - 5,
      radius: 5,
      fill: "#10b981",
      selectable: false,
    });
    fabricCanvas?.add(circle);

    // Draw lines
    if (newPoints.length > 1) {
      const lastIdx = newPoints.length - 1;
      const line = new Line(
        [newPoints[lastIdx - 1].x, newPoints[lastIdx - 1].y, x, y],
        {
          stroke: "#10b981",
          strokeWidth: 2,
          selectable: false,
        }
      );
      fabricCanvas?.add(line);
    }

    fabricCanvas?.renderAll();
  };

  const calculateScale = () => {
    if (calibrationPoints.length !== 2 || !knownDistance) {
      toast.error("Please select 2 points and enter known distance");
      return;
    }

    const [p1, p2] = calibrationPoints;
    const pixelDistance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
    const ratio = pixelDistance / parseFloat(knownDistance);
    setScaleRatio(ratio);
    setMode("idle");
    toast.success(`Scale calibrated: ${ratio.toFixed(2)} pixels per foot`);
  };

  const calculateArea = () => {
    if (polygonPoints.length < 3 || !scaleRatio) {
      toast.error("Need at least 3 points and calibration");
      return;
    }

    // Calculate area using Shoelace formula
    let area = 0;
    let perimeter = 0;

    for (let i = 0; i < polygonPoints.length; i++) {
      const j = (i + 1) % polygonPoints.length;
      area += polygonPoints[i].x * polygonPoints[j].y;
      area -= polygonPoints[j].x * polygonPoints[i].y;
      
      const dx = polygonPoints[j].x - polygonPoints[i].x;
      const dy = polygonPoints[j].y - polygonPoints[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    area = Math.abs(area / 2);
    
    // Convert from pixels to square feet
    const sqft = area / (scaleRatio * scaleRatio);
    const perimeterFt = perimeter / scaleRatio;

    // Close the polygon visually
    if (polygonPoints.length > 2) {
      const poly = new Polygon(polygonPoints, {
        fill: "rgba(16, 185, 129, 0.2)",
        stroke: "#10b981",
        strokeWidth: 2,
        selectable: false,
      });
      fabricCanvas?.add(poly);
      fabricCanvas?.renderAll();
    }

    toast.success(`Area: ${sqft.toFixed(2)} sq ft | Perimeter: ${perimeterFt.toFixed(2)} ft`);
    
    onMeasurementComplete({
      sqft,
      perimeter: perimeterFt,
      polygonCoords: polygonPoints,
      scaleRatio,
    });
  };

  const clearCanvas = () => {
    fabricCanvas?.clear();
    setCalibrationPoints([]);
    setPolygonPoints([]);
    setMode("idle");
    
    // Reload image
    if (imageUrl) {
      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        if (!fabricCanvas) return;
        const scale = Math.min(
          fabricCanvas.width! / img.width!,
          fabricCanvas.height! / img.height!
        );
        img.scale(scale);
        img.selectable = false;
        fabricCanvas.add(img);
        fabricCanvas.sendObjectToBack(img);
        fabricCanvas.renderAll();
      });
    }
  };

  const undoLast = () => {
    if (mode === "calibrate" && calibrationPoints.length > 0) {
      setCalibrationPoints(calibrationPoints.slice(0, -1));
    } else if (mode === "measure" && polygonPoints.length > 0) {
      setPolygonPoints(polygonPoints.slice(0, -1));
    }
    
    // Remove last object from canvas
    const objects = fabricCanvas?.getObjects();
    if (objects && objects.length > 1) {
      fabricCanvas?.remove(objects[objects.length - 1]);
      fabricCanvas?.renderAll();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "calibrate" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("calibrate");
              setCalibrationPoints([]);
            }}
            disabled={!!scaleRatio}
          >
            <Ruler className="w-4 h-4 mr-2" />
            Calibrate
          </Button>

          {mode === "calibrate" && (
            <div className="flex items-center gap-2 ml-4">
              <Label htmlFor="distance" className="text-sm">Known Distance (ft):</Label>
              <Input
                id="distance"
                type="number"
                placeholder="10"
                value={knownDistance}
                onChange={(e) => setKnownDistance(e.target.value)}
                className="w-24"
              />
              <Button
                size="sm"
                onClick={calculateScale}
                disabled={calibrationPoints.length !== 2 || !knownDistance}
              >
                Set Scale
              </Button>
            </div>
          )}

          {scaleRatio && (
            <Button
              variant={mode === "measure" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("measure")}
            >
              Measure Area
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undoLast}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          {polygonPoints.length >= 3 && (
            <Button size="sm" onClick={calculateArea}>
              <Save className="w-4 h-4 mr-2" />
              Calculate
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        {mode === "idle" && !scaleRatio && (
          <p>Click "Calibrate" to set the scale by selecting two points on a known distance.</p>
        )}
        {mode === "calibrate" && (
          <p>Click two points on the image that represent a known distance (e.g., a 10-foot wall), then enter the distance.</p>
        )}
        {mode === "measure" && (
          <p>Click to place points around the perimeter of the room. Click "Calculate" when done.</p>
        )}
        {mode === "idle" && scaleRatio && (
          <p className="text-green-600">✓ Scale calibrated: {scaleRatio.toFixed(2)} pixels/ft. Click "Measure Area" to start.</p>
        )}
      </div>

      {/* Canvas */}
      <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}