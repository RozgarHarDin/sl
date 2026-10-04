export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  sizeKb: number;
  quality: number;
  iterations: number;
  width: number;
  height: number;
  status: 'perfect' | 'in_range' | 'fallback';
}

export interface CompressionOptions {
  minKb: number;
  maxKb: number;
  targetKb: number;
  format?: 'image/jpeg' | 'image/png';
  maxIterations?: number;
  toleranceKb?: number;
  onProgress?: (percent: number) => void;
}

/**
 * Iterative Binary Search Compressor prioritizing maximum image sharpness & quality
 * Finds the highest possible JPEG quality (up to 0.98) that meets the target kilobyte constraints.
 */
export async function binarySearchCompress(
  sourceCanvas: HTMLCanvasElement,
  options: CompressionOptions
): Promise<CompressionResult> {
  const {
    minKb,
    maxKb,
    targetKb,
    format = 'image/jpeg',
    maxIterations = 7,
    toleranceKb = 1.0,
    onProgress,
  } = options;

  onProgress?.(10);

  if (format === 'image/png') {
    return new Promise((resolve) => {
      sourceCanvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to generate PNG blob');
        const sizeKb = +(blob.size / 1024).toFixed(2);
        const dataUrl = URL.createObjectURL(blob);
        onProgress?.(100);
        resolve({
          blob,
          dataUrl,
          sizeKb,
          quality: 1.0,
          iterations: 1,
          width: sourceCanvas.width,
          height: sourceCanvas.height,
          status: sizeKb >= minKb && sizeKb <= maxKb ? 'perfect' : 'fallback',
        });
      }, 'image/png');
    });
  }

  // Helper to extract canvas blob at specified quality
  const getBlobAtQuality = (canvas: HTMLCanvasElement, q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        Math.min(1.0, Math.max(0.01, q))
      );
    });
  };

  // Step 1: Check high quality baseline (0.95)
  const maxBlob = await getBlobAtQuality(sourceCanvas, 0.95);
  const maxSizeKb = +(maxBlob.size / 1024).toFixed(2);
  onProgress?.(30);

  // If already below or within target at near-maximum quality (0.95), return top quality immediately!
  if (maxSizeKb <= maxKb && maxSizeKb >= minKb) {
    const dataUrl = URL.createObjectURL(maxBlob);
    onProgress?.(100);
    return {
      blob: maxBlob,
      dataUrl,
      sizeKb: maxSizeKb,
      quality: 0.95,
      iterations: 1,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      status: 'perfect',
    };
  }

  // If even at 0.95 it is below minKb, try 1.0
  if (maxSizeKb < minKb) {
    const fullBlob = await getBlobAtQuality(sourceCanvas, 1.0);
    const fullKb = +(fullBlob.size / 1024).toFixed(2);
    const dataUrl = URL.createObjectURL(fullBlob);
    onProgress?.(100);
    return {
      blob: fullBlob,
      dataUrl,
      sizeKb: fullKb,
      quality: 1.0,
      iterations: 2,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      status: fullKb >= minKb ? 'in_range' : 'fallback',
    };
  }

  // Binary search optimization: focus on finding highest quality fitting <= maxKb
  let lowQuality = 0.1;
  let highQuality = 0.95;
  let optimalBlob: Blob | null = null;
  let optimalQuality = 0.85;
  let optimalSizeKb = 0;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    const progressPercent = 30 + Math.round((i / maxIterations) * 60);
    onProgress?.(progressPercent);

    const midQuality = (lowQuality + highQuality) / 2;
    const currentBlob = await getBlobAtQuality(sourceCanvas, midQuality);
    const currentKb = +(currentBlob.size / 1024).toFixed(2);

    if (currentKb <= maxKb && currentKb >= minKb) {
      optimalBlob = currentBlob;
      optimalQuality = midQuality;
      optimalSizeKb = currentKb;

      // If comfortably close to target, finish
      if (Math.abs(currentKb - targetKb) <= toleranceKb) {
        break;
      }
    } else if (currentKb <= maxKb && !optimalBlob) {
      optimalBlob = currentBlob;
      optimalQuality = midQuality;
      optimalSizeKb = currentKb;
    }

    if (currentKb < targetKb) {
      lowQuality = midQuality;
    } else {
      highQuality = midQuality;
    }
  }

  onProgress?.(95);

  const finalBlob = optimalBlob || maxBlob;
  const finalSizeKb = optimalSizeKb || maxSizeKb;
  const dataUrl = URL.createObjectURL(finalBlob);

  const status: 'perfect' | 'in_range' | 'fallback' =
    finalSizeKb >= minKb && finalSizeKb <= maxKb
      ? Math.abs(finalSizeKb - targetKb) <= 3
        ? 'perfect'
        : 'in_range'
      : 'fallback';

  onProgress?.(100);

  return {
    blob: finalBlob,
    dataUrl,
    sizeKb: finalSizeKb,
    quality: +optimalQuality.toFixed(2),
    iterations,
    width: sourceCanvas.width,
    height: sourceCanvas.height,
    status,
  };
}
