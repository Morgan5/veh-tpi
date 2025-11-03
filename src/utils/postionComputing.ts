import { Scene } from "../types";

export function computeScenePositions(
  scenes: Scene[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const levelSpacing = 200;
  const horizontalSpacing = 250;

  const startScene = scenes.find((s) => s.isStartScene);
  if (!startScene) return positions;

  // Construire un dictionnaire id -> scène
  const sceneMap = new Map(scenes.map((s) => [s.id, s]));

  // Construire les enfants
  const childrenMap = new Map<string, Scene[]>();
  scenes.forEach((scene) => {
    childrenMap.set(
      scene.id,
      scene.choices
        .map((c) => sceneMap.get(c.targetSceneId))
        .filter((s): s is Scene => !!s)
    );
  });

  let currentX = 0;

  function dfs(scene: Scene, depth: number): number {
    const children = childrenMap.get(scene.id) || [];

    if (children.length === 0) {
      // Feuille → on place et on avance le curseur
      const x = currentX * horizontalSpacing;
      positions[scene.id] = { x, y: depth * levelSpacing };
      currentX++;
      return x;
    }

    // Sinon, on calcule les positions des enfants
    const childXs = children.map((child) => dfs(child, depth + 1));
    const minX = Math.min(...childXs);
    const maxX = Math.max(...childXs);
    const x = (minX + maxX) / 2; // centrer le parent au milieu de ses enfants

    positions[scene.id] = { x, y: depth * levelSpacing };
    return x;
  }

  dfs(startScene, 0);

  // Scènes orphelines (non reliées)
  const placed = new Set(Object.keys(positions));
  const unlinked = scenes.filter((s) => !placed.has(s.id));
  unlinked.forEach((scene, i) => {
    positions[scene.id] = {
      x: (currentX + i) * horizontalSpacing,
      y: (positions[startScene.id].y || 0) + levelSpacing * 2
    };
  });

  return positions;
}
