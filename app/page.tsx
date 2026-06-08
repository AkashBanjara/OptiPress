"use client";

import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { 
  UploadCloud, 
  Download, 
  RefreshCw, 
  FileImage, 
  AlertCircle, 
  Sliders, 
  Sparkles, 
  Lock, 
  Scaling, 
  Info,
  Maximize2,
  Sun,
  Moon,
  RotateCw,
  Scissors,
  FlipHorizontal,
  FlipVertical,
  Check,
  ChevronDown
} from "lucide-react";
import { useImageCompressor, CropArea } from "./hooks/use-image-compressor";

// Helper to format bytes to human readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Preset visual filter configurations
const FILTER_PRESETS = [
  { name: "Original 🌈", filter: "none" },
  { name: "Brighten ☀️", filter: "brightness(1.25) contrast(1.05)" },
  { name: "Grayscale 🖤", filter: "grayscale(100%)" },
  { name: "Warm Sepia 🍂", filter: "sepia(80%) brightness(1.05) contrast(0.95)" },
  { name: "Cool Blue ❄️", filter: "hue-rotate(180deg) saturate(1.2)" },
];

export default function Home() {
  // Theme State (default to light)
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Image Source File
  const [file, setFile] = useState<File | null>(null);
  
  // Compression & Format Settings
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<string>("image/jpeg");
  const [scale, setScale] = useState<number>(100);
  
  // Editing Settings
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [crop, setCrop] = useState<CropArea | null>(null);
  const [cropPresetName, setCropPresetName] = useState<string>("full");

  // Custom Click-and-Drag Cropping States
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawingCrop, setIsDrawingCrop] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive Crop States
  const [isDraggingCropBox, setIsDraggingCropBox] = useState<boolean>(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null);
  const dragStartClientRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cropStartValRef = useRef<CropArea | null>(null);

  // Preview Mode: "split" (Squoosh slider) or "side-by-side"
  const [previewMode, setPreviewMode] = useState<"split" | "side-by-side">("split");

  // Draggable Split Comparison Slider coordinates
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const comparisonContainerRef = useRef<HTMLDivElement>(null);

  // Drag-and-drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // SEO FAQ Collapsible State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Custom hook for Canvas image manipulation
  const {
    originalStats,
    compressedStats,
    isProcessing,
    error: compressionError,
  } = useImageCompressor(file, quality, format, scale, rotation, flipH, flipV, activeFilter, crop);

  const [localError, setLocalError] = useState<string | null>(null);
  const displayError = localError || compressionError;

  // Toggle HTML class for theme styling
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Handle draggable split-pane slider
  useEffect(() => {
    if (!isDraggingSlider) return;

    const handleMove = (clientX: number) => {
      if (!comparisonContainerRef.current) return;
      const rect = comparisonContainerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSlider(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDraggingSlider]);

  // Drag-and-drop file upload handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setLocalError(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
      } else {
        setLocalError("Oops! That file is not a photo. Please select a JPEG, PNG, or WebP file.");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
      } else {
        setLocalError("Oops! That file is not a photo. Please select a JPEG, PNG, or WebP file.");
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Reset helper
  const handleReset = () => {
    setFile(null);
    setQuality(80);
    setFormat("image/jpeg");
    setScale(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setActiveFilter("none");
    setCrop(null);
    setCropPresetName("full");
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download Trigger
  const handleDownload = () => {
    if (!compressedStats || !originalStats) return;

    const nameParts = originalStats.name.split(".");
    if (nameParts.length > 1) {
      nameParts.pop();
    }
    const baseName = nameParts.join(".");
    
    let extension = "jpg";
    if (format === "image/webp") extension = "webp";
    if (format === "image/png") extension = "png";
    if (format === "image/bmp") extension = "bmp";
    if (format === "image/gif") extension = "gif";

    const downloadName = `${baseName}_optimized.${extension}`;

    const link = document.createElement("a");
    link.href = compressedStats.url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preset aspect ratio calculations
  const applyAspectCrop = (aspectName: string) => {
    setCropPresetName(aspectName);
    if (aspectName === "custom") {
      // Custom crop mode -> auto switch to side-by-side mode so user can draw easily on the original panel
      setPreviewMode("side-by-side");
      setCrop(null); // start fresh
      return;
    }

    if (aspectName === "full" || !originalStats) {
      setCrop(null);
      return;
    }

    // Auto-switch to Side-by-Side view so the crop handles are immediately visible and interactive
    setPreviewMode("side-by-side");

    const imageAspect = originalStats.width / originalStats.height;
    let targetAspect = 1.0; 
    if (aspectName === "16:9") targetAspect = 16 / 9;
    if (aspectName === "4:5") targetAspect = 4 / 5;

    let x = 0;
    let y = 0;
    let w = 1.0;
    let h = 1.0;

    if (imageAspect > targetAspect) {
      w = targetAspect / imageAspect;
      x = (1.0 - w) / 2;
    } else {
      h = imageAspect / targetAspect;
      y = (1.0 - h) / 2;
    }

    setCrop({ x, y, width: w, height: h });
  };

  // Click-and-drag cropping logic (drawing new custom crop)
  const handleCropStart = (clientX: number, clientY: number) => {
    if (cropPresetName !== "custom" || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setDragStart({ x, y });
    setDragCurrent({ x, y });
    setIsDrawingCrop(true);
  };

  const handleCropMove = (clientX: number, clientY: number) => {
    if (!isDrawingCrop || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setDragCurrent({ x, y });
  };

  const handleCropEnd = () => {
    if (!isDrawingCrop || !cropContainerRef.current) return;
    setIsDrawingCrop(false);
    const rect = cropContainerRef.current.getBoundingClientRect();

    const left = Math.min(dragStart.x, dragCurrent.x);
    const top = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragStart.x - dragCurrent.x);
    const height = Math.abs(dragStart.y - dragCurrent.y);

    // If box size is too tiny, skip cropping
    if (width < 10 || height < 10) {
      return;
    }

    // Normalizing values relative to full rendered image dimensions
    const normalizedCrop: CropArea = {
      x: left / rect.width,
      y: top / rect.height,
      width: width / rect.width,
      height: height / rect.height,
    };

    setCrop(normalizedCrop);
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    handleCropStart(e.clientX, e.clientY);
  };

  const handleCropTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleCropStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    handleCropMove(e.clientX, e.clientY);
  };

  const handleCropTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleCropMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCropMouseUp = () => {
    handleCropEnd();
  };

  // Dragging the crop box center coordinates
  const handleCropBoxDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ("button" in e && e.button !== 0) return; // Left click only
    if (!crop) return;

    e.stopPropagation(); // Prevent starting a new box drawing

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartClientRef.current = { x: clientX, y: clientY };
    cropStartValRef.current = crop;
    setIsDraggingCropBox(true);
  };

  // Resizing the crop box handles
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    if ("button" in e && e.button !== 0) return; // Left click only
    if (!crop) return;

    e.stopPropagation(); // Prevent dragging the crop box itself or drawing a new box

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartClientRef.current = { x: clientX, y: clientY };
    cropStartValRef.current = crop;
    setActiveResizeHandle(handle);
  };

  // Drag-and-resize listener hook
  useEffect(() => {
    if (!isDraggingCropBox && !activeResizeHandle) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!cropContainerRef.current || !originalStats || !cropStartValRef.current) return;

      const rect = cropContainerRef.current.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      const dx = clientX - dragStartClientRef.current.x;
      const dy = clientY - dragStartClientRef.current.y;

      const ndx = dx / W;
      const ndy = dy / H;

      const start = cropStartValRef.current;

      if (isDraggingCropBox) {
        // Translate the whole crop box
        let newX = start.x + ndx;
        let newY = start.y + ndy;

        newX = Math.max(0, Math.min(1 - start.width, newX));
        newY = Math.max(0, Math.min(1 - start.height, newY));

        setCrop({
          ...start,
          x: newX,
          y: newY,
        });
      } else if (activeResizeHandle) {
        // Resize selection
        const isAspectLocked = cropPresetName !== "custom" && cropPresetName !== "full";
        
        let targetAspect = 1.0;
        if (cropPresetName === "16:9") targetAspect = 16 / 9;
        if (cropPresetName === "4:5") targetAspect = 4 / 5;

        const imageAspect = originalStats.width / originalStats.height;
        const R = targetAspect / imageAspect; // w / h ratio in normalized coordinates

        if (isAspectLocked) {
          const rightX = start.x + start.width;
          const bottomY = start.y + start.height;

          if (activeResizeHandle === "se") {
            let w = start.width + ndx;
            w = Math.max(0.05, Math.min(1 - start.x, w));
            let h = w / R;
            if (h > 1 - start.y) {
              h = 1 - start.y;
              w = h * R;
            }
            if (w > 1 - start.x) {
              w = 1 - start.x;
              h = w / R;
            }
            setCrop({ x: start.x, y: start.y, width: w, height: h });
          } else if (activeResizeHandle === "sw") {
            let w = start.width - ndx;
            w = Math.max(0.05, Math.min(rightX, w));
            let h = w / R;
            if (h > 1 - start.y) {
              h = 1 - start.y;
              w = h * R;
            }
            if (w > rightX) {
              w = rightX;
              h = w / R;
            }
            setCrop({ x: rightX - w, y: start.y, width: w, height: h });
          } else if (activeResizeHandle === "ne") {
            let w = start.width + ndx;
            w = Math.max(0.05, Math.min(1 - start.x, w));
            let h = w / R;
            if (h > bottomY) {
              h = bottomY;
              w = h * R;
            }
            if (w > 1 - start.x) {
              w = 1 - start.x;
              h = w / R;
            }
            setCrop({ x: start.x, y: bottomY - h, width: w, height: h });
          } else if (activeResizeHandle === "nw") {
            let w = start.width - ndx;
            w = Math.max(0.05, Math.min(rightX, w));
            let h = w / R;
            if (h > bottomY) {
              h = bottomY;
              w = h * R;
            }
            if (w > rightX) {
              w = rightX;
              h = w / R;
            }
            setCrop({ x: rightX - w, y: bottomY - h, width: w, height: h });
          }
        } else {
          // Custom / Free crop resizing
          const rightX = start.x + start.width;
          const bottomY = start.y + start.height;

          let newX = start.x;
          let newY = start.y;
          let newW = start.width;
          let newH = start.height;

          switch (activeResizeHandle) {
            case "se":
              newW = Math.max(0.05, Math.min(1 - start.x, start.width + ndx));
              newH = Math.max(0.05, Math.min(1 - start.y, start.height + ndy));
              break;
            case "sw":
              newW = Math.max(0.05, Math.min(rightX, start.width - ndx));
              newX = rightX - newW;
              newH = Math.max(0.05, Math.min(1 - start.y, start.height + ndy));
              break;
            case "ne":
              newW = Math.max(0.05, Math.min(1 - start.x, start.width + ndx));
              newH = Math.max(0.05, Math.min(bottomY, start.height - ndy));
              newY = bottomY - newH;
              break;
            case "nw":
              newW = Math.max(0.05, Math.min(rightX, start.width - ndx));
              newX = rightX - newW;
              newH = Math.max(0.05, Math.min(bottomY, start.height - ndy));
              newY = bottomY - newH;
              break;
            case "n":
              newH = Math.max(0.05, Math.min(bottomY, start.height - ndy));
              newY = bottomY - newH;
              break;
            case "s":
              newH = Math.max(0.05, Math.min(1 - start.y, start.height + ndy));
              break;
            case "e":
              newW = Math.max(0.05, Math.min(1 - start.x, start.width + ndx));
              break;
            case "w":
              newW = Math.max(0.05, Math.min(rightX, start.width - ndx));
              newX = rightX - newW;
              break;
          }

          setCrop({
            x: newX,
            y: newY,
            width: newW,
            height: newH,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCropBox(false);
      setActiveResizeHandle(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDraggingCropBox, activeResizeHandle, cropPresetName, originalStats]);

  const isPng = format === "image/png";

  return (
    <main className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-100 antialiased transition-colors duration-300">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 dark:bg-indigo-900/10 blur-[120px] pointer-events-none animate-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-500/5 dark:bg-violet-900/10 blur-[120px] pointer-events-none animate-glow" style={{ animationDelay: "-4s" }} />

      {/* Top Navbar */}
      <nav className="w-full border-b border-zinc-200/80 dark:border-zinc-900/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md relative z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-black shadow-md shadow-indigo-500/20">
              ⚡
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
              OptiPress
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-xs transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-start">
        
        {/* Child-Friendly Steps Wizard */}
        <div className="w-full max-w-2xl mx-auto mb-8 grid grid-cols-3 gap-2 text-center">
          <div className={`p-3 rounded-2xl transition-all border ${
            !file 
              ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs scale-102"
              : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/10 text-emerald-600 dark:text-emerald-500"
          }`}>
            <div className="text-xl sm:text-2xl mb-1">🖼️</div>
            <div className="text-xs font-bold">1. Upload Image</div>
          </div>
          <div className={`p-3 rounded-2xl transition-all border ${
            file && !compressedStats
              ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs scale-102"
              : file && compressedStats
              ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/10 text-emerald-600 dark:text-emerald-500"
              : "bg-zinc-100/60 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-900/50 text-zinc-400"
          }`}>
            <div className="text-xl sm:text-2xl mb-1">✂️</div>
            <div className="text-xs font-bold">2. Edit & Shrink</div>
          </div>
          <div className={`p-3 rounded-2xl transition-all border ${
            file && compressedStats
              ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs scale-102"
              : "bg-zinc-100/60 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-900/50 text-zinc-400"
          }`}>
            <div className="text-xl sm:text-2xl mb-1">💾</div>
            <div className="text-xs font-bold">3. Save Photo</div>
          </div>
        </div>

        {/* Mascot Prompts */}
        <div className="w-full max-w-5xl mx-auto mb-6 bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center gap-4 shadow-xs">
          <div className="text-3xl animate-bounce">🐿️</div>
          <div>
            <span className="font-bold text-xs uppercase text-indigo-500 tracking-wider block">Opti says:</span>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {!file 
                ? "Hello! Drop any photo below, or click to find one on your computer. I'll make it smaller without making it blurry!"
                : displayError
                ? "Oops! Let's try another file. This one has some issues."
                : cropPresetName === "custom" && !crop
                ? "Custom Crop Mode Active! Click and drag your mouse/finger on the left 'Before' image to draw a crop box! ✂️"
                : isProcessing
                ? "I am shrinking and editing your picture right now! Hang tight..."
                : "Great photo! Play with the settings on the right, rotate it, filter it, or crop it to make it perfect!"}
            </p>
          </div>
        </div>

        {/* Workspace Display */}
        <div className="w-full max-w-5xl mx-auto">
          {displayError && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-600 dark:text-red-400 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Oops, something went wrong!</h4>
                <p className="text-xs mt-0.5">{displayError}</p>
              </div>
            </div>
          )}

          {!originalStats ? (
            /* Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`group border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 backdrop-blur-md flex flex-col items-center justify-center min-h-[380px] bg-white/50 dark:bg-zinc-900/30 ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/15 shadow-md scale-[0.99]"
                  : "border-zinc-300 dark:border-zinc-800 hover:border-indigo-400 hover:bg-white/80 dark:hover:bg-zinc-900/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <div className={`p-5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 group-hover:border-indigo-500/30 transition-all duration-300 group-hover:scale-110 shadow-md ${
                isDragOver ? "border-indigo-500 text-indigo-500 scale-110" : ""
              }`}>
                <UploadCloud className="w-12 h-12" />
              </div>

              <h3 className="mt-6 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Drag & drop your photo here
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                or click <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline font-bold">browse files</span> to select from your computer
              </p>
              
              <div className="mt-8 flex flex-wrap gap-3 items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">JPEG</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">PNG</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">WEBP</span>
              </div>

              {process.env.NODE_ENV === "development" && (
                <button
                  id="test-load-squirrel"
                  onClick={async (e) => {
                    e.stopPropagation(); // Prevent opening the file picker dialog
                    try {
                      const response = await fetch("/squirrel.png");
                      const blob = await response.blob();
                      const testFile = new File([blob], "squirrel.png", { type: "image/png" });
                      setFile(testFile);
                    } catch (err) {
                      console.error("Failed to load test image:", err);
                    }
                  }}
                  className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer z-10"
                >
                  🐿️ Try with Demo Image
                </button>
              )}
            </div>
          ) : (
            /* Workspace Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Visual Editor & Image Preview */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Visual Workspace Card */}
                <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
                  
                  {/* View Mode Toggle Tabs */}
                  <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-zinc-900/40 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewMode("split")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewMode === "split"
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                            : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                        }`}
                      >
                        <span>↔️</span>
                        Split View Slider
                      </button>
                      <button
                        onClick={() => setPreviewMode("side-by-side")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewMode === "side-by-side"
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                            : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                        }`}
                      >
                        <span>↕️</span>
                        Side-by-Side View
                      </button>
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold truncate max-w-[200px]" title={originalStats.name}>
                      📁 {originalStats.name}
                    </div>
                  </div>

                  {/* Rendering Previews */}
                  {previewMode === "side-by-side" ? (
                    /* Side-by-Side Layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-100/20 dark:bg-zinc-950/20">
                      
                      {/* Original Card */}
                      <div className="border border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div className="px-4 py-2.5 border-b border-zinc-200/80 dark:border-zinc-800/55 bg-zinc-100/40 dark:bg-zinc-900/50 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Before (Original)</span>
                          <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">{formatBytes(originalStats.size)}</span>
                        </div>
                        <div className="relative min-h-[260px] bg-zinc-150/40 dark:bg-zinc-950/50 flex items-center justify-center p-4">
                          
                          {/* Aspect Ratio Container for 1:1 coordinate mapping */}
                          <div 
                            ref={cropContainerRef}
                            className={`relative overflow-hidden select-none max-w-full rounded-lg shadow-sm border ${
                              cropPresetName === "custom" 
                                ? "cursor-crosshair border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                                : "border-transparent"
                            }`}
                            style={{
                              aspectRatio: originalStats.width / originalStats.height,
                              maxHeight: "260px",
                              width: "100%",
                            }}
                            onMouseDown={handleCropMouseDown}
                            onTouchStart={handleCropTouchStart}
                            onMouseMove={handleCropMouseMove}
                            onTouchMove={handleCropTouchMove}
                            onMouseUp={handleCropMouseUp}
                            onTouchEnd={handleCropMouseUp}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={originalStats.url}
                              alt="Original"
                              className="w-full h-full object-contain pointer-events-none select-none"
                            />
                            
                            {/* Rendering Active Crop Drag Outline (during drawing) */}
                            {isDrawingCrop && (
                              <div 
                                className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/10 pointer-events-none select-none z-20 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                                style={{
                                  left: `${Math.min(dragStart.x, dragCurrent.x)}px`,
                                  top: `${Math.min(dragStart.y, dragCurrent.y)}px`,
                                  width: `${Math.abs(dragStart.x - dragCurrent.x)}px`,
                                  height: `${Math.abs(dragStart.y - dragCurrent.y)}px`,
                                }}
                              />
                            )}

                            {/* Rendering Selected Crop Outline & Outside Shading */}
                            {!isDrawingCrop && crop && (
                              <div 
                                className="absolute border-2 border-indigo-500 bg-black/10 z-20 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] shadow-indigo-500/10 cursor-move"
                                style={{
                                  left: `${crop.x * 100}%`,
                                  top: `${crop.y * 100}%`,
                                  width: `${crop.width * 100}%`,
                                  height: `${crop.height * 100}%`,
                                }}
                                onMouseDown={handleCropBoxDragStart}
                                onTouchStart={handleCropBoxDragStart}
                              >
                                {/* Center Badge */}
                                <div className="absolute top-1.5 left-2 bg-indigo-600/90 backdrop-blur-xs text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider pointer-events-none select-none">
                                  {cropPresetName === "custom" ? "Custom Crop ✂️" : `${cropPresetName} Crop ✂️`}
                                </div>

                                {/* Rule of Thirds Alignment Grid */}
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                                  <div className="border-r border-b border-dashed border-white/60" />
                                  <div className="border-r border-b border-dashed border-white/60" />
                                  <div className="border-b border-dashed border-white/60" />
                                  <div className="border-r border-b border-dashed border-white/60" />
                                  <div className="border-r border-b border-dashed border-white/60" />
                                  <div className="border-b border-dashed border-white/60" />
                                  <div className="border-r border-dashed border-white/60" />
                                  <div className="border-r border-dashed border-white/60" />
                                  <div />
                                </div>

                                {/* Corner Handles */}
                                <div 
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full z-30 -top-1.5 -left-1.5 shadow-md hover:scale-125 transition-transform cursor-nwse-resize"
                                  onMouseDown={(e) => handleResizeStart(e, "nw")}
                                  onTouchStart={(e) => handleResizeStart(e, "nw")}
                                />
                                <div 
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full z-30 -top-1.5 -right-1.5 shadow-md hover:scale-125 transition-transform cursor-nesw-resize"
                                  onMouseDown={(e) => handleResizeStart(e, "ne")}
                                  onTouchStart={(e) => handleResizeStart(e, "ne")}
                                />
                                <div 
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full z-30 -bottom-1.5 -left-1.5 shadow-md hover:scale-125 transition-transform cursor-nesw-resize"
                                  onMouseDown={(e) => handleResizeStart(e, "sw")}
                                  onTouchStart={(e) => handleResizeStart(e, "sw")}
                                />
                                <div 
                                  className="absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full z-30 -bottom-1.5 -right-1.5 shadow-md hover:scale-125 transition-transform cursor-nwse-resize"
                                  onMouseDown={(e) => handleResizeStart(e, "se")}
                                  onTouchStart={(e) => handleResizeStart(e, "se")}
                                />

                                {/* Edge Handles (Custom Crop mode only allows free edge resizing) */}
                                {(cropPresetName === "custom" || cropPresetName === "full") && (
                                  <>
                                    <div 
                                      className="absolute h-2 -top-1 left-2.5 right-2.5 cursor-ns-resize z-25"
                                      onMouseDown={(e) => handleResizeStart(e, "n")}
                                      onTouchStart={(e) => handleResizeStart(e, "n")}
                                    />
                                    <div 
                                      className="absolute h-2 -bottom-1 left-2.5 right-2.5 cursor-ns-resize z-25"
                                      onMouseDown={(e) => handleResizeStart(e, "s")}
                                      onTouchStart={(e) => handleResizeStart(e, "s")}
                                    />
                                    <div 
                                      className="absolute w-2 -left-1 top-2.5 bottom-2.5 cursor-ew-resize z-25"
                                      onMouseDown={(e) => handleResizeStart(e, "w")}
                                      onTouchStart={(e) => handleResizeStart(e, "w")}
                                    />
                                    <div 
                                      className="absolute w-2 -right-1 top-2.5 bottom-2.5 cursor-ew-resize z-25"
                                      onMouseDown={(e) => handleResizeStart(e, "e")}
                                      onTouchStart={(e) => handleResizeStart(e, "e")}
                                    />
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          
                        </div>
                        <div className="p-3 bg-zinc-100/40 dark:bg-zinc-900/30 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold text-center border-t border-zinc-200/50 dark:border-zinc-800/50">
                          Dimensions: {originalStats.width} × {originalStats.height}px
                        </div>
                      </div>

                      {/* Optimized Card */}
                      <div className="border border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 rounded-2xl overflow-hidden flex flex-col justify-between relative">
                        <div className="px-4 py-2.5 border-b border-zinc-200/80 dark:border-zinc-800/55 bg-zinc-100/40 dark:bg-zinc-900/50 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">After (Optimized)</span>
                          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            {compressedStats ? formatBytes(compressedStats.size) : "Calculating..."}
                          </span>
                        </div>
                        <div className="relative min-h-[260px] bg-zinc-150/40 dark:bg-zinc-950/50 flex items-center justify-center p-4">
                          {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-15">
                              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                              <span className="text-[11px] font-bold text-indigo-500 mt-2">Updating...</span>
                            </div>
                          )}
                          {compressedStats?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={compressedStats.url}
                              alt="Optimized Preview"
                              className="max-h-[260px] max-w-full object-contain rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="text-zinc-400 dark:text-zinc-600 text-xs flex flex-col items-center">
                              <Maximize2 className="w-7 h-7 mb-2 opacity-50" />
                              <span>Processing preview...</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-zinc-100/40 dark:bg-zinc-900/30 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold text-center border-t border-zinc-200/50 dark:border-zinc-800/50">
                          Dimensions: {compressedStats ? `${compressedStats.width} × ${compressedStats.height}px` : "—"}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Squoosh-Style Draggable Slider Layout */
                    <div className="p-4 bg-zinc-100/20 dark:bg-zinc-950/20 flex flex-col items-center justify-center">
                      <div 
                        ref={comparisonContainerRef}
                        className="relative w-full max-w-[600px] aspect-auto bg-zinc-200 dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-inner select-none cursor-ew-resize"
                        style={{ minHeight: "280px", maxHeight: "380px" }}
                      >
                        {/* Background: Original Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={originalStats.url}
                          alt="Original"
                          className="w-full h-full object-contain pointer-events-none rounded-2xl"
                          style={{ maxHeight: "380px" }}
                        />

                        {/* Crop Guide representation inside slider */}
                        {crop && (
                          <div 
                            className="absolute border border-dashed border-indigo-500/60 pointer-events-none select-none z-10"
                            style={{
                              left: `${crop.x * 100}%`,
                              top: `${crop.y * 100}%`,
                              width: `${crop.width * 100}%`,
                              height: `${crop.height * 100}%`,
                            }}
                          />
                        )}

                        {/* Foreground Overlay: Compressed Image, clipped by width percentage */}
                        {compressedStats?.url && (
                          <div 
                            className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl"
                            style={{
                              clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={compressedStats.url}
                              alt="Optimized"
                              className="w-full h-full object-contain pointer-events-none"
                              style={{ maxHeight: "380px" }}
                            />
                          </div>
                        )}

                        {/* Centered Processing Loader Overlay */}
                        {isProcessing && (
                          <div className="absolute top-4 left-4 p-2 px-3 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-2 shadow-sm z-20">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        )}

                        {/* Comparison Labels */}
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white rounded-md text-[10px] font-bold z-20 pointer-events-none">
                          🕰️ Before (Left)
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-indigo-600/95 text-white rounded-md text-[10px] font-bold z-20 pointer-events-none">
                          🚀 After (Right)
                        </div>

                        {/* Slider Handle line and bubble */}
                        <div
                          style={{ left: `${sliderPosition}%` }}
                          onMouseDown={(e) => { e.preventDefault(); setIsDraggingSlider(true); }}
                          onTouchStart={() => setIsDraggingSlider(true)}
                          className="absolute top-0 bottom-0 w-1 bg-white dark:bg-zinc-200 cursor-ew-resize -translate-x-1/2 flex items-center justify-center z-35 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-150 text-indigo-600 shadow-md border border-zinc-200 dark:border-zinc-300 flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform select-none z-40">
                            <span className="text-xs font-bold leading-none select-none">↔️</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Visual Editing Toolbox section */}
                  <div className="p-6 border-t border-zinc-200/85 dark:border-zinc-800/85 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col gap-5">
                    
                    {/* 1. Basic transformations (Rotate, Mirror) */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider min-w-[70px]">
                        Rotate & Flip
                      </span>
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Spin photo 90 degrees clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Spin 90° 🔄</span>
                      </button>
                      <button
                        onClick={() => setFlipH(!flipH)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                          flipH 
                            ? "bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                            : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Flip Sideways ↔️</span>
                      </button>
                      <button
                        onClick={() => setFlipV(!flipV)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                          flipV 
                            ? "bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                            : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <FlipVertical className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Flip Upside Down ↕️</span>
                      </button>
                    </div>

                    {/* 2. Visual Filters presets */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Color Filters 🎨
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {FILTER_PRESETS.map((p) => {
                          const isActive = activeFilter === p.filter;
                          return (
                            <button
                              key={p.name}
                              onClick={() => setActiveFilter(p.filter)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700"
                              }`}
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Visual Crop ratios & Click-and-Drag Custom */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Crop Photo ✂️
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => applyAspectCrop("full")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            cropPresetName === "full"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <span>🖼️</span> Full Picture
                        </button>

                        <button
                          onClick={() => applyAspectCrop("custom")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            cropPresetName === "custom"
                              ? "bg-indigo-600 text-white shadow-xs border-indigo-500/50"
                              : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-355 border border-zinc-200 dark:border-zinc-700"
                          }`}
                          title="Click and drag over the original image on the left to crop"
                        >
                          <span>🖱️</span> Draw Custom Box
                        </button>

                        <button
                          onClick={() => applyAspectCrop("1:1")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            cropPresetName === "1:1"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <span>⏹️</span> Square (1:1)
                        </button>
                        <button
                          onClick={() => applyAspectCrop("16:9")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            cropPresetName === "16:9"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <span>📺</span> Landscape (16:9)
                        </button>
                        <button
                          onClick={() => applyAspectCrop("4:5")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            cropPresetName === "4:5"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          <span>📱</span> Portrait (4:5)
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: Settings & Download actions */}
              <div className="lg:col-span-4 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col gap-6">
                
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">Controls</h2>
                </div>

                {/* 1. Format Selection (Expanded with BMP and GIF) */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="format-select-child" className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    File Type 📁
                  </label>
                  <div className="relative">
                    <select
                      id="format-select-child"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-200 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="image/jpeg">JPEG (For general photos)</option>
                      <option value="image/webp">WebP (Best small file size)</option>
                      <option value="image/png">PNG (Best quality - Lossless)</option>
                      <option value="image/bmp">BMP (Bitmap - Uncompressed)</option>
                      <option value="image/gif">GIF (Static Frame)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Scale / Size Selection with Presets */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                      <Scaling className="w-3.5 h-3.5" />
                      Photo Size 📏
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black">{scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={scale}
                    onChange={(e) => setScale(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-950 rounded-lg cursor-pointer appearance-none border border-transparent dark:border-zinc-800/50"
                  />
                  
                  {/* Scale Presets */}
                  <div className="grid grid-cols-4 gap-1.5 mt-1">
                    {[
                      { label: "Tiny ✉️", val: 25 },
                      { label: "Half 📱", val: 50 },
                      { label: "Medium 📸", val: 75 },
                      { label: "Full 🌟", val: 100 }
                    ].map((item) => {
                      const isSel = scale === item.val;
                      return (
                        <button
                          key={item.label}
                          onClick={() => setScale(item.val)}
                          className={`py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            isSel
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quality Selection with Presets (Conditionally disabled for lossless formats) */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    <span>Image Sharpness ⭐</span>
                    <span className={`text-sm font-black ${isPng || format === "image/bmp" ? "text-zinc-400 dark:text-zinc-600 line-through" : "text-indigo-600 dark:text-indigo-400"}`}>
                      {isPng || format === "image/bmp" ? "—" : `${quality}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    disabled={isPng || format === "image/bmp"}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className={`w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-950 rounded-lg appearance-none border border-transparent dark:border-zinc-800/50 ${
                      isPng || format === "image/bmp" ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  />
                  
                  {/* Quality Presets */}
                  {isPng || format === "image/bmp" ? (
                    <div className="mt-1 p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-955 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>
                        Quality adjustment is not supported for {format === "image/bmp" ? "BMP" : "PNG"} because it is a lossless format.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      {[
                        { label: "Fuzzy / Tiny 💾", val: 30 },
                        { label: "Balanced ⚖️", val: 70 },
                        { label: "Super Sharp ⭐", val: 90 }
                      ].map((item) => {
                        const isSel = quality === item.val;
                        return (
                          <button
                            key={item.label}
                            onClick={() => setQuality(item.val)}
                            className={`py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              isSel
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Visual Size Savings Dashboard */}
                {compressedStats && (
                  <div className="mt-3 p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/15 bg-emerald-500/5 dark:bg-emerald-955/10 flex flex-col gap-2 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Shrink Status</span>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span>{formatBytes(originalStats.size)}</span>
                      <span>➔</span>
                      <span className="font-extrabold text-zinc-900 dark:text-white">{formatBytes(compressedStats.size)}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {compressedStats.size <= originalStats.size ? "-" : "+"}
                        {compressedStats.reductionPercent}%
                      </span>
                      <span className="text-xs font-bold text-emerald-600/90 dark:text-emerald-400/90">
                        {compressedStats.size <= originalStats.size ? "smaller! 🎉" : "larger ⚠️"}
                      </span>
                    </div>
                  </div>
                )}

                {/* 5. Action Buttons (Download & Reset) */}
                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !compressedStats}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed disabled:transform-none text-white text-sm font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Save Photo to Computer 💾
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full bg-zinc-200/60 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 active:scale-[0.98] border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset & Start Over 🔄
                  </button>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* SEO Features & FAQ Section */}
        <hr className="my-12 border-zinc-200/80 dark:border-zinc-800/80 max-w-5xl mx-auto w-full" />

        <section className="w-full max-w-5xl mx-auto flex flex-col gap-12 pb-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Why OptiPress is the Safest & Fastest Free Image Compressor
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              An enterprise-grade, serverless image compression and editing tool designed for privacy, speed, and efficiency. Cut file sizes by up to 90% without losing quality.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-2">100% Client-Side Privacy</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Your photos never touch any backend servers. All image compression, resizing, and cropping operations happen completely inside your browser using HTML5 Canvas APIs. Safe for personal and confidential images.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-2">Instant Offline Speed</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                By processing files locally, OptiPress bypasses file upload queues and network latencies. Get compressed results in milliseconds—even when you are offline.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md hover:scale-102 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-4">📐</div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-2">Precision Editing Controls</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Fine-tune image files with built-in crop presets, custom drag-and-resize boxes, rotation sliders, and format conversion. Compress JPEG, PNG, WebP, BMP, and GIF with ease.
              </p>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Everything you need to know about our browser-based image resizing software.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  q: "How can I compress image files without losing quality?",
                  a: "OptiPress uses custom-tuned browser canvas rendering algorithms. By adjusting the sharpness quality slider and the scaling percentage, you can reduce the file size by up to 90% while preserving excellent visual clarity."
                },
                {
                  q: "Is it safe to upload my pictures to online resizers?",
                  a: "Yes, with OptiPress it is completely safe. OptiPress runs entirely client-side. Your photos are loaded and processed locally in your browser and are never uploaded to any backend servers. Your data stays private."
                },
                {
                  q: "What image formats are supported by OptiPress?",
                  a: "OptiPress supports loading and optimizing all major web image formats, including JPEG, PNG, WebP, BMP, and static GIF frames. You can convert files between these formats on the fly."
                },
                {
                  q: "Is OptiPress completely free to use?",
                  a: "Yes, OptiPress is 100% free with no hidden charges, no email registration, no watermark overlays, and no limits on file sizes or counts."
                },
                {
                  q: "How can I convert images from JPG to WebP or PNG?",
                  a: "Converting formats (like JPG to WebP or PNG to JPEG) is built-in. Simply upload your image, select your desired format from the 'File Type' dropdown menu in the control panel, and save. The conversion runs instantly in your browser."
                },
                {
                  q: "Can I crop my images online using OptiPress?",
                  a: "Yes, OptiPress provides a fully interactive crop editor. Choose an aspect ratio preset (1:1, 16:9, 4:5) or click 'Draw Custom Box' and drag the corner and edge handles to frame your image perfectly."
                },
                {
                  q: "Can I compress images to a specific size like 100KB or 50KB?",
                  a: "Yes. As you adjust the quality and scale sliders, the 'Shrink Status' card shows the exact estimated output size in real-time. Adjust the sliders until the output size is under your target size (e.g. 100KB or 50KB) and click download."
                }
              ].map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white/50 dark:bg-zinc-900/10 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-xs text-indigo-500 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        ▼
                      </span>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <p className="px-6 pb-5 text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-850/50 pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-zinc-200/50 dark:border-zinc-900/50 backdrop-blur-xs relative z-10 transition-colors duration-300">
        <p className="text-xs text-zinc-500 dark:text-zinc-600 flex items-center justify-center gap-1.5 font-bold">
          <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          Secure & Private • Photos never leave your device
        </p>
      </footer>
    </main>
  );
}
