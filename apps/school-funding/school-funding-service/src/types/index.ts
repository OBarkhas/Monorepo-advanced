import { drizzleProvider } from '../drizzle-provider';

export type Maybe<T> = T | null | undefined;
export type DB = ReturnType<typeof drizzleProvider>;

export interface GraphQLContext {
  db: DB;
  env: any;
  userId?: string;
}

export type BaseQueryResolver<TResult = any, TArgs = any, TParent = unknown> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info: any,
) => Promise<TResult> | TResult;

export type BaseMutationResolver<
  TResult = any,
  TArgs = any,
  TParent = unknown,
> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info: any,
) => Promise<TResult> | TResult;

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FUNDED = 'FUNDED',
}

export enum TransactionType {
  VOTE = 'VOTE',
  REFUND = 'REFUND',
  SPARK = 'SPARK',
  AWARD = 'AWARD',
}

export type User = {
  id: string;
  userName: string;
  email: string;
  role: UserRole;
  age?: number | null;
  coinBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  images: string[];
  creatorId: string;
  status: ProjectStatus;
  reviewedById?: string | null;
  rejectionReason?: string | null;
  totalCoinsCollected: number;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Vote = {
  id: string;
  projectId: string;
  studentId: string;
  coinAmount: number;
  createdAt: string;
};

export type Comment = {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CoinTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  referenceId?: string | null;
  createdAt: string;
};

export type Response = {
  success: boolean;
  message: string;
};

export type CreateUserArgs = {
  userName: string;
  email: string;
  role: UserRole;
  age?: number | null;
};

export type CreateProjectArgs = {
  title: string;
  description: string;
  images?: string[] | null;
  creatorId: string;
};

export type UpdateProjectArgs = {
  id: string;
  title?: string | null;
  description?: string | null;
  images?: string[] | null;
  creatorId: string;
};

export type UpdateProjectStatusArgs = {
  id: string;
  status: ProjectStatus;
  reviewedById: string;
  rejectionReason?: string | null;
};

export type VoteProjectArgs = {
  projectId: string;
  studentId: string;
};

export type AddCommentArgs = {
  projectId: string;
  authorId: string;
  content: string;
};

export type AwardCoinsArgs = {
  teacherId: string;
  studentId: string;
  amount: number;
};

export interface QueryResolvers {
  getUsers: BaseQueryResolver<User[]>;
  getUserById: BaseQueryResolver<User | null, { id: string }>;
  getPublicProjects: BaseQueryResolver<Project[]>;
  getPendingProjects: BaseQueryResolver<Project[]>;
  getProjectsByStudent: BaseQueryResolver<Project[], { studentId: string }>;
  getProjectById: BaseQueryResolver<Project | null, { id: string }>;
  getCommentsByProject: BaseQueryResolver<Comment[], { projectId: string }>;
  getLeaderboard: BaseQueryResolver<Project[]>;
  getCoinAwardsByStudent: BaseQueryResolver<
    CoinTransaction[],
    { studentId: string }
  >;
}

export interface MutationResolvers {
  createUser: BaseMutationResolver<User, CreateUserArgs>;
  createProject: BaseMutationResolver<Project, CreateProjectArgs>;
  updateProject: BaseMutationResolver<Project, UpdateProjectArgs>;
  updateProjectStatus: BaseMutationResolver<Project, UpdateProjectStatusArgs>;
  voteProject: BaseMutationResolver<Vote, VoteProjectArgs>;
  addComment: BaseMutationResolver<Comment, AddCommentArgs>;
  awardCoins: BaseMutationResolver<User, AwardCoinsArgs>;
}
