import { describe, expect, it } from "vitest";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";
import { lastTouchStrategy } from "../strategies/last-touch.strategy.js";

const baseConversion: ConversionEvent = {
	id: 1,
	eventId: "conv-001",
	userId: "user-1",
	conversionValue: "150.00",
	timestamp: new Date("2026-03-15T10:00:00Z"),
	metadata: null,
	createdAt: new Date(),
};

function makeTouchpoint(overrides: Partial<Touchpoint> & { id: number; channelName: string; timestamp: Date }): Touchpoint {
	return {
		touchpointId: `tp-${overrides.id}`,
		userId: "user-1",
		campaignName: null,
		cost: null,
		createdAt: new Date(),
		...overrides,
	};
}

describe("lastTouchStrategy", () => {
	it("assigns 100% credit to the last touchpoint before conversion", () => {
		const touchpoints: Touchpoint[] = [
			makeTouchpoint({ id: 1, channelName: "Social", timestamp: new Date("2026-03-10T09:00:00Z") }),
			makeTouchpoint({ id: 2, channelName: "Email", timestamp: new Date("2026-03-12T14:00:00Z") }),
			makeTouchpoint({ id: 3, channelName: "Organic", timestamp: new Date("2026-03-14T11:00:00Z") }),
		];
		const results = lastTouchStrategy.attribute(baseConversion, touchpoints);
		expect(results).toHaveLength(1);
		expect(results[0].channelName).toBe("Organic");
		expect(results[0].creditWeight).toBe("1.0000");
		expect(results[0].attributedValue).toBe("150.00");
		expect(results[0].touchpointId).toBe(3);
	});

	it("marks as unattributed when no touchpoints exist", () => {
		const results = lastTouchStrategy.attribute(baseConversion, []);
		expect(results).toHaveLength(1);
		expect(results[0].channelName).toBe("Unattributed");
		expect(results[0].touchpointId).toBeNull();
	});

	it("excludes touchpoints after conversion timestamp", () => {
		const touchpoints: Touchpoint[] = [
			makeTouchpoint({ id: 1, channelName: "Social", timestamp: new Date("2026-03-10T09:00:00Z") }),
			makeTouchpoint({ id: 2, channelName: "Email", timestamp: new Date("2026-03-20T14:00:00Z") }), // after conversion
		];
		const results = lastTouchStrategy.attribute(baseConversion, touchpoints);
		expect(results[0].channelName).toBe("Social");
	});

	it("uses alphabetical tie-breaking for same timestamps", () => {
		const sameTime = new Date("2026-03-14T10:00:00Z");
		const touchpoints: Touchpoint[] = [
			makeTouchpoint({ id: 1, channelName: "Social", timestamp: sameTime }),
			makeTouchpoint({ id: 2, channelName: "Email", timestamp: sameTime }),
		];
		const results = lastTouchStrategy.attribute(baseConversion, touchpoints);
		// Sorted alphabetically: Email, Social. Last = Social
		expect(results[0].channelName).toBe("Social");
	});
});
