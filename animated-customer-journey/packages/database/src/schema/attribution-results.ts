import { pgTable, serial, integer, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { conversionEvents } from "./conversion-events.js";
import { touchpoints } from "./touchpoints.js";

export const attributionResults = pgTable("attribution_results", {
	id: serial("id").primaryKey(),
	conversionEventId: integer("conversion_event_id")
		.notNull()
		.references(() => conversionEvents.id),
	touchpointId: integer("touchpoint_id").references(() => touchpoints.id),
	attributionModel: varchar("attribution_model", { length: 64 }).notNull(),
	creditWeight: decimal("credit_weight", { precision: 5, scale: 4 }).notNull(),
	attributedValue: decimal("attributed_value", { precision: 12, scale: 2 }).notNull(),
	channelName: varchar("channel_name", { length: 128 }).notNull(),
	calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
});
