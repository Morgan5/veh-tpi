import { gql } from '@apollo/client';

export const GET_SCENARIOS = gql`
  query {
  allScenarios {
    mongoId
    title
    description
    isPublished
  }
}
`;

export const GET_SCENARIO = gql`
  query GetScenario($id: ID!) {
    scenario(id: $id) {
      id
      title
      description
      createdAt
      updatedAt
      scenes {
        id
        title
        content
        image
        audio
        position {
          x
          y
        }
        isStartScene
        choices {
          id
          text
          targetSceneId
          condition
        }
      }
      author {
        id
        name
      }
    }
  }
`;

export const CREATE_SCENARIO = gql`
  mutation CreateScenario($input: CreateScenarioInput!) {
    createScenario(input: $input) {
      scenario {
        mongoId
        title
        description
        isPublished
      }
      success
      message
    }
  }
`;

export const UPDATE_SCENARIO = gql`
  mutation UpdateScenario($scenarioId: ID!, $input: UpdateScenarioInput!) {
    updateScenario(scenarioId: $scenarioId, input: $input) {
      scenario {
        mongoId
        title
        description
        isPublished
      }
      success
      message
    }
  }
`;

export const DELETE_SCENARIO = gql`
  mutation DeleteScenario($id: ID!) {
    deleteScenario(id: $id)
  }
`;

export const LOG_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      success
      message
    }
  }
`;
export const GET_SCENARIO_BY_ID = gql`
  query GetScenarioById($scenarioId: ID!) {
    scenarioById(scenarioId: $scenarioId) {
      mongoId
      title
      description
      createdAt
      updatedAt
      scenesList {
        mongoId
        title
        text
        isStartScene
        imageId {
          mongoId
          url
          fullUrl
          type
          name
        }
        soundId {
          mongoId
          url
          fullUrl
          type
          name
        }
        choices {
          mongoId
          text
          condition
          toSceneId {
            mongoId
            title
          }
        }
      }
    }
  }
`;
export const CREATE_SCENE = gql`
  mutation CreateScene($input: CreateSceneInput!) {
    createScene(input: $input) {
      scene {
        mongoId
        title
        text
        order
        isStartScene
        isEndScene
      }
      success
      message
    }
  }
`;

export const CREATE_CHOICE = gql`
  mutation CreateChoice($input: CreateChoiceInput!) {
    createChoice(input: $input) {
      choice {
        mongoId
        text
        order
        fromSceneId {
          mongoId
          title
        }
        toSceneId {
          mongoId
          title
        }
      }
      success
      message
    }
  }
`;

export const UPDATE_SCENE = gql`
  mutation UpdateScene($sceneId: ID!, $input: UpdateSceneInput!) {
    updateScene(sceneId: $sceneId, input: $input) {
      scene {
        id
        mongoId
        title
        text
        order
        isStartScene
        isEndScene
      }
      success
      message
    }
  }
`;

export const UPDATE_CHOICE = gql`
  mutation UpdateChoice($choiceId: ID!, $input: UpdateChoiceInput!) {
    updateChoice(choiceId: $choiceId, input: $input) {
      choice {
        id
        mongoId
        text
        order
        fromSceneId {
          mongoId
          title
        }
        toSceneId {
          mongoId
          title
        }
      }
      success
      message
    }
  }
`;

export const DELETE_CHOICE = gql`
  mutation DeleteChoice($choiceId: ID!) {
    deleteChoice(choiceId: $choiceId) {
      success
      message
    }
  }
`;

export const DELETE_CHOICES = gql`
  mutation DeleteChoices($choiceIds: [ID!]!) {
    deleteChoices(choiceIds: $choiceIds) {
      success
      message
    }
  }
`;

// Asset Queries and Mutations
export const GET_MY_ASSETS = gql`
  query MyAssets($typeFilter: String) {
    myAssets(typeFilter: $typeFilter) {
      id
      mongoId
      type
      name
      filename
      url
      fileSize
      fileSizeMb
      mimeType
      metadata
      isPublic
      createdAt
      dimensions
      duration
    }
  }
`;

export const GET_PUBLIC_ASSETS = gql`
  query PublicAssets($typeFilter: String) {
    publicAssets(typeFilter: $typeFilter) {
      id
      mongoId
      type
      name
      url
      fileSizeMb
      metadata
    }
  }
`;

export const GENERATE_ASSET = gql`
  mutation GenerateAsset(
    $type: String!
    $name: String!
    $description: String
    $soundType: String
    $language: String
    $duration: Int
  ) {
    generateAsset(
      type: $type
      name: $name
      description: $description
      soundType: $soundType
      language: $language
      duration: $duration
    ) {
      success
      message
      asset {
        id
        mongoId
        type
        name
        filename
        url
        fullUrl
        fileSize
        fileSizeMb
        mimeType
        metadata
        isPublic
        createdAt
      }
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset($input: CreateAssetInput!) {
    createAsset(input: $input) {
      success
      message
      asset {
        id
        mongoId
        type
        name
        filename
        url
        fileSize
        mimeType
        metadata
        isPublic
        createdAt
      }
    }
  }
`;

export const DELETE_ASSET = gql`
  mutation DeleteAsset($id: ID!) {
    deleteAsset(id: $id) {
      success
      message
    }
  }
`;

