import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange, maxImages = 5, disabled = false }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remainingSlots = maxImages - files.length;
    const newFiles = selectedFiles.slice(0, remainingSlots);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    const updatedFiles = [...files, ...newFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onImagesChange(updatedFiles);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onImagesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {files.length < maxImages && (
          <label className={`border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-sm text-gray-500">{files.length} / {maxImages} images uploaded</p>
    </div>
  );
};