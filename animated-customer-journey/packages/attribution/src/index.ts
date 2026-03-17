export type { ConversionEvent } from "./models/conversion-event.js";
export type { Touchpoint } from "./models/touchpoint.js";
export type { AttributionResult } from "./models/attribution-result.js";
export type { IAttributionStrategy } from "./strategies/attribution-strategy.js";
export { lastTouchStrategy } from "./strategies/last-touch.strategy.js";
export { firstTouchStrategy } from "./strategies/first-touch.strategy.js";
export { linearStrategy } from "./strategies/linear.strategy.js";
export { runAttribution, getStrategy, VALID_MODELS } from "./services/attribution.service.js";
