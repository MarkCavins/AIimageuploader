import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Download, Share2, Camera, Info } from 'lucide-react';

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
    createCroppedImage(file);
  };

  const handleImageRemove = () => {
    setUploadedFile(null);
    setCroppedImageBlob(null);
  };

  const createCroppedImage = (file: File) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const targetRatio = 2 / 3;
      const imageRatio = img.width / img.height;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (imageRatio > targetRatio) {
        sourceWidth = img.height * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        sourceHeight = img.width / targetRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      const outputWidth = 800;
      const outputHeight = 1200;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      if (ctx) {
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, outputWidth, outputHeight
        );

        canvas.toBlob((blob) => {
          if (blob) {
            setCroppedImageBlob(blob);
          }
        }, 'image/jpeg', 0.9);
      }
    };

    img.src = URL.createObjectURL(file);
  };

  const handleDownload = () => {
    if (croppedImageBlob && uploadedFile) {
      const url = URL.createObjectURL(croppedImageBlob);
      const a = document.createElement('a');
      a.href = url;
      
      const originalName = uploadedFile.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
      const ext = originalName.substring(originalName.lastIndexOf('.'));
      a.download = `${nameWithoutExt}_2-3_ratio${ext}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    if (croppedImageBlob && navigator.share) {
      try {
        const file = new File([croppedImageBlob], 'social-media-image.jpg', {
          type: 'image/jpeg',
        });
        await navigator.share({
          title: 'Social Media Image (2:3 Ratio)',
          files: [file],
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-lg">
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span className="text-lg">Crop Tool</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="h-8 w-8 p-0"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-xl mb-2">Create Perfect Posts</h1>
              <p className="text-muted-foreground text-sm">
                Upload and crop your images to 2:3 ratio for social media
              </p>
            </div>
            
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />
          </div>

          {/* Image Details & Actions */}
          {uploadedFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Original</span>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processed</span>
                  <span className="text-sm text-muted-foreground">
                    {croppedImageBlob ? formatFileSize(croppedImageBlob.size) : 'Processing...'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">2:3 Ratio</Badge>
                  <Badge variant="secondary" className="text-xs">800×1200px</Badge>
                  <Badge variant="secondary" className="text-xs">Ready</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleDownload} 
                  className="w-full h-12"
                  disabled={!croppedImageBlob}
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Image
                </Button>
                
                {navigator.share && (
                  <Button 
                    onClick={handleShare} 
                    variant="outline" 
                    className="w-full h-12"
                    disabled={!croppedImageBlob}
                    size="lg"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Info Panel */}
          {showInfo && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
              <h3 className="text-sm">How it works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 mr-3 flex-shrink-0"></span>
                  <span>Upload any image and it gets automatically cropped to 2:3 ratio</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 mr-3 flex-shrink-0"></span>
                  <span>Perfect for Instagram posts, stories, and other social media</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 mr-3 flex-shrink-0"></span>
                  <span>Center cropping preserves the main subject</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 mr-3 flex-shrink-0"></span>
                  <span>High-quality output optimized for sharing</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}