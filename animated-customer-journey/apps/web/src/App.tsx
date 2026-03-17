import { useMemo } from "react";
import { useAttributionModelStore } from "./stores/attribution-model.store";
import { getMockSankeyData, getMockChannelStats } from "./data/mock-journeys";
import { SankeyFlow } from "./components/SankeyFlow";
import { AttributionToggle } from "./components/AttributionToggle";
import { ChannelReportTable } from "./components/ChannelReportTable";

export function App() {
	const model = useAttributionModelStore((s) => s.model);
	const sankeyData = useMemo(() => getMockSankeyData(model), [model]);
	const channelStats = useMemo(() => getMockChannelStats(model), [model]);

	return (
		<div
			style={{
				fontFamily: "system-ui, -apple-system, sans-serif",
				maxWidth: 1100,
				margin: "0 auto",
				padding: "2rem",
				color: "#222",
			}}
		>
			{/* Header */}
			<header style={{ marginBottom: "2rem" }}>
				<h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
					Animated Customer Journey
				</h1>
				<p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>
					Interactive Sankey flow diagram — conversion paths through marketing channels
				</p>
			</header>

			{/* Controls */}
			<section
				style={{
					display: "flex",
					alignItems: "center",
					gap: "1rem",
					marginBottom: "1.5rem",
				}}
			>
				<span style={{ fontWeight: 500, fontSize: "0.9rem" }}>Attribution Model:</span>
				<AttributionToggle />
			</section>

			{/* Sankey diagram */}
			<section
				style={{
					background: "#fafbfc",
					border: "1px solid #e8e8e8",
					borderRadius: "10px",
					padding: "1.5rem",
					marginBottom: "2rem",
				}}
			>
				<SankeyFlow data={sankeyData} width={1000} height={480} />
			</section>

			{/* Channel report table */}
			<section>
				<h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>
					Channel Attribution Report
					<span
						style={{
							fontSize: "0.8rem",
							fontWeight: 400,
							color: "#888",
							marginLeft: "0.75rem",
						}}
					>
						({model})
					</span>
				</h2>
				<div
					style={{
						background: "#fff",
						border: "1px solid #e8e8e8",
						borderRadius: "10px",
						overflow: "hidden",
					}}
				>
					<ChannelReportTable stats={channelStats} />
				</div>
			</section>

			{/* Footer */}
			<footer
				style={{
					marginTop: "3rem",
					paddingTop: "1rem",
					borderTop: "1px solid #eee",
					color: "#aaa",
					fontSize: "0.8rem",
				}}
			>
				Mock data • Connect the API at <code>/api/health</code> for live data
			</footer>
		</div>
	);
}
