import type { SummaryStats, AttributionModel } from "../data/mock-journeys";

interface SummaryStripProps {
	summary: SummaryStats;
	model: AttributionModel;
}

function formatCurrency(n: number): string {
	if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
	return `$${n}`;
}

interface KpiCardProps {
	label: string;
	value: React.ReactNode;
	sub?: React.ReactNode;
	accent?: string;
}

function KpiCard({ label, value, sub, accent = "#4285f4" }: KpiCardProps) {
	return (
		<div
			style={{
				flex: 1,
				minWidth: 0,
				background: "#fff",
				border: "1px solid #e8e8e8",
				borderRadius: 10,
				padding: "1rem 1.25rem",
				borderTop: `3px solid ${accent}`,
			}}
		>
			<div style={{ fontSize: "0.75rem", color: "#888", fontWeight: 500, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
				{label}
			</div>
			<div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111", lineHeight: 1.1 }}>
				{value}
			</div>
			{sub && (
				<div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.3rem" }}>
					{sub}
				</div>
			)}
		</div>
	);
}

const MODEL_LABELS: Record<AttributionModel, string> = {
	"last-touch": "Last Touch",
	"first-touch": "First Touch",
	linear: "Linear",
};

export function SummaryStrip({ summary, model }: SummaryStripProps) {
	const { totalRevenue, totalConversions, bestRoiChannel, bestRoi, biggestMover } = summary;

	const moverCard = () => {
		if (!biggestMover) {
			return (
				<KpiCard
					label="Model Delta"
					accent="#8e44ad"
					value={<span style={{ fontSize: "1rem", color: "#aaa", fontWeight: 500 }}>—</span>}
					sub="Switch model to see channel shifts"
				/>
			);
		}

		const gain = biggestMover.delta > 0;
		const color = gain ? "#27ae60" : "#ea4335";
		const arrow = gain ? "▲" : "▼";

		return (
			<KpiCard
				label="Model Delta"
				accent="#8e44ad"
				value={
					<span style={{ color }}>
						{arrow} {Math.abs(biggestMover.delta)}%
					</span>
				}
				sub={
					<>
						<strong style={{ color: "#444" }}>{biggestMover.channel}</strong>
						{" "}vs Last Touch baseline
					</>
				}
			/>
		);
	};

	return (
		<div
			style={{
				display: "flex",
				gap: "1rem",
				marginBottom: "1.75rem",
				flexWrap: "wrap",
			}}
		>
			<KpiCard
				label="Total Revenue"
				accent="#27ae60"
				value={formatCurrency(totalRevenue)}
				sub={`${MODEL_LABELS[model]} attribution`}
			/>
			<KpiCard
				label="Total Conversions"
				accent="#4285f4"
				value={totalConversions.toLocaleString()}
				sub="across all channels"
			/>
			<KpiCard
				label="Best ROI Channel"
				accent="#fbbc04"
				value={bestRoiChannel}
				sub={`${bestRoi}× return on spend`}
			/>
			{moverCard()}
		</div>
	);
}
