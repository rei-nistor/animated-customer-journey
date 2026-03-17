import { describe, expect, it } from "vitest";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";
import { linearStrategy } from "../strategies/linear.strategy.js";

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

describe("linearStrategy", () => {
	it("splits credit equally across three touchpoints", () => {
		const touchpoints: Touchpoint[] = [
			makeTouchpoint({ id: 1, channelName: "Social", timestamp: new Date("2026-03-10T09:00:00Z") }),
			makeTouchpoint({ id: 2, channelName: "Email", timestamp: new Date("2026-03-12T14:00:00Z") }),
			makeTouchpoint({ id: 3, channelName: "Organic", timestamp: new Date("2026-03-14T11:00:00Z") }),
		];
		const results = linearStrategy.attribute(baseConversion, touchpoints);
		expect(results).toHaveLength(3);

		// Sum of attributed values should equal conversion value
		const totalValue = results.reduce((sum, r) => sum + Number(r.attributedValue), 0);
		expect(totalValue).toBeCloseTo(150.0, 2);

		// Sum of weights should equal 1.0
		const totalWeight = results.reduce((sum, r) => sum + Number(r.creditWeight), 0);
		expect(totalWeight).toBeCloseTo(1.0, 4);

		// Each should be roughly 1/3
		expect(Number(results[0].creditWeight)).toBeCloseTo(0.3333, 4);
		expect(Number(results[1].creditWeight)).toBeCloseTo(0.3333, 4);
		// Last gets rounding correction
		expect(results[2].channelName).toBe("Organic");
	});

	it("gives 100% to single touchpoint", () => {
		const touchpoints: Touchpoint[] = [
			makeTouchpoint({ id: 1, channelName: "Email", timestamp: new Date("2026-03-12T14:00:00Z") }),
		];
		const results = linearStrategy.attribute(baseConversion, touchpoints);
		expect(results).toHaveLength(1);
		expect(results[0].creditWeight).toBe("1.0000");
		expect(results[0].attributedValue).toBe("150.00");
	});

	it("marks as unattributed when no touchpoints exist", () => {
		const results = linearStrategy.attribute(baseConversion, []);
		expect(results).toHaveLength(1);
		expect(results[0].channelName).toBe("Unattributed");
		expect(results[0].touchpointId).toBeNull();
	});
});
