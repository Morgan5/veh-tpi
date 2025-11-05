import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Volume2, Check } from 'lucide-react';
import { Asset } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';
import toast from 'react-hot-toast';

interface AssetUploaderProps {
  type: 'image' | 'sound' | 'video';
  onAssetSelected: (asset: Asset) => void;
  onCancel: () => void;
}

const AssetUploader: React.FC<AssetUploaderProps> = ({ type, onAssetSelected, onCancel }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validSoundTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    let isValid = false;
    if (type === 'image' && validImageTypes.includes(file.type)) {
      isValid = true;
    } else if (type === 'sound' && validSoundTypes.includes(file.type)) {
      isValid = true;
    } else if (type === 'video' && validVideoTypes.includes(file.type)) {
      isValid = true;
    }

    if (!isValid) {
      toast.error(`Type de fichier invalide pour ${type === 'image' ? 'une image' : type === 'sound' ? 'un son' : 'une vidéo'}`);
      return;
    }

    setSelectedFile(file);
    setAssetName(file.name);

    // Create preview
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      const event = { target: input } as any;
      handleFileSelect(event);
    }
  };

  const uploadFileToServer = async (file: File): Promise<Asset> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('name', assetName || file.name);
    formData.append('is_public', 'false');

    const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/';
    const baseUrl = graphqlUrl.replace('/graphql/', '');
    const uploadUrl = `${baseUrl}/api/upload/`;

    console.log('📤 Upload du fichier vers:', uploadUrl);
    console.log('📤 Données:', { type, name: assetName || file.name });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': token ? `JWT ${token}` : '',
        // Ne pas mettre Content-Type, le navigateur le fait automatiquement pour FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('❌ Erreur upload:', response.status, errorData);
      throw new Error(errorData.error || `Erreur lors de l'upload (${response.status}): ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Fichier uploadé et asset créé, réponse:', result);
    
    if (!result.success || !result.asset) {
      throw new Error(result.error || result.message || 'Erreur lors de la création de l\'asset');
    }

    // Le backend retourne directement l'asset créé
    const assetData = result.asset;
    const asset: Asset = {
      id: assetData.id || assetData.mongoId,
      mongoId: assetData.mongoId || assetData.id,
      type: assetData.type,
      name: assetData.name,
      filename: assetData.filename,
      url: assetData.fullUrl || assetData.url, // Utiliser fullUrl si disponible
      fileSize: assetData.fileSize,
      fileSizeMb: assetData.fileSizeMb,
      mimeType: assetData.mimeType,
      metadata: assetData.metadata || {},
      isPublic: assetData.isPublic,
      createdAt: assetData.createdAt,
    };

    return asset;
  };

  const handleUpload = async () => {
    if (!selectedFile || !assetName.trim()) {
      toast.error('Veuillez sélectionner un fichier et donner un nom à l\'asset');
      return;
    }

    setIsUploading(true);
    try {
      // Upload du fichier et création de l'asset en une seule requête
      // Le backend Django fait tout : sauvegarde du fichier + création dans MongoDB
      console.log('📤 Début de l\'upload du fichier...');
      const asset = await uploadFileToServer(selectedFile);
      console.log('✅ Fichier uploadé et asset créé:', asset);

      onAssetSelected(asset);
      toast.success(`${type === 'image' ? 'Image' : type === 'sound' ? 'Son' : 'Vidéo'} uploadé avec succès !`);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'upload';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload {type === 'image' ? 'd\'image' : type === 'sound' ? 'de son' : 'de vidéo'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={type === 'image' ? 'image/*' : type === 'sound' ? 'audio/*' : 'video/*'}
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-2">
                <Check className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {type === 'image' ? (
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                ) : (
                  <Volume2 className="h-12 w-12 mx-auto text-gray-400" />
                )}
                <p className="text-sm text-gray-600">
                  Cliquez ou glissez-déposez un fichier ici
                </p>
                <p className="text-xs text-gray-500">
                  {type === 'image' ? 'JPG, PNG, GIF, WebP' : type === 'sound' ? 'MP3, WAV, OGG, M4A' : 'MP4, WebM, OGG'}
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && type === 'image' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded"
              />
            </div>
          )}

          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'asset
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nom de l'asset"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              loading={isUploading}
              icon={Upload}
              disabled={!selectedFile || !assetName.trim()}
            >
              {isUploading ? 'Upload en cours...' : 'Uploader'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetUploader;

