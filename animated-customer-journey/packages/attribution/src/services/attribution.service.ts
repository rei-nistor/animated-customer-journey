import type { AttributionResult } from "../models/attribution-result.js";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";
import type { IAttributionStrategy } from "../strategies/attribution-strategy.js";
import { firstTouchStrategy } from "../strategies/first-touch.strategy.js";
import { lastTouchStrategy } from "../strategies/last-touch.strategy.js";
import { linearStrategy } from "../strategies/linear.strategy.js";

const strategies: Record<string, IAttributionStrategy> = {
	"last-touch": lastTouchStrategy,
	"first-touch": firstTouchStrategy,
	linear: linearStrategy,
};

export function getStrategy(model: string): IAttributionStrategy {
	const strategy = strategies[model];
	if (!strategy) {
		throw new Error(`Unknown attribution model: ${model}. Valid models: ${Object.keys(strategies).join(", ")}`);
	}
	return strategy;
}

export function runAttribution(
	conversions: ConversionEvent[],
	touchpoints: Touchpoint[],
	model: string,
): { results: AttributionResult[]; processed: number; attributed: number; unattributed: number } {
	const strategy = getStrategy(model);
	const touchpointsByUser = new Map<string, Touchpoint[]>();

	for (const tp of touchpoints) {
		const existing = touchpointsByUser.get(tp.userId) ?? [];
		existing.push(tp);
		touchpointsByUser.set(tp.userId, existing);
	}

	const allResults: AttributionResult[] = [];
	let attributed = 0;
	let unattributed = 0;

	for (const conversion of conversions) {
		const userTouchpoints = touchpointsByUser.get(conversion.userId) ?? [];
		const results = strategy.attribute(conversion, userTouchpoints);
		allResults.push(...results);

		if (results.some((r) => r.touchpointId !== null)) {
			attributed++;
		} else {
			unattributed++;
		}
	}

	return {
		results: allResults,
		processed: conversions.length,
		attributed,
		unattributed,
	};
}

export const VALID_MODELS = Object.keys(strategies);
