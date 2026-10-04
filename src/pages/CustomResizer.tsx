import React, { useState, useRef } from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { DropZone } from '../components/core/DropZone';
import { CanvasStage } from '../components/core/CanvasStage';
import { NameDateControls } from '../components/core/NameDateControls';
import { LiveInspector } from '../components/core/LiveInspector';
import { DownloadBar } from '../components/core/DownloadBar';
import { ExamPreset } from '../config/presets';
import { CropArea, OverlayOptions, loadImageSource } from '../utils/canvasDraw';
import { binarySearchCompress, CompressionResult } from '../utils/binarySearchCompress';
import { generateSampleCandidatePhoto } from '../utils/sampleImages';

interface CustomResizerProps {
  onIncrementProcessed: () => void;
  onAddCustomPreset: (preset: ExamPreset) => void;
}

export const CustomResizer: React.FC<CustomResizerProps> = ({
  onIncrementProcessed,
  onAddCustomPreset,
}) => {
  const [unit, setUnit] = useState<'px' | 'cm' | 'mm' | 'inch'>('px');
  const [widthVal, setWidthVal] = useState(350);
  const [heightVal, setHeightVal] = useState(450);
  const [dpi, setDpi] = useState(300);
  const [minKb, setMinKb] = useState(20);
  const [maxKb, setMaxKb] = useState(50);
  const [targetKb, setTargetKb] = useState(35);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [customName, setCustomName] = useState('Custom Portal Setting');

  // Convert to px
  const getComputedPx = () => {
    if (unit === 'px') return { w: widthVal, h: heightVal };
    if (unit === 'inch') return { w: Math.round(widthVal * dpi), h: Math.round(heightVal * dpi) };
    if (unit === 'cm') return { w: Math.round((widthVal / 2.54) * dpi), h: Math.round((heightVal / 2.54) * dpi) };
    if (unit === 'mm') return { w: Math.round((widthVal / 25.4) * dpi), h: Math.round((heightVal / 25.4) * dpi) };
    return { w: 350, h: 450 };
  };

  const pxDimensions = getComputedPx();

  const customPreset: ExamPreset = {
    id: 'custom_runtime_' + widthVal + '_' + heightVal,
    name: customName,
    shortName: 'Custom Mode',
    category: 'Custom',
    type: 'photo',
    width_px: pxDimensions.w,
    height_px: pxDimensions.h,
    width_cm: +(pxDimensions.w / (dpi / 2.54)).toFixed(2),
    height_cm: +(pxDimensions.h / (dpi / 2.54)).toFixed(2),
    dpi,
    min_kb: minKb,
    max_kb: maxKb,
    target_kb: targetKb,
    format,
    requires_name_date: false,
    background_rule: 'Custom User Configuration',
    guidelines: [`Custom ${pxDimensions.w}x${pxDimensions.h} px`, `KB Limit: ${minKb}–${maxKb} KB`],
  };

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('sample_candidate.jpg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const lastCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    zoom: 1.0,
    rotation: 0,
    flipH: false,
    flipV: false,
  });

  const [overlay, setOverlay] = useState<OverlayOptions>({
    enabled: false,
    name: 'CANDIDATE NAME',
    date: new Date().toISOString().slice(0, 10).split('-').reverse().join('-'),
    fontSizeMultiplier: 1.0,
    bandHeightPercent: 18,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  });

  React.useEffect(() => {
    const sample = generateSampleCandidatePhoto();
    loadImageSource(sample).then((img) => setImageElement(img));
  }, []);

  const handleFileSelect = async (fileOrUrl: File | string, fileName?: string) => {
    try {
      setIsProcessing(true);
      const img = await loadImageSource(fileOrUrl);
      setImageElement(img);
      setCurrentFileName(fileName || 'Custom_Candidate_Image.jpg');
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
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleTargetKbChange = async (newTarget: number) => {
    setTargetKb(newTarget);
    if (!lastCanvasRef.current) return;
    try {
      setIsProcessing(true);
      const result = await binarySearchCompress(lastCanvasRef.current, {
        minKb: customPreset.min_kb,
        maxKb: customPreset.max_kb,
        targetKb: newTarget,
        format: customPreset.format,
      });
      setCompressionResult(result);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleCanvasRendered = async (canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
    try {
      setIsProcessing(true);
      const result = await binarySearchCompress(canvas, {
        minKb: customPreset.min_kb,
        maxKb: customPreset.max_kb,
        targetKb: targetKb || customPreset.target_kb,
        format: customPreset.format,
      });
      setCompressionResult(result);
      setIsProcessing(false);
    } catch (err) {
      console.error('Binary compression failed:', err);
      setIsProcessing(false);
    }
  };

  const handleSaveToPresets = () => {
    onAddCustomPreset(customPreset);
    alert('Preset saved to your local directory!');
  };

  return (
    <div className="space-y-8 pb-16">
      <SEO
        title="Custom Photo & Signature Resizer (Set Exact Pixels, CM, and KB Limits) – SarkariPixel"
        description="Configure custom pixel width, height, DPI, and exact kilobyte compression for any portal or application."
        canonicalUrl="https://sl.sarkaripixel.workers.dev/custom"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto px-4 pt-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-sky-400 border border-blue-500/30">
          <Sliders className="w-3.5 h-3.5" />
          <span>Manual Specification Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          Custom Dimensions & Exact KB Compressor
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Set custom pixels, centimeters, millimeters, DPI, and exact file size bounds with high-sharpness resampling.
        </p>
      </div>

      {/* Custom Configuration Control Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Configure Target Rules
              </h3>
              <p className="text-xs text-slate-400">
                Calculated Canvas: <strong>{pxDimensions.w} × {pxDimensions.h} px</strong>
              </p>
            </div>

            {/* Unit Selector */}
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
              {(['px', 'cm', 'mm', 'inch'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    if (u === 'cm' && unit === 'px') {
                      setWidthVal(3.5);
                      setHeightVal(4.5);
                    } else if (u === 'mm' && unit === 'px') {
                      setWidthVal(35);
                      setHeightVal(45);
                    } else if (u === 'inch' && unit === 'px') {
                      setWidthVal(2);
                      setHeightVal(2);
                    } else if (u === 'px') {
                      setWidthVal(350);
                      setHeightVal(450);
                    }
                    setUnit(u);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition uppercase ${
                    unit === u ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Width */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Width ({unit})</label>
              <input
                type="number"
                value={widthVal}
                onChange={(e) => setWidthVal(parseFloat(e.target.value) || 100)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Height ({unit})</label>
              <input
                type="number"
                value={heightVal}
                onChange={(e) => setHeightVal(parseFloat(e.target.value) || 100)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
              />
            </div>

            {/* DPI */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">DPI Resolution</label>
              <select
                value={dpi}
                onChange={(e) => setDpi(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option value={100}>100 DPI</option>
                <option value={200}>200 DPI</option>
                <option value={300}>300 DPI (High Res)</option>
                <option value={600}>600 DPI</option>
              </select>
            </div>

            {/* Min KB */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Min KB</label>
              <input
                type="number"
                value={minKb}
                onChange={(e) => setMinKb(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            {/* Max KB */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Max KB</label>
              <input
                type="number"
                value={maxKb}
                onChange={(e) => setMaxKb(parseInt(e.target.value, 10) || 100)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            {/* Target KB */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Target KB</label>
              <input
                type="number"
                value={targetKb}
                onChange={(e) => setTargetKb(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-emerald-400 font-bold"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Export Format:</span>
              <button
                type="button"
                onClick={() => setFormat('image/jpeg')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  format === 'image/jpeg' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                JPEG / JPG
              </button>
              <button
                type="button"
                onClick={() => setFormat('image/png')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  format === 'image/png' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                PNG
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveToPresets}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-bold transition"
            >
              Save As Custom Preset
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Upload Custom Image
              </h3>
              <DropZone
                onFileSelect={handleFileSelect}
                currentFileName={currentFileName}
                presetType="photo"
              />
            </div>

            <NameDateControls
              overlay={overlay}
              setOverlay={setOverlay}
              preset={customPreset}
            />
          </div>

          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-20">
            <CanvasStage
              imageElement={imageElement}
              cropArea={cropArea}
              setCropArea={setCropArea}
              overlay={overlay}
              preset={customPreset}
              onCanvasRendered={handleCanvasRendered}
            />

            <LiveInspector
              preset={customPreset}
              compressionResult={compressionResult}
              isProcessing={isProcessing}
              targetKb={targetKb}
              onTargetKbChange={handleTargetKbChange}
              minKb={minKb}
              maxKb={maxKb}
            />

            <DownloadBar
              preset={customPreset}
              compressionResult={compressionResult}
              candidateName={overlay.enabled ? overlay.name : ''}
              onDownloaded={onIncrementProcessed}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
