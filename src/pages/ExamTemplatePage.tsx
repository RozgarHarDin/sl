import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { DropZone } from '../components/core/DropZone';
import { CanvasStage } from '../components/core/CanvasStage';
import { NameDateControls } from '../components/core/NameDateControls';
import { LiveInspector } from '../components/core/LiveInspector';
import { DownloadBar } from '../components/core/DownloadBar';
import { ExamPreset, getPresetById, getPresetBySlug } from '../config/presets';
import { CropArea, OverlayOptions, loadImageSource } from '../utils/canvasDraw';
import { binarySearchCompress, CompressionResult } from '../utils/binarySearchCompress';
import { generateSampleCandidatePhoto, generateSampleSignature } from '../utils/sampleImages';

interface ExamTemplatePageProps {
  slug: string;
  onNavigate: (page: string) => void;
  onIncrementProcessed: () => void;
}

export const ExamTemplatePage: React.FC<ExamTemplatePageProps> = ({
  slug,
  onNavigate,
  onIncrementProcessed,
}) => {
  const preset = getPresetBySlug(slug) || getPresetById('ssc_cgl_photo');

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [customTargetKb, setCustomTargetKb] = useState<number>(preset.target_kb);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    zoom: 1.0,
    rotation: 0,
    flipH: false,
    flipV: false,
  });

  const [overlay, setOverlay] = useState<OverlayOptions>({
    enabled: preset.requires_name_date,
    name: 'RAHUL SHARMA',
    date: (() => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      return `${dd}-${mm}-${today.getFullYear()}`;
    })(),
    fontSizeMultiplier: 1.0,
    bandHeightPercent: 18,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  });

  const lastCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load sample on mount
  useEffect(() => {
    setCustomTargetKb(preset.target_kb);
    const sample = preset.type === 'signature' ? generateSampleSignature() : generateSampleCandidatePhoto();
    loadImageSource(sample).then((img) => {
      setImageElement(img);
      setCurrentFileName(preset.type === 'signature' ? 'sample_signature.jpg' : 'sample_photo.jpg');
    });
  }, [preset.id, preset.type, preset.target_kb]);

  const handleFileSelect = async (fileOrUrl: File | string, fileName?: string) => {
    try {
      setIsProcessing(true);
      const img = await loadImageSource(fileOrUrl);
      setImageElement(img);
      setCurrentFileName(fileName || 'Candidate_Image.jpg');
      setCropArea({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        zoom: 1.0,
        rotation: 0,
        flipH: false,
        flipV: false,
      });
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleTargetKbChange = async (newTarget: number) => {
    setCustomTargetKb(newTarget);
    if (!lastCanvasRef.current) return;
    try {
      setIsProcessing(true);
      const result = await binarySearchCompress(lastCanvasRef.current, {
        minKb: preset.min_kb,
        maxKb: preset.max_kb,
        targetKb: newTarget,
        format: preset.format,
      });
      setCompressionResult(result);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleCanvasRendered = useCallback(async (canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
    try {
      setIsProcessing(true);
      const result = await binarySearchCompress(canvas, {
        minKb: preset.min_kb,
        maxKb: preset.max_kb,
        targetKb: customTargetKb || preset.target_kb,
        format: preset.format,
      });
      setCompressionResult(result);
      setIsProcessing(false);
    } catch (err) {
      console.error('Binary compression failed:', err);
      setIsProcessing(false);
    }
  }, [preset.min_kb, preset.max_kb, preset.target_kb, preset.format, customTargetKb]);

  const getSEOConfig = () => {
    switch (slug) {
      case 'ssc-photo-resizer':
        return {
          h1: 'Official SSC CGL / CHSL / MTS Photo & Signature Resizer (20–50 KB)',
          desc: 'Instant free online photo resizer for SSC forms. Automatically crop to 3.5 x 4.5 cm, stamp Name & Date of Photo (DOP), and compress between 20 KB to 50 KB.',
          faqs: [
            {
              q: 'What is the official photo size for SSC CGL / CHSL?',
              a: 'The official SSC photograph must be in JPEG format, strictly between 20 KB and 50 KB, measuring 3.5 cm width by 4.5 cm height (350x450 pixels) with a white or clear light background.',
            },
            {
              q: 'Is Date of Photo (DOP) mandatory on SSC photos?',
              a: 'SSC guidelines require the photograph to have been taken within the last 3 months. Printing the Candidate Name and Date of Taking Photograph (DOP) on a white footer strip prevents portal rejection.',
            },
            {
              q: 'What are the dimensions and KB limits for SSC Signature?',
              a: 'SSC signature must be between 10 KB and 20 KB in JPEG format, with dimensions 4.0 cm width by 2.0 cm height (400x200 px), signed in black ink on white paper (not in CAPITAL letters).',
            },
          ],
        };
      case 'ssc-signature-resize':
        return {
          h1: 'SSC Signature Resizer & Compressor Online (10–20 KB)',
          desc: 'Resize SSC CGL, CHSL, MTS, and GD signatures to exact 10-20 KB and 4.0 x 2.0 cm (400x200 px) in JPEG format with dark crisp ink.',
          faqs: [
            {
              q: 'What is the size limit for SSC signature?',
              a: 'The signature must be between 10 KB and 20 KB with pixel dimensions of 400x200 pixels.',
            },
            {
              q: 'Can I sign in CAPITAL letters?',
              a: 'No. Signatures in CAPITAL LETTERS are strictly rejected by the SSC portal.',
            }
          ]
        };
      case 'upsc-signature-resize':
      case 'upsc-photo-resize':
        return {
          h1: 'UPSC Civil Services / NDA Signature & Photo Resizer (20–300 KB)',
          desc: 'Resize and compress UPSC OTR, IAS, IPS, NDA, and CDS photos and signatures to official dimensions (350x350 to 1000x1000 px) and 20–300 KB limits.',
          faqs: [
            {
              q: 'What are the UPSC photo and signature upload requirements?',
              a: 'UPSC requires both photograph and signature to be in JPG format, between 20 KB and 300 KB in size, with pixel dimensions ranging from 350x350 px up to 1000x1000 px.',
            },
            {
              q: 'Does UPSC require Name and Date on the photo?',
              a: 'Yes, UPSC OTR guidelines mandate that the candidate photograph must display the candidate name and the date on which the photo was captured.',
            },
          ],
        };
      case 'nta-neet-photo-compress':
        return {
          h1: 'NTA NEET UG Passport & Postcard Photo Resizer Online (10–200 KB)',
          desc: 'Compress and format NEET UG passport photo (3.5x4.5 cm) and 4x6 inch postcard size photo to 10–200 KB with mandatory Name and DOP overlay.',
          faqs: [
            {
              q: 'What are the photo dimensions for NEET UG Application?',
              a: 'NEET requires two photos: Passport size (3.5 x 4.5 cm, 10–200 KB) and Postcard size (4" x 6" inch ratio, 10–200 KB) with white background and 80% face coverage.',
            },
            {
              q: 'What are the rules for NEET signature and finger impressions?',
              a: 'NEET signature must be 4 KB to 30 KB (3.5x1.5 cm) in running handwriting. Left and Right hand finger & thumb impressions must be between 10 KB to 200 KB in JPG format.',
            },
          ],
        };
      case 'ibps-photo-signature':
      default:
        return {
          h1: 'IBPS PO, Clerk & SBI Banking Photo, Signature & Thumb Resizer',
          desc: 'Resize photo (20–50 KB, 200x230 px), signature (10–20 KB, 140x60 px), left thumb impression, and handwritten declaration for IBPS and SBI forms.',
          faqs: [
            {
              q: 'What is the dimension of IBPS photo and signature?',
              a: 'IBPS photo must measure 200 x 230 pixels (20–50 KB). IBPS signature must measure 140 x 60 pixels (10–20 KB) in black ink without CAPITAL letters.',
            },
            {
              q: 'What are the specs for IBPS handwritten declaration?',
              a: 'Handwritten declaration must be in English with black ink on white paper, measuring 800 x 400 pixels (50–100 KB).',
            },
          ],
        };
    }
  };

  const seoConfig = getSEOConfig();

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://sl.sarkaripixel.workers.dev/${slug}/#webapp`,
        name: `SarkariPixel - ${preset.name} Resizer`,
        url: `https://sl.sarkaripixel.workers.dev/${slug}`,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        description: seoConfig.desc,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `https://sl.sarkaripixel.workers.dev/${slug}/#faq`,
        mainEntity: seoConfig.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-10 pb-16">
      <SEO
        title={`SarkariPixel – ${preset.name} Resizer (${preset.min_kb}–${preset.max_kb} KB)`}
        description={seoConfig.desc}
        canonicalUrl={`https://sl.sarkaripixel.workers.dev/${slug}`}
        schema={schemaData}
      />

      {/* Hero Header */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-sky-400 border border-blue-500/30 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Official 2026 Recruitment Notification Specs</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {seoConfig.h1}
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          {seoConfig.desc}
        </p>

        {/* Quick Specs Strip */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-sky-300 font-mono font-bold">
            Size: {preset.min_kb}–{preset.max_kb} KB
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
            {preset.width_px}×{preset.height_px} px ({preset.width_cm}×{preset.height_cm} cm)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold">
            {preset.background_rule}
          </span>
        </div>
      </section>

      {/* Embedded Live Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Upload & Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Upload {preset.name}
              </h3>
              <DropZone
                onFileSelect={handleFileSelect}
                currentFileName={currentFileName}
                presetType={preset.type}
              />
            </div>

            <NameDateControls
              overlay={overlay}
              setOverlay={setOverlay}
              preset={preset}
            />
          </div>

          {/* Right: Stage, Inspector, and Download */}
          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-20">
            <CanvasStage
              imageElement={imageElement}
              cropArea={cropArea}
              setCropArea={setCropArea}
              overlay={overlay}
              preset={preset}
              onCanvasRendered={handleCanvasRendered}
            />

            <LiveInspector
              preset={preset}
              compressionResult={compressionResult}
              isProcessing={isProcessing}
              targetKb={customTargetKb}
              onTargetKbChange={handleTargetKbChange}
            />

            <DownloadBar
              preset={preset}
              compressionResult={compressionResult}
              candidateName={overlay.enabled ? overlay.name : ''}
              onDownloaded={onIncrementProcessed}
            />
          </div>
        </div>
      </section>

      {/* Step-by-Step Tutorial */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>How to Resize & Compress {preset.shortName} (Step-by-Step Guide)</span>
          </h2>
          <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Upload your original picture:</strong> Drag and drop your photo or signature into the box above, or capture directly with your mobile camera.
            </li>
            <li>
              <strong>Align with the Aspect Box:</strong> Use the interactive crop stage to position your face centered with both ears visible and neutral expression.
            </li>
            <li>
              <strong>Add Date of Photo (DOP):</strong> Toggle the DOP option to automatically print your name and capture date onto the official white bottom band.
            </li>
            <li>
              <strong>Verify in Live Inspector:</strong> Confirm that the calculated file size sits comfortably between <strong>{preset.min_kb} KB and {preset.max_kb} KB</strong>.
            </li>
            <li>
              <strong>Download Compliant Image:</strong> Click "Download Compliant Image" to save your portal-ready JPG file without any watermarks.
            </li>
          </ol>
        </div>
      </section>

      {/* Structured FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <span>Frequently Asked Questions & Notification Rules</span>
          </h2>

          <div className="space-y-2">
            {seoConfig.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-800 rounded-xl overflow-hidden bg-slate-800/40"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:bg-slate-800/80 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
