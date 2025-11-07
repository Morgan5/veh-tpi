import { Choice, Scenario, Scene } from '../types';

function mapScenarioFromGraphQL(data: any): Scenario {
  return {
    id: data.mongoId,
    title: data.title,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: {
      id: '',
      name: '',
      email: '',
      role: '',
    },
    scenes: data.scenesList.map(mapSceneFromGraphQL),
  };
}
function mapSceneFromGraphQL(scene: any): Scene {
  return {
    id: scene.mongoId,
    title: scene.title,
    content: scene.text,
    order: scene.order,
    isStartScene: scene.isStartScene,
    choices: scene.choices ? scene.choices.map(mapChoiceFromGraphQL) : [],
    image: scene.imageId?.url,
    audio: scene.soundId?.url,
    music: scene.musicId?.url,
    position: undefined, // à compléter si position est calculée ou stockée
  };
}
function mapChoiceFromGraphQL(choice: any): Choice {
  return {
    id: choice.mongoId,
    text: choice.text,
    targetSceneId: choice.toSceneId?.mongoId || choice.toSceneId || '',
    condition: choice.condition, // attention : ici c'est un objet JSON, à stringifier si nécessaire
  };
}
export { mapChoiceFromGraphQL, mapScenarioFromGraphQL, mapSceneFromGraphQL };
