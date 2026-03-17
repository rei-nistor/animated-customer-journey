export interface AttributionResult {
	conversionEventId: number;
	touchpointId: number | null; // null = unattributed
	attributionModel: string;
	creditWeight: string; // string-encoded decimal 0.0000–1.0000
	attributedValue: string; // string-encoded decimal
	channelName: string;
}
