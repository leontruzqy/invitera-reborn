CREATE TABLE `gift_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`type` text DEFAULT 'bank' NOT NULL,
	`bank_name` text,
	`account_number` text,
	`account_name` text,
	`address` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `invitation_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`name` text NOT NULL,
	`event_date` integer,
	`time_label` text,
	`venue_name` text,
	`venue_address` text,
	`maps_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `love_story_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`title` text NOT NULL,
	`when_label` text,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX "guests_unique_slug_unique";--> statement-breakpoint
DROP INDEX "invitations_slug_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `invitations` ALTER COLUMN "template_key" TO "template_key" text NOT NULL DEFAULT 'rani-raka';--> statement-breakpoint
CREATE UNIQUE INDEX `guests_unique_slug_unique` ON `guests` (`unique_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `invitations` ADD `bride_short_name` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `groom_short_name` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `bride_parents` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `groom_parents` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `bride_tagline` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `groom_tagline` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `opening_greeting` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `verse_arabic` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `verse_translation` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `verse_reference` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `closing_message` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `hashtag` text;--> statement-breakpoint
ALTER TABLE `invitations` ADD `rsvp_deadline` integer;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `slot` text DEFAULT 'gallery' NOT NULL;