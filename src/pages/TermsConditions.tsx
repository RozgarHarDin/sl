import React from 'react';
import { SEO } from '../components/common/SEO';

export const TermsConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-16 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <SEO
        title="Terms & Conditions – SarkariPixel"
        description="Terms and conditions governing the use of SarkariPixel free in-browser photo resizer utility."
        canonicalUrl="https://sarkaripixel.klyvix.workers.dev/terms-and-conditions"
      />

      <div className="text-center space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-4xl font-black text-white">Terms and Conditions</h1>
        <p className="text-xs text-slate-400">Effective Date: October 4, 2026</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing or using SarkariPixel (the "Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.
        </p>

        <h2 className="text-base font-bold text-white">2. Free Permitted Use</h2>
        <p>
          SarkariPixel is provided 100% free of charge for individual candidates, students, Cyber Cafés, and CSC operators. You agree not to process unlawful, fraudulent, or harmful materials.
        </p>

        <h2 className="text-base font-bold text-white">3. As-Is Utility & User Responsibility</h2>
        <p>
          SarkariPixel provides pixel, DPI, and kilobyte resizing algorithms calibrated to official public recruitment notifications. However, government recruitment boards (such as SSC, UPSC, NTA, IBPS, and State PSCs) frequently update their guidelines. <strong>The final responsibility of verifying preview compliance against official examination notifications rests solely with the applicant.</strong>
        </p>

        <h2 className="text-base font-bold text-white">4. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, SarkariPixel and its operators shall not be liable for any portal rejection, administrative delay, or missed deadlines.
        </p>
      </div>
    </div>
  );
};
