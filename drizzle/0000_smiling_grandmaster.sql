CREATE TABLE `blocks` (
	`date` text PRIMARY KEY NOT NULL,
	`reason` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`reference` text NOT NULL,
	`test` text NOT NULL,
	`category` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	`contact` text NOT NULL,
	`company` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`vehicle` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_request_unique` ON `bookings` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_unique` ON `bookings` (`reference`);--> statement-breakpoint
CREATE INDEX `bookings_date_status` ON `bookings` (`date`,`status`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`kind` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`sent_at` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `outbox_booking_kind` ON `outbox` (`booking_id`,`kind`);--> statement-breakpoint
CREATE INDEX `outbox_status` ON `outbox` (`status`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`mode` text DEFAULT 'unconfigured' NOT NULL,
	`anchor` text DEFAULT '' NOT NULL
);
