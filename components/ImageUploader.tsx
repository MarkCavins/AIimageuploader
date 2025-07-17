import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';
import { Upload, X, Plus, RotateCcw } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
}

export function ImageUploader({ onImageUpload, onImageRemove }: ImageUploaderProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      onImageUpload?.(file);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleRemoveImage = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedImage, onImageRemove]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      <AspectRatio ratio={2/3} className="bg-muted/50 rounded-2xl overflow-hidden border border-border/50">
        {uploadedImage ? (
          <div className="relative w-full h-full group">
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 md:group-hover:bg-black/40 transition-colors duration-200">
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-background/90 hover:bg-background shadow-lg backdrop-blur-sm"
                  onClick={handleUploadClick}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0 shadow-lg"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile-only bottom actions */}
            <div className="absolute bottom-3 left-3 right-3 md:hidden">
              <div className="flex gap-2">
                <Button
                  onClick={handleUploadClick}
                  variant="secondary"
                  size="sm"
                  className="flex-1 bg-background/90 backdrop-blur-sm shadow-lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button
                  onClick={handleRemoveImage}
                  variant="destructive"
                  size="sm"
                  className="shadow-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`w-full h-full transition-all duration-200 cursor-pointer ${
              isDragOver
                ? 'bg-primary/5 border-primary/30'
                : 'hover:bg-muted/70'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              {/* Upload Icon */}
              <div className={`relative mb-6 transition-all duration-200 ${isDragOver ? 'scale-110' : ''}`}>
                <div className="w-16 h-16 rounded-full bg-muted/80 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                {isDragOver && (
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-base">
                  {isDragOver ? 'Drop your image here' : 'Add Photo'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {isDragOver 
                    ? 'Release to upload' 
                    : 'Drag and drop or tap to select from your device'
                  }
                </p>
              </div>

              {/* Format info */}
              <div className="mt-4 px-3 py-1 bg-muted/60 rounded-full">
                <span className="text-xs text-muted-foreground">
                  2:3 • Social Ready
                </span>
              </div>
            </div>
          </div>
        )}
      </AspectRatio>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}