import axios from 'axios';
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { type PresignedUrl } from '../../types/common.types';

export const mediaService = {
  async getPresignedUrls(files: { name: string; type: string }[]): Promise<PresignedUrl[]> {
    const response = await apiClient.post(API_ENDPOINTS.MEDIA.PRESIGN, { files });
    return response.data.presigns;
  },

  async uploadToS3(url: string, file: File): Promise<void> {
    await axios.put(url, file, {
      headers: { 'Content-Type': file.type },
    });
  },

  async uploadImages(files: File[]): Promise<string[]> {
    const fileInfos = files.map((f) => ({ name: f.name, type: f.type }));
    const presigns = await this.getPresignedUrls(fileInfos);

    await Promise.all(
      presigns.map((presign, index) => this.uploadToS3(presign.url, files[index]))
    );

    return presigns.map((p) => p.file_url);
  },
};