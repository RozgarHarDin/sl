import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-16 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <SEO
        title="Privacy Policy (Zero Data Egress Declaration) – SarkariPixel"
        description="Our explicit Zero Server Data Transmission policy guarantees your identity documents never leave your browser."
        canonicalUrl="https://sl.sarkaripixel.workers.dev/privacy-policy"
      />

      <div className="text-center space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero Server Transmission Guarantee</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: October 4, 2026</p>
      </div>

      <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl space-y-2">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Explicit "Zero Data Transmission" Declaration
        </h3>
        <p className="text-xs text-emerald-200">
          SarkariPixel is engineered with a strict <strong>offline-first, client-side only architecture</strong>. When you select or drop photos, signatures, or thumb impressions, they are processed exclusively inside your device's browser memory (RAM) via the HTML5 Canvas API. At no point are your images transmitted over the internet or stored on external servers.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">1. Information We Do NOT Collect</h2>
        <p>
          We do NOT collect, inspect, store, or transmit any candidate photos, signatures, handwritten declarations, biometric impressions, Aadhaar copies, or personal identification details.
        </p>

        <h2 className="text-base font-bold text-white">2. Local Storage Usage</h2>
        <p>
          SarkariPixel uses your browser’s standard `localStorage` exclusively to store non-identifying preferences (such as your chosen preset or custom crop dimensions). No image files are ever saved to local storage.
        </p>

        <h2 className="text-base font-bold text-white">3. Zero Third-Party Tracker / Zero Ads</h2>
        <p>
          SarkariPixel is a 100% free utility with zero tracking scripts or external storage dependencies.
        </p>
      </div>
    </div>
  );
};
