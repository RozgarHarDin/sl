import React from 'react';
import { ShieldCheck, Lock, Cpu, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Privacy Callout Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  Zero-Server Egress Privacy Architecture
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    100% In-Browser RAM
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Your identity photos and signatures never leave your device. All cropping, DOP stamping, and sharp KB compression run locally on HTML5 Canvas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('privacy-policy')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Read Privacy Guarantee
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white">SarkariPixel</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The high-precision, 100% free offline-first photo and signature sizing suite built for 35M+ Indian competitive exam applicants & Cyber Café operators.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>HTML5 Multi-Pass Resampling & Unsharp Mask</span>
            </div>
          </div>

          {/* Col 2: Top Exams */}
          <div>
            <h5 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Top Exam Resizers
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('ssc-photo-resizer')}
                  className="hover:text-sky-400 text-left transition"
                >
                  SSC CGL/CHSL Photo Resizer (20-50 KB)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('upsc-signature-resize')}
                  className="hover:text-sky-400 text-left transition"
                >
                  UPSC Signature & Photo (OTR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nta-neet-photo-compress')}
                  className="hover:text-sky-400 text-left transition"
                >
                  NTA NEET UG Passport & Postcard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ibps-photo-signature')}
                  className="hover:text-sky-400 text-left transition"
                >
                  IBPS / SBI Banking Photo & Thumb
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('presets')}
                  className="hover:text-sky-400 text-left transition font-semibold text-blue-400"
                >
                  View All 50+ Portals &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Free Tools */}
          <div>
            <h5 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Free Utilities
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-sky-400 text-left transition">
                  Universal Photo Resizer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('batch')} className="hover:text-sky-400 text-left transition flex items-center gap-1">
                  <span>Bulk Batch Mode</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">100% FREE</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('custom')} className="hover:text-sky-400 text-left transition">
                  Custom Pixel / CM / KB Resizer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-sky-400 text-left transition">
                  Exam Photo Rules & DOP FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div>
            <h5 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Trust & Legal
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('disclaimer')} className="hover:text-sky-400 text-left transition font-medium text-amber-300">
                  Govt Non-Affiliation Notice
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-sky-400 text-left transition">
                  Privacy Policy (Zero Data Egress)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-sky-400 text-left transition">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-sky-400 text-left transition">
                  About SarkariPixel
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-sky-400 text-left transition">
                  Contact & Operator Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-left">
            <strong>Disclaimer:</strong> SarkariPixel is an independent, 100% free browser utility. It is not affiliated with, authorized, or endorsed by the Staff Selection Commission (SSC), UPSC, NTA, IBPS, or any Central or State Government recruitment authority.
          </p>
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <span>Built with precision & privacy in 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
