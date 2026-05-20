/**
 * Cloudinary Storage Service
 * 
 * Setup Instructions:
 * 1. Create account at https://cloudinary.com
 * 2. Get credentials from Dashboard
 * 3. Create unsigned upload preset:
 *    - Settings → Upload → Add upload preset
 *    - Mode: Unsigned
 *    - Folder: ahmad-costimetics
 *    - Save and copy preset name
 * 4. Add to .env file
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ahmad_costimetics';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export type UploadFolder = 
  | 'products' 
  | 'categories' 
  | 'banners' 
  | 'profiles' 
  | 'payments' 
  | 'chat' 
  | 'documents';

interface UploadOptions {
  folder?: UploadFolder;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  maxFileSize?: number; // in MB
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
  onProgress?: (progress: number) => void;
}

/**
 * Validate file before upload
 */
function validateFile(
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const { 
    maxFileSize = 5, 
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] 
  } = options;

  // Size check
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxFileSize) {
    return { valid: false, error: `File size exceeds ${maxFileSize}MB limit` };
  }

  // Type check (only if allowedTypes specified)
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * Upload single file to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const { folder = 'products', tags = [], resourceType = 'auto', onProgress } = options;

  // Validate
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env');
  }

  // Build form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `ahmad-costimetics/${folder}`);
  
  // Try upload preset first; if not set, use unsigned upload with api_key
  if (UPLOAD_PRESET) {
    formData.append('upload_preset', UPLOAD_PRESET);
  }
  // Always include API key for authentication
  if (API_KEY) {
    formData.append('api_key', API_KEY);
  }
  // Timestamp for signature-less upload
  formData.append('timestamp', String(Math.round(Date.now() / 1000)));
  
  if (tags.length > 0) {
    formData.append('tags', tags.join(','));
  }

  // Use XHR for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (e) {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          const errMsg = error.error?.message || '';
          
          // If upload preset error, retry without preset
          if (errMsg.includes('preset') || errMsg.includes('Unknown API key') || errMsg.includes('upload_preset')) {
            console.warn('Upload preset failed, retrying with ml_default preset...');
            retryWithDefaultPreset(file, folder, tags, resourceType, onProgress)
              .then(resolve)
              .catch(reject);
            return;
          }
          
          reject(new Error(errMsg || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `${CLOUDINARY_URL}/${resourceType}/upload`);
    xhr.send(formData);
  });
}

/**
 * Retry upload with default preset or no preset
 */
async function retryWithDefaultPreset(
  file: File,
  folder: string,
  tags: string[],
  resourceType: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `ahmad-costimetics/${folder}`);
  formData.append('upload_preset', 'ml_default'); // Cloudinary's auto-created default preset
  
  if (tags.length > 0) {
    formData.append('tags', tags.join(','));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.open('POST', `${CLOUDINARY_URL}/${resourceType}/upload`);
    xhr.send(formData);
  });
}

/**
 * Upload multiple files
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  return Promise.all(files.map(file => uploadToCloudinary(file, options)));
}

/**
 * Delete file from Cloudinary
 * Note: Requires backend endpoint for security (signed deletion)
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // For production, this should call your backend which uses the API secret
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${apiUrl}/upload/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
}

/**
 * Build optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    gravity?: 'auto' | 'face' | 'center';
    blur?: number;
  } = {}
): string {
  if (!CLOUD_NAME) return publicId;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity,
    blur,
  } = options;

  const transformations: string[] = [`q_${quality}`, `f_${format}`];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (blur) transformations.push(`e_blur:${blur}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`;
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 200): string {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto',
  });
}

/**
 * Convert file to base64 (for preview before upload)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Upload product image
 */
export const uploadProductImage = (file: File, onProgress?: (p: number) => void) =>
  uploadToCloudinary(file, { 
    folder: 'products', 
    onProgress,
    maxFileSize: 5,
    tags: ['product'],
  });

/**
 * Helper: Upload category image
 */
export const uploadCategoryImage = (file: File, onProgress?: (p: number) => void) =>
  uploadToCloudinary(file, { 
    folder: 'categories', 
    onProgress,
    maxFileSize: 3,
    tags: ['category'],
  });

/**
 * Helper: Upload banner
 */
export const uploadBanner = (file: File, onProgress?: (p: number) => void) =>
  uploadToCloudinary(file, { 
    folder: 'banners', 
    onProgress,
    maxFileSize: 10,
    tags: ['banner'],
  });

/**
 * Helper: Upload payment proof
 */
export const uploadPaymentProof = (file: File, onProgress?: (p: number) => void) =>
  uploadToCloudinary(file, { 
    folder: 'payments', 
    onProgress,
    maxFileSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    tags: ['payment-proof'],
  });

/**
 * Helper: Upload profile photo
 */
export const uploadProfilePhoto = (file: File, onProgress?: (p: number) => void) =>
  uploadToCloudinary(file, { 
    folder: 'profiles', 
    onProgress,
    maxFileSize: 2,
    tags: ['profile'],
  });

/**
 * Helper: Upload chat attachment
 */
export const uploadChatAttachment = (file: File, onProgress?: (p: number) => void) =>
  uploadToCloudinary(file, { 
    folder: 'chat', 
    onProgress,
    maxFileSize: 10,
    tags: ['chat'],
  });

export const cloudinaryConfig = {
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  apiKey: API_KEY,
  isConfigured: !!CLOUD_NAME,
};
