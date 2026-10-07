import React from 'react';
import { ShieldCheck, Cpu, Lock } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-16 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <SEO
        title="About SarkariPixel – The Free, Privacy-First Indian Exam Photo Engine"
        description="Learn about our mission to eliminate exam form rejections and protect candidate privacy across India with 100% free in-browser resizing."
        canonicalUrl="https://sarkaripixel.klyvix.workers.dev/about"
      />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-sky-400 border border-blue-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">About SarkariPixel</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Built to solve the annual frustration of 35+ million Indian competitive examination aspirants with a completely free, privacy-first utility.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-white">The Problem We Solve</h2>
        <p>
          Every year, millions of students apply for competitive recruitment exams like SSC CGL, UPSC Civil Services, NTA NEET/JEE, Railway RRB, and State PSCs. Unfortunately, tens of thousands face application rejection due to strict upload parameters (20–50 KB limits, 3.5×4.5 cm ratios, or missing Date of Photo [DOP] strips).
        </p>
        <p>
          SarkariPixel gives every applicant, Cyber Café operator, and CSC VLE a fast, 100% free tool that runs entirely inside the browser with zero server uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">100% Client-Side Privacy</h3>
          <p className="text-xs text-slate-400">
            All algorithms execute inside your local browser memory (RAM). Zero bytes of image data are sent to any external server.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-sky-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Multi-Pass Stepped Resampling</h3>
          <p className="text-xs text-slate-400">
            Our multi-step downscaling and unsharp edge convolution preserve high visual clarity, facial sharpness, and signature contrast.
          </p>
        </div>
      </div>
    </div>
  );
};
