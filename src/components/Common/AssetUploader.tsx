import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Volume2, Loader2, Check } from 'lucide-react';
import { Asset } from '../../types';
import AudioPlayer from './AudioPlayer';
import toast from 'react-hot-toast';

interface AssetUploaderProps {
  type: 'image' | 'sound';
  currentAsset?: Asset;
  onAssetSelected: (asset: Asset) => void;
  onRemove?: () => void;
}

const AssetUploader: React.FC<AssetUploaderProps> = ({
  type,
  currentAsset,
  onAssetSelected,
  onRemove
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAsset?.url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = type === 'image' 
    ? 'image/jpeg,image/png,image/gif,image/webp'
    : 'audio/mpeg,audio/wav,audio/ogg';

  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for sounds

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`Le fichier est trop volumineux. Maximum: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith(type)) {
      toast.error(`Type de fichier invalide. Attendu: ${type}`);
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('name', file.name);

      // TODO: Replace with actual GraphQL mutation or REST endpoint
      // For now, simulate upload with local preview
      const localUrl = URL.createObjectURL(file);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newAsset: Asset = {
        id: Date.now().toString(),
        type,
        name: file.name,
        url: localUrl, // In production, this would be the uploaded URL
        uploadedBy: 'current-user-id',
        createdAt: new Date().toISOString(),
        metadata: {
          size: file.size,
          mimeType: file.type,
          originalName: file.name
        }
      };

      setPreview(localUrl);
      onAssetSelected(newAsset);
      toast.success(`${type === 'image' ? 'Image' : 'Son'} uploadé avec succès !`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
          {type === 'image' ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">
                    {currentAsset?.name || 'Audio file'}
                  </p>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AudioPlayer
                src={preview}
                title={currentAsset?.name}
                showControls={true}
              />
            </div>
          )}
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <Check className="h-3 w-3 mr-1 text-green-600" />
            {currentAsset?.metadata?.size 
              ? `${(currentAsset.metadata.size / 1024).toFixed(1)} KB`
              : 'Uploadé'}
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center space-y-3">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                {type === 'image' ? (
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                ) : (
                  <Volume2 className="h-10 w-10 text-gray-400" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    Cliquez pour uploader {type === 'image' ? 'une image' : 'un son'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {type === 'image' 
                      ? 'PNG, JPG, GIF, WEBP (max 5MB)'
                      : 'MP3, WAV, OGG (max 10MB)'}
                  </p>
                </div>
              </>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default AssetUploader;

