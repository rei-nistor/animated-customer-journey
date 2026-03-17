import type { AttributionResult } from "../models/attribution-result.js";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";
import type { IAttributionStrategy } from "./attribution-strategy.js";
import { eligible } from "./last-touch.strategy.js";

export const firstTouchStrategy: IAttributionStrategy = {
	modelName: "first-touch",
	attribute(conversion, touchpoints): AttributionResult[] {
		const sorted = eligible(touchpoints, conversion);
		if (sorted.length === 0) {
			return [
				{
					conversionEventId: conversion.id,
					touchpointId: null,
					attributionModel: "first-touch",
					creditWeight: "1.0000",
					attributedValue: conversion.conversionValue,
					channelName: "Unattributed",
				},
			];
		}
		const first = sorted[0];
		return [
			{
				conversionEventId: conversion.id,
				touchpointId: first.id,
				attributionModel: "first-touch",
				creditWeight: "1.0000",
				attributedValue: conversion.conversionValue,
				channelName: first.channelName,
			},
		];
	},
};
