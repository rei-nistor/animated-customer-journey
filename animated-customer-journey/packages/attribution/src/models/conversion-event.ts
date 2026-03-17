export interface ConversionEvent {
	id: number;
	eventId: string;
	userId: string;
	conversionValue: string; // string-encoded decimal
	timestamp: Date;
	metadata: string | null;
	createdAt: Date;
}
