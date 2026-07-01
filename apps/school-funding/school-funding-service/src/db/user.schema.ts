import { pgEnum } from 'drizzle-orm/pg-core';
import { int, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { UserRole } from './../types/index';

export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDED';

export type TransactionType = 'VOTE' | 'REFUND' | 'SPARK' | 'AWARD';

export const usersTable = sqliteTable('users_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userName: text('user_name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').$type<UserRole>().default(UserRole.STUDENT).notNull(),
  age: int('age'),
  coinBalance: int('coin_balance').default(100).notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
});

export const projectsTable = sqliteTable(
  'projects_table',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: text('title').notNull(),
    description: text('description').notNull(),
    images: text('images', { mode: 'json' })
      .$type<string[]>()
      .default([])
      .notNull(),
    creatorId: text('creator_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    status: text('status').$type<ProjectStatus>().default('PENDING').notNull(),
    reviewedById: text('reviewed_by_id').references(() => usersTable.id),
    rejectionReason: text('rejection_reason'),

    totalCoinsCollected: int('total_coins_collected').default(0).notNull(),

    endDate: text('end_date'),

    createdAt: text('created_at')
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text('updated_at')
      .$onUpdate(() => new Date().toISOString())
      .notNull(),
  },
  (table) => ({
    coinsIdx: index('coins_idx').on(table.totalCoinsCollected),
  }),
);

export const votesTable = sqliteTable('votes_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  projectId: text('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  coinAmount: int('coin_amount').default(10).notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

export const commentsTable = sqliteTable('comments_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  projectId: text('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
});

export const coinTransactionsTable = sqliteTable('coin_transactions_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  amount: int('amount').notNull(),
  type: text('type').$type<TransactionType>().notNull(),
  referenceId: text('reference_id'),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});
