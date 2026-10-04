import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why do Indian government exam portals (SSC, UPSC, NTA) reject photos?',
      a: 'The top 5 reasons for rejection are: 1) File size exceeding or falling below the strict KB limit (e.g. 19.8 KB when 20 KB is required), 2) Incorrect pixel aspect ratio causing stretched/squished faces, 3) Wearing caps, dark tinted glasses, or masks, 4) Missing Date of Photo (DOP) or name footer, and 5) Blurry background or shadows behind ears.',
    },
    {
      q: 'What is Date of Photo (DOP) and how does SarkariPixel generate it?',
      a: 'Many portals like SSC, UPSC, and NEET mandate that the candidate photo must display the candidate name and the date of capture (DD-MM-YYYY) in a clean white strip at the bottom. SarkariPixel automatically renders this calibrated 18% footer with high-contrast bold typography without squishing your facial aspect ratio.',
    },
    {
      q: 'Are my identity documents or photos uploaded to any external server?',
      a: 'No. Zero bytes of image data leave your device. All image cropping, rotation, text stamping, and binary search compression execute 100% inside your browser’s RAM via HTML5 Canvas API and Web Workers. Even if you turn off your internet, the resizer continues to work fully offline.',
    },
    {
      q: 'How does SarkariPixel prevent blurry/muddy photos?',
      a: 'We use stepped multi-pass downsampling (halving dimensions iteratively rather than a single sudden downscale) combined with an intelligent unsharp mask edge filter. This preserves crisp eye contours, hair details, and fine signature strokes.',
    },
    {
      q: 'What are the rules for signature uploads on SSC and IBPS portals?',
      a: 'Signatures must be signed in black or dark blue ink on crisp white paper in running handwriting. Signatures made entirely in CAPITAL LETTERS are permanently rejected by IBPS and SSC recruitment boards.',
    },
    {
      q: 'Can I install SarkariPixel on my Android or iPhone?',
      a: 'Yes! SarkariPixel is a Progressive Web App (PWA). On Android Chrome or desktop, click the "Install SarkariPixel" button in the header. On iOS Safari, tap "Share" > "Add to Home Screen".',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-16">
      <SEO
        title="Frequently Asked Questions (FAQ) & Exam Photo Rules – SarkariPixel"
        description="Comprehensive guide on SSC, UPSC, NEET, and IBPS photo dimensions, Date of Photo (DOP) stamping, and portal rejection troubleshooting."
        canonicalUrl="https://sl.sarkaripixel.workers.dev/faq"
      />

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-sky-400 border border-blue-500/30">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base & Portal Guidelines</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Everything you need to know about exact KB compression, background rules, and photo acceptance.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-white text-sm hover:bg-slate-800/40 transition"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-sky-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
