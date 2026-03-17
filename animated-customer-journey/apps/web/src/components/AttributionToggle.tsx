import { useAttributionModelStore } from "../stores/attribution-model.store";

const models = ["last-touch", "first-touch", "linear"] as const;

const labels: Record<string, string> = {
	"last-touch": "Last Touch",
	"first-touch": "First Touch",
	linear: "Linear",
};

export function AttributionToggle() {
	const { model, setModel } = useAttributionModelStore();

	return (
		<div style={{ display: "flex", gap: "0.5rem" }}>
			{models.map((m) => (
				<button
					key={m}
					onClick={() => setModel(m)}
					style={{
						padding: "0.5rem 1rem",
						borderRadius: "6px",
						border: model === m ? "2px solid #4285f4" : "1px solid #ccc",
						background: model === m ? "#e8f0fe" : "#fff",
						color: model === m ? "#1a73e8" : "#555",
						fontWeight: model === m ? 600 : 400,
						cursor: "pointer",
						fontSize: "0.875rem",
						transition: "all 0.15s ease",
					}}
				>
					{labels[m]}
				</button>
			))}
		</div>
	);
}
