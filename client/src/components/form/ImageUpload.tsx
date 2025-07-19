import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  multiple?: boolean;
  value: File | File[] | string | string[] | (File | string)[] | null;
  onChange: (file: File | File[] | string | string[] | (File | string)[] | null) => void;
  label?: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

const defaultOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  multiple = false,
  value,
  onChange,
  label = 'Upload Image',
  maxSizeMB,
  maxWidthOrHeight,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const files = Array.from(e.target.files);
    const options = {
      ...defaultOptions,
      ...(maxSizeMB ? { maxSizeMB } : {}),
      ...(maxWidthOrHeight ? { maxWidthOrHeight } : {}),
    };
    
    try {
      if (multiple) {
        const compressedFiles = await Promise.all(
          files.map(async (file, index) => {
            setUploadProgress(((index + 1) / files.length) * 100);
            return await imageCompression(file, options);
          })
        );
        onChange(compressedFiles);
      } else {
        setUploadProgress(50);
        const compressedFile = await imageCompression(files[0], options);
        setUploadProgress(100);
        onChange(compressedFile);
      }
    } catch (error) {
      console.error('Image compression failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = (idx?: number) => {
    if (multiple) {
      if (Array.isArray(value)) {
        const newFiles = value.filter((_, i) => i !== idx);
        onChange(newFiles.length ? newFiles as (File | string)[] : null);
      }
    } else {
      onChange(null);
    }
  };

  const renderPreviews = () => {
    if (multiple && Array.isArray(value)) {
      return (
        <div className="flex gap-2 flex-wrap mt-2">
          {value.map((item, idx) => (
            <div key={idx} className="relative inline-block">
              <img 
                src={typeof item === 'string' ? item : URL.createObjectURL(item)} 
                alt={`Preview ${idx}`} 
                className="h-20 w-20 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg2MFY2MEgyMFYyMFoiIGZpbGw9IiNEM0Q3RDAiLz4KPHBhdGggZD0iTTI1IDI1SDU1VjU1SDI1VjI1WiIgZmlsbD0iI0YzNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzNUg1MFY0NUgzMFYzNVoiIGZpbGw9IiNEM0Q3RDAiLz4KPC9zdmc+';
                }}
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                onClick={() => handleRemove(idx)}
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      );
    } else if (value) {
      const isFile = value instanceof File;
      const isString = typeof value === 'string';
      
      if (isFile || isString) {
        return (
          <div className="relative inline-block mt-2">
            <img 
              src={isFile ? URL.createObjectURL(value as File) : value as string} 
              alt="Preview" 
              className="h-32 w-32 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkg5NlY5NkgzMlYzMloiIGZpbGw9IiNEM0Q3RDAiLz4KPHBhdGggZD0iTTQwIDQwSDg4Vjg4SDQwVjQwWiIgZmlsbD0iI0YzNEY2Ii8+CjxwYXRoIGQ9Ik01NiA1Nkg3MlY3Mkg1NlY1NloiIGZpbGw9IiNEM0Q3RDAiLz4KPC9zdmc+';
              }}
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
              onClick={() => handleRemove()}
              title="Remove image"
            >
              ×
            </button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div>
      {label && <label className="block font-semibold mb-1">{label}</label>}
      
      {/* Progress Bar */}
      {isUploading && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-brand-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {uploadProgress < 100 ? 'Processing image...' : 'Upload complete!'}
          </p>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      {renderPreviews()}
    </div>
  );
};

export default ImageUpload; 