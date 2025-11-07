import { Scene } from '../types';

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
  const processing = new Set<string>(); // Pour détecter les cycles dans le chemin actuel

  function dfs(scene: Scene, depth: number, maxDepth: number = 50): number {
    // Protection contre la récursion infinie
    if (depth > maxDepth) {
      // Si on dépasse la profondeur max, placer la scène et continuer
      if (!positions[scene.id]) {
        const x = currentX * horizontalSpacing;
        positions[scene.id] = { x, y: depth * levelSpacing };
        currentX++;
      }
      return positions[scene.id].x;
    }

    // Si la scène est déjà positionnée, retourner sa position
    if (positions[scene.id]) {
      return positions[scene.id].x;
    }

    // Détecter un cycle dans le chemin actuel
    if (processing.has(scene.id)) {
      // Cycle détecté : placer la scène à une position relative
      const x = currentX * horizontalSpacing;
      positions[scene.id] = { x, y: depth * levelSpacing };
      currentX++;
      return x;
    }

    processing.add(scene.id);

    const children = childrenMap.get(scene.id) || [];

    if (children.length === 0) {
      // Feuille → on place et on avance le curseur
      const x = currentX * horizontalSpacing;
      positions[scene.id] = { x, y: depth * levelSpacing };
      currentX++;
      processing.delete(scene.id);
      return x;
    }

    // Sinon, on calcule les positions des enfants
    // Filtrer les enfants déjà en cours de traitement pour éviter les cycles
    const validChildren = children.filter((child) => !processing.has(child.id));

    if (validChildren.length === 0) {
      // Tous les enfants sont en cours de traitement (cycle) → placer la scène
      const x = currentX * horizontalSpacing;
      positions[scene.id] = { x, y: depth * levelSpacing };
      currentX++;
      processing.delete(scene.id);
      return x;
    }

    const childXs = validChildren.map((child) =>
      dfs(child, depth + 1, maxDepth)
    );
    const minX = Math.min(...childXs);
    const maxX = Math.max(...childXs);
    const x = (minX + maxX) / 2; // centrer le parent au milieu de ses enfants

    positions[scene.id] = { x, y: depth * levelSpacing };
    processing.delete(scene.id);
    return x;
  }

  dfs(startScene, 0);

  // Scènes orphelines (non reliées)
  const placed = new Set(Object.keys(positions));
  const unlinked = scenes.filter((s) => !placed.has(s.id));
  unlinked.forEach((scene, i) => {
    positions[scene.id] = {
      x: (currentX + i) * horizontalSpacing,
      y: (positions[startScene.id]?.y || 0) + levelSpacing * 2,
    };
  });

  return positions;
}

export function hasCycle(scenes: Scene[]): boolean {
  const sceneMap = new Map(scenes.map((s) => [s.id, s]));

  function dfs(
    sceneId: string,
    visited: Set<string>,
    stack: Set<string>
  ): boolean {
    // Si la scène n'existe pas dans la map, ce n'est pas un cycle
    if (!sceneMap.has(sceneId)) return false;

    if (stack.has(sceneId)) return true; // cycle détecté
    if (visited.has(sceneId)) return false;

    visited.add(sceneId);
    stack.add(sceneId);

    const scene = sceneMap.get(sceneId);
    if (scene) {
      for (const choice of scene.choices) {
        // Ignorer les choix vides ou invalides
        if (!choice.targetSceneId) continue;

        // Vérifier que la scène cible existe dans la map
        if (!sceneMap.has(choice.targetSceneId)) continue;

        if (dfs(choice.targetSceneId, visited, stack)) return true;
      }
    }

    stack.delete(sceneId);
    return false;
  }

  // Ne vérifier les cycles qu'à partir des scènes de départ
  // Si aucune scène de départ n'existe, vérifier depuis toutes les scènes
  const startScenes = scenes.filter((s) => s.isStartScene);
  const scenesToCheck = startScenes.length > 0 ? startScenes : scenes;

  for (const scene of scenesToCheck) {
    const visited = new Set<string>();
    const stack = new Set<string>();
    if (dfs(scene.id, visited, stack)) {
      return true;
    }
  }

  return false;
}
