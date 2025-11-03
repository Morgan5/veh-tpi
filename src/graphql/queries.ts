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