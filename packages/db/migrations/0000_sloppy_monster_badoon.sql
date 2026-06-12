CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`instagram` text,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`group_name` text,
	`unique_slug` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guests_unique_slug_unique` ON `guests` (`unique_slug`);--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`order_id` integer,
	`slug` text NOT NULL,
	`bride_name` text NOT NULL,
	`groom_name` text NOT NULL,
	`event_date` integer,
	`venue_name` text,
	`venue_address` text,
	`maps_url` text,
	`template_key` text DEFAULT 'modern-minimal' NOT NULL,
	`theme_config_json` text DEFAULT '{}' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`type` text DEFAULT 'image' NOT NULL,
	`url` text NOT NULL,
	`alt_text` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`package_type` text DEFAULT 'basic' NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`order_status` text DEFAULT 'pending' NOT NULL,
	`deadline` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`guest_id` integer,
	`guest_name` text NOT NULL,
	`attendance_status` text NOT NULL,
	`pax_count` integer DEFAULT 1 NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer NOT NULL,
	`guest_name` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
