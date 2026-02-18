import React from 'react';
import { FaTrash } from 'react-icons/fa';
import FileUpload from './FileUpload';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

/**
 * Multi-image upload component with thumbnail previews and reordering
 */
const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = 'Images',
}) => {
  const handleAddImage = (base64: string) => {
    if (images.length < maxImages) {
      onImagesChange([...images, base64]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < images.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      onImagesChange(newImages);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300">
        {label} ({images.length}/{maxImages})
      </label>

      {/* Image Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 dark:bg-surface-800 rounded-lg overflow-hidden border border-gray-200 dark:border-surface-700"
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-contain p-1"
              />
              {/* First image badge */}
              {index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded">
                  Main
                </span>
              )}
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, 'up')}
                    className="p-1.5 bg-gray-200 dark:bg-surface-800 rounded text-gray-700 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-surface-700 text-xs"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600 text-xs"
                  title="Remove"
                >
                  <FaTrash size={10} />
                </button>
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, 'down')}
                    className="p-1.5 bg-gray-200 dark:bg-surface-800 rounded text-gray-700 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-surface-700 text-xs"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add More Image Button */}
      {images.length < maxImages && (
        <FileUpload
          label={images.length === 0 ? 'Add Image' : 'Add More Images'}
          accept="image/*"
          maxSize={5}
          onFileSelect={handleAddImage}
          preview={false}
          compact={images.length > 0}
        />
      )}

      <p className="text-xs text-gray-500 dark:text-neutral-400">
        First image will be used as the main display image. Hover to reorder or remove.
      </p>
    </div>
  );
};

export default MultiImageUpload;
