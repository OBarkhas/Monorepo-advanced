import gql from 'graphql-tag';

export const projectTypeDefs = gql`
  enum ProjectStatus {
    PENDING
    APPROVED
    REJECTED
    FUNDED
  }

  enum TransactionType {
    VOTE
    REFUND
    SPARK
    AWARD
  }

  type Project {
    id: ID!
    title: String!
    description: String!
    images: [String!]!
    creatorId: String!
    status: ProjectStatus!
    reviewedById: String
    rejectionReason: String
    totalCoinsCollected: Int!
    endDate: String
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    projectId: String!
    authorId: String!
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type Vote {
    id: ID!
    projectId: String!
    studentId: String!
    coinAmount: Int!
    createdAt: String!
  }

  type CoinTransaction {
    id: ID!
    userId: String!
    amount: Int!
    type: TransactionType!
    referenceId: String
    createdAt: String!
  }

  extend type Query {
    getPublicProjects: [Project!]!
    getPendingProjects: [Project!]!
    getProjectsByStudent(studentId: ID!): [Project!]!
    getProjectById(id: ID!): Project
    getCommentsByProject(projectId: ID!): [Comment!]!
    getLeaderboard: [Project!]!
    getCoinAwardsByStudent(studentId: ID!): [CoinTransaction!]!
  }

  extend type Mutation {
    createProject(
      title: String!
      description: String!
      images: [String!]
      creatorId: ID!
    ): Project!

    updateProject(
      id: ID!
      title: String
      description: String
      images: [String!]
      creatorId: ID!
    ): Project!

    updateProjectStatus(
      id: ID!
      status: ProjectStatus!
      reviewedById: ID!
      rejectionReason: String
    ): Project!

    addComment(projectId: ID!, authorId: ID!, content: String!): Comment!

    voteProject(projectId: ID!, studentId: ID!): Vote!

    awardCoins(teacherId: ID!, studentId: ID!, amount: Int!): User!
  }
`;
