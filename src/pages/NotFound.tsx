import React from 'react';
import { FileQuestion, Home as HomeIcon, ArrowRight, Layers } from 'lucide-react';
import { SEO } from '../components/common/SEO';

interface NotFoundProps {
  onNavigate: (page: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 pb-24">
      <SEO
        title="404 Page Not Found – GovPhotoPass"
        description="The requested exam resizer page could not be found."
      />

      <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">404 - Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          The exam page or specification link you are looking for has been moved or updated.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <HomeIcon className="w-4 h-4" />
          <span>Go to Universal Resizer</span>
        </button>

        <button
          onClick={() => onNavigate('presets')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Browse 50+ Exam Presets</span>
        </button>
      </div>
    </div>
  );
};
