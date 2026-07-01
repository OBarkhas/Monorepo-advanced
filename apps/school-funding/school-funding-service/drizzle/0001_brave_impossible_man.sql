ALTER TABLE `fundings_table` RENAME TO `votes_table`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_votes_table` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`student_id` text NOT NULL,
	`coin_amount` integer DEFAULT 10 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects_table`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_votes_table`("id", "project_id", "student_id", "coin_amount", "created_at") SELECT "id", "project_id", "student_id", "coin_amount", "created_at" FROM `votes_table`;--> statement-breakpoint
DROP TABLE `votes_table`;--> statement-breakpoint
ALTER TABLE `__new_votes_table` RENAME TO `votes_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`id` text PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'STUDENT' NOT NULL,
	`age` integer,
	`coin_balance` integer DEFAULT 100 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("id", "user_name", "email", "role", "age", "coin_balance", "created_at", "updated_at") SELECT "id", "user_name", "email", "role", "age", "coin_balance", "created_at", "updated_at" FROM `users_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);--> statement-breakpoint
ALTER TABLE `projects_table` ADD `rejection_reason` text;--> statement-breakpoint
ALTER TABLE `projects_table` ADD `end_date` text;--> statement-breakpoint
CREATE INDEX `coins_idx` ON `projects_table` (`total_coins_collected`);