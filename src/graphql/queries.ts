import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const GET_SCENARIOS = gql`
  query GetScenarios {
    scenarios {
      id
      title
      description
      createdAt
      updatedAt
      author {
        id
        name
      }
    }
  }
`;

export const GET_SCENARIO = gql`
  query GetScenario($id: ID!) {
    scenario(id: $id) {
      id
      title
      description
      authorId
      createdAt
      updatedAt
      scenes {
        id
        scenarioId
        title
        text
        imageId
        image {
          id
          type
          name
          url
          metadata
        }
        soundId
        sound {
          id
          type
          name
          url
          metadata
        }
        position {
          x
          y
        }
        isStartScene
        choices {
          id
          fromSceneId
          toSceneId
          text
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
      id
      title
      description
      authorId
      createdAt
      updatedAt
      scenes {
        id
        scenarioId
        title
        text
        imageId
        soundId
        position {
          x
          y
        }
        isStartScene
        choices {
          id
          fromSceneId
          toSceneId
          text
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

export const UPDATE_SCENARIO = gql`
  mutation UpdateScenario($id: ID!, $input: UpdateScenarioInput!) {
    updateScenario(id: $id, input: $input) {
      id
      title
      description
      scenes {
        id
        scenarioId
        title
        text
        imageId
        soundId
        position {
          x
          y
        }
        isStartScene
        choices {
          id
          fromSceneId
          toSceneId
          text
          condition
        }
      }
    }
  }
`;

export const DELETE_SCENARIO = gql`
  mutation DeleteScenario($id: ID!) {
    deleteScenario(id: $id)
  }
`;

// Asset Queries & Mutations
export const GET_ASSETS = gql`
  query GetAssets($type: String) {
    assets(type: $type) {
      id
      type
      name
      url
      metadata
      uploadedBy
      createdAt
    }
  }
`;

export const UPLOAD_ASSET = gql`
  mutation UploadAsset($file: Upload!, $type: String!, $name: String!) {
    uploadAsset(file: $file, type: $type, name: $name) {
      id
      type
      name
      url
      metadata
      uploadedBy
      createdAt
    }
  }
`;

export const GENERATE_IMAGE_WITH_AI = gql`
  mutation GenerateImageWithAI($prompt: String!) {
    generateImageWithAI(prompt: $prompt) {
      id
      type
      name
      url
      metadata
      uploadedBy
      createdAt
    }
  }
`;

export const GENERATE_SOUND_WITH_AI = gql`
  mutation GenerateSoundWithAI($prompt: String!) {
    generateSoundWithAI(prompt: $prompt) {
      id
      type
      name
      url
      metadata
      uploadedBy
      createdAt
    }
  }
`;

export const DELETE_ASSET = gql`
  mutation DeleteAsset($id: ID!) {
    deleteAsset(id: $id)
  }
`;