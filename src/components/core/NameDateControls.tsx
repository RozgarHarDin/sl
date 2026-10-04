import React from 'react';
import { Type, Calendar, CheckSquare, Square, Palette, Sliders, HelpCircle } from 'lucide-react';
import { OverlayOptions } from '../../utils/canvasDraw';
import { ExamPreset } from '../../config/presets';

interface NameDateControlsProps {
  overlay: OverlayOptions;
  setOverlay: React.Dispatch<React.SetStateAction<OverlayOptions>>;
  preset: ExamPreset;
}

export const NameDateControls: React.FC<NameDateControlsProps> = ({
  overlay,
  setOverlay,
  preset,
}) => {
  const isRecommended = preset.requires_name_date;
  const isMandatory = preset.name_date_mandatory;

  const handleSetToday = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formatted = `${dd}-${mm}-${yyyy}`;

    setOverlay((prev) => ({
      ...prev,
      date: formatted,
    }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOverlay((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            {overlay.enabled ? (
              <CheckSquare className="w-5 h-5 text-sky-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-400 shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>3. Date of Photo (DOP) & Name Strip</span>
                {isMandatory ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    Mandatory for {preset.category}
                  </span>
                ) : isRecommended ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Recommended
                  </span>
                ) : null}
              </h3>
              <p className="text-xs text-slate-400">
                Stamps crisp white bottom band with candidate name and date DD-MM-YYYY
              </p>
            </div>
          </button>
        </div>
      </div>

      {overlay.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 animate-fadeIn">
          {/* Candidate Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-sky-400" />
                Candidate Full Name
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Auto UPPERCASE</span>
            </label>
            <input
              type="text"
              value={overlay.name}
              onChange={(e) =>
                setOverlay((prev) => ({
                  ...prev,
                  name: e.target.value.toUpperCase(),
                }))
              }
              placeholder="RAHUL SHARMA"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Date of Photo (DOP) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Date of Photo (DD-MM-YYYY)
              </span>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[10px] text-sky-400 hover:text-sky-300 underline"
              >
                Set Today's Date
              </button>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={overlay.date}
                onChange={(e) =>
                  setOverlay((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                placeholder="02-10-2026"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Advanced Footer Styling Options */}
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2">
              <span>Band Height:</span>
              <input
                type="range"
                min="12"
                max="26"
                step="1"
                value={overlay.bandHeightPercent || 18}
                onChange={(e) =>
                  setOverlay((prev) => ({
                    ...prev,
                    bandHeightPercent: parseInt(e.target.value, 10),
                  }))
                }
                className="w-24 h-1 bg-slate-700 rounded-lg accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-slate-300">{overlay.bandHeightPercent || 18}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Font Size:</span>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={overlay.fontSizeMultiplier || 1.0}
                onChange={(e) =>
                  setOverlay((prev) => ({
                    ...prev,
                    fontSizeMultiplier: parseFloat(e.target.value),
                  }))
                }
                className="w-24 h-1 bg-slate-700 rounded-lg accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-slate-300">
                {((overlay.fontSizeMultiplier || 1.0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
