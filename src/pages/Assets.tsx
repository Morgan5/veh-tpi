import React from 'react';
import AssetManager from '../components/AssetManager/AssetManager';

const Assets: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        <p className="text-gray-600">Gérez votre bibliothèque d'images et de sons</p>
      </div>

      <AssetManager />
    </div>
  );
};

export default Assets;

