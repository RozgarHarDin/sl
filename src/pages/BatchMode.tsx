import React from 'react';
import { SEO } from '../components/common/SEO';
import { BatchProcessor } from '../components/pro/BatchProcessor';

interface BatchModeProps {
  onIncrementProcessed: (count?: number) => void;
}

export const BatchMode: React.FC<BatchModeProps> = ({
  onIncrementProcessed,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
      <SEO
        title="Bulk Batch Photo & Signature Compressor (100% Free JSZip)"
        description="Batch process multiple candidate photos at once. Auto-apply Date of Photo (DOP) overlays, resize to exact exam KB limits, and export organized ZIP files."
        canonicalUrl="https://sl.sarkaripixel.workers.dev/batch"
      />

      <BatchProcessor
        onProcessedCountChange={onIncrementProcessed}
      />
    </div>
  );
};
