import type { ChannelStat } from "../data/mock-journeys";

interface ChannelReportTableProps {
	stats: ChannelStat[];
}

function formatCurrency(n: number): string {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function ChannelReportTable({ stats }: ChannelReportTableProps) {
	return (
		<div style={{ overflowX: "auto" }}>
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					fontSize: "0.875rem",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				<thead>
					<tr
						style={{
							borderBottom: "2px solid #e0e0e0",
							textAlign: "left",
						}}
					>
						<th style={{ padding: "0.75rem 1rem" }}>Channel</th>
						<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Conversions</th>
						<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Revenue</th>
						<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Spend</th>
						<th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>ROI</th>
					</tr>
				</thead>
				<tbody>
					{stats.map((s) => (
						<tr
							key={s.channel}
							style={{ borderBottom: "1px solid #f0f0f0" }}
						>
							<td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>{s.channel}</td>
							<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>{s.conversions}</td>
							<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>{formatCurrency(s.revenue)}</td>
							<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>{formatCurrency(s.spend)}</td>
							<td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
								{s.roi === Infinity ? "∞" : `${s.roi}×`}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
