import React, { useState } from 'react';
import { Download, Copy, Check, Sparkles, FileCheck, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamPreset } from '../../config/presets';
import { CompressionResult } from '../../utils/binarySearchCompress';
import { triggerDownload, generateCompliantFileName } from '../../utils/fileSanitizer';

interface DownloadBarProps {
  preset: ExamPreset;
  compressionResult: CompressionResult | null;
  candidateName: string;
  onDownloaded?: () => void;
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  preset,
  compressionResult,
  candidateName,
  onDownloaded,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const defaultFileName = generateCompliantFileName(
    candidateName,
    preset.shortName,
    preset.type,
    preset.format === 'image/png' ? 'png' : 'jpg'
  );

  const [customFileName, setCustomFileName] = useState(defaultFileName);

  const handleDownload = () => {
    if (!compressionResult) return;

    triggerDownload(compressionResult.dataUrl, customFileName || defaultFileName);
    setDownloadSuccess(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      console.error(e);
    }

    if (onDownloaded) {
      onDownloaded();
    }

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyToClipboard = async () => {
    if (!compressionResult) return;
    try {
      const response = await fetch(compressionResult.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-600/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Custom Filename Input */}
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Target Download File Name</span>
          </label>
          <input
            type="text"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-sky-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Download & Copy Buttons */}
        <div className="flex items-center gap-2 pt-2 sm:pt-4">
          <button
            type="button"
            onClick={handleCopyToClipboard}
            disabled={!compressionResult}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Copy image to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!compressionResult}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Compliant Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span>Ready for upload to official government portal</span>
        <span className="font-mono text-emerald-400">0 bytes uploaded to external servers</span>
      </div>
    </div>
  );
};
