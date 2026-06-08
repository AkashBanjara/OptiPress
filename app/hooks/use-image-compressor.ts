import { useState, useEffect, useRef } from "react";

export interface ImageStats {
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
  url: string;
}

export interface CompressedStats {
  size: number;
  width: number;
  height: number;
  url: string;
  reductionPercent: number;
}

export interface CropArea {
  x: number; // 0 to 1 (fraction of original width)
  y: number; // 0 to 1 (fraction of original height)
  width: number; // 0 to 1
  height: number; // 0 to 1
}

export function useImageCompressor(
  file: File | null,
  quality: number, // 1 - 100
  format: string, // "image/jpeg" | "image/png" | "image/webp"
  scale: number, // 10 - 100
  rotation: number, // 0, 90, 180, 270
  flipH: boolean,
  flipV: boolean,
  filter: string, // canvas filter string (e.g., "none", "brightness(120%)")
  crop: CropArea | null
) {
  const [originalStats, setOriginalStats] = useState<ImageStats | null>(null);
  const [compressedStats, setCompressedStats] = useState<CompressedStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalUrlRef = useRef<string | null>(null);
  const compressedUrlRef = useRef<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const cleanupUrls = (cleanOriginal = true) => {
    if (cleanOriginal && originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current);
      compressedUrlRef.current = null;
    }
  };

  // 1. Handle File Loading
  useEffect(() => {
    if (!file) {
      setOriginalStats(null);
      setCompressedStats(null);
      setError(null);
      imageRef.current = null;
      cleanupUrls(true);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setIsProcessing(true);
    setError(null);
    cleanupUrls(true);

    const fileUrl = URL.createObjectURL(file);
    originalUrlRef.current = fileUrl;

    const img = new Image();
    img.src = fileUrl;

    img.onload = () => {
      imageRef.current = img;
      setOriginalStats({
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type,
        url: fileUrl,
      });
      setIsProcessing(false);
    };

    img.onerror = () => {
      setError("Failed to load image. The file might be corrupted.");
      setIsProcessing(false);
      imageRef.current = null;
      setOriginalStats(null);
    };
  }, [file]);

  // 2. Handle Debounced Edit + Compression
  useEffect(() => {
    const img = imageRef.current;
    if (!img || !originalStats) return;

    setIsProcessing(true);

    const performCompression = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setError("Failed to initialize canvas context.");
          setIsProcessing(false);
          return;
        }

        // Calculate source rectangle based on crop configuration
        const sx = crop ? crop.x * originalStats.width : 0;
        const sy = crop ? crop.y * originalStats.height : 0;
        const sw = crop ? crop.width * originalStats.width : originalStats.width;
        const sh = crop ? crop.height * originalStats.height : originalStats.height;

        // Apply scale factor to dimensions
        const scaleFactor = scale / 100;
        const scaledWidth = Math.max(1, Math.round(sw * scaleFactor));
        const scaledHeight = Math.max(1, Math.round(sh * scaleFactor));

        // Swapping dimensions for 90 or 270 degree rotation
        const isDimensionSwapped = rotation === 90 || rotation === 270;
        const canvasWidth = isDimensionSwapped ? scaledHeight : scaledWidth;
        const canvasHeight = isDimensionSwapped ? scaledWidth : scaledHeight;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Configure smooth image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Apply visual CSS filters (natively supported on canvas context)
        ctx.filter = filter || "none";

        // Translate context to center coordinate for rotation and flips
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Draw image section onto the rotated canvas context
        ctx.drawImage(
          img,
          sx,
          sy,
          sw,
          sh,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );

        const computedQuality = quality / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError("Failed to generate image output.");
              setIsProcessing(false);
              return;
            }

            if (compressedUrlRef.current) {
              URL.revokeObjectURL(compressedUrlRef.current);
            }

            const compressedUrl = URL.createObjectURL(blob);
            compressedUrlRef.current = compressedUrl;

            const reduction = originalStats.size > 0 
              ? Math.max(0, ((originalStats.size - blob.size) / originalStats.size) * 100)
              : 0;

            setCompressedStats({
              size: blob.size,
              width: canvasWidth,
              height: canvasHeight,
              url: compressedUrl,
              reductionPercent: parseFloat(reduction.toFixed(1)),
            });

            setError(null);
            setIsProcessing(false);
          },
          format,
          format === "image/png" ? undefined : computedQuality
        );
      } catch (err) {
        console.error("Compression error:", err);
        setError("An error occurred while compiling edits.");
        setIsProcessing(false);
      }
    };

    // Debounce compression by 150ms to keep sliders responsive
    const timer = setTimeout(performCompression, 150);

    return () => clearTimeout(timer);
  }, [originalStats, quality, format, scale, rotation, flipH, flipV, filter, crop]);

  // Clean up on component unmount
  useEffect(() => {
    return () => cleanupUrls(true);
  }, []);

  return {
    originalStats,
    compressedStats,
    isProcessing,
    error,
  };
}
