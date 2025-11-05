import { Choice, Scenario, Scene } from "../types";

function mapScenarioFromGraphQL(data: any): Scenario {
  return {
    id: data.mongoId,
    title: data.title,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    author: {
      id: "",
      name: "",
      email: "",
      role: ""
    },
    scenes: data.scenesList.map(mapSceneFromGraphQL)
  };
}
function mapSceneFromGraphQL(scene: any): Scene {
  return {
    id: scene.mongoId,
    title: scene.title,
    content: scene.text,
    isStartScene: scene.isStartScene,
    choices: scene.choices.map(mapChoiceFromGraphQL),
    // Mapper les assets : URL pour affichage, ID pour sauvegarde
    image: scene.imageId?.fullUrl || scene.imageId?.url || undefined,
    audio: scene.soundId?.fullUrl || scene.soundId?.url || undefined,
    imageAssetId: scene.imageId?.mongoId || undefined,
    audioAssetId: scene.soundId?.mongoId || undefined,
    position: undefined // à compléter si position est calculée ou stockée
  };
}
function mapChoiceFromGraphQL(choice: any): Choice {
  return {
    id: choice.mongoId,
    text: choice.text,
    targetSceneId: choice.toSceneId.mongoId,
    condition: choice.condition // attention : ici c’est un objet JSON, à stringifier si nécessaire
  };
}
export { mapScenarioFromGraphQL, mapSceneFromGraphQL, mapChoiceFromGraphQL };
