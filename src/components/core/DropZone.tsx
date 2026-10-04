import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Image as ImageIcon, FileSignature, Fingerprint, AlertCircle } from 'lucide-react';
import { validateImageFile } from '../../utils/fileSanitizer';
import { generateSampleCandidatePhoto, generateSampleSignature, generateSampleThumb } from '../../utils/sampleImages';

interface DropZoneProps {
  onFileSelect: (file: File | string, fileName?: string) => void;
  currentFileName?: string;
  presetType?: 'photo' | 'signature' | 'thumb' | 'declaration' | 'postcard';
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelect,
  currentFileName,
  presetType = 'photo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format');
      return;
    }
    setErrorMessage(null);
    onFileSelect(file, file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const loadSamplePhoto = () => {
    const dataUrl = generateSampleCandidatePhoto();
    setErrorMessage(null);
    onFileSelect(dataUrl, 'Demo_Candidate_Photo.jpg');
  };

  const loadSampleSignature = () => {
    const dataUrl = generateSampleSignature();
    setErrorMessage(null);
    onFileSelect(dataUrl, 'Demo_Candidate_Signature.jpg');
  };

  const loadSampleThumb = () => {
    const dataUrl = generateSampleThumb();
    setErrorMessage(null);
    onFileSelect(dataUrl, 'Demo_Candidate_Thumb.jpg');
  };

  return (
    <div className="space-y-3">
      {/* Drag and drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Click to browse or drop {presetType} here
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports JPG, JPEG, PNG, WEBP (Max 25 MB) • 100% Client-Side Privacy
            </p>
          </div>

          {currentFileName && (
            <span className="inline-block text-xs font-mono bg-slate-800 text-sky-300 px-3 py-1 rounded-full border border-slate-700 truncate max-w-xs">
              Selected: {currentFileName}
            </span>
          )}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Action Buttons & Sample Loaders */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium transition"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Take Camera Photo</span>
          </button>
        </div>

        {/* Demo buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Try demo:</span>
          <button
            type="button"
            onClick={loadSamplePhoto}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-blue-900/40 text-sky-300 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs font-medium transition"
          >
            <ImageIcon className="w-3 h-3" />
            <span>Sample Photo</span>
          </button>
          <button
            type="button"
            onClick={loadSampleSignature}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-blue-900/40 text-sky-300 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs font-medium transition"
          >
            <FileSignature className="w-3 h-3" />
            <span>Signature</span>
          </button>
          <button
            type="button"
            onClick={loadSampleThumb}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-blue-900/40 text-sky-300 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs font-medium transition hidden sm:flex"
          >
            <Fingerprint className="w-3 h-3" />
            <span>Thumb</span>
          </button>
        </div>
      </div>
    </div>
  );
};
