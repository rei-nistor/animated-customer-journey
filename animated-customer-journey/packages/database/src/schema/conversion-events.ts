import { pgTable, serial, varchar, decimal, timestamp, text } from "drizzle-orm/pg-core";

export const conversionEvents = pgTable("conversion_events", {
	id: serial("id").primaryKey(),
	eventId: varchar("event_id", { length: 256 }).notNull().unique(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	conversionValue: decimal("conversion_value", { precision: 12, scale: 2 }).notNull(),
	timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
	metadata: text("metadata"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
