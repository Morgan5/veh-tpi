import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Volume2, Trash2, Search, Grid, List, X, Play } from 'lucide-react';
import { Asset } from '../../types';
import Button from '../Common/Button';
import AssetUploader from '../Common/AssetUploader';
import AIGenerator from '../Common/AIGenerator';
import AudioPlayer from '../Common/AudioPlayer';
import toast from 'react-hot-toast';

interface AssetManagerProps {
  onSelectAsset?: (asset: Asset) => void;
  selectionMode?: boolean;
  filterType?: 'image' | 'sound';
}

const AssetManager: React.FC<AssetManagerProps> = ({
  onSelectAsset,
  selectionMode = false,
  filterType
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'sound'>(filterType || 'all');
  const [showUploader, setShowUploader] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'sound'>('image');
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with GraphQL query
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockAssets: Asset[] = [
        {
          id: '1',
          type: 'image',
          name: 'Château mystérieux',
          url: 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Chateau',
          uploadedBy: 'user-1',
          createdAt: '2024-01-15T10:00:00Z',
          metadata: { size: 125000 }
        },
        {
          id: '2',
          type: 'image',
          name: 'Dragon doré',
          url: 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Dragon',
          uploadedBy: 'user-1',
          createdAt: '2024-01-16T11:00:00Z',
          metadata: { size: 180000, aiGenerated: true }
        },
        {
          id: '3',
          type: 'sound',
          name: 'Ambiance mystérieuse',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          uploadedBy: 'user-1',
          createdAt: '2024-01-17T09:00:00Z',
          metadata: { size: 2500000, duration: 120 }
        }
      ];

      setAssets(mockAssets);
    } catch (error) {
      toast.error('Erreur lors du chargement des assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet asset ?')) {
      try {
        // TODO: GraphQL mutation
        await new Promise(resolve => setTimeout(resolve, 500));
        setAssets(assets.filter(a => a.id !== id));
        toast.success('Asset supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleAssetUploaded = (newAsset: Asset) => {
    setAssets([newAsset, ...assets]);
    setShowUploader(false);
    toast.success('Asset ajouté à la bibliothèque');
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || asset.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Bibliothèque d'Assets</h2>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ImageIcon}
              onClick={() => {
                setUploadType('image');
                setShowUploader(true);
              }}
            >
              Ajouter Image
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Volume2}
              onClick={() => {
                setUploadType('sound');
                setShowUploader(true);
              }}
            >
              Ajouter Son
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {!filterType && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-2 text-sm rounded ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setActiveFilter('image')}
                className={`px-3 py-2 text-sm rounded flex items-center gap-1 ${
                  activeFilter === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Images
              </button>
              <button
                onClick={() => setActiveFilter('sound')}
                className={`px-3 py-2 text-sm rounded flex items-center gap-1 ${
                  activeFilter === 'sound'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Sons
              </button>
            </div>
          )}

          <div className="flex gap-1 border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <Grid className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <List className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun asset trouvé</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                  selectionMode ? 'cursor-pointer hover:border-blue-500' : ''
                }`}
              >
                {asset.type === 'image' ? (
                  <div 
                    className="aspect-video bg-gray-100 cursor-pointer"
                    onClick={() => selectionMode && onSelectAsset?.(asset)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative">
                    {playingSound === asset.id ? (
                      <div className="w-full px-4">
                        <AudioPlayer
                          src={asset.url}
                          title=""
                          showControls={true}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectionMode) {
                            onSelectAsset?.(asset);
                          } else {
                            setPlayingSound(asset.id);
                          }
                        }}
                        className="flex flex-col items-center gap-2 p-4 hover:scale-110 transition-transform"
                      >
                        <Play className="h-12 w-12 text-purple-600" />
                        <span className="text-sm text-gray-600">Écouter</span>
                      </button>
                    )}
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                    {asset.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(asset.metadata?.size || 0)}</span>
                    {asset.metadata?.aiGenerated && (
                      <span className="text-purple-600 font-medium">✨ IA</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {asset.type === 'sound' && playingSound !== asset.id && !selectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingSound(asset.id);
                        }}
                        className="flex-1 text-blue-600 hover:text-blue-800 text-xs flex items-center justify-center gap-1 py-1"
                      >
                        <Play className="h-3 w-3" />
                        Écouter
                      </button>
                    )}
                    {selectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset?.(asset);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded"
                      >
                        Sélectionner
                      </button>
                    )}
                    {!selectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id);
                        }}
                        className="flex-1 text-red-600 hover:text-red-800 text-xs flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 ${
                  selectionMode ? 'cursor-pointer hover:border-blue-500' : ''
                }`}
                onClick={() => selectionMode && onSelectAsset?.(asset)}
              >
                <div className="flex items-center gap-3">
                  {asset.type === 'image' ? (
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{asset.name}</h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(asset.metadata?.size || 0)}
                      {asset.metadata?.aiGenerated && ' • Généré par IA'}
                    </p>
                  </div>
                </div>
                {!selectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter un {uploadType === 'image' ? 'Image' : 'Son'}
              </h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <AssetUploader
                type={uploadType}
                onAssetSelected={handleAssetUploaded}
              />
              
              <div className="text-center text-sm text-gray-500">ou</div>
              
              <AIGenerator
                type={uploadType}
                onAssetGenerated={handleAssetUploaded}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;

