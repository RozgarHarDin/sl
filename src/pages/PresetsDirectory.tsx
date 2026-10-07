import React, { useState } from 'react';
import { Search, Layers, ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { ExamPreset, CATEGORIES } from '../config/presets';

interface PresetsDirectoryProps {
  presets: ExamPreset[];
  onSelectPreset: (presetId: string) => void;
  onNavigate: (page: string) => void;
}

export const PresetsDirectory: React.FC<PresetsDirectoryProps> = ({
  presets,
  onSelectPreset,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = presets.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.background_rule.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUsePreset = (preset: ExamPreset) => {
    onSelectPreset(preset.id);
    if (preset.slug) {
      onNavigate(preset.slug);
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <SEO
        title="Directory of 50+ Indian Govt Exam Photo & Signature Specifications (2026) – SarkariPixel"
        description="Comprehensive index of official photo dimensions, DPI, and KB limits for SSC, UPSC, NTA NEET/JEE, IBPS, Railways RRB, State PSCs, and Passport Seva."
        canonicalUrl="https://sarkaripixel.klyvix.workers.dev/presets"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto px-4 pt-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-sky-400 border border-blue-500/30">
          <Layers className="w-3.5 h-3.5" />
          <span>Official Notification Guidelines Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          50+ Indian Government Exam & Portal Presets
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Click "Use Preset" to instantly load dimension constraints and exact-KB compression rules into SarkariPixel.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by exam name, portal, or state..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 shadow-xl"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((preset) => (
            <div
              key={preset.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-xl transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    {preset.category} • {preset.type.toUpperCase()}
                  </span>
                  {preset.popular && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Popular
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base leading-snug">
                  {preset.name}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ALLOWED KB</span>
                    <span className="text-emerald-400 font-bold">{preset.min_kb}–{preset.max_kb} KB</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">DIMENSIONS</span>
                    <span className="text-sky-300">{preset.width_px}×{preset.height_px} px</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">PRINT SIZE</span>
                    <span className="text-slate-300">{preset.width_cm}×{preset.height_cm} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">DOP OVERLAY</span>
                    <span className={preset.requires_name_date ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      {preset.requires_name_date ? 'Recommended' : 'Optional'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Background:</strong> {preset.background_rule}
                </p>
              </div>

              <button
                onClick={() => handleUsePreset(preset)}
                className="w-full py-2 bg-blue-600/30 hover:bg-blue-600 text-sky-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Use This Preset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
