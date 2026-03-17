import type { AttributionResult } from "../models/attribution-result.js";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";
import type { IAttributionStrategy } from "./attribution-strategy.js";
import { eligible } from "./last-touch.strategy.js";

export const linearStrategy: IAttributionStrategy = {
	modelName: "linear",
	attribute(conversion, touchpoints): AttributionResult[] {
		const sorted = eligible(touchpoints, conversion);
		if (sorted.length === 0) {
			return [
				{
					conversionEventId: conversion.id,
					touchpointId: null,
					attributionModel: "linear",
					creditWeight: "1.0000",
					attributedValue: conversion.conversionValue,
					channelName: "Unattributed",
				},
			];
		}

		const n = sorted.length;
		const value = Number(conversion.conversionValue);
		const baseWeight = Math.floor((10000 / n)) / 10000; // 4 decimal places
		const baseValue = Math.floor((value * baseWeight) * 100) / 100;

		const results: AttributionResult[] = [];
		let totalWeight = 0;
		let totalValue = 0;

		for (let i = 0; i < n; i++) {
			const tp = sorted[i];
			const isLast = i === n - 1;

			const weight = isLast ? Math.round((1 - totalWeight) * 10000) / 10000 : baseWeight;
			const attrValue = isLast
				? Math.round((value - totalValue) * 100) / 100
				: baseValue;

			results.push({
				conversionEventId: conversion.id,
				touchpointId: tp.id,
				attributionModel: "linear",
				creditWeight: weight.toFixed(4),
				attributedValue: attrValue.toFixed(2),
				channelName: tp.channelName,
			});

			totalWeight += isLast ? weight : baseWeight;
			totalValue += isLast ? attrValue : baseValue;
		}

		return results;
	},
};
