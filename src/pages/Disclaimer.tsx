import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const Disclaimer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-16 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <SEO
        title="Government Non-Affiliation Disclaimer – SarkariPixel"
        description="Official statement of non-affiliation with the Government of India, SSC, UPSC, NTA, IBPS, or State PSC entities."
        canonicalUrl="https://sarkaripixel.klyvix.workers.dev/disclaimer"
      />

      <div className="text-center space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Non-Affiliation Notice</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Legal Disclaimer</h1>
        <p className="text-xs text-slate-400">Strict Non-Government Independent Tool Notice</p>
      </div>

      <div className="bg-amber-950/20 border-2 border-amber-500/40 p-6 rounded-3xl space-y-3">
        <h3 className="font-bold text-white text-base text-amber-300">
          GOVERNMENT NON-AFFILIATION DECLARATION
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong>SarkariPixel (sarkaripixel.klyvix.workers.dev)</strong> is an independent software tool and private technical utility. It is <strong>NOT affiliated, associated, authorized, endorsed by, or in any way officially connected</strong> with:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-2">
          <li>Staff Selection Commission (SSC)</li>
          <li>Union Public Service Commission (UPSC)</li>
          <li>National Testing Agency (NTA - NEET / JEE / CUET)</li>
          <li>Institute of Banking Personnel Selection (IBPS) or State Bank of India (SBI)</li>
          <li>Railway Recruitment Boards (RRB)</li>
          <li>Any State Public Service Commission (UPPSC, BPSC, MPSC, TNPSC, etc.)</li>
          <li>The Government of India or any Ministry/Department thereof</li>
        </ul>
        <p className="text-xs text-slate-300 mt-2">
          All examination names, acronyms, and trademarks referenced on this website are the property of their respective official recruitment bodies and are utilized solely for informational compatibility purposes under fair use.
        </p>
      </div>
    </div>
  );
};
