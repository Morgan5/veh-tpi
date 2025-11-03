import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Scene } from '../../types';
import { Play, Plus } from 'lucide-react';
import { computeScenePositions } from '../../utils/postionComputing';

interface SceneNodeData {
  scene: Scene;
  onSelect: (scene: Scene) => void;
}

const SceneNode: React.FC<{ data: SceneNodeData }> = ({ data }) => {
  const { scene, onSelect } = data;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-w-[200px] hover:border-blue-500 transition-colors">
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 truncate">{scene.title}</h3>
        {scene.isStartScene && (
          <Play className="h-4 w-4 text-green-500" />
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {scene.content || 'Pas de contenu'}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {scene.choices.length} choix
        </span>
        <button
          onClick={() => onSelect(scene)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
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

const SceneGraphView: React.FC<SceneGraphViewProps> = ({ scenes, onSceneSelect }) => {
  const initialNodes: Node[] = useMemo(() => {
    const computedPositions = computeScenePositions(scenes);

    return scenes.map((scene) => ({
      id: scene.id,
      type: 'sceneNode',
      position: computedPositions[scene.id] || { x: 0, y: 0 },
      data: { scene, onSelect: onSceneSelect }
    }));
  }, [scenes, onSceneSelect]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    scenes.forEach((scene) => {
      scene.choices.forEach((choice, index) => {
        const targetScene = scenes.find(s => s.id === choice.targetSceneId);
        if (targetScene) {
          edges.push({
            id: `${scene.id}-${choice.id}`,
            source: scene.id,
            target: choice.targetSceneId,
            label: choice.text,
            style: { stroke: '#3B82F6' },
            labelStyle: { fontSize: '12px', fill: '#374151' }
          });
        }
      });
    });

    return edges;
  }, [scenes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  if (scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune scène créée</p>
          <p className="text-sm text-gray-400">Commencez par ajouter une scène</p>
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