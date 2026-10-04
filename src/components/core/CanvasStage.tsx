import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  RefreshCw,
  Move
} from 'lucide-react';
import { CropArea, OverlayOptions, renderProcessedCanvas } from '../../utils/canvasDraw';
import { ExamPreset } from '../../config/presets';

interface CanvasStageProps {
  imageElement: HTMLImageElement | null;
  cropArea: CropArea;
  setCropArea: React.Dispatch<React.SetStateAction<CropArea>>;
  overlay: OverlayOptions;
  preset: ExamPreset;
  onCanvasRendered?: (canvas: HTMLCanvasElement) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  imageElement,
  cropArea,
  setCropArea,
  overlay,
  preset,
  onCanvasRendered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFaceGuide, setShowFaceGuide] = useState(preset.type === 'photo');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Store onCanvasRendered in a ref to break the re-render dependency loop
  const onCanvasRenderedRef = useRef(onCanvasRendered);
  useEffect(() => {
    onCanvasRenderedRef.current = onCanvasRendered;
  }, [onCanvasRendered]);

  // Update showFaceGuide if preset type changes
  useEffect(() => {
    setShowFaceGuide(preset.type === 'photo');
  }, [preset.type]);

  // Re-render canvas whenever image, crop, overlay or preset dimensions change
  useEffect(() => {
    if (!imageElement || !canvasRef.current) return;

    try {
      const processedCanvas = renderProcessedCanvas({
        image: imageElement,
        targetWidth: preset.width_px,
        targetHeight: preset.height_px,
        cropArea,
        overlay,
        enableSharpening: true,
        sharpenAmount: 0.22,
      });

      // Copy processedCanvas onto visible canvas
      const displayCanvas = canvasRef.current;
      displayCanvas.width = preset.width_px;
      displayCanvas.height = preset.height_px;
      const dCtx = displayCanvas.getContext('2d');
      if (dCtx) {
        dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        dCtx.drawImage(processedCanvas, 0, 0);
      }

      // Notify parent via ref (breaking circular render loop)
      onCanvasRenderedRef.current?.(processedCanvas);
    } catch (err) {
      console.error('Failed to render canvas stage:', err);
    }
  }, [
    imageElement,
    cropArea.x,
    cropArea.y,
    cropArea.zoom,
    cropArea.rotation,
    cropArea.flipH,
    cropArea.flipV,
    overlay.enabled,
    overlay.name,
    overlay.date,
    overlay.fontSizeMultiplier,
    overlay.bandHeightPercent,
    preset.width_px,
    preset.height_px,
  ]);

  // Mouse & Touch Pan Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, prev.x + (dx / 3))),
      y: Math.max(0, Math.min(100, prev.y + (dy / 3))),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });

    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, prev.x + (dx / 3))),
      y: Math.max(0, Math.min(100, prev.y + (dy / 3))),
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setCropArea((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleFlipH = () => {
    setCropArea((prev) => ({
      ...prev,
      flipH: !prev.flipH,
    }));
  };

  const handleFlipV = () => {
    setCropArea((prev) => ({
      ...prev,
      flipV: !prev.flipV,
    }));
  };

  const handleResetCrop = () => {
    setCropArea({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      zoom: 1.0,
      rotation: 0,
      flipH: false,
      flipV: false,
    });
  };

  const handleZoomChange = (newZoom: number) => {
    setCropArea((prev) => ({
      ...prev,
      zoom: Math.max(0.3, Math.min(3.0, newZoom)),
    }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>2. Crop & Aspect Lock Stage</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 font-mono">
              Ratio: {preset.width_px}:{preset.height_px}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Drag to pan position • Use slider to zoom • Aspect ratio is strictly locked
          </p>
        </div>

        {preset.type === 'photo' && (
          <button
            type="button"
            onClick={() => setShowFaceGuide(!showFaceGuide)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition ${
              showFaceGuide
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Face Guide</span>
          </button>
        )}
      </div>

      {/* Main Interactive Stage Box */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square sm:aspect-[4/3] max-h-[380px] bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        {imageElement ? (
          <div className="relative flex items-center justify-center p-4">
            {/* The actual preview canvas */}
            <canvas
              ref={canvasRef}
              className="max-h-[340px] max-w-full object-contain rounded-md shadow-2xl bg-white border border-slate-700"
            />

            {/* Passport Oval & Eye-Line Alignment Guides */}
            {showFaceGuide && preset.type === 'photo' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-44 h-56 rounded-[50%] border-2 border-dashed border-sky-400/60 flex flex-col items-center justify-center">
                  {/* Eye line */}
                  <div className="absolute top-[38%] w-full border-t border-dashed border-sky-400/40" />
                  {/* Chin line */}
                  <div className="absolute bottom-[18%] w-20 border-t border-dashed border-sky-400/40" />
                  <span className="text-[10px] text-sky-300/80 font-bold bg-slate-950/70 px-1.5 py-0.5 rounded -mt-24">
                    Align Face & Eyes
                  </span>
                </div>
              </div>
            )}

            {/* Drag hint overlay */}
            <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1 pointer-events-none">
              <Move className="w-3 h-3 text-sky-400" />
              <span>Drag to Pan</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-2 text-slate-500">
            <Maximize2 className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-medium">Please upload or select an image first</p>
          </div>
        )}
      </div>

      {/* Transform Toolbars & Sliders */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Zoom Slider */}
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <ZoomOut
            className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white"
            onClick={() => handleZoomChange(cropArea.zoom - 0.1)}
          />
          <input
            type="range"
            min="0.4"
            max="2.5"
            step="0.05"
            value={cropArea.zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <ZoomIn
            className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white"
            onClick={() => handleZoomChange(cropArea.zoom + 0.1)}
          />
          <span className="text-xs font-mono text-slate-300 w-12 text-right">
            {(cropArea.zoom * 100).toFixed(0)}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFlipH}
            title="Flip Horizontal"
            className={`p-2 rounded-lg border transition ${
              cropArea.flipH
                ? 'bg-blue-600/30 text-sky-300 border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFlipV}
            title="Flip Vertical"
            className={`p-2 rounded-lg border transition ${
              cropArea.flipV
                ? 'bg-blue-600/30 text-sky-300 border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCrop}
            title="Reset Transformations"
            className="flex items-center gap-1 text-xs px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
