import * as Query from './queries';
import * as Mutation from './mutations';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
    getUserById: Query.getUserById,
    getPublicProjects: Query.getPublicProjects,
    getPendingProjects: Query.getPendingProjects,
    getProjectsByStudent: Query.getProjectsByStudent,
    getProjectById: Query.getProjectById,
    getCommentsByProject: Query.getCommentsByProject,
    getLeaderboard: Query.getLeaderboard,
    getCoinAwardsByStudent: Query.getCoinAwardsByStudent,
  },
  Mutation: {
    createUser: Mutation.createUser,
    createProject: Mutation.createProject,
    updateProject: Mutation.updateProject,
    updateProjectStatus: Mutation.updateProjectStatus,
    voteProject: Mutation.voteProject,
    addComment: Mutation.addComment,
    awardCoins: Mutation.awardCoins,
    deleteProject: Mutation.deleteProject,
    deleteUser: Mutation.deleteUser,
  },
};
