/**
 * Generates sample candidate photo & signature data URLs using HTML5 Canvas
 * so users can test immediately without searching for files on their device.
 */

export function generateSampleCandidatePhoto(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 450;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Plain light grey / white background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 450, 600);

  // 2. Body / Formal Shirt
  ctx.fillStyle = '#1e3a8a'; // Navy Blue formal shirt
  ctx.beginPath();
  ctx.moveTo(70, 600);
  ctx.bezierCurveTo(90, 420, 160, 380, 225, 380);
  ctx.bezierCurveTo(290, 380, 360, 420, 380, 600);
  ctx.closePath();
  ctx.fill();

  // Shirt Collar & Tie
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(180, 380);
  ctx.lineTo(225, 460);
  ctx.lineTo(270, 380);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#dc2626'; // Red tie
  ctx.beginPath();
  ctx.moveTo(215, 450);
  ctx.lineTo(235, 450);
  ctx.lineTo(240, 580);
  ctx.lineTo(225, 600);
  ctx.lineTo(210, 580);
  ctx.closePath();
  ctx.fill();

  // 3. Neck
  ctx.fillStyle = '#e2a37e';
  ctx.fillRect(195, 320, 60, 80);

  // 4. Face Oval
  ctx.fillStyle = '#f0b793';
  ctx.beginPath();
  ctx.ellipse(225, 230, 85, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Ears
  ctx.fillStyle = '#e2a37e';
  ctx.beginPath();
  ctx.ellipse(140, 230, 12, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(310, 230, 12, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // 6. Hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(225, 155, 90, 60, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // 7. Eyes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(190, 220, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(260, 220, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(175, 205);
  ctx.lineTo(205, 205);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(245, 205);
  ctx.lineTo(275, 205);
  ctx.stroke();

  // Nose
  ctx.beginPath();
  ctx.moveTo(225, 220);
  ctx.lineTo(220, 255);
  ctx.lineTo(230, 255);
  ctx.stroke();

  // Smile
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(225, 275, 22, 0.1 * Math.PI, 0.9 * Math.PI, false);
  ctx.stroke();

  // Sample watermark label
  ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('[SarkariPixel Demo Model]', 225, 40);

  return canvas.toDataURL('image/jpeg', 0.95);
}

export function generateSampleSignature(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Pure white paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 600, 240);

  // Black ink signature in smooth bezier curves
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // "R"
  ctx.moveTo(90, 160);
  ctx.lineTo(95, 70);
  ctx.bezierCurveTo(140, 60, 150, 110, 100, 115);
  ctx.lineTo(135, 160);

  // "a-h-u-l"
  ctx.moveTo(135, 160);
  ctx.bezierCurveTo(145, 140, 155, 130, 165, 145);
  ctx.bezierCurveTo(175, 160, 185, 130, 195, 145);
  ctx.bezierCurveTo(205, 160, 215, 100, 225, 150);
  ctx.bezierCurveTo(235, 160, 245, 130, 255, 150);
  ctx.lineTo(270, 150);

  // "S-h-a-r-m-a"
  ctx.moveTo(300, 150);
  ctx.bezierCurveTo(280, 120, 340, 80, 310, 60);
  ctx.bezierCurveTo(290, 80, 350, 140, 340, 160);
  ctx.bezierCurveTo(350, 130, 360, 155, 370, 150);
  ctx.bezierCurveTo(380, 135, 390, 150, 400, 145);
  ctx.bezierCurveTo(415, 120, 430, 160, 445, 145);
  ctx.bezierCurveTo(455, 130, 470, 160, 485, 150);

  // Underline flourish
  ctx.moveTo(85, 175);
  ctx.bezierCurveTo(250, 170, 420, 165, 510, 170);
  ctx.moveTo(460, 190);
  ctx.arc(460, 190, 2.5, 0, Math.PI * 2);
  ctx.moveTo(480, 190);
  ctx.arc(480, 190, 2.5, 0, Math.PI * 2);

  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.95);
}

export function generateSampleThumb(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 300, 300);

  ctx.strokeStyle = '#1e3a8a'; // Blue ink
  ctx.lineWidth = 1.8;

  // Concentric fingerprint whorls
  for (let r = 10; r < 100; r += 7) {
    ctx.beginPath();
    ctx.ellipse(150, 150, r * 0.7, r * 1.1, 0.1, 0, Math.PI * 1.85);
    ctx.stroke();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
