/**
 * usePhotoEstimate — Upload job site photos → Qwen Vision → AI line items
 *
 * Flow:
 *   1. User selects/captures photos (mobile camera or file picker)
 *   2. Files uploaded to Supabase Storage bucket 'quote-photos'
 *   3. Each photo sent to Qwen2.5-VL-72B-Instruct (vision model) for scene description
 *   4. All descriptions fed into generateEstimateFromScope() → line items
 *
 * Env vars:
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY — Supabase (already set)
 *   VITE_HF_TOKEN — HuggingFace token for Qwen Vision calls
 */

import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { generateEstimateFromScope } from '../lib/aiEngine';
import type { AIScopeResponse, ProjectType } from '../types';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const VISION_API_URL =
  'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-72B-Instruct/v1/chat/completions';

export type PhotoUploadStatus =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'generating'
  | 'done'
  | 'error';

export interface UploadedPhoto {
  id: string;
  file: File;
  previewUrl: string;      // local object URL for preview
  storageUrl?: string;     // Supabase Storage public URL
  storagePath?: string;    // path in bucket
  description?: string;    // Qwen Vision description
  status: 'pending' | 'uploading' | 'analyzing' | 'done' | 'error';
  error?: string;
}

export interface UsePhotoEstimateReturn {
  photos: UploadedPhoto[];
  overallStatus: PhotoUploadStatus;
  result: AIScopeResponse | null;
  error: string | null;
  addPhotos: (files: File[]) => void;
  removePhoto: (id: string) => void;
  runAnalysis: (projectType: ProjectType) => Promise<void>;
  reset: () => void;
  uploadProgress: number; // 0–100
}

export function usePhotoEstimate(): UsePhotoEstimateReturn {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [overallStatus, setOverallStatus] = useState<PhotoUploadStatus>('idle');
  const [result, setResult] = useState<AIScopeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addPhotos = useCallback((files: File[]) => {
    const MAX_PHOTOS = 10;
    const allowed = files.slice(0, MAX_PHOTOS - photos.length);
    const newPhotos: UploadedPhoto[] = allowed.map((file) => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setOverallStatus('idle');
    setResult(null);
  }, [photos.length]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const updatePhoto = (id: string, update: Partial<UploadedPhoto>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...update } : p))
    );
  };

  // Step 1: Upload a single photo to Supabase Storage
  const uploadToStorage = async (photo: UploadedPhoto): Promise<string> => {
    const ext = photo.file.name.split('.').pop() ?? 'jpg';
    const path = `quote-photos/${Date.now()}-${photo.id}.${ext}`;

    updatePhoto(photo.id, { status: 'uploading' });

    const { error: uploadError } = await supabase.storage
      .from('quote-photos')
      .upload(path, photo.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: photo.file.type,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: urlData } = supabase.storage
      .from('quote-photos')
      .getPublicUrl(path);

    updatePhoto(photo.id, {
      storageUrl: urlData.publicUrl,
      storagePath: path,
    });

    return urlData.publicUrl;
  };

  // Step 2: Describe a photo using Qwen Vision
  const describePhoto = async (photo: UploadedPhoto, publicUrl: string): Promise<string> => {
    updatePhoto(photo.id, { status: 'analyzing' });

    if (!HF_TOKEN) {
      // Mock description when no token set
      const mocks = [
        'Outdated kitchen with oak laminate cabinets, worn formica countertops, single-bowl drop-in sink, and old fluorescent lighting fixture. Tile floor shows cracking grout.',
        'Small bathroom with cultured marble vanity top, builder-grade mirror, fiberglass tub/shower combo with mold staining, and vinyl floor.',
        'Master bath with double vanity, separate shower stall with frameless glass door, freestanding soaking tub, and large format tile floor.',
      ];
      const desc = mocks[Math.floor(Math.random() * mocks.length)];
      updatePhoto(photo.id, { description: desc, status: 'done' });
      return desc;
    }

    const response = await fetch(VISION_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-VL-72B-Instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: publicUrl },
              },
              {
                type: 'text',
                text: `You are a remodeling contractor's estimating assistant analyzing a job site photo.
Describe what you see in detail focusing on:
1. Current condition of surfaces (cabinets, countertops, flooring, walls, tile)
2. Fixtures visible (faucets, sinks, toilets, lighting, appliances)
3. Obvious damage, wear, or items needing replacement
4. Approximate size/scale clues (window count, cabinet run length, etc.)
5. Style (modern, traditional, builder-grade, etc.)

Be specific and technical — your description will be used to generate a remodeling estimate.
Respond in 3-5 sentences, plain text only.`,
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error ${response.status}`);
    }

    const data = await response.json();
    const description = data?.choices?.[0]?.message?.content ?? 'Unable to analyze photo.';
    updatePhoto(photo.id, { description, status: 'done' });
    return description;
  };

  // Main runner: upload all → describe all → generate estimate
  const runAnalysis = useCallback(async (projectType: ProjectType) => {
    if (photos.length === 0) {
      setError('Please add at least one photo.');
      return;
    }

    setOverallStatus('uploading');
    setError(null);
    setResult(null);
    setUploadProgress(0);

    try {
      // Upload all photos
      const publicUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadToStorage(photos[i]);
        publicUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / photos.length) * 40)); // 0-40%
      }

      // Describe all photos with Qwen Vision
      setOverallStatus('analyzing');
      const descriptions: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const desc = await describePhoto(photos[i], publicUrls[i]);
        descriptions.push(desc);
        setUploadProgress(40 + Math.round(((i + 1) / photos.length) * 40)); // 40-80%
      }

      // Generate estimate from all descriptions
      setOverallStatus('generating');
      setUploadProgress(85);

      const estimate = await generateEstimateFromScope({
        projectType,
        photoDescriptions: descriptions,
      });

      setResult(estimate);
      setOverallStatus('done');
      setUploadProgress(100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
      setOverallStatus('error');
    }
  }, [photos]);

  const reset = useCallback(() => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setOverallStatus('idle');
    setResult(null);
    setError(null);
    setUploadProgress(0);
  }, [photos]);

  return {
    photos,
    overallStatus,
    result,
    error,
    addPhotos,
    removePhoto,
    runAnalysis,
    reset,
    uploadProgress,
  };
}
