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

export const UPDATE_SCENARIO = gql`
  mutation UpdateScenario($id: ID!, $input: UpdateScenarioInput!) {
    updateScenario(id: $id, input: $input) {
      id
      title
      description
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
    }
  }
`;

export const DELETE_SCENARIO = gql`
  mutation DeleteScenario($id: ID!) {
    deleteScenario(id: $id)
  }
`;