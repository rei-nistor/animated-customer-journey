const RANGES = ["30D", "90D", "180D"] as const;
export type DateRange = (typeof RANGES)[number];

interface DateRangeToggleProps {
	value: DateRange;
	onChange: (r: DateRange) => void;
}

export function DateRangeToggle({ value, onChange }: DateRangeToggleProps) {
	return (
		<div
			style={{
				display: "inline-flex",
				background: "#f0f0f0",
				borderRadius: 7,
				padding: 3,
				gap: 2,
			}}
		>
			{RANGES.map((r) => (
				<button
					key={r}
					onClick={() => onChange(r)}
					style={{
						padding: "0.3rem 0.75rem",
						borderRadius: 5,
						border: "none",
						background: value === r ? "#fff" : "transparent",
						color: value === r ? "#111" : "#888",
						fontWeight: value === r ? 600 : 400,
						fontSize: "0.8rem",
						cursor: "pointer",
						boxShadow: value === r ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
						transition: "all 0.15s ease",
					}}
				>
					{r}
				</button>
			))}
		</div>
	);
}
