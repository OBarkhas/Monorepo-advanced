export type Maybe<T> = T | null | undefined;

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
