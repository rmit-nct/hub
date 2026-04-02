'use client';

import { Button } from '@ncthub/ui/button';
import { Checkbox } from '@ncthub/ui/checkbox';
import { Dropzone, DropzoneEmptyState } from '@ncthub/ui/dropzone';
import { Label } from '@ncthub/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ncthub/ui/select';
import { Slider } from '@ncthub/ui/slider';
import { motion } from 'framer-motion';
import QRCodeStyling, { type TypeNumber } from 'qr-code-styling';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NeoGeneratorHero from './hero';
import '@/style/animations.css';
import '@/style/qr-generator.css';

// Type definitions
interface QRTypeTab {
  value: QrType;
  label: string;
  description: string;
}

type QrType =
  | 'url'
  | 'wifi'
  | 'email'
  | 'sms'
  | 'vcard'
  | 'facebook'
  | 'appstores'
  | 'images';
type QrDownloadFormat = 'png' | 'jpeg' | 'svg' | 'eps';
type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';
type QrDotShape = 'square' | 'rounded' | 'dots';

function triggerDownload(blobOrUrl: Blob | string, fileName: string) {
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

function getExt(fileName: string) {
  const idx = fileName.lastIndexOf('.');
  return idx === -1 ? '' : fileName.slice(idx + 1).toLowerCase();
}

function buildWifiPayload({
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

function buildEmailPayload({
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

function buildSmsPayload({
  number,
  message,
}: {
  number: string;
  message: string;
}) {
  return `SMSTO:${number.trim()}:${encodeURIComponent(message)}`;
}

function buildVCardPayload({
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

function buildAppStorePayload({
  platform,
  iosUrl,
  androidUrl,
}: {
  platform: 'ios' | 'android';
  iosUrl: string;
  androidUrl: string;
}) {
  return platform === 'ios' ? iosUrl.trim() : androidUrl.trim();
}

// Validate and sanitize dot types to prevent qr-code-styling crashes
function sanitizeDotType(type: unknown): string {
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

function dotStyle(dotShape: QrDotShape) {
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
function buildQrOptions({
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
    bgColor && typeof bgColor === 'string' ? bgColor : '#ffffff';

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
    !options.dotsOptions ||
    !options.dotsOptions.type ||
    !options.cornersSquareOptions ||
    !options.cornersSquareOptions.type ||
    !options.cornersDotOptions ||
    !options.cornersDotOptions.type ||
    !options.backgroundOptions ||
    !options.backgroundOptions.color
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
        color: '#ffffff',
      },
    } as any;
  }

  return options;
}

export default function NeoQrGeneratorPage() {
  // Initialize colors from CSS variables (theme-aware)
  const getInitialFgColor = () => {
    if (typeof window === 'undefined') return '#000000';
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Primary foreground for light mode (dark text), theme-inverted for dark mode
    return isDark ? '#ffffff' : '#000000';
  };

  const getInitialBgColor = () => {
    if (typeof window === 'undefined') return '#ffffff';
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Light background for light mode, dark background for dark mode
    return isDark ? '#1e293b' : '#ffffff';
  };

  const [qrType, setQrType] = useState<QrType>('url');
  const [qrValue, setQrValue] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DEBOUNCE: Prevent rapid successive updates during theme transitions
  const qrUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL-like inputs
  const [urlInput, setUrlInput] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [appPlatform, setAppPlatform] = useState<'ios' | 'android'>('ios');
  const [iosStoreUrl, setIosStoreUrl] = useState('');
  const [androidStoreUrl, setAndroidStoreUrl] = useState('');

  // Structured inputs
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<
    'WPA' | 'WEP' | 'nopass' | 'WPA2' | 'NONE'
  >('WPA2');
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  const [vFirstName, setVFirstName] = useState('');
  const [vLastName, setVLastName] = useState('');
  const [vOrg, setVOrg] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vTel, setVTel] = useState('');
  const [vEmail, setVEmail] = useState('');

  // File-based inputs
  const [fileObjectUrl, setFileObjectUrl] = useState<string>('');

  // Customize options - Theme-aware colors from CSS variables
  const [bgColor, setBgColor] = useState(getInitialBgColor());
  const [fgColor, setFgColor] = useState(getInitialFgColor());
  const [qrSize, setQrSize] = useState(260);
  const [previewQrSize, setPreviewQrSize] = useState(260);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>('H');
  const [quietZone, setQuietZone] = useState(true);

  const [dotShape, setDotShape] = useState<QrDotShape>('rounded');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoSize, setLogoSize] = useState(58); // Fixed 48px

  // Export options
  const [downloadFormat, setDownloadFormat] = useState<QrDownloadFormat>('png');
  const [downloadName, setDownloadName] = useState('qrcode');

  // Preview / render
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const prevQrTypeRef = useRef<QrType>(qrType);
  const prevQrContainerElRef = useRef<HTMLDivElement | null>(null);

  const isValidHttpUrl = (value: string) => {
    const v = value.trim();
    if (!v) return true;
    try {
      const url = new URL(v);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const urlInputValid = isValidHttpUrl(urlInput);
  const facebookUrlValid = isValidHttpUrl(facebookUrl);

  // Slider drag behavior: slider and label update in real-time, QR image/background frozen
  const handleQrSizeSliderStart = useCallback(() => {
    setIsDraggingSlider(true);
    setPreviewQrSize(qrSize);
  }, [qrSize]);

  const handleQrSizeSliderChange = useCallback(
    (v: number[]) => {
      // Update preview slider value in real-time
      setPreviewQrSize(v[0] ?? qrSize);
    },
    [qrSize]
  );

  const handleQrSizeSliderEnd = useCallback(() => {
    // Apply final size to QR
    setQrSize(previewQrSize);
    setIsDraggingSlider(false);
  }, [previewQrSize]);

  const handleQrSizeSliderPointerDown = useCallback(() => {
    handleQrSizeSliderStart();
  }, [handleQrSizeSliderStart]);

  const handleQrSizeSliderPointerUp = useCallback(() => {
    handleQrSizeSliderEnd();
  }, [handleQrSizeSliderEnd]);

  const qrPayload = useMemo(() => {
    switch (qrType) {
      case 'url':
        return urlInput.trim();
      case 'facebook':
        return facebookUrl.trim();
      case 'appstores':
        return buildAppStorePayload({
          platform: appPlatform,
          iosUrl: iosStoreUrl,
          androidUrl: androidStoreUrl,
        });
      case 'wifi':
        return buildWifiPayload({
          ssid: wifiSsid,
          password: wifiPassword,
          security: wifiSecurity,
          hidden: wifiHidden,
        });
      case 'email':
        return buildEmailPayload({
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
        });
      case 'sms':
        return buildSmsPayload({ number: smsNumber, message: smsMessage });
      case 'vcard':
        return buildVCardPayload({
          firstName: vFirstName,
          lastName: vLastName,
          org: vOrg,
          title: vTitle,
          tel: vTel,
          email: vEmail,
        });
      default:
        return '';
    }
  }, [
    emailBody,
    emailSubject,
    emailTo,
    facebookUrl,
    appPlatform,
    androidStoreUrl,
    iosStoreUrl,
    qrType,
    smsMessage,
    smsNumber,
    urlInput,
    wifiHidden,
    wifiPassword,
    wifiSecurity,
    wifiSsid,
    vEmail,
    vFirstName,
    vLastName,
    vOrg,
    vTel,
    vTitle,
  ]);

  // Normalize QR value into a single source of truth.
  useEffect(() => {
    setQrValue(qrPayload);
  }, [qrPayload]);

  // Extract the actual QR update logic into a separate function for clarity
  // Declare this BEFORE the useEffect that uses it
  const performQrUpdate = useCallback(() => {
    if (!qrContainerRef.current) return;

    const currentContainer = qrContainerRef.current;

    // Validate required data before creating/updating QR
    if (!qrValue.trim()) {
      // Clear container if no value
      if (qrRef.current) {
        currentContainer.innerHTML = '';
      }
      return;
    }

    const dot = dotStyle(dotShape);
    const margin = quietZone ? 3 : 0;
    // Always use qrSize for rendering - frozen during slider dragging
    const displaySize = qrSize;

    // Defensive: Ensure dot style returns expected shape
    if (!dot || !dot.shape || !dot.dots) {
      console.warn('Invalid dot style configuration');
      return;
    }

    // Build COMPLETE and VALID options using helper function
    const options = buildQrOptions({
      qrValue,
      displaySize,
      dotConfig: dot,
      fgColor,
      bgColor,
      margin,
      errorLevel,
    });

    // Determine if we need to recreate (only on qrType or container change)
    const needsRecreate =
      !qrRef.current ||
      prevQrTypeRef.current !== qrType ||
      prevQrContainerElRef.current !== currentContainer;

    try {
      if (needsRecreate) {
        // Clean up old instance
        if (qrRef.current && currentContainer) {
          currentContainer.innerHTML = '';
        }

        // Create new instance with validated options
        qrRef.current = new QRCodeStyling(options);
        qrRef.current.append(currentContainer);

        prevQrTypeRef.current = qrType;
        prevQrContainerElRef.current = currentContainer;
      } else {
        // BULLETPROOF: Validate all critical fields before update
        if (!qrRef.current) {
          console.warn('[QR WARN] qrRef.current is null, cannot update');
          return;
        }

        if (!options) {
          console.warn('[QR WARN] options object is null, cannot update');
          return;
        }

        // BULLETPROOF: Validate nested options object structure with comprehensive checks
        const hasValidDotsOptions =
          options.dotsOptions &&
          typeof options.dotsOptions === 'object' &&
          'type' in options.dotsOptions &&
          'color' in options.dotsOptions &&
          typeof options.dotsOptions.type === 'string' &&
          typeof options.dotsOptions.color === 'string';

        const hasValidCornersSquare =
          options.cornersSquareOptions &&
          typeof options.cornersSquareOptions === 'object' &&
          'type' in options.cornersSquareOptions &&
          'color' in options.cornersSquareOptions &&
          typeof options.cornersSquareOptions.type === 'string' &&
          typeof options.cornersSquareOptions.color === 'string';

        const hasValidCornersDot =
          options.cornersDotOptions &&
          typeof options.cornersDotOptions === 'object' &&
          'type' in options.cornersDotOptions &&
          'color' in options.cornersDotOptions &&
          typeof options.cornersDotOptions.type === 'string' &&
          typeof options.cornersDotOptions.color === 'string';

        const hasValidBackground =
          options.backgroundOptions &&
          typeof options.backgroundOptions === 'object' &&
          'color' in options.backgroundOptions &&
          typeof options.backgroundOptions.color === 'string';

        const hasValidQrOptions =
          options.qrOptions &&
          typeof options.qrOptions === 'object' &&
          'errorCorrectionLevel' in options.qrOptions;

        if (
          !hasValidDotsOptions ||
          !hasValidCornersSquare ||
          !hasValidCornersDot ||
          !hasValidBackground ||
          !hasValidQrOptions
        ) {
          console.warn(
            '[QR WARN] Options structure validation failed, recreating instead:',
            {
              hasValidDotsOptions,
              hasValidCornersSquare,
              hasValidCornersDot,
              hasValidBackground,
              hasValidQrOptions,
            }
          );
          // Fallback: Recreate the QR code instead of updating
          if (currentContainer) {
            currentContainer.innerHTML = '';
          }
          qrRef.current = new QRCodeStyling(options);
          qrRef.current.append(currentContainer);
          return;
        }

        // BULLETPROOF: All guards passed, safe to update
        // Wrap update in defensive try-catch to handle any library edge cases
        try {
          qrRef.current.update(options);
        } catch (updateError) {
          console.warn(
            '[QR WARN] Update failed, attempting recreation:',
            updateError
          );
          // If update fails, recreate the QR code
          if (currentContainer) {
            currentContainer.innerHTML = '';
          }
          qrRef.current = new QRCodeStyling(options);
          qrRef.current.append(currentContainer);
        }
      }
    } catch (error) {
      console.error('Failed to create/update QR code:', error, {
        options,
        hasQrRef: !!qrRef.current,
      });
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    }
  }, [
    bgColor,
    dotShape,
    errorLevel,
    fgColor,
    qrType,
    quietZone,
    qrValue,
    qrSize,
  ]);

  // DEBOUNCED: Main QR update effect with protection against rapid theme transitions
  useEffect(() => {
    // Clear any pending update from previous render
    if (qrUpdateTimeoutRef.current) {
      clearTimeout(qrUpdateTimeoutRef.current);
    }

    // DEBOUNCE: Delay update to prevent crashes during theme transitions
    // This allows multiple rapid state changes to batch together
    qrUpdateTimeoutRef.current = setTimeout(() => {
      performQrUpdate();
    }, 50); // 50ms debounce - short enough for responsiveness, long enough to batch updates

    return () => {
      if (qrUpdateTimeoutRef.current) {
        clearTimeout(qrUpdateTimeoutRef.current);
      }
    };
  }, [performQrUpdate]);

  const resetFormForType = useCallback(() => {
    setUrlInput('');
    setFacebookUrl('');
    setWifiSsid('');
    setWifiPassword('');
    setWifiSecurity('WPA2');
    setWifiHidden(false);
    setEmailTo('');
    setEmailSubject('');
    setEmailBody('');
    setSmsNumber('');
    setSmsMessage('');
    setVFirstName('');
    setVLastName('');
    setVOrg('');
    setVTitle('');
    setVTel('');
    setVEmail('');
    setFileObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  }, []);

  const handleTypeChange = useCallback(
    (type: QrType) => {
      setQrType(type);
      resetFormForType();
    },
    [resetFormForType]
  );

  const copyQRCode = useCallback(async () => {
    if (!qrValue.trim()) return;
    await navigator.clipboard.writeText(qrValue);
  }, [qrValue]);

  const handleCopy = async () => {
    await copyQRCode();
    if (!qrValue.trim()) return;

    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (qrUpdateTimeoutRef.current) clearTimeout(qrUpdateTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    };
  }, [fileObjectUrl]);

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 2MB file size limit for the logo
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit. Please upload a smaller image.');
      return;
    }

    const ext = getExt(file.name);
    const ok = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
    if (!ok) {
      setLogoDataUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        // UPDATED: Explicitly typed Image creation
        const img = document.createElement('img') as HTMLImageElement;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setLogoDataUrl(result);
            return;
          }

          // Safe resolution for QR code logos to keep file sizes very small
          const targetSize = 256;
          canvas.width = targetSize;
          canvas.height = targetSize;

          // Center crop the original image to a perfect square
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;

          ctx.drawImage(
            img,
            startX,
            startY,
            size,
            size,
            0,
            0,
            targetSize,
            targetSize
          );
          setLogoDataUrl(canvas.toDataURL('image/png'));
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const qrCanDownload = qrValue.trim().length > 0;

  const download = useCallback(async () => {
    if (!qrRef.current || !qrCanDownload) return;

    if (!logoDataUrl) {
      if (downloadFormat === 'eps') {
        const svgBlob = await qrRef.current.getRawData('svg');
        if (!svgBlob) return;
        triggerDownload(svgBlob as Blob, `${downloadName}.eps`);
        return;
      }

      await qrRef.current.download({
        extension:
          downloadFormat === 'jpeg'
            ? 'jpeg'
            : downloadFormat === 'svg'
              ? 'svg'
              : downloadFormat,
        name: downloadName,
      });
      return;
    }

    // Merge QR code and logo for raster downloads
    if (downloadFormat === 'png' || downloadFormat === 'jpeg') {
      const qrBlob = await qrRef.current.getRawData('png');
      if (!qrBlob) return;
      const qrUrl = URL.createObjectURL(qrBlob as Blob);

      // UPDATED: Explicitly typed Image creation
      const qrImg = document.createElement('img') as HTMLImageElement;
      const logoImg = document.createElement('img') as HTMLImageElement;

      await Promise.all([
        new Promise((res) => {
          qrImg.onload = res;
          qrImg.src = qrUrl;
        }),
        new Promise((res) => {
          logoImg.onload = res;
          logoImg.src = logoDataUrl;
        }),
      ]);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(qrUrl);
        return;
      }

      // Logo positioned at center (fixed 48px)
      const logoWidth = 48;
      const logoHeight = 48;
      const logoX = (qrSize - logoWidth) / 2;
      const logoY = (qrSize - logoHeight) / 2;

      canvas.width = qrSize;
      canvas.height = qrSize;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);

      // Draw Logo with white border for visibility
      ctx.fillStyle = bgColor;
      ctx.fillRect(logoX - 4, logoY - 4, logoWidth + 8, logoHeight + 8);
      ctx.fillStyle = 'white';
      ctx.fillRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4);
      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, `${downloadName}.${downloadFormat}`);
        URL.revokeObjectURL(qrUrl);
      }, `image/${downloadFormat}`);
      return;
    }

    // Merge QR code and logo for vector downloads
    if (downloadFormat === 'svg' || downloadFormat === 'eps') {
      const svgBlob = await qrRef.current.getRawData('svg');
      if (!svgBlob) return;
      const svgText = await (svgBlob as Blob).text();

      // Logo positioned at center (fixed 48px)
      const logoWidth = 48;
      const logoHeight = 48;
      const logoX = (qrSize - logoWidth) / 2;
      const logoY = (qrSize - logoHeight) / 2;

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      svgElement.setAttribute('viewBox', `0 0 ${qrSize} ${qrSize}`);
      svgElement.setAttribute('height', `${qrSize}`);
      svgElement.setAttribute('width', `${qrSize}`);

      // Add white border behind logo for visibility
      const borderRect = svgDoc.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      borderRect.setAttribute('x', `${logoX - 3}`);
      borderRect.setAttribute('y', `${logoY - 3}`);
      borderRect.setAttribute('width', `${logoWidth + 6}`);
      borderRect.setAttribute('height', `${logoHeight + 6}`);
      borderRect.setAttribute('fill', 'white');
      borderRect.setAttribute('rx', '4');
      svgElement.appendChild(borderRect);

      const imageElement = svgDoc.createElementNS(
        'http://www.w3.org/2000/svg',
        'image'
      );
      imageElement.setAttribute('href', logoDataUrl);
      imageElement.setAttribute('x', `${logoX}`);
      imageElement.setAttribute('y', `${logoY}`);
      imageElement.setAttribute('width', `${logoWidth}`);
      imageElement.setAttribute('height', `${logoHeight}`);
      imageElement.setAttribute('rx', '2');
      svgElement.appendChild(imageElement);

      const serializer = new XMLSerializer();
      const finalSvgText = serializer.serializeToString(svgDoc);
      const finalBlob = new Blob([finalSvgText], { type: 'image/svg+xml' });

      triggerDownload(
        finalBlob,
        `${downloadName}.${downloadFormat === 'eps' ? 'eps' : 'svg'}`
      );
    }
  }, [
    bgColor,
    downloadFormat,
    downloadName,
    logoDataUrl,
    qrCanDownload,
    qrSize,
  ]);

  const qrTypeTabs: QRTypeTab[] = [
    {
      value: 'url',
      label: 'URL',
      description: 'Redirect to an existing web URL',
    },
    {
      value: 'email',
      label: 'Email',
      description: 'Pre-filled email composer',
    },
    {
      value: 'sms',
      label: 'SMS',
      description: 'Pre-filled text message',
    },
    {
      value: 'wifi',
      label: 'WiFi',
      description: 'Share WiFi credentials',
    },
    {
      value: 'vcard',
      label: 'Contact',
      description: 'Digital business card',
    },
    {
      value: 'facebook',
      label: 'App',
      description: 'Link to app profile',
    },
  ];

  const currentTabInfo = qrTypeTabs.find((t) => t.value === qrType);

  return (
    <div className="min-h-screen">
      <NeoGeneratorHero />

      <div className="mx-auto max-w-6xl px-4 py-16 pb-0 sm:px-6 lg:px-8">
        {/* Unified Main Container - All sections merged */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col lg:flex-row lg:gap-0">
            {/* Left Column: Input Section */}
            <div className="flex-1 border-slate-200 border-b p-6 sm:p-8 lg:border-r lg:border-b-0 lg:pr-8 dark:border-slate-700">
              {/* Navbar - Type Switcher */}
              <div className="mb-8">
                <div className="relative flex flex-wrap justify-center gap-1.5 overflow-x-auto rounded-full border border-slate-200 bg-slate-100 p-2 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
                  {qrTypeTabs.map((tab) => {
                    const isActive = tab.value === qrType;
                    return (
                      <motion.button
                        type="button"
                        key={tab.value}
                        onClick={() => handleTypeChange(tab.value)}
                        whileHover={
                          !isActive
                            ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                            : {}
                        }
                        whileTap={{ scale: 0.95 }}
                        className={`relative shrink-0 overflow-hidden whitespace-nowrap rounded-full px-4 py-2.5 font-medium text-sm transition-all duration-300 ${
                          isActive
                            ? 'scale-100 text-white'
                            : 'text-slate-700 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:text-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      >
                        {isActive ? (
                          <motion.div
                            layoutId="activeTabPill"
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 35,
                            }}
                            className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 shadow-blue-500/50 shadow-lg"
                          />
                        ) : null}
                        <span className="hidden text-center sm:inline">
                          {tab.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Description & Inputs - Merged without card styling */}
              <div className="mb-8 space-y-6">
                {/* Description */}
                <div className="border-slate-200 border-b pb-6 dark:border-slate-700">
                  <h3 className="text-center font-semibold text-lg text-slate-900 dark:text-white">
                    {currentTabInfo?.description ||
                      'Redirect to an existing web URL'}
                  </h3>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  {/* URL Input */}
                  {qrType === 'url' ? (
                    <motion.div
                      key="url-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-3"
                    >
                      <input
                        id="url-input"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="Enter URL"
                        className={`w-full rounded-lg border bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition-colors focus:outline-none ${
                          urlInput.trim() && !urlInputValid
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                            : 'border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                      <p className="text-foreground text-xs">
                        Try something like https://example.com/
                      </p>
                    </motion.div>
                  ) : null}

                  {/* Facebook URL Input */}
                  {qrType === 'facebook' ? (
                    <motion.div
                      key="facebook-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-3"
                    >
                      <input
                        id="facebook-url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="https://facebook.com/..."
                        className={`w-full rounded-lg border bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition-colors focus:outline-none ${
                          facebookUrl.trim() && !facebookUrlValid
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                            : 'border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                    </motion.div>
                  ) : null}

                  {/* App Stores Selection */}
                  {qrType === 'appstores' ? (
                    <motion.div
                      key="appstores-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Platform</Label>
                          <Select
                            value={appPlatform}
                            onValueChange={(v) =>
                              setAppPlatform(v as 'ios' | 'android')
                            }
                          >
                            <SelectTrigger className="rounded-lg border-slate-600 bg-slate-700/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-slate-600 bg-slate-800 text-white">
                              <SelectItem value="ios">iOS</SelectItem>
                              <SelectItem value="android">Android</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Store URL</Label>
                          <input
                            id="store-url"
                            value={
                              appPlatform === 'ios'
                                ? iosStoreUrl
                                : androidStoreUrl
                            }
                            onChange={(e) => {
                              if (appPlatform === 'ios')
                                setIosStoreUrl(e.target.value);
                              else setAndroidStoreUrl(e.target.value);
                            }}
                            onFocus={(e) => e.currentTarget.select()}
                            placeholder="Paste URL"
                            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {/* WiFi Configuration */}
                  {qrType === 'wifi' ? (
                    <motion.div
                      key="wifi-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Network name (SSID)
                        </Label>
                        <input
                          id="wifi-ssid"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="My_WiFi"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Password</Label>
                        <input
                          id="wifi-password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="••••••••"
                          disabled={
                            wifiSecurity === 'nopass' || wifiSecurity === 'NONE'
                          }
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Security</Label>
                          <Select
                            value={wifiSecurity}
                            onValueChange={(v) =>
                              setWifiSecurity(
                                v as 'WPA' | 'WEP' | 'nopass' | 'WPA2' | 'NONE'
                              )
                            }
                          >
                            <SelectTrigger className="rounded-lg border-slate-600 bg-slate-700/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-slate-600 bg-slate-800 text-white">
                              <SelectItem value="WPA2">WPA2</SelectItem>
                              <SelectItem value="WPA">WPA</SelectItem>
                              <SelectItem value="WEP">WEP</SelectItem>
                              <SelectItem value="nopass">
                                No password
                              </SelectItem>
                              <SelectItem value="NONE">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                          <Checkbox
                            id="wifi-hidden"
                            checked={wifiHidden}
                            onCheckedChange={(c) => setWifiHidden(c === true)}
                          />
                          <Label
                            htmlFor="wifi-hidden"
                            className="cursor-pointer text-slate-300"
                          >
                            Hidden
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {/* Email Configuration */}
                  {qrType === 'email' ? (
                    <motion.div
                      key="email-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-slate-300">To</Label>
                        <input
                          id="email-to"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="someone@example.com"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Subject</Label>
                        <input
                          id="email-subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Optional"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Body</Label>
                        <textarea
                          id="email-body"
                          rows={3}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          placeholder="Write a message..."
                        />
                      </div>
                    </motion.div>
                  ) : null}

                  {/* SMS Configuration */}
                  {qrType === 'sms' ? (
                    <motion.div
                      key="sms-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-slate-300">Number</Label>
                        <input
                          id="sms-number"
                          value={smsNumber}
                          onChange={(e) => setSmsNumber(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="+1 555 123 456"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Message</Label>
                        <textarea
                          id="sms-message"
                          rows={3}
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          placeholder="Your message..."
                        />
                      </div>
                    </motion.div>
                  ) : null}

                  {/* vCard Configuration */}
                  {qrType === 'vcard' ? (
                    <motion.div
                      key="vcard-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="space-y-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="v-first" className="text-slate-300">
                            First name
                          </Label>
                          {/* UPDATED: Added placeholder for Contact tab */}
                          <input
                            id="v-first"
                            value={vFirstName}
                            onChange={(e) => setVFirstName(e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            placeholder="Enter full name"
                            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="v-last" className="text-slate-300">
                            Last name
                          </Label>
                          {/* UPDATED: Added placeholder for Contact tab */}
                          <input
                            id="v-last"
                            value={vLastName}
                            onChange={(e) => setVLastName(e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            placeholder="Enter last name"
                            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="v-org" className="text-slate-300">
                          Organization
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-org"
                          value={vOrg}
                          onChange={(e) => setVOrg(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter company name"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="v-title" className="text-slate-300">
                          Title
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-title"
                          value={vTitle}
                          onChange={(e) => setVTitle(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter job title"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="v-tel" className="text-slate-300">
                          Phone
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-tel"
                          value={vTel}
                          onChange={(e) => setVTel(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter phone number"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="v-email" className="text-slate-300">
                          Email
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-email"
                          value={vEmail}
                          onChange={(e) => setVEmail(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter email address"
                          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              </div>

              {/* Customize Options - Merged without separate card */}
              <div className="space-y-4 border-slate-200 border-t pt-6 dark:border-slate-700">
                <h4 className="font-semibold text-base text-slate-900 dark:text-white">
                  QR Customization
                </h4>

                {/* Inline Color Pickers with HEX Input */}
                <div className="space-y-4">
                  {/* Foreground Color Picker */}
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-700 dark:text-slate-300">
                      Foreground Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-12 w-14 cursor-pointer rounded-lg border border-slate-300 transition-all hover:shadow-md dark:border-slate-600"
                        title="Foreground color picker"
                      />
                      <input
                        type="text"
                        value={fgColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (/^#[0-9A-F]{6}$/.test(val)) {
                            setFgColor(val);
                          }
                        }}
                        placeholder="#000000"
                        maxLength={7}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-900 text-sm placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Background Color Picker */}
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-700 dark:text-slate-300">
                      Background Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-12 w-14 cursor-pointer rounded-lg border border-slate-300 transition-all hover:shadow-md dark:border-slate-600"
                        title="Background color picker"
                      />
                      <input
                        type="text"
                        value={bgColor.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (/^#[0-9A-F]{6}$/.test(val)) {
                            setBgColor(val);
                          }
                        }}
                        placeholder="#FFFFFF"
                        maxLength={7}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-900 text-sm placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* QR Size Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-slate-700 dark:text-slate-300">
                      QR Size
                    </Label>
                    <span className="font-semibold text-blue-600 text-sm dark:text-blue-400">
                      {isDraggingSlider ? previewQrSize : qrSize}px
                    </span>
                  </div>
                  <div
                    className="space-y-1"
                    onPointerDown={handleQrSizeSliderPointerDown}
                    onPointerUp={handleQrSizeSliderPointerUp}
                    onPointerLeave={
                      isDraggingSlider ? handleQrSizeSliderPointerUp : undefined
                    }
                  >
                    <Slider
                      min={180}
                      max={420}
                      step={10}
                      value={[isDraggingSlider ? previewQrSize : qrSize]}
                      onValueChange={handleQrSizeSliderChange}
                      className="py-1"
                    />
                    {isDraggingSlider && (
                      <p className="text-right font-medium text-blue-500 text-xs dark:text-blue-400">
                        Release to apply
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Correction */}
                <div className="space-y-2">
                  <Label className="font-medium text-slate-700 dark:text-slate-300">
                    Error Correction
                  </Label>
                  <Select
                    value={errorLevel}
                    onValueChange={(v) => setErrorLevel(v as QrErrorLevel)}
                  >
                    <SelectTrigger className="rounded-lg border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
                      <SelectItem value="L">Low (~7%)</SelectItem>
                      <SelectItem value="M">Medium (~15%)</SelectItem>
                      <SelectItem value="Q">Quartile (~25%)</SelectItem>
                      <SelectItem value="H">High (~30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quiet Zone */}
                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    id="quiet-zone"
                    checked={quietZone}
                    onCheckedChange={(c) => setQuietZone(c === true)}
                  />
                  <Label
                    htmlFor="quiet-zone"
                    className="cursor-pointer font-medium text-slate-700 dark:text-slate-300"
                  >
                    Quiet zone (recommended)
                  </Label>
                </div>
              </div>
            </div>

            {/* Right Column: QR Preview and Actions */}
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8 lg:pl-8">
              <div className="pt-2">
                <h3 className="text-center font-semibold text-lg text-slate-900 tracking-wide dark:text-white">
                  Live Preview
                </h3>
              </div>

              {/* QR Code Preview with Fade-in Animation */}
              <div className="flex flex-col items-center justify-center gap-6 border-slate-200 border-t px-8 py-10 dark:border-slate-700">
                {qrValue.trim() ? (
                  <div
                    key={`qr-${qrType}-${qrValue.slice(0, 40)}`}
                    className="qr-container flex animate-fadeIn flex-col items-center justify-center gap-6 rounded-xl p-6 transition-all duration-300 ease-in-out"
                  >
                    {/* Logo positioned at center */}
                    <div className="relative inline-block">
                      <div
                        className="transition-all duration-300 ease-in-out"
                        style={{
                          width: qrSize,
                          height: qrSize,
                        }}
                      >
                        <div ref={qrContainerRef} />
                      </div>
                      {logoDataUrl && (
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: logoSize,
                            height: logoSize,
                          }}
                        >
                          <div
                            style={{
                              height: logoSize,
                              width: logoSize,
                              backgroundImage: `url('${logoDataUrl}')`,
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                            }}
                            className="rounded-md border-2 border-white shadow-lg dark:border-slate-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="qr-container flex min-h-75 w-full items-center justify-center rounded-xl border-2 border-slate-300 border-dashed text-center transition-all duration-300 dark:border-slate-700">
                    <div className="space-y-3 px-6">
                      <p className="font-semibold text-lg text-slate-600 dark:text-slate-400">
                        No QR Code yet
                      </p>
                      <p className="text-slate-500 text-sm dark:text-slate-500">
                        Enter details on the left to generate a QR code
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Merged into flow */}
              <div className="flex flex-wrap items-center justify-center gap-3 border-slate-200 border-t pt-6 dark:border-slate-700">
                <Button
                  type="button"
                  onClick={download}
                  disabled={!qrCanDownload}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-blue-600 disabled:hover:shadow-none dark:hover:shadow-blue-500/50"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <title>Download</title>
                      <path
                        d="M12 3v10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 11l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 20h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Download
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!qrCanDownload || copied}
                  className="rounded-lg border border-slate-300 bg-white text-slate-900 transition-all duration-200 hover:scale-105 hover:border-blue-500 hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-blue-400 dark:hover:bg-slate-800"
                  onClick={handleCopy}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <title>Copy</title>
                      <path
                        d="M9 9h10v12H9V9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowOptionsModal(true)}
                  variant="outline"
                  className="rounded-lg border border-slate-300 bg-white text-slate-900 transition-all duration-200 hover:scale-105 hover:border-blue-500 hover:bg-slate-50 hover:shadow-md active:scale-95 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-blue-400 dark:hover:bg-slate-800"
                >
                  Options
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options Modal */}
      {showOptionsModal && (
        <OptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          dotShape={dotShape}
          setDotShape={setDotShape}
          downloadName={downloadName}
          setDownloadName={setDownloadName}
          downloadFormat={downloadFormat}
          setDownloadFormat={setDownloadFormat}
          logoDataUrl={logoDataUrl}
          setLogoDataUrl={setLogoDataUrl}
          logoSize={logoSize}
          setLogoSize={setLogoSize}
          onDropLogo={onDropLogo}
        />
      )}
    </div>
  );
}

// Options Modal Component
interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dotShape: QrDotShape;
  setDotShape: (shape: QrDotShape) => void;
  downloadName: string;
  setDownloadName: (name: string) => void;
  downloadFormat: QrDownloadFormat;
  setDownloadFormat: (format: QrDownloadFormat) => void;
  logoDataUrl: string;
  setLogoDataUrl: (url: string) => void;
  logoSize: number;
  setLogoSize: (size: number) => void;
  onDropLogo: (files: File[]) => void;
}

function OptionsModal({
  isOpen,
  onClose,
  dotShape,
  setDotShape,
  downloadName,
  setDownloadName,
  downloadFormat,
  setDownloadFormat,
  logoDataUrl,
  setLogoDataUrl,
  logoSize,
  setLogoSize,
  onDropLogo,
}: OptionsModalProps) {
  const initialStateRef = useRef<{
    dotShape: QrDotShape;
    downloadName: string;
    downloadFormat: QrDownloadFormat;
    logoDataUrl: string;
    logoSize: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initialStateRef.current = null;
      return;
    }

    if (initialStateRef.current === null) {
      initialStateRef.current = {
        dotShape,
        downloadName,
        downloadFormat,
        logoDataUrl,
        logoSize,
      };
    }
  }, [dotShape, downloadFormat, downloadName, isOpen, logoDataUrl, logoSize]);

  if (!isOpen) return null;

  const handleCancel = () => {
    const initial = initialStateRef.current;
    if (initial) {
      setDotShape(initial.dotShape);
      setDownloadName(initial.downloadName);
      setDownloadFormat(initial.downloadFormat);
      setLogoDataUrl(initial.logoDataUrl);
      setLogoSize(initial.logoSize);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md animate-slideUp overflow-y-auto rounded-xl border border-slate-300 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
            More Options
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-all duration-200 hover:scale-110 hover:text-slate-900 active:scale-95 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-medium text-slate-700 dark:text-slate-300">
              Dot shape
            </Label>
            <Select
              value={dotShape}
              onValueChange={(v) => setDotShape(v as QrDotShape)}
            >
              <SelectTrigger className="rounded-lg border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logo upload section */}
          <div className="space-y-3 border-slate-200 border-t pt-4 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 text-sm dark:text-white">
                Logo
              </p>
            </div>

            {!logoDataUrl ? (
              <Dropzone
                onDrop={onDropLogo}
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                }}
                maxFiles={1}
                className="border-slate-300 bg-slate-50 text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                <DropzoneEmptyState />
              </Dropzone>
            ) : null}

            {logoDataUrl ? (
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 text-xs dark:text-slate-300">
                  Logo uploaded
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoDataUrl('')}
                  className="border-slate-300 bg-white text-slate-900 transition-all duration-200 hover:scale-105 hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Remove
                </Button>
              </div>
            ) : null}
          </div>

          {/* Download options */}
          <div className="space-y-3 border-slate-200 border-t pt-4 dark:border-slate-700">
            <div className="space-y-2">
              <Label className="font-medium text-slate-700 dark:text-slate-300">
                File name
              </Label>
              <input
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value || 'qrcode')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 text-sm placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-slate-700 dark:text-slate-300">
                Download format
              </Label>
              <Select
                value={downloadFormat}
                onValueChange={(v) => setDownloadFormat(v as QrDownloadFormat)}
              >
                <SelectTrigger className="rounded-lg border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
                  <SelectItem value="png">PNG (screen)</SelectItem>
                  <SelectItem value="jpeg">JPG (screen)</SelectItem>
                  <SelectItem value="svg">SVG (print quality)</SelectItem>
                  <SelectItem value="eps">EPS (SVG fallback)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 active:scale-95"
          >
            Done
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-900 transition-all duration-200 hover:scale-105 hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
