import { Edit, Music, Play, Plus, Volume2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeTypes,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Scene } from '../../types';
import { computeScenePositions } from '../../utils/postionComputing';

interface SceneNodeData {
  scene: Scene;
  onSelect: (scene: Scene) => void;
}

const SceneNode: React.FC<{ data: SceneNodeData }> = ({ data }) => {
  const { scene, onSelect } = data;

  // Construire l'URL complète pour les assets
  const getFullUrl = (url?: string) => {
    if (!url) return null;
    // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Sinon, construire l'URL avec le base URL de l'API
    // Utiliser VITE_GRAPHQL_URL pour extraire le base URL, ou VITE_API_URL, ou une valeur par défaut
    const graphqlUrl =
      import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/';
    const apiUrl =
      import.meta.env.VITE_API_URL || graphqlUrl.replace('/graphql/', '');
    return `${apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const imageUrl = getFullUrl(scene.image);
  const audioUrl = getFullUrl(scene.audio);
  const musicUrl = getFullUrl(scene.music);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-w-[300px] max-w-[400px] hover:border-blue-500 transition-colors">
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 truncate">{scene.title}</h3>
        {scene.isStartScene && <Play className="h-4 w-4 text-green-500" />}
      </div>

      {/* Aperçu de l'image */}
      {imageUrl && (
        <div className="mb-2 rounded overflow-hidden border border-gray-200">
          <img
            src={imageUrl}
            alt={scene.title}
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {scene.content || 'Pas de contenu'}
      </p>

      {/* Lecteurs audio */}
      <div className="flex flex-col gap-2 mb-2">
        {audioUrl && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Volume2 className="h-3 w-3" />
              <span>Narration</span>
            </div>
            <audio controls className="flex-1 h-8" src={audioUrl} />
          </div>
        )}
        {musicUrl && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Music className="h-3 w-3" />
              <span>Musique</span>
            </div>
            <audio controls className="flex-1 h-8" src={musicUrl} />
          </div>
        )}
        {!audioUrl && !musicUrl && !imageUrl && (
          <span className="text-xs text-gray-400 italic">Aucun média</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {scene.choices.length} choix
        </span>
        <button
          onClick={() => onSelect(scene)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Edit className="h-4 w-4" />
          Modifier
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  sceneNode: SceneNode,
};

interface SceneGraphViewProps {
  scenes: Scene[];
  onSceneSelect: (scene: Scene) => void;
}

const SceneGraphView: React.FC<SceneGraphViewProps> = ({
  scenes,
  onSceneSelect,
}) => {
  const initialNodes: Node[] = useMemo(() => {
    const computedPositions = computeScenePositions(scenes);

    return scenes.map((scene) => ({
      id: scene.id,
      type: 'sceneNode',
      position: computedPositions[scene.id] || { x: 0, y: 0 },
      data: { scene, onSelect: onSceneSelect },
    }));
  }, [scenes, onSceneSelect]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    scenes.forEach((scene) => {
      scene.choices.forEach((choice) => {
        const targetScene = scenes.find((s) => s.id === choice.targetSceneId);
        if (targetScene) {
          edges.push({
            id: `${scene.id}-${choice.id}`,
            source: scene.id,
            target: choice.targetSceneId,
            label: choice.text,
            style: { stroke: '#3B82F6' },
            labelStyle: { fontSize: '12px', fill: '#374151' },
          });
        }
      });
    });

    return edges;
  }, [scenes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Mettre à jour les nodes quand les scènes changent
  // Utiliser une clé basée sur les données des scènes pour forcer la mise à jour
  const scenesKey = useMemo(
    () =>
      scenes
        .map(
          (s) =>
            `${s.id}-${s.title}-${s.image}-${s.audio}-${s.music}-${s.choices.length}`
        )
        .join('|'),
    [scenes]
  );

  useEffect(() => {
    // Recréer les nodes avec les nouvelles données de scène pour forcer la mise à jour
    setNodes((currentNodes) => {
      const computedPositions = computeScenePositions(scenes);
      return scenes.map((scene) => {
        // Préserver la position existante si le node existe déjà
        const existingNode = currentNodes.find((n) => n.id === scene.id);
        return {
          id: scene.id,
          type: 'sceneNode' as const,
          position: existingNode?.position ||
            computedPositions[scene.id] || { x: 0, y: 0 },
          data: { scene, onSelect: onSceneSelect },
        };
      });
    });
  }, [scenesKey, scenes, onSceneSelect, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  if (scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune scène créée</p>
          <p className="text-sm text-gray-400">
            Commencez par ajouter une scène
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      className="bg-gray-50"
    >
      <Background />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const scene = node.data.scene;
          return scene.isStartScene ? '#10B981' : '#3B82F6';
        }}
        className="bg-white border border-gray-200 rounded"
      />
    </ReactFlow>
  );
};

export default SceneGraphView;
