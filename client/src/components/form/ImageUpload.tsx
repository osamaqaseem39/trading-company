import React, { useRef } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  multiple?: boolean;
  value: File | File[] | null;
  onChange: (file: File | File[] | null) => void;
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const options = {
      ...defaultOptions,
      ...(maxSizeMB ? { maxSizeMB } : {}),
      ...(maxWidthOrHeight ? { maxWidthOrHeight } : {}),
    };
    if (multiple) {
      const compressedFiles = await Promise.all(
        files.map(file => imageCompression(file, options))
      );
      onChange(compressedFiles);
    } else {
      const compressedFile = await imageCompression(files[0], options);
      onChange(compressedFile);
    }
  };

  const handleRemove = (idx?: number) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== idx);
      onChange(newFiles.length ? newFiles : null);
    } else {
      onChange(null);
    }
  };

  const renderPreviews = () => {
    if (multiple && Array.isArray(value)) {
      return (
        <div className="flex gap-2 flex-wrap mt-2">
          {value.map((file, idx) => (
            <div key={idx} className="relative inline-block">
              <img src={URL.createObjectURL(file)} alt={`Preview ${idx}`} className="h-20 rounded" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                onClick={() => handleRemove(idx)}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      );
    } else if (value instanceof File) {
      return (
        <div className="relative inline-block mt-2">
          <img src={URL.createObjectURL(value)} alt="Preview" className="h-32 rounded" />
          <button
            type="button"
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            onClick={() => handleRemove()}
            title="Remove image"
          >
            &times;
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {label && <label className="block font-semibold mb-1">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
      />
      {renderPreviews()}
    </div>
  );
};

export default ImageUpload; 