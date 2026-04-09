"use client";

import { Button } from "@ncthub/ui/button";
import { Checkbox } from "@ncthub/ui/checkbox";
import { Dropzone, DropzoneEmptyState } from "@ncthub/ui/dropzone";
import { Label } from "@ncthub/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ncthub/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ncthub/ui/select";
import { Slider } from "@ncthub/ui/slider";
import { motion } from "framer-motion";
import QRCodeStyling, { type TypeNumber } from "qr-code-styling";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColorPicker } from "react-color-pikr";
import NeoGeneratorHero from "./hero";

// Type definitions
interface QRTypeTab {
  value: QrType;
  label: string;
  description: string;
}

type QrType =
  | "url"
  | "wifi"
  | "email"
  | "sms"
  | "vcard"
  | "facebook"
  | "appstores"
  | "images";
type QrDownloadFormat = "png" | "jpeg" | "svg" | "eps";
type QrErrorLevel = "L" | "M" | "Q" | "H";
type QrDotShape = "square" | "rounded" | "dots";

function triggerDownload(blobOrUrl: Blob | string, fileName: string) {
  const url =
    typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  if (typeof blobOrUrl !== "string") {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

function getExt(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

//QR code frame selection
export type FrameStyle = "none" | "minimal" | "rounded" | "banner" | "polaroid";
export interface QRconfig {
  value: string;
  frame: FrameStyle;
  color: string;
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
  security: "WPA" | "WEP" | "nopass" | "WPA2" | "NONE";
  hidden: boolean;
}) {
  const ssidEscaped = ssid.replace(/;/g, ":");
  const passwordEscaped = password.replace(/;/g, ":");
  const wifiType =
    security === "NONE"
      ? "nopass"
      : security === "nopass"
        ? "nopass"
        : security;
  const parts = [
    `T:${wifiType}`,
    `S:${ssidEscaped}`,
    security === "nopass" || security === "NONE"
      ? `P:`
      : `P:${passwordEscaped}`,
    `H:${hidden ? "true" : "false"}`,
  ];
  return `WIFI:${parts.join(";")};;`;
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
  if (subject.trim()) params.set("subject", subject);
  if (body.trim()) params.set("body", body);
  const query = params.toString();
  return `mailto:${to.trim()}${query ? `?${query}` : ""}`;
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
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${fullName || `${firstName || ""} ${lastName || ""}`.trim()}`,
    org.trim() ? `ORG:${org.trim()}` : "",
    title.trim() ? `TITLE:${title.trim()}` : "",
    tel.trim() ? `TEL:${tel.trim()}` : "",
    email.trim() ? `EMAIL:${email.trim()}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}

// Validate and sanitize dot types to prevent qr-code-styling crashes
function sanitizeDotType(type: unknown): string {
  const validTypes = [
    "square",
    "dots",
    "rounded",
    "extra-rounded",
    "classy",
    "classy-rounded",
  ];
  if (typeof type === "string" && validTypes.includes(type)) {
    return type;
  }
  return "square"; // Safe fallback
}

function dotStyle(dotShape: QrDotShape) {
  switch (dotShape) {
    case "rounded":
      return {
        shape: "square" as const,
        dots: "rounded" as const,
        cornerSquare: "extra-rounded" as const,
        cornerDot: "dots" as const,
      };
    case "dots":
      return {
        shape: "square" as const,
        dots: "dots" as const,
        cornerSquare: "dots" as const,
        cornerDot: "dots" as const,
      };
    default:
      return {
        shape: "square" as const,
        dots: "square" as const,
        cornerSquare: "square" as const,
        cornerDot: "square" as const,
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
    fgColor && typeof fgColor === "string" ? fgColor : "#000000";
  const safeBgColor =
    bgColor && typeof bgColor === "string" ? bgColor : "#000000";

  // BULLETPROOF: Sanitize all dot types - always have fallback
  const safeDotType = sanitizeDotType(dotConfig?.dots) || "square";
  const safeCornerSquareType =
    sanitizeDotType(dotConfig?.cornerSquare) || "square";
  const safeCornerDotType = sanitizeDotType(dotConfig?.cornerDot) || "square";

  // BULLETPROOF: Ensure shape exists
  const safeShape = dotConfig?.shape || "square";

  // BULLETPROOF: Validate qrValue
  const safeData =
    qrValue && qrValue.trim().length > 0 ? qrValue : "https://example.com";

  // BULLETPROOF: Validate margin
  const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0;

  // Build options with ALL fields explicitly set
  const options = {
    type: "svg" as const,
    shape: safeShape,
    width: safeSize,
    height: safeSize,
    margin: safeMargin,
    data: safeData,
    qrOptions: {
      typeNumber: 0 as unknown as TypeNumber | undefined,
      errorCorrectionLevel: errorLevel || "H",
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
      "[QR WARN] Options object has missing fields, using safe defaults",
    );
    // Return absolute fallback
    return {
      type: "svg" as const,
      shape: "square",
      width: 260,
      height: 260,
      margin: 0,
      data: "https://example.com",
      qrOptions: {
        typeNumber: 0 as unknown as TypeNumber | undefined,
        errorCorrectionLevel: "H",
      },
      dotsOptions: {
        type: "square",
        color: "#000000",
        roundSize: false,
      },
      cornersSquareOptions: {
        type: "square",
        color: "#000000",
      },
      cornersDotOptions: {
        type: "square",
        color: "#000000",
      },
      backgroundOptions: {
        round: 0,
        color: "#000000",
      },
    } as any;
  }

  return options;
}

export default function NeoQrGeneratorPage() {
  // Initialize colors with safe defaults to avoid hydration mismatch
  // Use a consistent default on both server and client, then update after hydration
  const [qrType, setQrType] = useState<QrType>("url");
  const [qrValue, setQrValue] = useState("");
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
  const [frameText, setFrameText] = useState("SCAN ME");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DEBOUNCE: Prevent rapid successive updates during theme transitions
  const qrUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL-like inputs
  const [urlInput, setUrlInput] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  // Structured inputs
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<
    "WPA" | "WEP" | "nopass" | "WPA2" | "NONE"
  >("WPA2");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [smsNumber, setSmsNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  const [vFirstName, setVFirstName] = useState("");
  const [vLastName, setVLastName] = useState("");
  const [vOrg, setVOrg] = useState("");
  const [vTitle, setVTitle] = useState("");
  const [vTel, setVTel] = useState("");
  const [vEmail, setVEmail] = useState("");

  // File-based inputs
  const [fileObjectUrl, setFileObjectUrl] = useState<string>("");

  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  // Customize options - Use safe default to avoid hydration mismatch
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [qrSize, setQrSize] = useState(260);
  const [displayScale, setDisplayScale] = useState(1);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [currentSliderValue, setCurrentSliderValue] = useState(260);
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>("H");
  const [quietZone, setQuietZone] = useState(true);

  const [dotShape, setDotShape] = useState<QrDotShape>("square");
  const [customizationTab, setCustomizationTab] = useState<
    "customization" | "logo" | "frame"
  >("customization");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [logoSize, setLogoSize] = useState(58); // Fixed 48px

  // Export options
  const [downloadFormat, setDownloadFormat] = useState<QrDownloadFormat>("png");
  const [downloadName, setDownloadName] = useState("qrcode");

  // Preview / render
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const prevQrTypeRef = useRef<QrType>(qrType);
  const prevQrContainerElRef = useRef<HTMLDivElement | null>(null);

  // Effect to update foreground color after hydration based on actual theme
  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setFgColor(isDark ? "#ffffff" : "#000000");
    setBgColor(isDark ? "#000000" : "#ffffff");
  }, []);

  const isValidHttpUrl = (value: string) => {
    const v = value.trim();
    if (!v) return true;
    try {
      const url = new URL(v);
      return url.protocol === "http:" || url.protocol === "https:";
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
  if (qrType === "url") isCurrentInputValid = urlValid;
  else if (qrType === "facebook") isCurrentInputValid = facebookUrlValid;
  else if (qrType === "email") isCurrentInputValid = emailToValid;
  else if (qrType === "vcard") isCurrentInputValid = vEmailValid;

  // Slider drag behavior: smooth visual scaling via transform during drag, then update QR on release
  const handleQrSizeSliderStart = useCallback(() => {
    setIsDraggingSlider(true);
    setDisplayScale(1); // Reset scale at start
    setCurrentSliderValue(qrSize); // Track starting position
  }, [qrSize]);

  const handleQrSizeSliderChange = useCallback(
    (v: number[]) => {
      // Track the actual slider value and calculate scale based on it
      const newSize = v[0] ?? qrSize;
      setCurrentSliderValue(newSize);
      const scale = newSize / qrSize;
      setDisplayScale(scale);
    },
    [qrSize],
  );

  const handleQrSizeSliderEnd = useCallback(() => {
    // Apply the final slider value that was tracked during dragging
    setQrSize(currentSliderValue);
    setDisplayScale(1); // Reset scale after updating actual size
    setIsDraggingSlider(false);
  }, [currentSliderValue]);

  const handleQrSizeSliderPointerDown = useCallback(() => {
    handleQrSizeSliderStart();
  }, [handleQrSizeSliderStart]);

  const handleQrSizeSliderPointerUp = useCallback(() => {
    handleQrSizeSliderEnd();
  }, [handleQrSizeSliderEnd]);

  const qrPayload = useMemo(() => {
    switch (qrType) {
      case "url":
        return urlInput.trim();
      case "facebook":
        return facebookUrl.trim();
      case "wifi":
        return buildWifiPayload({
          ssid: wifiSsid,
          password: wifiPassword,
          security: wifiSecurity,
          hidden: wifiHidden,
        });
      case "email":
        return buildEmailPayload({
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
        });
      case "sms":
        return buildSmsPayload({ number: smsNumber, message: smsMessage });
      case "vcard":
        return buildVCardPayload({
          firstName: vFirstName,
          lastName: vLastName,
          org: vOrg,
          title: vTitle,
          tel: vTel,
          email: vEmail,
        });
      default:
        return "";
    }
  }, [
    emailBody,
    emailSubject,
    emailTo,
    facebookUrl,
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
        currentContainer.innerHTML = "";
      }
      return;
    }

    const dot = dotStyle(dotShape);
    const margin = quietZone ? 3 : 0;
    // Always use qrSize for rendering - frozen during slider dragging
    const displaySize = qrSize;

    // Defensive: Ensure dot style returns expected shape
    if (!dot || !dot.shape || !dot.dots) {
      console.warn("Invalid dot style configuration");
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
          currentContainer.innerHTML = "";
        }

        // Create new instance with validated options
        qrRef.current = new QRCodeStyling(options);
        qrRef.current.append(currentContainer);

        prevQrTypeRef.current = qrType;
        prevQrContainerElRef.current = currentContainer;
      } else {
        // BULLETPROOF: Validate all critical fields before update
        if (!qrRef.current) {
          console.warn("[QR WARN] qrRef.current is null, cannot update");
          return;
        }

        if (!options) {
          console.warn("[QR WARN] options object is null, cannot update");
          return;
        }

        // BULLETPROOF: Validate nested options object structure with comprehensive checks
        const hasValidDotsOptions =
          options.dotsOptions &&
          typeof options.dotsOptions === "object" &&
          "type" in options.dotsOptions &&
          "color" in options.dotsOptions &&
          typeof options.dotsOptions.type === "string" &&
          typeof options.dotsOptions.color === "string";

        const hasValidCornersSquare =
          options.cornersSquareOptions &&
          typeof options.cornersSquareOptions === "object" &&
          "type" in options.cornersSquareOptions &&
          "color" in options.cornersSquareOptions &&
          typeof options.cornersSquareOptions.type === "string" &&
          typeof options.cornersSquareOptions.color === "string";

        const hasValidCornersDot =
          options.cornersDotOptions &&
          typeof options.cornersDotOptions === "object" &&
          "type" in options.cornersDotOptions &&
          "color" in options.cornersDotOptions &&
          typeof options.cornersDotOptions.type === "string" &&
          typeof options.cornersDotOptions.color === "string";

        const hasValidBackground =
          options.backgroundOptions &&
          typeof options.backgroundOptions === "object" &&
          "color" in options.backgroundOptions &&
          typeof options.backgroundOptions.color === "string";

        const hasValidQrOptions =
          options.qrOptions &&
          typeof options.qrOptions === "object" &&
          "errorCorrectionLevel" in options.qrOptions;

        if (
          !hasValidDotsOptions ||
          !hasValidCornersSquare ||
          !hasValidCornersDot ||
          !hasValidBackground ||
          !hasValidQrOptions
        ) {
          console.warn(
            "[QR WARN] Options structure validation failed, recreating instead:",
            {
              hasValidDotsOptions,
              hasValidCornersSquare,
              hasValidCornersDot,
              hasValidBackground,
              hasValidQrOptions,
            },
          );
          // Fallback: Recreate the QR code instead of updating
          if (currentContainer) {
            currentContainer.innerHTML = "";
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
            "[QR WARN] Update failed, attempting recreation:",
            updateError,
          );
          // If update fails, recreate the QR code
          if (currentContainer) {
            currentContainer.innerHTML = "";
          }
          qrRef.current = new QRCodeStyling(options);
          qrRef.current.append(currentContainer);
        }
      }
    } catch (error) {
      console.error("Failed to create/update QR code:", error, {
        options,
        hasQrRef: !!qrRef.current,
      });
      if (currentContainer) {
        currentContainer.innerHTML = "";
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
    setUrlInput("");
    setFacebookUrl("");
    setWifiSsid("");
    setWifiPassword("");
    setWifiSecurity("WPA2");
    setWifiHidden(false);
    setEmailTo("");
    setEmailSubject("");
    setEmailBody("");
    setSmsNumber("");
    setSmsMessage("");
    setVFirstName("");
    setVLastName("");
    setVOrg("");
    setVTitle("");
    setVTel("");
    setVEmail("");
    setFileObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  }, []);

  const handleTypeChange = useCallback(
    (type: QrType) => {
      setQrType(type);
      resetFormForType();
    },
    [resetFormForType],
  );

  const getFrameConfig = useCallback(() => {
    let framePaddingX = 0;
    let framePaddingY = 0;
    let bannerHeight = 0;
    let bottomTextHeight = 0;
    let borderWidth = 0;
    let borderRadius = 0;

    if (frameStyle === "minimal") {
      framePaddingX = 16;
      framePaddingY = 16;
      borderWidth = 6;
    } else if (frameStyle === "rounded") {
      framePaddingX = 20;
      framePaddingY = 20;
      borderWidth = 6;
      borderRadius = 24;
    } else if (frameStyle === "banner") {
      framePaddingX = 16;
      framePaddingY = 16;
      borderWidth = 6;
      bannerHeight = 46;
      borderRadius = 16;
    } else if (frameStyle === "polaroid") {
      framePaddingX = 16;
      framePaddingY = 16;
      borderWidth = 6;
      bottomTextHeight = 50;
      borderRadius = 4;
    }

    return {
      framePaddingX,
      framePaddingY,
      bannerHeight,
      bottomTextHeight,
      borderWidth,
      borderRadius,
      totalWidth: qrSize + framePaddingX * 2 + borderWidth * 2,
      totalHeight:
        qrSize +
        framePaddingY * 2 +
        borderWidth * 2 +
        bannerHeight +
        bottomTextHeight,
      qrOffsetX: framePaddingX + borderWidth,
      qrOffsetY: framePaddingY + borderWidth + bannerHeight,
    };
  }, [frameStyle, qrSize]);

  const generateCanvas =
    useCallback(async (): Promise<HTMLCanvasElement | null> => {
      if (!qrRef.current) return null;

      const qrBlob = await qrRef.current.getRawData("png");
      if (!qrBlob) return null;
      const qrUrl = URL.createObjectURL(qrBlob as Blob);

      const qrImg = document.createElement("img") as HTMLImageElement;
      const promises: Promise<any>[] = [
        new Promise((res) => {
          qrImg.onload = res;
          qrImg.src = qrUrl;
        }),
      ];

      let logoImg: HTMLImageElement | null = null;
      if (logoDataUrl) {
        logoImg = document.createElement("img");
        promises.push(
          new Promise((res) => {
            logoImg!.onload = res;
            logoImg!.src = logoDataUrl;
          }),
        );
      }

      await Promise.all(promises);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(qrUrl);
        return null;
      }

      const config = getFrameConfig();
      canvas.width = config.totalWidth;
      canvas.height = config.totalHeight;

      if (frameStyle !== "none") {
        // Draw Background
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        if (config.borderRadius && ctx.roundRect) {
          ctx.roundRect(
            0,
            0,
            config.totalWidth,
            config.totalHeight,
            config.borderRadius,
          );
        } else {
          ctx.rect(0, 0, config.totalWidth, config.totalHeight);
        }
        ctx.fill();

        // Draw Border
        if (config.borderWidth > 0) {
          ctx.lineWidth = config.borderWidth;
          ctx.strokeStyle = fgColor;
          ctx.beginPath();
          const r = config.borderRadius
            ? Math.max(0, config.borderRadius - config.borderWidth / 2)
            : 0;
          const bw = config.borderWidth;
          if (r > 0 && ctx.roundRect) {
            ctx.roundRect(
              bw / 2,
              bw / 2,
              config.totalWidth - bw,
              config.totalHeight - bw,
              r,
            );
          } else {
            ctx.rect(
              bw / 2,
              bw / 2,
              config.totalWidth - bw,
              config.totalHeight - bw,
            );
          }
          ctx.stroke();
        }
      }

      // Draw Banner Header
      if (frameStyle === "banner") {
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(
            0,
            0,
            config.totalWidth,
            config.bannerHeight + config.borderRadius,
            [config.borderRadius, config.borderRadius, 0, 0],
          );
        } else {
          ctx.rect(0, 0, config.totalWidth, config.bannerHeight);
        }
        ctx.fill();

        // Banner Text
        ctx.fillStyle = bgColor;
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          frameText,
          config.totalWidth / 2,
          config.bannerHeight / 2 + 2,
        );
      }

      // Draw Polaroid Footer Text
      if (frameStyle === "polaroid") {
        ctx.fillStyle = fgColor;
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          frameText,
          config.totalWidth / 2,
          config.totalHeight - config.bottomTextHeight / 2,
        );
      }

      // Draw QR code inside the frame
      ctx.drawImage(qrImg, config.qrOffsetX, config.qrOffsetY, qrSize, qrSize);

      // Draw Logo
      if (logoImg) {
        const logoX = config.qrOffsetX + (qrSize - logoSize) / 2;
        const logoY = config.qrOffsetY + (qrSize - logoSize) / 2;

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8, 6);
        } else {
          ctx.rect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
        }
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 4);
        } else {
          ctx.rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
        }
        ctx.fill();

        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }

      URL.revokeObjectURL(qrUrl);
      return canvas;
    }, [
      logoDataUrl,
      bgColor,
      fgColor,
      frameStyle,
      frameText,
      qrSize,
      logoSize,
      getFrameConfig,
    ]);

  const generateSVG = useCallback(async (): Promise<Blob | null> => {
    if (!qrRef.current) return null;
    const svgBlob = await qrRef.current.getRawData("svg");
    if (!svgBlob) return null;
    const svgText = await (svgBlob as Blob).text();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    const config = getFrameConfig();

    svgElement.setAttribute(
      "viewBox",
      `0 0 ${config.totalWidth} ${config.totalHeight}`,
    );
    svgElement.setAttribute("width", `${config.totalWidth}`);
    svgElement.setAttribute("height", `${config.totalHeight}`);

    const qrGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
    qrGroup.setAttribute(
      "transform",
      `translate(${config.qrOffsetX}, ${config.qrOffsetY})`,
    );

    while (svgElement.firstChild) {
      qrGroup.appendChild(svgElement.firstChild);
    }

    const frameGroup = svgDoc.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );

    if (frameStyle !== "none") {
      // Background
      const bgRect = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      bgRect.setAttribute("width", `${config.totalWidth}`);
      bgRect.setAttribute("height", `${config.totalHeight}`);
      bgRect.setAttribute("fill", bgColor);
      if (config.borderRadius)
        bgRect.setAttribute("rx", `${config.borderRadius}`);
      frameGroup.appendChild(bgRect);

      // Border
      if (config.borderWidth > 0) {
        const borderRect = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        borderRect.setAttribute("x", `${config.borderWidth / 2}`);
        borderRect.setAttribute("y", `${config.borderWidth / 2}`);
        borderRect.setAttribute(
          "width",
          `${config.totalWidth - config.borderWidth}`,
        );
        borderRect.setAttribute(
          "height",
          `${config.totalHeight - config.borderWidth}`,
        );
        borderRect.setAttribute("fill", "none");
        borderRect.setAttribute("stroke", fgColor);
        borderRect.setAttribute("stroke-width", `${config.borderWidth}`);
        if (config.borderRadius)
          borderRect.setAttribute(
            "rx",
            `${Math.max(0, config.borderRadius - config.borderWidth / 2)}`,
          );
        frameGroup.appendChild(borderRect);
      }
    }

    // Banner Header
    if (frameStyle === "banner") {
      const bannerPath = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      const r = config.borderRadius;
      const w = config.totalWidth;
      const h = config.bannerHeight;
      const pathData = `M 0,${r} A ${r},${r} 0 0,1 ${r},0 L ${w - r},0 A ${r},${r} 0 0,1 ${w},${r} L ${w},${h} L 0,${h} Z`;
      bannerPath.setAttribute("d", pathData);
      bannerPath.setAttribute("fill", fgColor);
      frameGroup.appendChild(bannerPath);

      const textEl = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      textEl.setAttribute("x", `${config.totalWidth / 2}`);
      textEl.setAttribute("y", `${config.bannerHeight / 2}`);
      textEl.setAttribute("fill", bgColor);
      textEl.setAttribute("font-family", "sans-serif");
      textEl.setAttribute("font-weight", "bold");
      textEl.setAttribute("font-size", "20px");
      textEl.setAttribute("text-anchor", "middle");
      textEl.setAttribute("dominant-baseline", "central");
      textEl.textContent = frameText;
      frameGroup.appendChild(textEl);
    }

    // Polaroid Footer Text
    if (frameStyle === "polaroid") {
      const textEl = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      textEl.setAttribute("x", `${config.totalWidth / 2}`);
      textEl.setAttribute(
        "y",
        `${config.totalHeight - config.bottomTextHeight / 2}`,
      );
      textEl.setAttribute("fill", fgColor);
      textEl.setAttribute("font-family", "sans-serif");
      textEl.setAttribute("font-weight", "bold");
      textEl.setAttribute("font-size", "20px");
      textEl.setAttribute("text-anchor", "middle");
      textEl.setAttribute("dominant-baseline", "central");
      textEl.textContent = frameText;
      frameGroup.appendChild(textEl);
    }

    svgElement.appendChild(frameGroup);
    svgElement.appendChild(qrGroup);

    // Logo
    if (logoDataUrl) {
      const logoX = config.qrOffsetX + (qrSize - logoSize) / 2;
      const logoY = config.qrOffsetY + (qrSize - logoSize) / 2;

      const borderOuter = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      borderOuter.setAttribute("x", `${logoX - 4}`);
      borderOuter.setAttribute("y", `${logoY - 4}`);
      borderOuter.setAttribute("width", `${logoSize + 8}`);
      borderOuter.setAttribute("height", `${logoSize + 8}`);
      borderOuter.setAttribute("fill", bgColor);
      borderOuter.setAttribute("rx", "6");
      svgElement.appendChild(borderOuter);

      const borderInner = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      borderInner.setAttribute("x", `${logoX - 2}`);
      borderInner.setAttribute("y", `${logoY - 2}`);
      borderInner.setAttribute("width", `${logoSize + 4}`);
      borderInner.setAttribute("height", `${logoSize + 4}`);
      borderInner.setAttribute("fill", "white");
      borderInner.setAttribute("rx", "4");
      svgElement.appendChild(borderInner);

      const imageElement = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "image",
      );
      imageElement.setAttribute("href", logoDataUrl);
      imageElement.setAttribute("x", `${logoX}`);
      imageElement.setAttribute("y", `${logoY}`);
      imageElement.setAttribute("width", `${logoSize}`);
      imageElement.setAttribute("height", `${logoSize}`);
      svgElement.appendChild(imageElement);
    }

    const serializer = new XMLSerializer();
    const finalSvgText = serializer.serializeToString(svgDoc);
    return new Blob([finalSvgText], { type: "image/svg+xml" });
  }, [
    logoDataUrl,
    bgColor,
    fgColor,
    frameStyle,
    frameText,
    qrSize,
    logoSize,
    getFrameConfig,
  ]);

  const copyQRCode = useCallback(async () => {
    if (!qrValue.trim()) return;

    if (logoDataUrl || frameStyle !== "none") {
      try {
        const canvas = await generateCanvas();
        if (!canvas) return;

        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const item = new ClipboardItem({ "image/png": blob });
              await navigator.clipboard.write([item]);
            } catch (error) {
              console.warn(
                "Failed to copy QR with frame/logo to clipboard:",
                error,
              );
            }
          }
        }, "image/png");
        return;
      } catch (error) {
        console.warn("Failed to copy QR with frame/logo, falling back:", error);
      }
    }

    try {
      if (qrRef.current) {
        const pngBlob = (await qrRef.current.getRawData("png")) as Blob | null;
        if (pngBlob) {
          const item = new ClipboardItem({ "image/png": pngBlob });
          await navigator.clipboard.write([item]);
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to copy QR image, falling back to text:", error);
    }

    // Final fallback: copy text
    try {
      await navigator.clipboard.writeText(qrValue);
    } catch (textError) {
      console.warn("Failed to copy QR value:", textError);
    }
  }, [qrValue, logoDataUrl, frameStyle, generateCanvas]);

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
      alert("Image size exceeds 2MB limit. Please upload a smaller image.");
      return;
    }

    const ext = getExt(file.name);
    const ok = ["png", "jpg", "jpeg", "webp"].includes(ext);
    if (!ok) {
      setLogoDataUrl("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        // UPDATED: Explicitly typed Image creation
        const img = document.createElement("img") as HTMLImageElement;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
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
            targetSize,
          );
          setLogoDataUrl(canvas.toDataURL("image/png"));
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const qrCanDownload = qrValue.trim().length > 0 && isGenerated;

  const download = useCallback(async () => {
    if (!qrRef.current || !qrCanDownload) return;

    if (!logoDataUrl && frameStyle === "none") {
      if (downloadFormat === "eps") {
        const svgBlob = await qrRef.current.getRawData("svg");
        if (!svgBlob) return;
        triggerDownload(svgBlob as Blob, `${downloadName}.eps`);
        return;
      }

      await qrRef.current.download({
        extension:
          downloadFormat === "jpeg"
            ? "jpeg"
            : downloadFormat === "svg"
              ? "svg"
              : downloadFormat,
        name: downloadName,
      });
      return;
    }

    if (downloadFormat === "png" || downloadFormat === "jpeg") {
      const canvas = await generateCanvas();
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, `${downloadName}.${downloadFormat}`);
      }, `image/${downloadFormat}`);
      return;
    }

    if (downloadFormat === "svg" || downloadFormat === "eps") {
      const svgBlob = await generateSVG();
      if (!svgBlob) return;
      triggerDownload(
        svgBlob,
        `${downloadName}.${downloadFormat === "eps" ? "eps" : "svg"}`,
      );
    }
  }, [
    downloadFormat,
    downloadName,
    logoDataUrl,
    frameStyle,
    qrCanDownload,
    generateCanvas,
    generateSVG,
  ]);

  const qrTypeTabs: QRTypeTab[] = [
    {
      value: "url",
      label: "URL",
      description: "Redirect to an existing web URL",
    },
    {
      value: "email",
      label: "Email",
      description: "Pre-filled email composer",
    },
    {
      value: "sms",
      label: "SMS",
      description: "Pre-filled text message",
    },
    {
      value: "wifi",
      label: "WiFi",
      description: "Share WiFi credentials",
    },
    {
      value: "vcard",
      label: "Contact",
      description: "Digital business card",
    },
  ];

  const currentTabInfo = qrTypeTabs.find((t) => t.value === qrType);

  const renderFrame = useCallback(
    (children: React.ReactNode) => {
      const config = getFrameConfig();
      return (
        <div
          style={{
            position: "relative",
            width: config.totalWidth,
            height: config.totalHeight,
            backgroundColor: frameStyle === "none" ? "transparent" : bgColor,
            border:
              frameStyle === "none"
                ? "none"
                : `${config.borderWidth}px solid ${fgColor}`,
            borderRadius: config.borderRadius,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          {frameStyle === "banner" && (
            <div
              style={{
                width: "100%",
                height: config.bannerHeight,
                backgroundColor: fgColor,
                color: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                fontFamily: "sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {frameText}
            </div>
          )}
          <div
            style={{
              paddingTop: config.framePaddingY,
              paddingBottom: config.framePaddingY,
              paddingLeft: config.framePaddingX,
              paddingRight: config.framePaddingX,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {children}
          </div>
          {frameStyle === "polaroid" && (
            <div
              style={{
                width: "100%",
                height: config.bottomTextHeight,
                backgroundColor: bgColor,
                color: fgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                fontFamily: "sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {frameText}
            </div>
          )}
        </div>
      );
    },
    [frameStyle, frameText, bgColor, fgColor, getFrameConfig],
  );

  return (
    <div className="min-h-screen">
      <NeoGeneratorHero />

      <div className="mx-auto max-w-6xl px-4 py-16 pb-0 sm:px-6 lg:px-8">
        {/* Unified Main Container - All sections merged */}
        <div
          className="rounded-2xl border bg-white shadow-lg transition-all duration-300"
          style={{ backgroundColor: "var(--background)" }}
        >
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
                            ? { backgroundColor: "rgba(255, 255, 255, 0.3)" }
                            : {}
                        }
                        whileTap={{ scale: 0.95 }}
                        className={`relative shrink-0 overflow-hidden whitespace-nowrap rounded-full px-4 py-2.5 font-medium text-sm transition-all duration-300 ${
                          isActive
                            ? "scale-100 text-white"
                            : "text-slate-700 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:text-slate-200"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      >
                        {isActive ? (
                          <motion.div
                            layoutId="activeTabPill"
                            transition={{
                              type: "spring",
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
                      "Redirect to an existing web URL"}
                  </h3>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  {/* URL Input */}
                  {qrType === "url" ? (
                    <motion.div
                      key="url-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
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
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500"
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
                  {qrType === "facebook" ? (
                    <motion.div
                      key="facebook-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
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
                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500"
                        }`}
                      />
                    </motion.div>
                  ) : null}

                  {/* WiFi Configuration */}
                  {qrType === "wifi" ? (
                    <motion.div
                      key="wifi-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
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
                            wifiSecurity === "nopass" || wifiSecurity === "NONE"
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
                                v as "WPA" | "WEP" | "nopass" | "WPA2" | "NONE",
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
                  {qrType === "email" ? (
                    <motion.div
                      key="email-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
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
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                              : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500"
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
                  {qrType === "sms" ? (
                    <motion.div
                      key="sms-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
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
                  {qrType === "vcard" ? (
                    <motion.div
                      key="vcard-input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
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
                              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                              : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:focus:border-blue-500"
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
                style={{ borderColor: "var(--border)" }}
              >
                {/* Tab Navigation */}
                <div
                  className="flex gap-2 rounded-lg border p-1"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--secondary)",
                  }}
                >
                  {(["customization", "logo", "frame"] as const).map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setCustomizationTab(tab)}
                      className="flex-1 rounded-md px-3 py-2 font-medium text-sm transition-all duration-200"
                      style={{
                        backgroundColor:
                          customizationTab === tab
                            ? "var(--card)"
                            : "transparent",
                        color:
                          customizationTab === tab
                            ? "var(--primary)"
                            : "var(--muted-foreground)",
                        boxShadow:
                          customizationTab === tab
                            ? "0 1px 3px rgba(0, 0, 0, 0.1)"
                            : "none",
                      }}
                    >
                      {tab === "customization"
                        ? "Customization"
                        : tab === "logo"
                          ? "Logo"
                          : "Frame"}
                    </button>
                  ))}
                </div>

                {/* Customization Tab - 3 Rows Structure */}
                {customizationTab === "customization" && (
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
                                {typeof fgColor === "string"
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
                                {typeof bgColor === "string"
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
                        style={{ color: "var(--foreground)" }}
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
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
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
                          style={{ color: "var(--foreground)" }}
                        >
                          QR Size
                        </Label>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "var(--primary)" }}
                        >
                          {isDraggingSlider ? currentSliderValue : qrSize}
                          px
                        </span>
                      </div>
                      <div
                        className="space-y-1"
                        onPointerDown={handleQrSizeSliderPointerDown}
                        onPointerUp={handleQrSizeSliderPointerUp}
                        onPointerLeave={() => {
                          if (isDraggingSlider) {
                            // If pointer leaves while dragging, apply the current slider value
                            handleQrSizeSliderPointerUp();
                          }
                        }}
                      >
                        <Slider
                          min={180}
                          max={360}
                          step={10}
                          value={[
                            isDraggingSlider ? currentSliderValue : qrSize,
                          ]}
                          onValueChange={handleQrSizeSliderChange}
                          className="py-1"
                        />
                        {isDraggingSlider && (
                          <p
                            className="text-right font-medium text-xs"
                            style={{ color: "var(--primary)" }}
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
                        style={{ color: "var(--foreground)" }}
                      >
                        Quiet zone (recommended)
                      </Label>
                    </div>
                  </div>
                )}

                {/* Logo Tab - File Upload Dropzone */}
                {customizationTab === "logo" && (
                  <div className="space-y-4">
                    <div
                      className="group relative cursor-pointer space-y-4 rounded-lg border-2 border-dashed p-6 text-center transition-all hover:border-opacity-80"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--secondary)",
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
                          style={{ color: "var(--foreground)" }}
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
                          style={{ color: "var(--foreground)" }}
                        >
                          Drag logo here or click to select
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          PNG, JPG, or WebP (max 2MB)
                        </p>
                      </div>
                    </div>
                    {logoDataUrl && (
                      <div className="space-y-2">
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          Logo Preview:
                        </p>
                        <div className="flex items-center justify-center">
                          <div
                            className="max-h-20 w-20 rounded-lg border"
                            style={{
                              borderColor: "var(--border)",
                              backgroundImage: `url('${logoDataUrl}')`,
                              backgroundSize: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setLogoDataUrl("")}
                          className="w-full rounded-lg px-3 py-2 font-medium text-sm transition-all duration-200 hover:opacity-80"
                          style={{
                            color: "var(--foreground)",
                            backgroundColor: "var(--card)",
                            border: "1px solid",
                            borderColor: "var(--border)",
                          }}
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Frame Tab */}
                {customizationTab === "frame" && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-medium text-slate-700 dark:text-slate-300">
                        Frame Style
                      </Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {[
                          { value: "none", label: "None" },
                          { value: "minimal", label: "Minimal" },
                          { value: "rounded", label: "Rounded" },
                          { value: "banner", label: "Banner" },
                          { value: "polaroid", label: "Polaroid" },
                        ].map((f) => (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => setFrameStyle(f.value as FrameStyle)}
                            className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                              frameStyle === f.value
                                ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20"
                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                            }`}
                          >
                            <div
                              className={`mb-2 h-8 w-8 bg-slate-100 dark:bg-slate-700 ${
                                f.value === "rounded"
                                  ? "rounded-lg border-2 border-slate-300 dark:border-slate-500"
                                  : f.value === "minimal"
                                    ? "border-2 border-slate-300 dark:border-slate-500"
                                    : f.value === "banner"
                                      ? "border-2 border-slate-300 border-t-[6px] dark:border-slate-500"
                                      : f.value === "polaroid"
                                        ? "border-2 border-slate-300 border-b-[6px] dark:border-slate-500"
                                        : "border-2 border-transparent"
                              }`}
                            />
                            <span className="font-medium text-slate-700 text-xs dark:text-slate-300">
                              {f.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(frameStyle === "banner" || frameStyle === "polaroid") && (
                      <div className="space-y-2">
                        <Label className="font-medium text-slate-700 dark:text-slate-300">
                          Frame Text
                        </Label>
                        <input
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          maxLength={20}
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
                          placeholder="SCAN ME"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        className="font-medium"
                        style={{ color: "var(--foreground)" }}
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
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
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
            <div className="flex flex-1 flex-col gap-0 lg:pr-8 lg:pl-8">
              {/* Title Section */}
              <div className="mt-4 flex-shrink-0 border-slate-200 border-b px-6 py-4 sm:px-8 lg:pr-8 dark:border-slate-700">
                <h3 className="text-center font-semibold text-lg text-slate-900 tracking-wide dark:text-white">
                  Live Preview
                </h3>
              </div>

              {/* QR Code Preview - Flexible section that expands to fit QR size */}
              <div className="flex flex-1 flex-col items-center justify-center border-slate-200 px-6 py-4 sm:px-8 lg:pr-8 dark:border-slate-700">
                {qrValue.trim() ? (
                  <div
                    key={`qr-${qrType}-${qrValue.slice(0, 40)}`}
                    className="qr-container flex animate-fadeIn flex-col items-center justify-center gap-4 rounded-xl p-4"
                  >
                    {/* Unified wrapper: scales both QR image and background container together */}
                    <div
                      className={`relative inline-flex items-center justify-center transition-all duration-500 will-change-transform ${
                        !isGenerated
                          ? "pointer-events-none select-none opacity-40 blur-md grayscale-[50%]"
                          : ""
                      }`}
                      style={{
                        transform: `scale(${displayScale})`,
                        transformOrigin: "center center",
                        transition: isDraggingSlider
                          ? "none"
                          : "transform 0.2s ease-out, filter 0.5s, opacity 0.5s",
                      }}
                    >
                      {renderFrame(
                        <div
                          style={{
                            position: "relative",
                            width: qrSize,
                            height: qrSize,
                          }}
                        >
                          {/* QR Code container */}
                          <div
                            ref={qrContainerRef}
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          />

                          {/* Logo overlay - positioned at center and scales with container */}
                          {logoDataUrl && (
                            <div
                              className="absolute flex items-center justify-center"
                              style={{
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: logoSize,
                                height: logoSize,
                              }}
                            >
                              <div
                                style={{
                                  height: logoSize,
                                  width: logoSize,
                                  backgroundImage: `url('${logoDataUrl}')`,
                                  backgroundSize: "contain",
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "center",
                                }}
                                className="rounded-md border-2 border-white shadow-lg dark:border-slate-600"
                              />
                            </div>
                          )}
                        </div>,
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="qr-container flex w-full items-center justify-center rounded-xl border-2 border-slate-300 border-dashed text-center transition-all duration-300 dark:border-slate-700"
                    style={{ minHeight: "400px" }}
                  >
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

              {/* Generate Button - If hidden, space is reserved */}
              <div
                className="flex-shrink-0"
                style={{ minHeight: !isGenerated ? "88px" : "0px" }}
              >
                {!isGenerated && (
                  <Button
                    type="button"
                    onClick={() => setIsGenerated(true)}
                    disabled={!qrValue.trim() || !isCurrentInputValid}
                    className="z-10 m-6 w-[calc(100%-48px)] rounded-full px-6 py-6 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 sm:m-8 sm:w-[calc(100%-64px)]"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    Generate QR Code
                  </Button>
                )}
              </div>

              {/* Divider - Fixed and stable */}
              <div
                className="flex-shrink-0 border-t"
                style={{ borderColor: "var(--border)", height: "1px" }}
              />

              {/* Action Buttons - Fixed at bottom with padding */}
              <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-3 px-6 py-6 sm:px-8">
                <Button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  disabled={!qrCanDownload}
                  className="rounded-lg px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
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
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
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
                    {copied ? "Copied" : "Copy"}
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
          frameStyle={frameStyle}
          setFrameStyle={setFrameStyle}
          frameText={frameText}
          setFrameText={setFrameText}
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
      style={{ backgroundColor: "var(--background)" }}
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl border p-6 shadow-lg"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="mb-4 font-semibold text-lg"
          style={{ color: "var(--foreground)" }}
        >
          Download QR Code
        </h2>

        <div className="space-y-4">
          {/* File Name Input */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              style={{ color: "var(--foreground)" }}
            >
              File Name
            </label>
            <input
              type="text"
              value={downloadName}
              onChange={(e) => setDownloadName(e.target.value || "qrcode")}
              placeholder="qrcode"
              className="w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              style={{ color: "var(--foreground)" }}
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
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card)",
                  color: "var(--foreground)",
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
            style={{ backgroundColor: "var(--primary)" }}
          >
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-lg border px-4 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
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
  frameStyle: FrameStyle;
  setFrameStyle: (style: FrameStyle) => void;
  frameText: string;
  setFrameText: (text: string) => void;
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
  frameStyle,
  setFrameStyle,
  frameText,
  setFrameText,
}: OptionsModalProps) {
  const initialStateRef = useRef<{
    dotShape: QrDotShape;
    downloadName: string;
    downloadFormat: QrDownloadFormat;
    logoDataUrl: string;
    logoSize: number;
    frameStyle: FrameStyle;
    frameText: string;
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
        frameStyle,
        frameText,
      };
    }
  }, [
    dotShape,
    downloadFormat,
    downloadName,
    isOpen,
    logoDataUrl,
    logoSize,
    frameStyle,
    frameText,
  ]);

  if (!isOpen) return null;

  const handleCancel = () => {
    const initial = initialStateRef.current;
    if (initial) {
      setDotShape(initial.dotShape);
      setDownloadName(initial.downloadName);
      setDownloadFormat(initial.downloadFormat);
      setLogoDataUrl(initial.logoDataUrl);
      setLogoSize(initial.logoSize);
      setFrameStyle(initial.frameStyle);
      setFrameText(initial.frameText);
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
          {/* Frame Section */}
          <div className="space-y-4 border-slate-200 border-t pt-4 dark:border-slate-700">
            <div className="space-y-2">
              <Label className="font-medium text-slate-700 dark:text-slate-300">
                Frame Style
              </Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { value: "none", label: "None" },
                  { value: "minimal", label: "Minimal" },
                  { value: "rounded", label: "Rounded" },
                  { value: "banner", label: "Banner" },
                  { value: "polaroid", label: "Polaroid" },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrameStyle(f.value as FrameStyle)}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                      frameStyle === f.value
                        ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    <span className="font-medium text-slate-700 text-xs dark:text-slate-300">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {(frameStyle === "banner" || frameStyle === "polaroid") && (
              <div className="space-y-2">
                <Label className="font-medium text-slate-700 dark:text-slate-300">
                  Frame Text
                </Label>
                <input
                  value={frameText}
                  onChange={(e) => setFrameText(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 text-sm transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}
          </div>

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
                  "image/png": [".png"],
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/webp": [".webp"],
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
                  onClick={() => setLogoDataUrl("")}
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
                onChange={(e) => setDownloadName(e.target.value || "qrcode")}
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
