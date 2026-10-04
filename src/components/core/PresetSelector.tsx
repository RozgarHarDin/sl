import React, { useState } from 'react';
import { Search, Filter, Check, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { ExamPreset, CATEGORIES } from '../../config/presets';

interface PresetSelectorProps {
  presets: ExamPreset[];
  selectedPreset: ExamPreset;
  onSelectPreset: (presetId: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  selectedPreset,
  onSelectPreset,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredPresets = presets.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>1. Select Official Exam Preset</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-normal">
              {presets.length} Portals
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Auto-configures pixel dimensions, cm ratio, and strict KB upload window.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SSC, UPSC, NEET..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Current Selection Card & Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = preset.id === selectedPreset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`text-left p-3 rounded-xl border transition-all relative ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-950/80 to-slate-800 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-white line-clamp-1">
                  {preset.name}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-300 font-mono font-medium">
                  {preset.min_kb}–{preset.max_kb} KB
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono">
                  {preset.width_px}×{preset.height_px} px
                </span>
                {preset.requires_name_date && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    DOP
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Preset Specification Summary Pill */}
      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-300">{selectedPreset.name} Rules:</span>
          <span className="text-slate-300">
            Target Size: <strong>{selectedPreset.min_kb}–{selectedPreset.max_kb} KB</strong> (Aim: {selectedPreset.target_kb} KB)
          </span>
        </div>
        <div className="text-slate-400 text-[11px] font-mono">
          {selectedPreset.width_cm} × {selectedPreset.height_cm} cm ({selectedPreset.width_px}×{selectedPreset.height_px} px @ {selectedPreset.dpi} DPI)
        </div>
      </div>
    </div>
  );
};
