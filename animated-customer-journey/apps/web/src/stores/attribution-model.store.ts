import { create } from "zustand";

type AttributionModel = "last-touch" | "first-touch" | "linear";

interface AttributionModelState {
	model: AttributionModel;
	setModel: (model: AttributionModel) => void;
}

export const useAttributionModelStore = create<AttributionModelState>((set) => ({
	model: "last-touch",
	setModel: (model) => set({ model }),
}));
