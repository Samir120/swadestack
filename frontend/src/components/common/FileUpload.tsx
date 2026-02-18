import React, { useState } from 'react';
import { useToast } from './Toast';

interface FileUploadProps {
  onFileSelect: (base64: string, file: File | null) => void;
  currentUrl?: string;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  preview?: boolean;
  previewClassName?: string;
  compact?: boolean; // Compact mode - smaller button, no URL input, no preview
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  currentUrl,
  label,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  preview = true,
  previewClassName = 'h-32 w-auto object-contain',
  compact = false
}) => {
  const toast = useToast();
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    // Validate file type
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      
      // Validate that we have a proper data URI
      if (!result.startsWith('data:')) {
        console.error('Invalid data URI format:', result.substring(0, 50));
        toast.error('Error reading file. Please try again.');
        setIsUploading(false);
        return;
      }
      
      console.log('File loaded successfully. Data URI prefix:', result.substring(0, 30));
      console.log('Total size:', result.length, 'characters');
      
      setPreviewUrl(result);
      onFileSelect(result, file);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onFileSelect(url, null);
  };

  // Compact mode - simple button-like file input
  if (compact) {
    return (
      <div>
        <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 dark:bg-surface-800 dark:text-neutral-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-surface-700 transition-colors text-sm font-medium border border-dashed border-gray-300 dark:border-surface-600">
          <span>+ {label}</span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        {isUploading && (
          <span className="text-xs text-gray-500 dark:text-neutral-400 ml-2">Uploading...</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</label>

      {/* File Upload */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Upload File</label>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-surface-600 rounded-lg text-sm disabled:opacity-50"
        />
        {isUploading && (
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Uploading...</p>
        )}
      </div>

      {/* URL Input (Alternative) */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Or Enter URL</label>
        <input
          type="text"
          value={currentUrl || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.png"
          className="w-full px-3 py-2 border border-gray-300 dark:border-surface-600 rounded-lg text-sm"
        />
      </div>

      {/* Preview */}
      {preview && previewUrl && (
        <div>
          <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Preview</label>
          <div className="border border-gray-200 dark:border-surface-700 rounded-lg p-2 bg-gray-100 dark:bg-surface-800">
            <img
              src={previewUrl}
              alt="Preview"
              className={previewClassName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
