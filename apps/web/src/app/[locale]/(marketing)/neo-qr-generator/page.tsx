'use client';

import { Button } from '@ncthub/ui/button';
import { Checkbox } from '@ncthub/ui/checkbox';
import { Dropzone, DropzoneEmptyState } from '@ncthub/ui/dropzone';
import { Label } from '@ncthub/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@ncthub/ui/popover';
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ColorPicker } from 'react-color-pikr';
import NeoGeneratorHero from './hero';

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
//Email validator
function isEmailValid(email: string) {
  if (!email.trim()) return true;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}
function isUrlValid(url: string) {
  if (!url.trim()) return true;
  const urlRegex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
  return urlRegex.test(url);
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
        color: '#000000',
      },
    } as any;
  }

  return options;
}

export default function NeoQrGeneratorPage() {
  // Initialize colors with safe defaults to avoid hydration mismatch
  // Use a consistent default on both server and client, then update after hydration
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

  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  // Customize options - Use safe default to avoid hydration mismatch
  const [bgColor, setBgColor] = useState('#000000');
  const [fgColor, setFgColor] = useState('#090A0B');
  const [qrSize, setQrSize] = useState(260);
  const [displayScale, setDisplayScale] = useState(1);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>('H');
  const [quietZone, setQuietZone] = useState(true);

  const [dotShape, setDotShape] = useState<QrDotShape>('rounded');
  const [customizationTab, setCustomizationTab] = useState<
    'customization' | 'logo' | 'frame'
  >('customization');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
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

  // Effect to update foreground color after hydration based on actual theme
  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setFgColor(isDark ? '#FAFAFA' : '#090A0B');
  }, []);

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
  const emailToValid = isEmailValid(emailTo);
  const vEmailValid = isEmailValid(vEmail);
  const urlValid = isUrlValid(urlInput);

  let isCurrentInputValid = true;
  if (qrType === 'url') isCurrentInputValid = urlValid;
  else if (qrType === 'facebook') isCurrentInputValid = facebookUrlValid;
  else if (qrType === 'email') isCurrentInputValid = emailToValid;
  else if (qrType === 'vcard') isCurrentInputValid = vEmailValid;

  // Slider drag behavior: smooth visual scaling via transform during drag, then update QR on release
  const handleQrSizeSliderStart = useCallback(() => {
    setIsDraggingSlider(true);
    setDisplayScale(1); // Reset scale at start
  }, []);

  const handleQrSizeSliderChange = useCallback(
    (v: number[]) => {
      // Calculate smooth scale factor for live visual feedback during drag
      const newSize = v[0] ?? qrSize;
      const scale = newSize / qrSize;
      setDisplayScale(scale);
    },
    [qrSize]
  );

  const handleQrSizeSliderEnd = useCallback((finalSize: number) => {
    // Apply final size to QR and update rendering
    setQrSize(finalSize);
    setDisplayScale(1); // Reset scale after updating actual size
    setIsDraggingSlider(false);
  }, []);

  const handleQrSizeSliderPointerDown = useCallback(() => {
    handleQrSizeSliderStart();
  }, [handleQrSizeSliderStart]);

  const handleQrSizeSliderPointerUp = useCallback(
    (finalSize: number) => {
      handleQrSizeSliderEnd(finalSize);
    },
    [handleQrSizeSliderEnd]
  );

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
    setIsGenerated(false);
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

    // If logo exists, merge QR and logo before copying (same as download)
    if (logoDataUrl) {
      try {
        if (!qrRef.current) return;

        const qrBlob = await qrRef.current.getRawData('png');
        if (!qrBlob) return;
        const qrUrl = URL.createObjectURL(qrBlob as Blob);

        // Create and load images
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

        // Convert canvas to blob and copy to clipboard
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
            } catch (error) {
              console.warn('Failed to copy QR with logo to clipboard:', error);
            }
          }
          URL.revokeObjectURL(qrUrl);
        }, 'image/png');

        return;
      } catch (error) {
        console.warn('Failed to copy QR with logo, falling back:', error);
      }
    }

    // If no logo, try to copy just the QR image as PNG
    try {
      if (qrRef.current) {
        const pngBlob = (await qrRef.current.getRawData('png')) as Blob | null;
        if (pngBlob) {
          const item = new ClipboardItem({ 'image/png': pngBlob });
          await navigator.clipboard.write([item]);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to copy QR image, falling back to text:', error);
    }

    // Final fallback: copy text
    try {
      await navigator.clipboard.writeText(qrValue);
    } catch (textError) {
      console.warn('Failed to copy QR value:', textError);
    }
  }, [qrValue, logoDataUrl, qrSize, bgColor]);

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

  const qrCanDownload = qrValue.trim().length > 0 && isGenerated;

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
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400 ${
                          urlInput.trim() && !urlInputValid
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500'
                        }`}
                      />
                      {urlInput.trim() && !urlValid && (
                        <p className="text-red-500 text-sm dark:text-red-400">
                          Please enter correct format URL
                        </p>
                      )}
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
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400 ${
                          facebookUrl.trim() && !facebookUrlValid
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500'
                        }`}
                      />
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
                        <Label className="text-slate-700 dark:text-slate-300">
                          Network name (SSID)
                        </Label>
                        <input
                          id="wifi-ssid"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="My_WiFi"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Password
                        </Label>
                        <input
                          id="wifi-password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="••••••••"
                          disabled={
                            wifiSecurity === 'nopass' || wifiSecurity === 'NONE'
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">
                            Security
                          </Label>
                          <Select
                            value={wifiSecurity}
                            onValueChange={(v) =>
                              setWifiSecurity(
                                v as 'WPA' | 'WEP' | 'nopass' | 'WPA2' | 'NONE'
                              )
                            }
                          >
                            <SelectTrigger className="rounded-lg border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
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
                            className="cursor-pointer text-slate-700 dark:text-slate-300"
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
                        <Label className="text-slate-700 dark:text-slate-300">
                          To
                        </Label>
                        <input
                          id="email-to"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="someone@example.com"
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400 ${
                            emailTo.trim() && !emailToValid
                              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500'
                          }`}
                        />

                        {emailTo.trim() && !emailToValid && (
                          <p className="text-red-500 text-sm dark:text-red-400">
                            Please enter a valid email address.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Subject
                        </Label>
                        <input
                          id="email-subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Optional"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Body
                        </Label>
                        <textarea
                          id="email-body"
                          rows={3}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
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
                        <Label className="text-slate-700 dark:text-slate-300">
                          Number
                        </Label>
                        <input
                          id="sms-number"
                          value={smsNumber}
                          onChange={(e) => setSmsNumber(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="+1 555 123 456"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Message
                        </Label>
                        <textarea
                          id="sms-message"
                          rows={3}
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
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
                          <Label
                            htmlFor="v-first"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            First name
                          </Label>
                          {/* UPDATED: Added placeholder for Contact tab */}
                          <input
                            id="v-first"
                            value={vFirstName}
                            onChange={(e) => setVFirstName(e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            placeholder="Enter full name"
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="v-last"
                            className="text-slate-700 dark:text-slate-300"
                          >
                            Last name
                          </Label>
                          {/* UPDATED: Added placeholder for Contact tab */}
                          <input
                            id="v-last"
                            value={vLastName}
                            onChange={(e) => setVLastName(e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            placeholder="Enter last name"
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="v-org"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Organization
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-org"
                          value={vOrg}
                          onChange={(e) => setVOrg(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter company name"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="v-title"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Title
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-title"
                          value={vTitle}
                          onChange={(e) => setVTitle(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter job title"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="v-tel"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Phone
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-tel"
                          value={vTel}
                          onChange={(e) => setVTel(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter phone number"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="v-email"
                          className="text-slate-700 dark:text-slate-300"
                        >
                          Email
                        </Label>
                        {/* UPDATED: Added placeholder for Contact tab */}
                        <input
                          id="v-email"
                          value={vEmail}
                          onChange={(e) => setVEmail(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          placeholder="Enter email address"
                          className={`w-full rounded-lg border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-700/50 dark:text-white dark:placeholder-slate-400 ${
                            vEmail.trim() && !vEmailValid
                              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500'
                          }`}
                        />
                        {vEmail.trim() && !vEmailValid && (
                          <p className="text-red-500 text-sm dark:text-red-400">
                            Please enter a valid email address.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              </div>

              {/* Customize Options - Tabbed Interface */}
              <div
                className="space-y-4 border-t pt-6"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Tab Navigation */}
                <div
                  className="flex gap-2 rounded-lg border p-1"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--secondary)',
                  }}
                >
                  {(['customization', 'logo', 'frame'] as const).map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setCustomizationTab(tab)}
                      className="flex-1 rounded-md px-3 py-2 font-medium text-sm transition-all duration-200"
                      style={{
                        backgroundColor:
                          customizationTab === tab
                            ? 'var(--card)'
                            : 'transparent',
                        color:
                          customizationTab === tab
                            ? 'var(--primary)'
                            : 'var(--muted-foreground)',
                        boxShadow:
                          customizationTab === tab
                            ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                            : 'none',
                      }}
                    >
                      {tab === 'customization'
                        ? 'Customization'
                        : tab === 'logo'
                          ? 'Logo'
                          : 'Frame'}
                    </button>
                  ))}
                </div>

                {/* Customization Tab - 3 Rows Structure */}
                {customizationTab === 'customization' && (
                  <div className="space-y-4">
                    {/* Row 1: Foreground + Background Color Pickers */}
                    <div className="flex flex-col gap-5">
                      {/* Foreground Color Picker */}
                      <div className="space-y-2">
                        <Label className="font-medium text-foreground">
                          QR Color
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start rounded-lg border bg-card text-left font-normal text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <div
                                className="mr-3 h-5 w-5 rounded-sm border shadow-sm"
                                suppressHydrationWarning
                                style={{
                                  backgroundColor: fgColor,
                                }}
                              />
                              <span suppressHydrationWarning>
                                {typeof fgColor === 'string'
                                  ? fgColor.toUpperCase()
                                  : fgColor}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto border-border bg-card p-2 shadow-xl"
                            align="start"
                          >
                            <div className="[&>div]:!w-full [&>div]:!min-w-0 [&>div]:!bg-transparent [&>div]:!shadow-none [&_*]:!border-border [&_*]:!text-foreground [&_input]:!bg-background [&_input]:!text-foreground [&_button]:!text-black [&_span]:!text-black w-full overflow-hidden">
                              <ColorPicker
                                value={fgColor}
                                onChange={(c: any) => setFgColor(c.hex || c)}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Background Color Picker */}
                      <div className="space-y-2">
                        <Label className="font-medium text-foreground">
                          Background Color
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start rounded-lg border bg-card text-left font-normal text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <div
                                className="mr-3 h-5 w-5 rounded-sm border shadow-sm"
                                suppressHydrationWarning
                                style={{
                                  backgroundColor: bgColor,
                                }}
                              />
                              <span suppressHydrationWarning>
                                {typeof bgColor === 'string'
                                  ? bgColor.toUpperCase()
                                  : bgColor}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto border-border bg-card p-2 shadow-xl"
                            align="start"
                          >
                            <div className="[&>div]:!w-full [&>div]:!min-w-0 [&>div]:!bg-transparent [&>div]:!shadow-none [&_*]:!border-border [&_*]:!text-foreground [&_input]:!bg-background [&_input]:!text-foreground [&_button]:!text-black [&_span]:!text-black w-full overflow-hidden">
                              <ColorPicker
                                value={bgColor}
                                onChange={(c: any) => setBgColor(c.hex || c)}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Row 2: Error Correction (Full Width) */}
                    <div className="space-y-2">
                      <Label
                        className="font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Error Correction
                      </Label>
                      <Select
                        value={errorLevel}
                        onValueChange={(v) => setErrorLevel(v as QrErrorLevel)}
                      >
                        <SelectTrigger
                          className="rounded-lg"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <SelectItem value="L">Low (~7%)</SelectItem>
                          <SelectItem value="M">Medium (~15%)</SelectItem>
                          <SelectItem value="Q">Quartile (~25%)</SelectItem>
                          <SelectItem value="H">High (~30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Row 3: QR Size Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          className="font-medium"
                          style={{ color: 'var(--foreground)' }}
                        >
                          QR Size
                        </Label>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: 'var(--primary)' }}
                        >
                          {isDraggingSlider
                            ? Math.round(qrSize * displayScale)
                            : qrSize}
                          px
                        </span>
                      </div>
                      <div
                        className="space-y-1"
                        onPointerDown={handleQrSizeSliderPointerDown}
                        onPointerUp={(e) => {
                          // Calculate final size based on slider position
                          const sliderElement = e.currentTarget;
                          const rect = sliderElement.getBoundingClientRect();
                          const percent = Math.max(
                            0,
                            Math.min(1, (e.clientX - rect.left) / rect.width)
                          );
                          const finalSize = Math.round(
                            180 + (360 - 180) * percent
                          );
                          handleQrSizeSliderPointerUp(finalSize);
                        }}
                        onPointerLeave={() => {
                          if (isDraggingSlider) {
                            // If pointer leaves without releasing properly, apply current scale
                            const finalSize = Math.round(qrSize * displayScale);
                            handleQrSizeSliderPointerUp(finalSize);
                          }
                        }}
                      >
                        <Slider
                          min={180}
                          max={360}
                          step={10}
                          value={[
                            Math.round(
                              qrSize * (isDraggingSlider ? displayScale : 1)
                            ),
                          ]}
                          onValueChange={handleQrSizeSliderChange}
                          className="py-1"
                        />
                        {isDraggingSlider && (
                          <p
                            className="text-right font-medium text-xs"
                            style={{ color: 'var(--primary)' }}
                          >
                            Release to apply
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quiet Zone Checkbox */}
                    <div className="flex items-center gap-3 pt-1">
                      <Checkbox
                        id="quiet-zone"
                        checked={quietZone}
                        onCheckedChange={(c) => setQuietZone(c === true)}
                      />
                      <Label
                        htmlFor="quiet-zone"
                        className="cursor-pointer font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Quiet zone (recommended)
                      </Label>
                    </div>
                  </div>
                )}

                {/* Logo Tab - File Upload Dropzone */}
                {customizationTab === 'logo' && (
                  <div className="space-y-4">
                    <div
                      className="group relative cursor-pointer space-y-4 rounded-lg border-2 border-dashed p-6 text-center transition-all hover:border-opacity-80"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--secondary)',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = Array.from(e.dataTransfer.files);
                        onDropLogo(files);
                      }}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                        multiple={false}
                        onChange={(e) => {
                          const files = Array.from(e.currentTarget.files || []);
                          if (files.length > 0) {
                            onDropLogo(files);
                          }
                        }}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        title="Drag and drop logo or click to select"
                      />
                      <div>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="mx-auto mb-2 opacity-60 transition-opacity group-hover:opacity-100"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <title>Upload</title>
                          <path
                            d="M13 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18 3v5m2-2l-2-2m-2 2l2-2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Drag logo here or click to select
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          PNG, JPG, or WebP (max 2MB)
                        </p>
                      </div>
                    </div>
                    {logoDataUrl && (
                      <div className="space-y-2">
                        <p
                          className="font-medium text-sm"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Logo Preview:
                        </p>
                        <div className="flex items-center justify-center">
                          <div
                            className="max-h-20 w-20 rounded-lg border"
                            style={{
                              borderColor: 'var(--border)',
                              backgroundImage: `url('${logoDataUrl}')`,
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setLogoDataUrl('')}
                          className="w-full rounded-lg px-3 py-2 font-medium text-sm transition-all duration-200 hover:opacity-80"
                          style={{
                            color: 'var(--foreground)',
                            backgroundColor: 'var(--card)',
                            border: '1px solid',
                            borderColor: 'var(--border)',
                          }}
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Frame Tab */}
                {customizationTab === 'frame' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label
                        className="font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Dot Shape
                      </Label>
                      <Select
                        value={dotShape}
                        onValueChange={(v) => setDotShape(v as QrDotShape)}
                      >
                        <SelectTrigger
                          className="rounded-lg"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                          }}
                        >
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="dots">Dots</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: QR Preview and Actions */}
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8 lg:pl-8">
              <div className="pt-2">
                <h3 className="text-center font-semibold text-lg text-slate-900 tracking-wide dark:text-white">
                  Live Preview
                </h3>
              </div>

              {/* QR Code Preview with Fade-in Animation - Fixed Height Container */}
              <div
                className="flex flex-col items-center justify-center gap-6 border-slate-200 border-t px-6 py-4 dark:border-slate-700"
                style={{ minHeight: '420px', overflow: 'hidden' }}
              >
                {qrValue.trim() ? (
                  <div
                    key={`qr-${qrType}-${qrValue.slice(0, 40)}`}
                    className="qr-container flex animate-fadeIn flex-col items-center justify-center gap-4 rounded-xl p-4"
                  >
                    {/* Unified wrapper: scales both QR image and background container together */}
                    <div
                      className={`relative inline-flex items-center justify-center transition-all duration-500 will-change-transform ${
                        !isGenerated
                          ? 'pointer-events-none select-none opacity-40 blur-md grayscale-[50%]'
                          : ''
                      }`}
                      style={{
                        width: qrSize,
                        height: qrSize,
                        transform: `scale(${displayScale})`,
                        transformOrigin: 'center center',
                        transition: isDraggingSlider
                          ? 'none'
                          : 'transform 0.2s ease-out, filter 0.5s, opacity 0.5s',
                      }}
                    >
                      {/* QR Code container */}
                      <div
                        ref={qrContainerRef}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />

                      {/* Logo overlay - positioned at center and scales with container */}
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
              {!isGenerated && (
                <Button
                  type="button"
                  onClick={() => setIsGenerated(true)}
                  disabled={!qrValue.trim() || !isCurrentInputValid}
                  className="z-10 -mt-4 mb-2 rounded-full px-6 py-6 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  Generate QR Code
                </Button>
              )}

              {/* Divider - Fixed and stable */}
              <div
                className="border-t"
                style={{ borderColor: 'var(--border)', height: '1px' }}
              />

              {/* Action Buttons - Download and Copy Only */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <Button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  disabled={!qrCanDownload}
                  className="rounded-lg px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
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
                  className="rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          downloadName={downloadName}
          setDownloadName={setDownloadName}
          downloadFormat={downloadFormat}
          setDownloadFormat={setDownloadFormat}
          onDownload={download}
        />
      )}

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

// Download Modal Component
interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadName: string;
  setDownloadName: (name: string) => void;
  downloadFormat: QrDownloadFormat;
  setDownloadFormat: (format: QrDownloadFormat) => void;
  onDownload: () => Promise<void>;
}

function DownloadModal({
  isOpen,
  onClose,
  downloadName,
  setDownloadName,
  downloadFormat,
  setDownloadFormat,
  onDownload,
}: DownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
      onClose();
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl border p-6 shadow-lg"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="mb-4 font-semibold text-lg"
          style={{ color: 'var(--foreground)' }}
        >
          Download QR Code
        </h2>

        <div className="space-y-4">
          {/* File Name Input */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              style={{ color: 'var(--foreground)' }}
            >
              File Name
            </label>
            <input
              type="text"
              value={downloadName}
              onChange={(e) => setDownloadName(e.target.value || 'qrcode')}
              placeholder="qrcode"
              className="w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              style={{ color: 'var(--foreground)' }}
            >
              Format
            </label>
            <Select
              value={downloadFormat}
              onValueChange={(v) => setDownloadFormat(v as QrDownloadFormat)}
            >
              <SelectTrigger
                className="rounded-lg"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                }}
              >
                <SelectItem value="png">PNG (Screen)</SelectItem>
                <SelectItem value="jpeg">JPG (Screen)</SelectItem>
                <SelectItem value="svg">SVG (Print Quality)</SelectItem>
                <SelectItem value="eps">EPS (SVG Fallback)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 rounded-lg px-4 py-2 font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-lg border px-4 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
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
