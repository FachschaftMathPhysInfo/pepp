// Calculations taken from https://www.w3.org/TR/WCAG20/
type RGB = {
  r: number;
  g: number;
  b: number;
};

export const calculateFontColor = (backgroundColor: string): string => {
  const rgb = hexToSRGB(backgroundColor);

  const bgLuminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  const whiteLuminance = calculateLuminance(255, 255, 255);
  const blackLuminance = calculateLuminance(0, 0, 0);

  const whiteContrast = calculateContrastRatio(bgLuminance, whiteLuminance);
  const blackContrast = calculateContrastRatio(bgLuminance, blackLuminance);

  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

const hexToSRGB = (hex: string): RGB => {
  hex = hex.slice(1);

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

const calculateLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const calculateContrastRatio = (lum1: number, lum2: number): number => {
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};