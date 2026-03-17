import type { AttributionResult } from "../models/attribution-result.js";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";
import type { IAttributionStrategy } from "./attribution-strategy.js";

function sortTouchpoints(touchpoints: Touchpoint[]): Touchpoint[] {
	return [...touchpoints].sort((a, b) => {
		const timeDiff = a.timestamp.getTime() - b.timestamp.getTime();
		if (timeDiff !== 0) return timeDiff;
		return a.channelName.localeCompare(b.channelName);
	});
}

function eligible(touchpoints: Touchpoint[], conversion: ConversionEvent): Touchpoint[] {
	return sortTouchpoints(touchpoints).filter(
		(tp) => tp.timestamp.getTime() < conversion.timestamp.getTime(),
	);
}

export const lastTouchStrategy: IAttributionStrategy = {
	modelName: "last-touch",
	attribute(conversion, touchpoints): AttributionResult[] {
		const sorted = eligible(touchpoints, conversion);
		if (sorted.length === 0) {
			return [
				{
					conversionEventId: conversion.id,
					touchpointId: null,
					attributionModel: "last-touch",
					creditWeight: "1.0000",
					attributedValue: conversion.conversionValue,
					channelName: "Unattributed",
				},
			];
		}
		const last = sorted[sorted.length - 1];
		return [
			{
				conversionEventId: conversion.id,
				touchpointId: last.id,
				attributionModel: "last-touch",
				creditWeight: "1.0000",
				attributedValue: conversion.conversionValue,
				channelName: last.channelName,
			},
		];
	},
};

export { sortTouchpoints, eligible };
