import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadToCloudinary, type UploadFolder, type CloudinaryUploadResult, fileToBase64 } from '../services/cloudinary';

interface UploadedImage {
  url: string;
  publicId: string;
  preview?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

interface ImageUploaderProps {
  folder?: UploadFolder;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // MB
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  onUploadComplete?: (results: CloudinaryUploadResult[]) => void;
  className?: string;
  label?: string;
  helperText?: string;
  accept?: string;
  showPreview?: boolean;
}

export default function ImageUploader({
  folder = 'products',
  multiple = false,
  maxFiles = 5,
  maxFileSize = 5,
  value = [],
  onChange,
  onUploadComplete,
  className = '',
  label = 'Upload Image',
  helperText,
  accept = 'image/*',
  showPreview = true,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(value);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImages = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages);
    onChange?.(newImages);
  }, [onChange]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    
    if (!multiple && files.length > 1) {
      files.splice(1);
    }

    if (multiple && images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Create preview entries with uploading state
    const newImages: UploadedImage[] = [];
    for (const file of files) {
      const preview = await fileToBase64(file);
      newImages.push({
        url: '',
        publicId: '',
        preview,
        uploading: true,
        progress: 0,
      });
    }

    const combined = multiple ? [...images, ...newImages] : newImages;
    updateImages(combined);

    // Upload each file
    const results: CloudinaryUploadResult[] = [];
    const startIndex = multiple ? images.length : 0;

    for (let i = 0; i < files.length; i++) {
      const fileIndex = startIndex + i;
      
      try {
        const result = await uploadToCloudinary(files[i], {
          folder,
          maxFileSize,
          onProgress: (progress) => {
            setImages(prev => {
              const updated = [...prev];
              if (updated[fileIndex]) {
                updated[fileIndex] = { ...updated[fileIndex], progress };
              }
              return updated;
            });
          },
        });

        results.push(result);

        setImages(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = {
              url: result.secure_url,
              publicId: result.public_id,
              preview: result.secure_url,
              uploading: false,
              progress: 100,
            };
          }
          onChange?.(updated);
          return updated;
        });
      } catch (error: any) {
        setImages(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              uploading: false,
              error: error.message || 'Upload failed',
            };
          }
          onChange?.(updated);
          return updated;
        });
      }
    }

    if (results.length > 0) {
      onUploadComplete?.(results);
    }
  }, [images, multiple, maxFiles, maxFileSize, folder, updateImages, onChange, onUploadComplete]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const updated = images.filter((_, i) => i !== index);
    updateImages(updated);
  }, [images, updateImages]);

  const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all
            ${dragActive 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm md:text-base font-medium text-gray-700">
                {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {multiple ? `Up to ${maxFiles} files` : 'Single file'}, max {maxFileSize}MB each
              </p>
              {helperText && (
                <p className="text-xs text-gray-500 mt-1">{helperText}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className={`mt-4 grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group"
            >
              {img.preview || img.url ? (
                <img
                  src={img.preview || img.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Uploading overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-xs font-medium">{img.progress || 0}%</span>
                  <div className="w-3/4 h-1 bg-white/30 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all"
                      style={{ width: `${img.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success indicator */}
              {!img.uploading && !img.error && img.url && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center text-white p-2 text-center">
                  <AlertCircle className="w-6 h-6 mb-1" />
                  <span className="text-xs">{img.error}</span>
                </div>
              )}

              {/* Remove button */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
