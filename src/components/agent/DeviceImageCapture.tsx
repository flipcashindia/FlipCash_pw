// src/components/agent/DeviceImageCapture.tsx
// Component for capturing device inspection images

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  Check,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Trash2,
  // Loader2,
  AlertCircle,
} from 'lucide-react';

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

const IMAGE_SLOTS: ImageSlot[] = [
  {
    key: 'front',
    label: 'Front View',
    description: 'Capture the front of the device showing the screen',
    required: true,
  },
  {
    key: 'back',
    label: 'Back View',
    description: 'Capture the back of the device',
    required: true,
  },
  {
    key: 'screen',
    label: 'Screen Close-up',
    description: 'Capture any scratches or damage on screen',
    required: false,
  },
  {
    key: 'imei',
    label: 'IMEI/Serial Number',
    description: 'Capture the IMEI from device settings',
    required: true,
  },
];

interface DeviceImageCaptureProps {
  images: Record<string, string>;
  onImagesChange: (images: Record<string, string>) => void;
  onUpload?: (key: string, file: File) => Promise<string>;
  isUploading?: boolean;
}

const DeviceImageCapture: React.FC<DeviceImageCaptureProps> = ({
  images,
  onImagesChange,
  onUpload,
}) => {
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (slotKey: string) => {
    setActiveSlot(slotKey);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      setCameraStream(stream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions or use file upload.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCapturedImage(null);
    setActiveSlot(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
    }
  };

  const confirmCapture = () => {
    if (capturedImage && activeSlot) {
      onImagesChange({
        ...images,
        [activeSlot]: capturedImage,
      });
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlot) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      if (onUpload) {
        try {
          const url = await onUpload(activeSlot, file);
          onImagesChange({
            ...images,
            [activeSlot]: url,
          });
        } catch (err) {
          onImagesChange({
            ...images,
            [activeSlot]: base64,
          });
        }
      } else {
        onImagesChange({
          ...images,
          [activeSlot]: base64,
        });
      }
      
      setActiveSlot(null);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (key: string) => {
    const newImages = { ...images };
    delete newImages[key];
    onImagesChange(newImages);
  };

  const openFileSelector = (slotKey: string) => {
    setActiveSlot(slotKey);
    fileInputRef.current?.click();
  };

  const getCompletedCount = () => {
    return IMAGE_SLOTS.filter(slot => images[slot.key]).length;
  };

  const getRequiredCount = () => {
    return IMAGE_SLOTS.filter(slot => slot.required).length;
  };

  const getRequiredCompletedCount = () => {
    return IMAGE_SLOTS.filter(slot => slot.required && images[slot.key]).length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#1C1C1B]">Device Photos</h3>
          <p className="text-sm text-gray-500">
            {getCompletedCount()} of {IMAGE_SLOTS.length} photos captured
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          getRequiredCompletedCount() >= getRequiredCount()
            ? 'bg-[#1B8A05]/20 text-[#1B8A05]'
            : 'bg-[#FEC925]/20 text-[#b48f00]'
        }`}>
          {getRequiredCompletedCount()}/{getRequiredCount()} required
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-3">
        {IMAGE_SLOTS.map((slot) => (
          <div key={slot.key} className="relative">
            {images[slot.key] ? (
              // Image preview
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#1B8A05]">
                <img
                  src={images[slot.key]}
                  alt={slot.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-[#1B8A05] text-white text-xs font-bold rounded-lg flex items-center gap-1">
                  <Check size={12} />
                  {slot.label}
                </div>
                <button
                  onClick={() => removeImage(slot.key)}
                  className="absolute top-2 right-2 p-1.5 bg-[#FF0000] text-white rounded-full hover:bg-red-600 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              // Empty slot
              <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-4">
                <ImageIcon className="text-gray-400 mb-2" size={24} />
                <p className="text-sm font-semibold text-gray-600 text-center">{slot.label}</p>
                {slot.required && (
                  <span className="text-xs text-[#FF0000]">Required</span>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => startCamera(slot.key)}
                    className="p-2 bg-[#FEC925] text-[#1C1C1B] rounded-lg hover:bg-[#e5b520] transition"
                    title="Take photo"
                  >
                    <Camera size={18} />
                  </button>
                  <button
                    onClick={() => openFileSelector(slot.key)}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    title="Upload file"
                  >
                    <Upload size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Video Feed / Captured Image */}
            <div className="relative h-full flex items-center justify-center">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">
                    {IMAGE_SLOTS.find(s => s.key === activeSlot)?.label}
                  </p>
                  <p className="text-white/70 text-sm">
                    {IMAGE_SLOTS.find(s => s.key === activeSlot)?.description}
                  </p>
                </div>
                <button
                  onClick={stopCamera}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                >
                  <X className="text-white" size={24} />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-6">
                {capturedImage ? (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="flex flex-col items-center gap-1 text-white"
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <RotateCcw size={24} />
                      </div>
                      <span className="text-sm">Retake</span>
                    </button>
                    <button
                      onClick={confirmCapture}
                      className="flex flex-col items-center gap-1 text-white"
                    >
                      <div className="w-14 h-14 bg-[#1B8A05] rounded-full flex items-center justify-center">
                        <Check size={28} />
                      </div>
                      <span className="text-sm">Use Photo</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30"
                  >
                    <div className="w-16 h-16 bg-[#FEC925] rounded-full flex items-center justify-center">
                      <Camera className="text-[#1C1C1B]" size={28} />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceImageCapture;
