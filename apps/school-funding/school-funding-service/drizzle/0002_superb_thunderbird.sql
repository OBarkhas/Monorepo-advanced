CREATE TABLE `weekly_winners_table` (
	`id` text PRIMARY KEY NOT NULL,
	`rank` integer NOT NULL,
	`project_id` text NOT NULL,
	`project_title` text NOT NULL,
	`creator_id` text NOT NULL,
	`coins_collected` integer DEFAULT 0 NOT NULL,
	`week_label` text NOT NULL,
	`created_at` text NOT NULL
);
