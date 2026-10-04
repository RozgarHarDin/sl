/**
 * File sanitation, naming, and safety utilities
 */

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 60);
}

export function generateCompliantFileName(
  candidateName: string,
  presetName: string,
  type: string,
  extension: string = 'jpg'
): string {
  const cleanName = candidateName ? sanitizeFileName(candidateName) : 'Candidate';
  const cleanPreset = sanitizeFileName(presetName);
  const cleanType = sanitizeFileName(type);
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${cleanName}_${cleanPreset}_${cleanType}_${dateStamp}.${extension}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1000) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB max
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'File exceeds 25 MB. Please select a smaller original image.'
    };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
    return {
      valid: false,
      error: 'Unsupported format. Please select a valid JPG, PNG, or WEBP image.'
    };
  }

  return { valid: true };
}

export function triggerDownload(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
