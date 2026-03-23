'use client';

import { Button } from '@ncthub/ui/button';
import { Checkbox } from '@ncthub/ui/checkbox';
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

// Type definitions
interface QRTypeTab {
  value: QrType;
  label: string;
  icon: string;
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
type QrFrameStyle = 'none' | 'neo' | 'gold' | 'soft' | 'dashed';

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

function dotStyle(dotShape: QrDotShape) {
  switch (dotShape) {
    case 'rounded':
      return {
        shape: 'square' as const,
        dots: 'rounded' as const,
        cornerSquare: 'extra-rounded' as const,
        cornerDot: 'dot' as const,
      };
    case 'dots':
      return {
        shape: 'circle' as const,
        dots: 'dots' as const,
        cornerSquare: 'dot' as const,
        cornerDot: 'dot' as const,
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

export default function NeoQrGeneratorPage() {
  const [qrType, setQrType] = useState<QrType>('url');
  const [qrValue, setQrValue] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Customize options
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [qrSize, setQrSize] = useState(260);
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>('H');
  const [quietZone, setQuietZone] = useState(true);

  const [frameStyle, setFrameStyle] = useState<QrFrameStyle>('neo');
  const [dotShape, setDotShape] = useState<QrDotShape>('rounded');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoSize, setLogoSize] = useState(50);
  const [logoMargin, setLogoMargin] = useState(6);

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

  useEffect(() => {
    if (!qrContainerRef.current) return;

    const currentContainer = qrContainerRef.current;
    const dot = dotStyle(dotShape);
    const margin = quietZone ? 12 : 0;

    const options = {
      type: 'svg' as const,
      shape: dot.shape,
      width: qrSize,
      height: qrSize,
      margin,
      data: qrValue || '',
      qrOptions: {
        typeNumber: 0 as unknown as TypeNumber | undefined,
        errorCorrectionLevel: errorLevel,
      },
      imageOptions: {
        saveAsBlob: true,
        hideBackgroundDots: true,
        imageSize: logoDataUrl ? logoSize : 0,
        crossOrigin: 'anonymous',
        margin: logoMargin,
      },
      dotsOptions: {
        type: dot.dots,
        color: fgColor,
        roundSize: false,
      },
      cornersSquareOptions: {
        type: dot.cornerSquare,
        color: fgColor,
      },
      cornersDotOptions: {
        type: dot.cornerDot,
        color: fgColor,
      },
      backgroundOptions: {
        round: 0,
        color: bgColor,
      },
      ...(logoDataUrl ? { image: logoDataUrl } : {}),
    } as any;

    const shouldRecreate =
      !qrRef.current ||
      prevQrTypeRef.current !== qrType ||
      prevQrContainerElRef.current !== currentContainer;

    if (shouldRecreate) {
      qrRef.current = new QRCodeStyling(options);
      qrRef.current.append(currentContainer);
      prevQrTypeRef.current = qrType;
      prevQrContainerElRef.current = currentContainer;
    } else {
      qrRef.current!.update({
        ...options,
        width: qrSize,
        height: qrSize,
      });
    }
  }, [
    bgColor,
    dotShape,
    errorLevel,
    fgColor,
    logoDataUrl,
    logoMargin,
    logoSize,
    qrType,
    quietZone,
    qrValue,
    qrSize,
  ]);

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
      if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    };
  }, [fileObjectUrl]);

  const onLogoUploadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = getExt(file.name);
      const ok = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
      if (!ok) {
        setLogoDataUrl('');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') setLogoDataUrl(result);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const qrCanDownload = qrValue.trim().length > 0;

  const download = useCallback(async () => {
    if (!qrRef.current || !qrCanDownload) return;

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
  }, [downloadFormat, downloadName, qrCanDownload]);

  const handleSave = async () => {
    if (!qrCanDownload) return;
    await download();
    if (!qrRef.current) return;
    setSaved(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const qrTypeTabs: QRTypeTab[] = [
    {
      value: 'url',
      label: 'URL',
      icon: '🔗',
      description: 'Redirect to an existing web URL',
    },
    {
      value: 'email',
      label: 'Email',
      icon: '📧',
      description: 'Pre-filled email composer',
    },
    {
      value: 'sms',
      label: 'SMS',
      icon: '💬',
      description: 'Pre-filled text message',
    },
    {
      value: 'wifi',
      label: 'WiFi',
      icon: '📡',
      description: 'Share WiFi credentials',
    },
    {
      value: 'vcard',
      label: 'Contact',
      icon: '👤',
      description: 'Digital business card',
    },
    {
      value: 'facebook',
      label: 'App',
      icon: '📱',
      description: 'Link to app profile',
    },
  ];

  const currentTabInfo = qrTypeTabs.find((t) => t.value === qrType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <NeoGeneratorHero />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* QR Type Tabs with Sliding Indicator */}
        <div className="relative mb-8 flex flex-wrap justify-center gap-2">
          {qrTypeTabs.map((tab) => {
            const isActive = tab.value === qrType;
            return (
              <button
                type="button"
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className={`relative flex items-center gap-2 overflow-hidden rounded-lg px-3 py-2 font-medium text-sm transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 ${
                  isActive
                    ? 'scale-105 text-white'
                    : 'border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-lg bg-blue-600 shadow-blue-600/30 shadow-lg"
                  />
                ) : null}
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-800/30 p-6 backdrop-blur-sm">
          {/* Section Title */}
          <div className="mb-6">
            <h3 className="text-center font-semibold text-lg text-white">
              {currentTabInfo?.description || 'Redirect to an existing web URL'}
            </h3>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            {/* URL Input */}
            {qrType === 'url' ? (
              <div className="space-y-3">
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
                <p className="text-slate-400 text-xs">
                  Try something like https://example.com/
                </p>
              </div>
            ) : null}

            {/* Facebook URL Input */}
            {qrType === 'facebook' ? (
              <div className="space-y-3">
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
              </div>
            ) : null}

            {/* App Stores Selection */}
            {qrType === 'appstores' ? (
              <div className="space-y-4">
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
                        appPlatform === 'ios' ? iosStoreUrl : androidStoreUrl
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
              </div>
            ) : null}

            {/* WiFi Configuration */}
            {qrType === 'wifi' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Network name (SSID)</Label>
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
                        <SelectItem value="nopass">No password</SelectItem>
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
              </div>
            ) : null}

            {/* Email Configuration */}
            {qrType === 'email' ? (
              <div className="space-y-4">
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
              </div>
            ) : null}

            {/* SMS Configuration */}
            {qrType === 'sms' ? (
              <div className="space-y-4">
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
              </div>
            ) : null}

            {/* vCard Configuration */}
            {qrType === 'vcard' ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="v-first" className="text-slate-300">
                      First name
                    </Label>
                    <input
                      id="v-first"
                      value={vFirstName}
                      onChange={(e) => setVFirstName(e.target.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-last" className="text-slate-300">
                      Last name
                    </Label>
                    <input
                      id="v-last"
                      value={vLastName}
                      onChange={(e) => setVLastName(e.target.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-org" className="text-slate-300">
                    Organization
                  </Label>
                  <input
                    id="v-org"
                    value={vOrg}
                    onChange={(e) => setVOrg(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-title" className="text-slate-300">
                    Title
                  </Label>
                  <input
                    id="v-title"
                    value={vTitle}
                    onChange={(e) => setVTitle(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-tel" className="text-slate-300">
                    Phone
                  </Label>
                  <input
                    id="v-tel"
                    value={vTel}
                    onChange={(e) => setVTel(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v-email" className="text-slate-300">
                    Email
                  </Label>
                  <input
                    id="v-email"
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* QR Code Preview with Fade-in Animation */}
          <div className="mt-8 border-white/10 border-t pt-8">
            <p className="mb-3 text-slate-400 text-sm">Live Preview</p>
            <div className="flex flex-col items-center justify-center">
              {qrValue.trim() ? (
                <div
                  key={`qr-${qrType}-${qrValue.slice(0, 40)}`}
                  className="flex animate-fadeIn items-center justify-center rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl"
                >
                  <div
                    className="transition-all duration-300 ease-in-out"
                    style={{ width: qrSize, height: qrSize }}
                  >
                    <div ref={qrContainerRef} />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] w-full items-center justify-center text-center text-slate-400 text-sm">
                  <div>
                    <p className="font-semibold text-lg text-slate-600">
                      No QR Code yet
                    </p>
                    <p className="mt-2">Enter details above to generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid gap-2 sm:grid-cols-5">
            <Button
              type="button"
              onClick={download}
              disabled={!qrCanDownload}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-blue-600"
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
              className="rounded-lg border border-slate-600 bg-slate-800/50 text-white transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-700 hover:brightness-110 active:scale-95 disabled:opacity-50"
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
                {copied ? '✅ Copied' : 'Copy'}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!qrCanDownload || saved}
              onClick={handleSave}
              className="rounded-lg border border-slate-600 bg-slate-800/50 text-white transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-700 hover:brightness-110 active:scale-95 disabled:opacity-50"
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
                  <title>Save</title>
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 21v-8H7v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 3v5h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                {saved ? '✅ Saved' : 'Save'}
              </span>
            </Button>
            <Button
              type="button"
              onClick={() => setShowCustomizeModal(true)}
              variant="outline"
              className="rounded-lg border border-slate-600 bg-transparent text-white transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-800/50 hover:brightness-110 active:scale-95"
            >
              🎨 Customize
            </Button>
            <Button
              type="button"
              onClick={() => setShowOptionsModal(true)}
              variant="outline"
              className="rounded-lg border border-slate-600 bg-transparent text-white transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-800/50 hover:brightness-110 active:scale-95"
            >
              ⚙️ Options
            </Button>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && (
        <CustomizeModal
          isOpen={showCustomizeModal}
          onClose={() => setShowCustomizeModal(false)}
          bgColor={bgColor}
          setBgColor={setBgColor}
          fgColor={fgColor}
          setFgColor={setFgColor}
          qrSize={qrSize}
          setQrSize={setQrSize}
          errorLevel={errorLevel}
          setErrorLevel={setErrorLevel}
          quietZone={quietZone}
          setQuietZone={setQuietZone}
        />
      )}

      {/* Options Modal */}
      {showOptionsModal && (
        <OptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          frameStyle={frameStyle}
          setFrameStyle={setFrameStyle}
          dotShape={dotShape}
          setDotShape={setDotShape}
          logoDataUrl={logoDataUrl}
          setLogoDataUrl={setLogoDataUrl}
          logoSize={logoSize}
          setLogoSize={setLogoSize}
          logoMargin={logoMargin}
          setLogoMargin={setLogoMargin}
          downloadName={downloadName}
          setDownloadName={setDownloadName}
          downloadFormat={downloadFormat}
          setDownloadFormat={setDownloadFormat}
          onLogoUploadChange={onLogoUploadChange}
        />
      )}
    </div>
  );
}

// Customize Modal Component
interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  fgColor: string;
  setFgColor: (color: string) => void;
  qrSize: number;
  setQrSize: (size: number) => void;
  errorLevel: QrErrorLevel;
  setErrorLevel: (level: QrErrorLevel) => void;
  quietZone: boolean;
  setQuietZone: (enabled: boolean) => void;
}

function CustomizeModal({
  isOpen,
  onClose,
  bgColor,
  setBgColor,
  fgColor,
  setFgColor,
  qrSize,
  setQrSize,
  errorLevel,
  setErrorLevel,
  quietZone,
  setQuietZone,
}: CustomizeModalProps) {
  const initialStateRef = useRef<{
    fgColor: string;
    bgColor: string;
    qrSize: number;
    errorLevel: QrErrorLevel;
    quietZone: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initialStateRef.current = null;
      return;
    }

    // Snapshot once per modal open; keep it stable for Cancel revert.
    if (initialStateRef.current === null) {
      initialStateRef.current = {
        fgColor,
        bgColor,
        qrSize,
        errorLevel,
        quietZone,
      };
    }
  }, [bgColor, errorLevel, fgColor, isOpen, qrSize, quietZone]);

  if (!isOpen) return null;

  const handleCancel = () => {
    const initial = initialStateRef.current;
    if (initial) {
      setFgColor(initial.fgColor);
      setBgColor(initial.bgColor);
      setQrSize(initial.qrSize);
      setErrorLevel(initial.errorLevel);
      setQuietZone(initial.quietZone);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slideUp rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-white">
            🎨 Customize QR Code
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-all duration-200 hover:scale-110 hover:text-white active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-6">
            <div className="space-y-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-600"
              />
              <Label className="text-slate-300">
                <span className="block leading-tight">Foreground</span>
                <span className="block leading-tight">color</span>
              </Label>
            </div>

            <div className="space-y-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-600"
              />
              <Label className="text-slate-300">
                <span className="block leading-tight">Background</span>
                <span className="block leading-tight">color</span>
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">QR size ({qrSize}px)</Label>
            <Slider
              min={180}
              max={420}
              step={10}
              value={[qrSize]}
              onValueChange={(v) => setQrSize(v[0] ?? qrSize)}
              className="py-1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Error correction</Label>
            <Select
              value={errorLevel}
              onValueChange={(v) => setErrorLevel(v as QrErrorLevel)}
            >
              <SelectTrigger className="rounded-lg border-slate-600 bg-slate-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-800 text-white">
                <SelectItem value="L">Low (~7%)</SelectItem>
                <SelectItem value="M">Medium (~15%)</SelectItem>
                <SelectItem value="Q">Quartile (~25%)</SelectItem>
                <SelectItem value="H">High (~30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="quiet-zone-modal"
              checked={quietZone}
              onCheckedChange={(c) => setQuietZone(c === true)}
            />
            <Label
              htmlFor="quiet-zone-modal"
              className="cursor-pointer text-slate-300"
            >
              Quiet zone (recommended)
            </Label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:brightness-110 active:scale-95"
          >
            Done
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 text-white transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-700 hover:brightness-110 active:scale-95"
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
  frameStyle: QrFrameStyle;
  setFrameStyle: (style: QrFrameStyle) => void;
  dotShape: QrDotShape;
  setDotShape: (shape: QrDotShape) => void;
  logoDataUrl: string;
  setLogoDataUrl: (url: string) => void;
  logoSize: number;
  setLogoSize: (size: number) => void;
  logoMargin: number;
  setLogoMargin: (margin: number) => void;
  downloadName: string;
  setDownloadName: (name: string) => void;
  downloadFormat: QrDownloadFormat;
  setDownloadFormat: (format: QrDownloadFormat) => void;
  onLogoUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function OptionsModal({
  isOpen,
  onClose,
  frameStyle,
  setFrameStyle,
  dotShape,
  setDotShape,
  logoDataUrl,
  setLogoDataUrl,
  logoSize,
  setLogoSize,
  logoMargin,
  setLogoMargin,
  downloadName,
  setDownloadName,
  downloadFormat,
  setDownloadFormat,
  onLogoUploadChange,
}: OptionsModalProps) {
  const initialStateRef = useRef<{
    frameStyle: QrFrameStyle;
    dotShape: QrDotShape;
    logoDataUrl: string;
    logoSize: number;
    logoMargin: number;
    downloadName: string;
    downloadFormat: QrDownloadFormat;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initialStateRef.current = null;
      return;
    }

    // Snapshot once per modal open; keep it stable for Cancel revert.
    if (initialStateRef.current === null) {
      initialStateRef.current = {
        frameStyle,
        dotShape,
        logoDataUrl,
        logoSize,
        logoMargin,
        downloadName,
        downloadFormat,
      };
    }
  }, [
    dotShape,
    downloadFormat,
    downloadName,
    frameStyle,
    isOpen,
    logoDataUrl,
    logoMargin,
    logoSize,
  ]);

  if (!isOpen) return null;

  const handleCancel = () => {
    const initial = initialStateRef.current;
    if (initial) {
      setFrameStyle(initial.frameStyle);
      setDotShape(initial.dotShape);
      setLogoDataUrl(initial.logoDataUrl);
      setLogoSize(initial.logoSize);
      setLogoMargin(initial.logoMargin);
      setDownloadName(initial.downloadName);
      setDownloadFormat(initial.downloadFormat);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md animate-slideUp overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-white">⚙️ More Options</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-all duration-200 hover:scale-110 hover:text-white active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Frame style</Label>
              <Select
                value={frameStyle}
                onValueChange={(v) => setFrameStyle(v as QrFrameStyle)}
              >
                <SelectTrigger className="rounded-lg border-slate-600 bg-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-600 bg-slate-800 text-white">
                  <SelectItem value="neo">Neo border</SelectItem>
                  <SelectItem value="gold">Gold glow</SelectItem>
                  <SelectItem value="soft">Soft frame</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Dot shape</Label>
              <Select
                value={dotShape}
                onValueChange={(v) => setDotShape(v as QrDotShape)}
              >
                <SelectTrigger className="rounded-lg border-slate-600 bg-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-600 bg-slate-800 text-white">
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logo upload */}
          <div className="space-y-3 rounded-lg border border-slate-600 bg-slate-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-white">Logo</p>
                <p className="mt-1 text-slate-400 text-xs">
                  Upload PNG/JPG/WebP logo
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById('logo-input-modal')?.click()
                }
                className="border-slate-600 bg-slate-800/50 text-white transition-all duration-200 hover:scale-105 hover:bg-slate-700 hover:brightness-110 active:scale-95"
              >
                Upload
              </Button>
            </div>

            <input
              id="logo-input-modal"
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={onLogoUploadChange}
            />

            {logoDataUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Logo uploaded</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoDataUrl('')}
                  className="border-slate-600 bg-slate-800/50 text-white transition-all duration-200 hover:scale-105 hover:bg-slate-700 hover:brightness-110 active:scale-95"
                >
                  Remove
                </Button>
              </div>
            ) : null}

            {logoDataUrl && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Size</Label>
                  <Slider
                    min={0}
                    max={120}
                    step={2}
                    value={[logoSize]}
                    onValueChange={(v) => setLogoSize(v[0] ?? logoSize)}
                    className="py-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Margin</Label>
                  <Slider
                    min={0}
                    max={20}
                    step={1}
                    value={[logoMargin]}
                    onValueChange={(v) => setLogoMargin(v[0] ?? logoMargin)}
                    className="py-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Download options */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-slate-300">File name</Label>
              <input
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value || 'qrcode')}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Download format</Label>
              <Select
                value={downloadFormat}
                onValueChange={(v) => setDownloadFormat(v as QrDownloadFormat)}
              >
                <SelectTrigger className="rounded-lg border-slate-600 bg-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-600 bg-slate-800 text-white">
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
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 text-white transition-all duration-200 hover:scale-105 hover:border-slate-500 hover:bg-slate-700 active:scale-95"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
