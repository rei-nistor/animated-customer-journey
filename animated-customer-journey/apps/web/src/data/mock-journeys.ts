/** Mock journey data for local development (no API needed). */

export interface SankeyNode {
	name: string;
}

export interface SankeyLink {
	source: number;
	target: number;
	value: number;
}

export interface SankeyData {
	nodes: SankeyNode[];
	links: SankeyLink[];
}

/**
 * Generates mock Sankey data representing marketing channel → journey stage → conversion paths.
 * Varies slightly based on the selected attribution model.
 */
export function getMockSankeyData(model: "last-touch" | "first-touch" | "linear"): SankeyData {
	// Nodes: channels (0-4) → stages (5-7) → outcomes (8-9)
	const nodes: SankeyNode[] = [
		// Channels (sources)
		{ name: "Paid Search" },     // 0
		{ name: "Social Media" },    // 1
		{ name: "Email" },           // 2
		{ name: "Organic Search" },  // 3
		{ name: "Direct" },          // 4
		// Journey stages
		{ name: "Landing Page" },    // 5
		{ name: "Product Page" },    // 6
		{ name: "Cart" },            // 7
		// Outcomes
		{ name: "Purchase" },        // 8
		{ name: "Drop-off" },        // 9
	];

	const multipliers: Record<string, number[]> = {
		"last-touch":  [1.0, 0.8, 0.6, 0.9, 0.5],
		"first-touch": [0.7, 1.0, 0.9, 0.6, 0.4],
		"linear":      [0.85, 0.9, 0.75, 0.75, 0.45],
	};

	const m = multipliers[model];

	const links: SankeyLink[] = [
		// Channel → Landing Page
		{ source: 0, target: 5, value: Math.round(320 * m[0]) },
		{ source: 1, target: 5, value: Math.round(280 * m[1]) },
		{ source: 2, target: 5, value: Math.round(190 * m[2]) },
		{ source: 3, target: 5, value: Math.round(250 * m[3]) },
		{ source: 4, target: 5, value: Math.round(120 * m[4]) },

		// Landing Page → Product Page
		{ source: 5, target: 6, value: Math.round(680 * m[0]) },
		// Landing Page → Drop-off
		{ source: 5, target: 9, value: Math.round(200 * m[1]) },

		// Product Page → Cart
		{ source: 6, target: 7, value: Math.round(420 * m[2]) },
		// Product Page → Drop-off
		{ source: 6, target: 9, value: Math.round(260 * m[3]) },

		// Cart → Purchase
		{ source: 7, target: 8, value: Math.round(290 * m[4]) },
		// Cart → Drop-off
		{ source: 7, target: 9, value: Math.round(130 * m[0]) },
	];

	return { nodes, links };
}

/** Channel summary stats for the report cards. */
export interface ChannelStat {
	channel: string;
	conversions: number;
	revenue: number;
	spend: number;
	roi: number;
}

export function getMockChannelStats(model: "last-touch" | "first-touch" | "linear"): ChannelStat[] {
	const base: ChannelStat[] = [
		{ channel: "Paid Search", conversions: 87, revenue: 14_320, spend: 4_200, roi: 2.41 },
		{ channel: "Social Media", conversions: 64, revenue: 9_850, spend: 3_100, roi: 2.18 },
		{ channel: "Email", conversions: 52, revenue: 8_700, spend: 800, roi: 9.88 },
		{ channel: "Organic Search", conversions: 71, revenue: 11_200, spend: 1_500, roi: 6.47 },
		{ channel: "Direct", conversions: 31, revenue: 4_900, spend: 0, roi: Infinity },
	];

	// Shift numbers slightly by model so switching models shows a visible change
	const jitter: Record<string, number> = {
		"last-touch": 1.0,
		"first-touch": 0.88,
		"linear": 0.94,
	};
	const j = jitter[model];

	return base.map((s) => ({
		...s,
		conversions: Math.round(s.conversions * j),
		revenue: Math.round(s.revenue * j),
		roi: +(s.roi * j).toFixed(2),
	}));
}
