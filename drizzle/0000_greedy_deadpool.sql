CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'Waiting' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`case_id` text NOT NULL,
	`kind` text NOT NULL,
	`role` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_id_unique` ON `events` (`id`);