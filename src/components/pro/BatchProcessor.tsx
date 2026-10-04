import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  FileArchive, 
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { ExamPreset, EXAM_PRESETS } from '../../config/presets';
import { renderProcessedCanvas, loadImageSource, CropArea, OverlayOptions } from '../../utils/canvasDraw';
import { binarySearchCompress, CompressionResult } from '../../utils/binarySearchCompress';
import { sanitizeFileName } from '../../utils/fileSanitizer';

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  candidateName: string;
  dateStr: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSizeKb: number;
  processedResult?: CompressionResult;
  error?: string;
}

interface BatchProcessorProps {
  onProcessedCountChange?: (count: number) => void;
  onZipDownloaded?: () => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  onProcessedCountChange,
  onZipDownloaded,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ssc_cgl_photo');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [globalDopEnabled, setGlobalDopEnabled] = useState(true);
  const [globalTargetKb, setGlobalTargetKb] = useState(35);
  const [globalDate, setGlobalDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${today.getFullYear()}`;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPreset = EXAM_PRESETS.find(p => p.id === selectedPresetId) || EXAM_PRESETS[0];

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = EXAM_PRESETS.find(ep => ep.id === presetId) || EXAM_PRESETS[0];
    setGlobalTargetKb(p.target_kb);
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];
    const totalCurrent = batchItems.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawName = file.name.split('.')[0].replace(/[-_]/g, ' ').replace(/(photo|sign|signature|pic|image)/gi, '').trim();
      const candidateName = rawName ? rawName.toUpperCase() : `CANDIDATE ${totalCurrent + newItems.length + 1}`;

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        candidateName,
        dateStr: globalDate,
        status: 'pending',
        originalSizeKb: +(file.size / 1024).toFixed(1),
      });
    }

    setBatchItems(prev => [...prev, ...newItems]);
  };

  const processSingleItem = async (item: BatchItem, preset: ExamPreset): Promise<BatchItem> => {
    try {
      const img = await loadImageSource(item.file);
      const cropArea: CropArea = {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        zoom: 1.0,
        rotation: 0,
        flipH: false,
        flipV: false,
      };

      const overlay: OverlayOptions = {
        enabled: globalDopEnabled && preset.requires_name_date,
        name: item.candidateName,
        date: item.dateStr || globalDate,
        fontSizeMultiplier: 1.0,
        bandHeightPercent: 18,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
      };

      const canvas = renderProcessedCanvas({
        image: img,
        targetWidth: preset.width_px,
        targetHeight: preset.height_px,
        cropArea,
        overlay,
        enableSharpening: true,
        sharpenAmount: 0.22,
      });

      const compressionResult = await binarySearchCompress(canvas, {
        minKb: preset.min_kb,
        maxKb: preset.max_kb,
        targetKb: globalTargetKb || preset.target_kb,
        format: preset.format,
      });

      return {
        ...item,
        status: 'done',
        processedResult: compressionResult,
      };
    } catch (err) {
      return {
        ...item,
        status: 'error',
        error: String(err),
      };
    }
  };

  const handleProcessAll = async () => {
    if (batchItems.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    const updatedItems = [...batchItems];

    for (let i = 0; i < updatedItems.length; i++) {
      if (updatedItems[i].status !== 'done') {
        updatedItems[i] = { ...updatedItems[i], status: 'processing' };
        setBatchItems([...updatedItems]);

        const processed = await processSingleItem(updatedItems[i], selectedPreset);
        updatedItems[i] = processed;
        setBatchItems([...updatedItems]);
      }
    }

    setIsProcessingAll(false);
    onProcessedCountChange?.(updatedItems.length);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadZip = async () => {
    const doneItems = batchItems.filter(i => i.status === 'done' && i.processedResult);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    const folderName = `SarkariPixel_${sanitizeFileName(selectedPreset.shortName)}_Batch`;
    const folder = zip.folder(folderName) || zip;

    for (const item of doneItems) {
      if (!item.processedResult) continue;
      const fileName = `${sanitizeFileName(item.candidateName)}_${sanitizeFileName(selectedPreset.shortName)}.${
        selectedPreset.format === 'image/png' ? 'png' : 'jpg'
      }`;
      folder.file(fileName, item.processedResult.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onZipDownloaded?.();
  };

  const handleRemoveItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setBatchItems([]);
  };

  const doneCount = batchItems.filter(i => i.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <FolderArchive className="w-5 h-5 text-sky-300" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Bulk Multi-Candidate Batch Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                100% Free
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Process unlimited candidate photos in parallel • Auto DOP footer stamping • 1-Click JSZip export
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Select Preset */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Target Exam Preset
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {EXAM_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.min_kb}–{preset.max_kb} KB)
              </option>
            ))}
          </select>
        </div>

        {/* Global Date */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Date of Photo (DOP)
          </label>
          <input
            type="text"
            value={globalDate}
            onChange={(e) => setGlobalDate(e.target.value)}
            placeholder="DD-MM-YYYY"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Global DOP Toggle */}
        <div className="flex items-center justify-between pt-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={globalDopEnabled}
              onChange={(e) => setGlobalDopEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
            />
            <span>Stamp DOP & Name Strip</span>
          </label>

          <span className="text-xs text-slate-400 font-mono">
            {batchItems.length} Files in Queue
          </span>
        </div>
      </div>

      {/* Multi-File Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-8 text-center cursor-pointer transition space-y-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => handleFilesAdded(e.target.files)}
        />
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-white">
          Drop candidate photos here or click to browse
        </p>
        <p className="text-xs text-slate-400">
          Upload any number of images for parallel client-side compression
        </p>
      </div>

      {/* Queue Table */}
      {batchItems.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Batch Processing Queue ({batchItems.length} items)
              </h3>
              <p className="text-xs text-slate-400">
                {doneCount} of {batchItems.length} files compressed to exact {selectedPreset.min_kb}–{selectedPreset.max_kb} KB
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleProcessAll}
                disabled={isProcessingAll || batchItems.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessingAll ? 'animate-spin' : ''}`} />
                <span>{isProcessingAll ? 'Processing...' : 'Process All Files'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={doneCount === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <FileArchive className="w-3.5 h-3.5" />
                <span>Download ZIP ({doneCount})</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Candidate & File</th>
                  <th className="p-3">Original Size</th>
                  <th className="p-3">Target Size</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {batchItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={item.candidateName}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, candidateName: val } : it));
                          }}
                          placeholder="Candidate Name"
                          className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono font-bold text-sky-200 focus:outline-none focus:border-blue-500"
                        />
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.name}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{item.originalSizeKb} KB</td>
                    <td className="p-3 font-mono">
                      {item.processedResult ? (
                        <span className="text-emerald-400 font-bold">
                          {item.processedResult.sizeKb} KB
                        </span>
                      ) : (
                        <span className="text-slate-500">~{globalTargetKb} KB</span>
                      )}
                    </td>
                    <td className="p-3">
                      {item.status === 'done' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sharp & Ready</span>
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 text-[10px]">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Compressing...</span>
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                          Pending
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Error</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.processedResult && (
                          <a
                            href={item.processedResult.dataUrl}
                            download={`${sanitizeFileName(item.candidateName)}_${selectedPreset.shortName}.jpg`}
                            className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-sky-300 rounded-lg transition"
                            title="Download single file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                          title="Remove from batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
