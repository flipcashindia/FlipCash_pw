import { useState } from 'react';
import { mediaService } from '../api/services/mediaService';
import { validateImageFile, compressImage } from '../utils/imageUtils';
import { handleApiError } from '../utils/errorHandler';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      const compressedFiles = await Promise.all(
        files.map((file) => compressImage(file))
      );

      setProgress(30);

      const urls = await mediaService.uploadImages(compressedFiles);

      setProgress(100);
      return urls;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    progress,
    error,
    uploadImages,
  };
};