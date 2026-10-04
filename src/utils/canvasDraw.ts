export interface CropArea {
  x: number; // percentage (0 to 100) or normalized
  y: number;
  width: number;
  height: number;
  zoom: number;
  rotation: number; // in degrees: 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface OverlayOptions {
  enabled: boolean;
  name: string;
  date: string; // DD-MM-YYYY
  nameLabel?: string;
  dateLabel?: string;
  fontSizeMultiplier?: number;
  bandHeightPercent?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface RenderCanvasOptions {
  image: HTMLImageElement;
  targetWidth: number;
  targetHeight: number;
  cropArea: CropArea;
  overlay: OverlayOptions;
  maintainAspectRatio?: boolean;
  enableSharpening?: boolean;
  sharpenAmount?: number; // 0 to 1, default 0.25
  onProgress?: (percent: number) => void;
}

/**
 * Stepped multi-pass downsampling to prevent aliasing and blur
 * Halves dimensions repeatedly until within 2x of target, then performs final resize.
 */
function steppedDownscale(
  source: CanvasImageSource,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  let curW = sourceW;
  let curH = sourceH;

  // If already close or smaller, simple high-quality draw
  if (curW <= targetW * 2 && curH <= targetH * 2) {
    const out = document.createElement('canvas');
    out.width = targetW;
    out.height = targetH;
    const ctx = out.getContext('2d', { alpha: false, desynchronized: true }) || out.getContext('2d');
    if (!ctx) return out;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, targetW, targetH);
    return out;
  }

  // Stepped half-size passes
  let currentCanvas = document.createElement('canvas');
  currentCanvas.width = curW;
  currentCanvas.height = curH;
  let currentCtx = currentCanvas.getContext('2d', { alpha: false }) || currentCanvas.getContext('2d');
  if (currentCtx) {
    currentCtx.imageSmoothingEnabled = true;
    currentCtx.imageSmoothingQuality = 'high';
    currentCtx.drawImage(source, 0, 0, curW, curH);
  }

  while (curW > targetW * 2 || curH > targetH * 2) {
    const nextW = Math.max(targetW, Math.floor(curW / 2));
    const nextH = Math.max(targetH, Math.floor(curH / 2));

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d', { alpha: false }) || nextCanvas.getContext('2d');
    if (nextCtx) {
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);
    }

    currentCanvas = nextCanvas;
    curW = nextW;
    curH = nextH;
  }

  // Final resize to exact target
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d', { alpha: false, desynchronized: true }) || finalCanvas.getContext('2d');
  if (finalCtx) {
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);
  }

  return finalCanvas;
}

/**
 * Applies a 3x3 mild unsharp mask convolution filter to enhance edge clarity
 * for faces, text, and signatures without introducing digital noise.
 */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number = 0.25
): void {
  if (amount <= 0) return;
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const output = ctx.createImageData(width, height);
    const outData = output.data;

    // Kernel:
    // [  0,  -a,   0 ]
    // [ -a, 1+4a, -a ]
    // [  0,  -a,   0 ]
    const a = amount;
    const center = 1 + 4 * a;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        // Skip borders
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          outData[i] = data[i];
          outData[i + 1] = data[i + 1];
          outData[i + 2] = data[i + 2];
          outData[i + 3] = data[i + 3];
          continue;
        }

        const up = ((y - 1) * width + x) * 4;
        const down = ((y + 1) * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            data[i + c] * center -
            (data[up + c] + data[down + c] + data[left + c] + data[right + c]) * a;
          outData[i + c] = Math.min(255, Math.max(0, val));
        }
        outData[i + 3] = data[i + 3]; // Preserve alpha
      }
    }

    ctx.putImageData(output, 0, 0);
  } catch (err) {
    // Cross-origin fallback safety
    console.warn('Canvas pixel manipulation skipped:', err);
  }
}

/**
 * Draws image onto target sized canvas with crisp multi-step downscaling,
 * interactive transformations, DOP footer, and subtle unsharp sharpening.
 */
export function renderProcessedCanvas(options: RenderCanvasOptions): HTMLCanvasElement {
  const {
    image,
    targetWidth,
    targetHeight,
    cropArea,
    overlay,
    enableSharpening = true,
    sharpenAmount = 0.22,
    onProgress,
  } = options;

  onProgress?.(20);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  // Use optimal context attributes for maximum performance & color fidelity
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) || canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas 2D context');

  // Fill with pure white background first
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Configure high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Calculate photo region vs overlay footer region
  const footerHeight = overlay.enabled
    ? Math.round(targetHeight * ((overlay.bandHeightPercent || 18) / 100))
    : 0;
  const photoHeight = targetHeight - footerHeight;

  onProgress?.(40);

  // Render transformed photo
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, targetWidth, photoHeight);
  ctx.clip();

  const centerX = targetWidth / 2;
  const centerY = photoHeight / 2;
  ctx.translate(centerX, centerY);

  // Rotation
  if (cropArea.rotation) {
    ctx.rotate((cropArea.rotation * Math.PI) / 180);
  }

  // Horizontal & Vertical Flips
  ctx.scale(cropArea.flipH ? -1 : 1, cropArea.flipV ? -1 : 1);

  // Aspect & zoom calculations
  const zoom = Math.max(0.2, cropArea.zoom || 1.0);
  const imgAspect = image.width / image.height;
  const targetAspect = targetWidth / photoHeight;

  let drawW = targetWidth;
  let drawH = photoHeight;

  if (imgAspect > targetAspect) {
    drawH = photoHeight * zoom;
    drawW = drawH * imgAspect;
  } else {
    drawW = targetWidth * zoom;
    drawH = drawW / imgAspect;
  }

  const panX = ((cropArea.x - 50) / 100) * targetWidth;
  const panY = ((cropArea.y - 50) / 100) * photoHeight;

  // Use stepped high-quality downsampling if source image is substantially larger than viewport
  if (image.width > targetWidth * 1.8 || image.height > photoHeight * 1.8) {
    const intermediateCanvas = steppedDownscale(
      image,
      image.width,
      image.height,
      Math.round(drawW),
      Math.round(drawH)
    );
    ctx.drawImage(
      intermediateCanvas,
      -drawW / 2 + panX,
      -drawH / 2 + panY,
      drawW,
      drawH
    );
  } else {
    ctx.drawImage(
      image,
      -drawW / 2 + panX,
      -drawH / 2 + panY,
      drawW,
      drawH
    );
  }

  ctx.restore();

  onProgress?.(65);

  // Apply edge sharpening filter on photo region for crisp facial and stroke clarity
  if (enableSharpening) {
    applyUnsharpMask(ctx, targetWidth, photoHeight, sharpenAmount);
  }

  onProgress?.(80);

  // Draw Date of Photo (DOP) & Name Footer Strip if enabled
  if (overlay.enabled) {
    const footerY = photoHeight;

    // Solid white footer band
    ctx.fillStyle = overlay.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, footerY, targetWidth, footerHeight);

    // High contrast crisp divider line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(targetWidth * 0.003));
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(targetWidth, footerY);
    ctx.stroke();

    // Text configuration
    ctx.fillStyle = overlay.textColor || '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const baseFontSize = Math.max(
      11,
      Math.round(targetWidth * 0.048 * (overlay.fontSizeMultiplier || 1.0))
    );
    ctx.font = `bold ${baseFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;

    const nameText = (overlay.name || 'CANDIDATE NAME').trim().toUpperCase();
    const dateText = (overlay.date || new Date().toISOString().slice(0, 10).split('-').reverse().join('-')).trim();

    const lineSpacing = baseFontSize * 1.15;
    const midY = footerY + footerHeight / 2;

    if (nameText && dateText) {
      const topY = midY - lineSpacing * 0.48;
      const botY = midY + lineSpacing * 0.52;
      ctx.fillText(nameText, targetWidth / 2, topY, targetWidth * 0.94);
      ctx.font = `600 ${Math.round(baseFontSize * 0.92)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
      const dateString = overlay.dateLabel ? `${overlay.dateLabel} ${dateText}` : `DOP: ${dateText}`;
      ctx.fillText(dateString, targetWidth / 2, botY, targetWidth * 0.94);
    } else if (nameText) {
      ctx.fillText(nameText, targetWidth / 2, midY, targetWidth * 0.94);
    } else if (dateText) {
      const dateString = overlay.dateLabel ? `${overlay.dateLabel} ${dateText}` : `DOP: ${dateText}`;
      ctx.fillText(dateString, targetWidth / 2, midY, targetWidth * 0.94);
    }
  }

  // Border if requested
  if (overlay.borderWidth && overlay.borderWidth > 0) {
    ctx.strokeStyle = overlay.borderColor || '#000000';
    ctx.lineWidth = overlay.borderWidth;
    ctx.strokeRect(0, 0, targetWidth, targetHeight);
  }

  onProgress?.(100);
  return canvas;
}

/**
 * Loads an image from a File, Blob, or Data URL with cross-origin safety.
 */
export function loadImageSource(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image file: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
    }
  });
}
