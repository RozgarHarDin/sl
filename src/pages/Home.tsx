import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { DropZone } from '../components/core/DropZone';
import { PresetSelector } from '../components/core/PresetSelector';
import { CanvasStage } from '../components/core/CanvasStage';
import { NameDateControls } from '../components/core/NameDateControls';
import { LiveInspector } from '../components/core/LiveInspector';
import { DownloadBar } from '../components/core/DownloadBar';
import { ExamPreset } from '../config/presets';
import { CropArea, OverlayOptions, loadImageSource } from '../utils/canvasDraw';
import { binarySearchCompress, CompressionResult } from '../utils/binarySearchCompress';
import { generateSampleCandidatePhoto } from '../utils/sampleImages';

interface HomeProps {
  selectedPreset: ExamPreset;
  onSelectPreset: (presetId: string) => void;
  presets: ExamPreset[];
  onNavigate: (page: string) => void;
  onIncrementProcessed: () => void;
}

export const Home: React.FC<HomeProps> = ({
  selectedPreset,
  onSelectPreset,
  presets,
  onNavigate,
  onIncrementProcessed,
}) => {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('sample_candidate.jpg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  
  // Dynamic user-selected target KB
  const [customTargetKb, setCustomTargetKb] = useState<number>(selectedPreset.target_kb);

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
    enabled: selectedPreset.requires_name_date,
    name: 'RAHUL SHARMA',
    date: (() => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      return `${dd}-${mm}-${today.getFullYear()}`;
    })(),
    fontSizeMultiplier: 1.0,
    bandHeightPercent: 18,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  });

  const lastCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load sample candidate photo on initial mount once
  useEffect(() => {
    if (!imageElement) {
      const sample = generateSampleCandidatePhoto();
      loadImageSource(sample).then((img) => {
        setImageElement(img);
      });
    }
  }, []);

  // Update target KB and overlay whenever preset primitives change
  useEffect(() => {
    setCustomTargetKb(selectedPreset.target_kb);
    setOverlay((prev) => ({
      ...prev,
      enabled: selectedPreset.requires_name_date,
    }));
  }, [selectedPreset.id, selectedPreset.target_kb, selectedPreset.requires_name_date]);

  // Handle file drop or selection
  const handleFileSelect = async (fileOrUrl: File | string, fileName?: string) => {
    try {
      setIsProcessing(true);
      const img = await loadImageSource(fileOrUrl);
      setImageElement(img);
      setCurrentFileName(fileName || 'Candidate_Image.jpg');
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

  // Re-run compression when user changes target KB slider
  const handleTargetKbChange = async (newTarget: number) => {
    setCustomTargetKb(newTarget);
    if (!lastCanvasRef.current) return;
    try {
      setIsProcessing(true);
      const result = await binarySearchCompress(lastCanvasRef.current, {
        minKb: selectedPreset.min_kb,
        maxKb: selectedPreset.max_kb,
        targetKb: newTarget,
        format: selectedPreset.format,
      });
      setCompressionResult(result);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Stable callback invoked when CanvasStage finishes rendering
  const handleCanvasRendered = useCallback(async (canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
    try {
      setIsProcessing(true);
      const result = await binarySearchCompress(canvas, {
        minKb: selectedPreset.min_kb,
        maxKb: selectedPreset.max_kb,
        targetKb: customTargetKb || selectedPreset.target_kb,
        format: selectedPreset.format,
      });
      setCompressionResult(result);
      setIsProcessing(false);
    } catch (err) {
      console.error('Binary compression failed:', err);
      setIsProcessing(false);
    }
  }, [selectedPreset.min_kb, selectedPreset.max_kb, selectedPreset.target_kb, selectedPreset.format, customTargetKb]);

  return (
    <div className="space-y-10 pb-16">
      <SEO
        title="SarkariPixel - Free SSC, UPSC & Govt Exam Photo Resizer (20-50 KB)"
        description="Resize, compress, and add Name & Date (DOP) to photos and signatures for SSC, UPSC, NTA, IBPS government exam portals. 100% private, free, in-browser compression."
      />

      {/* Hero Section */}
      <section className="relative pt-6 pb-2 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-sky-400 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% In-Browser Privacy
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Guaranteed Portal Acceptance
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
            <Zap className="w-3.5 h-3.5" />
            Stepped Lanczos Sharp Resizing
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Exact KB & Dimension Resizer for{' '}
          <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Indian Govt Exams
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Zero server uploads. Automatically crop, add Date of Photo (DOP) & Name, and compress to exact <strong>20–50 KB</strong> limits for SSC, UPSC, NTA, IBPS, and State PSC portals with sharp visual clarity.
        </p>

        {/* Quick Exam Shortcut Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Presets:</span>
          <button
            onClick={() => onSelectPreset('ssc_cgl_photo')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 text-sky-300 border border-slate-700 hover:border-blue-500 rounded-lg transition"
          >
            SSC Photo (20-50 KB)
          </button>
          <button
            onClick={() => onSelectPreset('ssc_cgl_signature')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 text-sky-300 border border-slate-700 hover:border-blue-500 rounded-lg transition"
          >
            SSC Signature (10-20 KB)
          </button>
          <button
            onClick={() => onSelectPreset('upsc_ias_photo')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 text-sky-300 border border-slate-700 hover:border-blue-500 rounded-lg transition"
          >
            UPSC Photo (DOP)
          </button>
          <button
            onClick={() => onSelectPreset('nta_neet_passport_photo')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 text-sky-300 border border-slate-700 hover:border-blue-500 rounded-lg transition"
          >
            NEET Passport Photo
          </button>
          <button
            onClick={() => onSelectPreset('ibps_po_photo')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 text-sky-300 border border-slate-700 hover:border-blue-500 rounded-lg transition"
          >
            IBPS Banking (20-50 KB)
          </button>
        </div>
      </section>

      {/* Main Two-Column Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Preset, Dropzone, and DOP Controls */}
          <div className="lg:col-span-6 space-y-6">
            <PresetSelector
              presets={presets}
              selectedPreset={selectedPreset}
              onSelectPreset={onSelectPreset}
            />

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Upload Candidate {selectedPreset.type.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400">
                    File is loaded directly into your browser's local RAM.
                  </p>
                </div>
              </div>

              <DropZone
                onFileSelect={handleFileSelect}
                currentFileName={currentFileName}
                presetType={selectedPreset.type}
              />
            </div>

            <NameDateControls
              overlay={overlay}
              setOverlay={setOverlay}
              preset={selectedPreset}
            />
          </div>

          {/* Right Column: Sticky Interactive Stage, Live Inspector, and Download */}
          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-20">
            <CanvasStage
              imageElement={imageElement}
              cropArea={cropArea}
              setCropArea={setCropArea}
              overlay={overlay}
              preset={selectedPreset}
              onCanvasRendered={handleCanvasRendered}
            />

            <LiveInspector
              preset={selectedPreset}
              compressionResult={compressionResult}
              isProcessing={isProcessing}
              targetKb={customTargetKb}
              onTargetKbChange={handleTargetKbChange}
            />

            <DownloadBar
              preset={selectedPreset}
              compressionResult={compressionResult}
              candidateName={overlay.enabled ? overlay.name : ''}
              onDownloaded={onIncrementProcessed}
            />
          </div>
        </div>
      </section>

      {/* Bulk Batch Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Bulk Processing Utility (100% Free)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Processing Multiple Candidate Applications?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Switch to <strong>Bulk Batch Mode</strong> to drop multiple photos simultaneously, auto-apply Name & DOP, and download organized ZIP archives in one click.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('batch')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Open Bulk Batch Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-black text-white">
            Why Over 35 Million Applicants Rely on SarkariPixel
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Built strictly according to official Staff Selection Commission & UPSC recruitment notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Zero Server Transmission</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your sensitive Aadhaar, signature, and facial photos never touch external servers. All processing happens strictly in browser memory.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">High-Fidelity Edge Sharpening</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-pass stepped downscaling and intelligent unsharp masking preserve crisp eye, face, and signature details even under strict KB limits.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">100% Free & Offline PWA</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Install SarkariPixel on Android, iOS, Windows, or Mac. Completely free with zero signup friction or subscription limits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
