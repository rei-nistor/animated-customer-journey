import { pgTable, serial, varchar, decimal, timestamp } from "drizzle-orm/pg-core";

export const touchpoints = pgTable("touchpoints", {
	id: serial("id").primaryKey(),
	touchpointId: varchar("touchpoint_id", { length: 256 }).notNull().unique(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	channelName: varchar("channel_name", { length: 128 }).notNull(),
	campaignName: varchar("campaign_name", { length: 256 }),
	timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
	cost: decimal("cost", { precision: 12, scale: 2 }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
