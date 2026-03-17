import type { AttributionResult } from "../models/attribution-result.js";
import type { ConversionEvent } from "../models/conversion-event.js";
import type { Touchpoint } from "../models/touchpoint.js";

export interface IAttributionStrategy {
	readonly modelName: string;
	attribute(conversion: ConversionEvent, touchpoints: Touchpoint[]): AttributionResult[];
}
