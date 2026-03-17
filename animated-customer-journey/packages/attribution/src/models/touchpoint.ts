export interface Touchpoint {
	id: number;
	touchpointId: string;
	userId: string;
	channelName: string;
	campaignName: string | null;
	timestamp: Date;
	cost: string | null; // string-encoded decimal
	createdAt: Date;
}
