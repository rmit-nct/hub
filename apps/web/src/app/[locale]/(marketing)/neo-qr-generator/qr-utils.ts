import type { TypeNumber } from 'qr-code-styling';

// Type definitions
export interface QRTypeTab {
  value: QrType;
  label: string;
  description: string;
}

export type QrType =
  | 'url'
  | 'wifi'
  | 'email'
  | 'sms'
  | 'vcard'
  | 'facebook'
  | 'appstores'
  | 'images';
export type QrDownloadFormat = 'png' | 'jpeg' | 'svg' | 'eps';
export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';
export type QrDotShape = 'square' | 'rounded' | 'dots';

//QR code frame selection
export type FrameStyle = 'none' | 'minimal' | 'rounded' | 'banner' | 'polaroid';
export interface QRconfig {
  value: string;
  frame: FrameStyle;
  color: string;
}

export function triggerDownload(blobOrUrl: Blob | string, fileName: string) {
  const url =
    typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export function getExt(fileName: string) {
  const idx = fileName.lastIndexOf('.');
  return idx === -1 ? '' : fileName.slice(idx + 1).toLowerCase();
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

//Email validator
export function isEmailValid(email: string) {
  if (!email.trim()) return true;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}
export function isUrlValid(url: string) {
  if (!url.trim()) return true;
  const urlRegex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
  return urlRegex.test(url);
}
export function buildWifiPayload({
  ssid,
  password,
  security,
  hidden,
}: {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass' | 'WPA2' | 'NONE';
  hidden: boolean;
}) {
  const ssidEscaped = ssid.replace(/;/g, ':');
  const passwordEscaped = password.replace(/;/g, ':');
  const wifiType =
    security === 'NONE'
      ? 'nopass'
      : security === 'nopass'
        ? 'nopass'
        : security;
  const parts = [
    `T:${wifiType}`,
    `S:${ssidEscaped}`,
    security === 'nopass' || security === 'NONE'
      ? `P:`
      : `P:${passwordEscaped}`,
    `H:${hidden ? 'true' : 'false'}`,
  ];
  return `WIFI:${parts.join(';')};;`;
}

export function buildEmailPayload({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const params = new URLSearchParams();
  if (subject.trim()) params.set('subject', subject);
  if (body.trim()) params.set('body', body);
  const query = params.toString();
  return `mailto:${to.trim()}${query ? `?${query}` : ''}`;
}

export function buildSmsPayload({
  number,
  message,
}: {
  number: string;
  message: string;
}) {
  return `SMSTO:${number.trim()}:${encodeURIComponent(message)}`;
}

export function buildVCardPayload({
  firstName,
  lastName,
  org,
  title,
  tel,
  email,
}: {
  firstName: string;
  lastName: string;
  org: string;
  title: string;
  tel: string;
  email: string;
}) {
  const fullName = `${firstName} ${lastName}`.trim();
  const first = lastName ? firstName : firstName;
  const last = lastName ? lastName : lastName;
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${last};${first};;;`,
    `FN:${fullName || `${firstName || ''} ${lastName || ''}`.trim()}`,
    org.trim() ? `ORG:${org.trim()}` : '',
    title.trim() ? `TITLE:${title.trim()}` : '',
    tel.trim() ? `TEL:${tel.trim()}` : '',
    email.trim() ? `EMAIL:${email.trim()}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');
}

// Validate and sanitize dot types to prevent qr-code-styling crashes
export function sanitizeDotType(type: unknown): string {
  const validTypes = [
    'square',
    'dots',
    'rounded',
    'extra-rounded',
    'classy',
    'classy-rounded',
  ];
  if (typeof type === 'string' && validTypes.includes(type)) {
    return type;
  }
  return 'square'; // Safe fallback
}

export function dotStyle(dotShape: QrDotShape) {
  switch (dotShape) {
    case 'rounded':
      return {
        shape: 'square' as const,
        dots: 'rounded' as const,
        cornerSquare: 'extra-rounded' as const,
        cornerDot: 'dots' as const,
      };
    case 'dots':
      return {
        shape: 'square' as const,
        dots: 'dots' as const,
        cornerSquare: 'dots' as const,
        cornerDot: 'dots' as const,
      };
    default:
      return {
        shape: 'square' as const,
        dots: 'square' as const,
        cornerSquare: 'square' as const,
        cornerDot: 'square' as const,
      };
  }
}

// Build COMPLETE and VALID QR options object - BULLETPROOF VERSION
// This prevents partial update crashes from undefined fields
export function buildQrOptions({
  qrValue,
  displaySize,
  dotConfig,
  fgColor,
  bgColor,
  margin,
  errorLevel,
}: {
  qrValue: string;
  displaySize: number;
  dotConfig: ReturnType<typeof dotStyle>;
  fgColor: string;
  bgColor: string;
  margin: number;
  errorLevel: QrErrorLevel;
}) {
  // BULLETPROOF: Enforce minimum size of 180px
  const safeSize = Math.max(180, Math.ceil(displaySize));

  // BULLETPROOF: Default values for all colors
  const safeFgColor =
    fgColor && typeof fgColor === 'string' ? fgColor : '#000000';
  const safeBgColor =
    bgColor && typeof bgColor === 'string' ? bgColor : '#000000';

  // BULLETPROOF: Sanitize all dot types - always have fallback
  const safeDotType = sanitizeDotType(dotConfig?.dots) || 'square';
  const safeCornerSquareType =
    sanitizeDotType(dotConfig?.cornerSquare) || 'square';
  const safeCornerDotType = sanitizeDotType(dotConfig?.cornerDot) || 'square';

  // BULLETPROOF: Ensure shape exists
  const safeShape = dotConfig?.shape || 'square';

  // BULLETPROOF: Validate qrValue
  const safeData =
    qrValue && qrValue.trim().length > 0 ? qrValue : 'https://example.com';

  // BULLETPROOF: Validate margin
  const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0;

  // Build options with ALL fields explicitly set
  const options = {
    type: 'svg' as const,
    shape: safeShape,
    width: safeSize,
    height: safeSize,
    margin: safeMargin,
    data: safeData,
    qrOptions: {
      typeNumber: 0 as unknown as TypeNumber | undefined,
      errorCorrectionLevel: errorLevel || 'H',
    },
    dotsOptions: {
      type: safeDotType,
      color: safeFgColor,
      roundSize: false,
    },
    cornersSquareOptions: {
      type: safeCornerSquareType,
      color: safeFgColor,
    },
    cornersDotOptions: {
      type: safeCornerDotType,
      color: safeFgColor,
    },
    backgroundOptions: {
      round: 0,
      color: safeBgColor,
    },
  } as any;

  // BULLETPROOF: Validate complete object before returning
  if (
    !options.dotsOptions?.type ||
    !options.cornersSquareOptions?.type ||
    !options.cornersDotOptions?.type ||
    !options.backgroundOptions?.color
  ) {
    console.warn(
      '[QR WARN] Options object has missing fields, using safe defaults'
    );
    // Return absolute fallback
    return {
      type: 'svg' as const,
      shape: 'square',
      width: 260,
      height: 260,
      margin: 0,
      data: 'https://example.com',
      qrOptions: {
        typeNumber: 0 as unknown as TypeNumber | undefined,
        errorCorrectionLevel: 'H',
      },
      dotsOptions: {
        type: 'square',
        color: '#000000',
        roundSize: false,
      },
      cornersSquareOptions: {
        type: 'square',
        color: '#000000',
      },
      cornersDotOptions: {
        type: 'square',
        color: '#000000',
      },
      backgroundOptions: {
        round: 0,
        color: '#000000',
      },
    } as any;
  }

  return options;
}
