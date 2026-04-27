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

// Per-channel weights per model — deliberately shift credit between channels.
// last-touch: rewards channels closest to conversion (Paid Search, Direct)
// first-touch: rewards discovery channels (Social, Organic)
// linear: balanced, everyone gets partial credit
const CHANNEL_WEIGHTS: Record<string, number[]> = {
	//                       Paid  Social  Email  Organic  Direct
	"last-touch":  [0.95,  0.55,  0.45,  0.60,    0.90],
	"first-touch": [0.50,  0.95,  0.70,  0.90,    0.35],
	"linear":      [0.72,  0.78,  0.60,  0.75,    0.60],
};

// Base channel inflow volumes (visitors entering from each channel)
const BASE_INFLOWS = [320, 280, 190, 250, 120];

export function getMockSankeyData(model: "last-touch" | "first-touch" | "linear"): SankeyData {
	// Nodes: channels (0-4) → stages (5-7) → outcomes (8-9)
	const nodes: SankeyNode[] = [
		{ name: "Paid Search" },    // 0
		{ name: "Social Media" },   // 1
		{ name: "Email" },          // 2
		{ name: "Organic Search" }, // 3
		{ name: "Direct" },         // 4
		{ name: "Landing Page" },   // 5
		{ name: "Product Page" },   // 6
		{ name: "Cart" },           // 7
		{ name: "Purchase" },       // 8
		{ name: "Drop-off" },       // 9
	];

	const weights = CHANNEL_WEIGHTS[model];

	// Channel → Landing Page (weighted inflows)
	const channelToLanding: SankeyLink[] = BASE_INFLOWS.map((base, i) => ({
		source: i,
		target: 5,
		value: Math.round(base * weights[i]),
	}));

	// Derive downstream flows from total landing page inflow so math is consistent
	const totalLanding = channelToLanding.reduce((sum, l) => sum + l.value, 0);

	const toProductPage = Math.round(totalLanding * 0.68);
	const landingDropoff = totalLanding - toProductPage;

	const toCart = Math.round(toProductPage * 0.62);
	const productDropoff = toProductPage - toCart;

	const toPurchase = Math.round(toCart * 0.69);
	const cartDropoff = toCart - toPurchase;

	const links: SankeyLink[] = [
		...channelToLanding,
		{ source: 5, target: 6, value: toProductPage },
		{ source: 5, target: 9, value: landingDropoff },
		{ source: 6, target: 7, value: toCart },
		{ source: 6, target: 9, value: productDropoff },
		{ source: 7, target: 8, value: toPurchase },
		{ source: 7, target: 9, value: cartDropoff },
	];

	return { nodes, links };
}

/** Channel summary stats for the report cards. */
export interface ChannelStat {
	channel: string;
	conversions: number;
	revenue: number;
	spend: number;
	roi: number | null; // null = no paid spend (Direct)
}

// Base stats for last-touch; other models shift credit between channels
const BASE_STATS = [
	{ channel: "Paid Search",    conversions: 87, revenue: 14_320, spend: 4_200 },
	{ channel: "Social Media",   conversions: 64, revenue: 9_850,  spend: 3_100 },
	{ channel: "Email",          conversions: 52, revenue: 8_700,  spend: 800   },
	{ channel: "Organic Search", conversions: 71, revenue: 11_200, spend: 1_500 },
	{ channel: "Direct",         conversions: 31, revenue: 4_900,  spend: 0     },
];

// Per-channel, per-model revenue/conversion multipliers — mirror the Sankey weights
const STAT_WEIGHTS: Record<string, number[]> = {
	//                       Paid  Social  Email  Organic  Direct
	"last-touch":  [1.00,  0.62,  0.52,  0.68,    0.95],
	"first-touch": [0.54,  1.00,  0.75,  0.95,    0.38],
	"linear":      [0.76,  0.82,  0.64,  0.79,    0.63],
};

export type AttributionModel = "last-touch" | "first-touch" | "linear";

export function getMockChannelStats(model: AttributionModel): ChannelStat[] {
	const weights = STAT_WEIGHTS[model];
	return BASE_STATS.map((s, i) => {
		const w = weights[i];
		const revenue = Math.round(s.revenue * w);
		const roi = s.spend === 0 ? null : +((revenue - s.spend) / s.spend).toFixed(2);
		return {
			channel: s.channel,
			conversions: Math.round(s.conversions * w),
			revenue,
			spend: s.spend,
			roi,
		};
	});
}

export interface SummaryStats {
	totalRevenue: number;
	totalConversions: number;
	bestRoiChannel: string;
	bestRoi: number;
	biggestMover: { channel: string; delta: number } | null;
}

export function getMockSummary(model: AttributionModel): SummaryStats {
	const stats = getMockChannelStats(model);
	const totalRevenue = stats.reduce((s, c) => s + c.revenue, 0);
	const totalConversions = stats.reduce((s, c) => s + c.conversions, 0);
	const bestRoiStat = stats.filter((s) => s.roi !== null).sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))[0];

	let biggestMover: { channel: string; delta: number } | null = null;
	if (model !== "last-touch") {
		const base = getMockChannelStats("last-touch");
		biggestMover = stats
			.map((s, i) => ({
				channel: s.channel,
				delta: Math.round(((s.revenue - base[i].revenue) / base[i].revenue) * 100),
			}))
			.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
	}

	return {
		totalRevenue,
		totalConversions,
		bestRoiChannel: bestRoiStat.channel,
		bestRoi: bestRoiStat.roi as number,
		biggestMover,
	};
}

/** Per-channel revenue delta (%) vs last-touch baseline. Empty object when on last-touch. */
export function getChannelDeltas(model: AttributionModel): Record<string, number> {
	if (model === "last-touch") return {};
	const base = getMockChannelStats("last-touch");
	const current = getMockChannelStats(model);
	const out: Record<string, number> = {};
	base.forEach((b, i) => {
		out[b.channel] = Math.round(((current[i].revenue - b.revenue) / b.revenue) * 100);
	});
	return out;
}
