import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import clsx from 'clsx';

interface ImageUploadProps {
  value?: File | string;
  onChange: (file: File) => void;
  onClear: () => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onClear,
  accept = 'image/*',
  maxSizeMB = 10,
  className,
}: ImageUploadProps) {
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): boolean => {
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPreviewUrl = (): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return URL.createObjectURL(value);
  };

  const getFileName = (): string => {
    if (!value) return '';
    if (typeof value === 'string') {
      const parts = value.split('/');
      return parts[parts.length - 1] || '';
    }
    return value.name;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className={clsx('w-full', className)}>
      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleClick}>
                Change
              </Button>
              <Button variant="danger" size="sm" onClick={handleClear}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 truncate">{getFileName()}</p>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={clsx(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-300 mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-gray-500">Max file size: {maxSizeMB}MB</p>
        </div>
      )}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
