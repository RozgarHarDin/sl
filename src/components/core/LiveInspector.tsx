import React from 'react';
import { CheckCircle2, AlertTriangle, Cpu, Info, Sliders } from 'lucide-react';
import { ExamPreset } from '../../config/presets';
import { CompressionResult } from '../../utils/binarySearchCompress';

interface LiveInspectorProps {
  preset: ExamPreset;
  compressionResult: CompressionResult | null;
  isProcessing: boolean;
  targetKb: number;
  onTargetKbChange?: (kb: number) => void;
  minKb?: number;
  maxKb?: number;
}

export const LiveInspector: React.FC<LiveInspectorProps> = ({
  preset,
  compressionResult,
  isProcessing,
  targetKb,
  onTargetKbChange,
  minKb = preset.min_kb,
  maxKb = preset.max_kb,
}) => {
  const currentKb = compressionResult?.sizeKb || 0;
  const isCompliant = currentKb >= minKb && currentKb <= maxKb;
  const isTooSmall = currentKb > 0 && currentKb < minKb;

  // Calculate static, deterministic gauge fill percentage based on bounds
  const rangeSpan = Math.max(1, maxKb - minKb);
  const clampedKb = Math.min(maxKb, Math.max(minKb, currentKb));
  const gaugePercent = currentKb > 0 
    ? Math.min(100, Math.max(0, ((clampedKb - minKb) / rangeSpan) * 100))
    : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>4. Real-Time Portal Inspector</span>
          </h3>
          <p className="text-xs text-slate-400">
            Live validation against {preset.shortName} official parameters
          </p>
        </div>

        {/* Status Pill Badge */}
        {compressionResult ? (
          isCompliant ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>PORTAL COMPLIANT</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTooSmall ? 'BELOW MINIMUM KB' : 'EXCEEDS MAXIMUM KB'}</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>Ready</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Computed File Size */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Output File Size
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-mono font-black ${
                isCompliant
                  ? 'text-emerald-400'
                  : currentKb > 0
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {isProcessing ? 'Optimizing...' : currentKb ? `${currentKb.toFixed(1)} KB` : '-- KB'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Limit: {minKb}–{maxKb} KB
          </span>
        </div>

        {/* Metric 2: Dimensions (Pixels) */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Dimensions (px)
          </span>
          <div className="text-base font-mono font-bold text-sky-300">
            {preset.width_px} × {preset.height_px} px
          </div>
          <span className="text-[10px] text-emerald-400 block font-medium">
            Multi-Pass Sharp
          </span>
        </div>

        {/* Metric 3: Print Dimensions (cm / DPI) */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Print Size (cm)
          </span>
          <div className="text-base font-mono font-bold text-slate-200">
            {preset.width_cm} × {preset.height_cm} cm
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            @{preset.dpi} DPI calibrated
          </span>
        </div>

        {/* Metric 4: Visual Quality Factor */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Visual Quality
          </span>
          <div className="text-base font-mono font-bold text-white uppercase">
            {compressionResult ? `${Math.round(compressionResult.quality * 100)}% Sharp` : '95% Sharp'}
          </div>
          <span className="text-[10px] text-sky-300 block font-mono">
            Unsharp Edge Mask
          </span>
        </div>
      </div>

      {/* Dynamic Target Size Customizer Slider */}
      {onTargetKbChange && (
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Target File Size Aim:</span>
            </span>
            <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
              {targetKb} KB
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">{minKb} KB</span>
            <input
              type="range"
              min={minKb}
              max={maxKb}
              step={1}
              value={targetKb}
              onChange={(e) => onTargetKbChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[11px] font-mono text-slate-400">{maxKb} KB</span>
          </div>
        </div>
      )}

      {/* Static Visual KB Meter */}
      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-2">
        <div className="flex justify-between text-[11px] text-slate-300">
          <span>Min Limit: <strong>{minKb} KB</strong></span>
          <span className="font-bold text-sky-300">Target: {targetKb} KB</span>
          <span>Max Limit: <strong>{maxKb} KB</strong></span>
        </div>

        <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
          {/* Static progress needle */}
          <div
            className={`h-full ${
              isCompliant ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-amber-500'
            }`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>
      </div>

      {/* Portal Guidelines Note */}
      <div className="flex items-start gap-2 text-xs text-slate-400 bg-blue-950/20 p-2.5 rounded-xl border border-blue-900/40">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">Official Requirement: </strong>
          {preset.background_rule}. {preset.guidelines.join(' • ')}
        </div>
      </div>
    </div>
  );
};
