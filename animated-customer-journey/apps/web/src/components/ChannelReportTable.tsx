import type { ChannelStat } from "../data/mock-journeys";
import { CHANNEL_COLORS } from "./SankeyFlow";

interface ChannelReportTableProps {
	stats: ChannelStat[];
	deltas: Record<string, number>;
	animationKey: string;
	faded?: boolean;
}

function formatCurrency(n: number): string {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatRoi(roi: number | null): React.ReactNode {
	if (roi === null) {
		return (
			<span title="No paid spend — all revenue is organic">
				<span style={{ color: "#888", fontStyle: "italic", fontSize: "0.8em" }}>No paid spend</span>
			</span>
		);
	}
	const color = roi >= 2 ? "#27ae60" : roi >= 0 ? "#f39c12" : "#ea4335";
	return <span style={{ color, fontWeight: 600 }}>{roi}×</span>;
}

function DeltaBadge({ delta, animationKey }: { delta: number; animationKey: string }) {
	if (delta === 0) return null;
	const gain = delta > 0;
	const color = gain ? "#27ae60" : "#ea4335";
	const bg = gain ? "#eafaf1" : "#fdf2f0";
	return (
		<span
			key={animationKey}
			style={{
				display: "inline-block",
				marginLeft: "0.5rem",
				padding: "0.1rem 0.4rem",
				borderRadius: 4,
				background: bg,
				color,
				fontSize: "0.72rem",
				fontWeight: 700,
				animation: "deltaFlash 0.55s ease",
			}}
		>
			{gain ? "▲" : "▼"} {Math.abs(delta)}%
		</span>
	);
}

export function ChannelReportTable({ stats, deltas, animationKey, faded = false }: ChannelReportTableProps) {
	return (
		<>
			<style>{`
				@keyframes deltaFlash {
					0%   { opacity: 0; transform: translateY(-4px) scale(0.9); }
					60%  { opacity: 1; transform: translateY(1px) scale(1.05); }
					100% { opacity: 1; transform: translateY(0) scale(1); }
				}
			`}</style>
			<div
				style={{
					overflowX: "auto",
					opacity: faded ? 0.35 : 1,
					transition: "opacity 0.15s ease",
					position: "relative",
				}}
			>
				{faded && (
					<div
						style={{
							position: "absolute",
							inset: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "0.8rem",
							color: "#888",
							fontStyle: "italic",
							zIndex: 1,
						}}
					>
						Recalculating…
					</div>
				)}
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontSize: "0.875rem",
						fontFamily: "system-ui, sans-serif",
					}}
				>
					<thead>
						<tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
							<th style={{ padding: "0.75rem 1rem" }}>Channel</th>
							<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Conversions</th>
							<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Revenue</th>
							<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Spend</th>
							<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>ROI</th>
						</tr>
					</thead>
					<tbody>
						{stats.map((s) => {
							const delta = deltas[s.channel] ?? 0;
							return (
								<tr key={s.channel} style={{ borderBottom: "1px solid #f0f0f0" }}>
									<td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>
										<span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
											<span
												style={{
													display: "inline-block",
													width: 10,
													height: 10,
													borderRadius: 2,
													background: CHANNEL_COLORS[s.channel] ?? "#888",
													flexShrink: 0,
												}}
											/>
											{s.channel}
										</span>
									</td>
									<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>{s.conversions}</td>
									<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
										{formatCurrency(s.revenue)}
										<DeltaBadge delta={delta} animationKey={`${animationKey}-${s.channel}`} />
									</td>
									<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
										{s.spend === 0 ? <span style={{ color: "#aaa" }}>—</span> : formatCurrency(s.spend)}
									</td>
									<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
										{formatRoi(s.roi)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</>
	);
}
