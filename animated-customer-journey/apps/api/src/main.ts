import cors from "cors";
import express from "express";
import { logger } from "@acj/logger";

const app = express();
const PORT = Number(process.env.PORT) || 5151;

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
	logger.info(`${req.method} ${req.path}`);
	next();
});

// Health check
app.get("/api/health", (_req, res) => {
	res.json({ status: "ok" });
});

// TODO: Mount route modules in Phase 4
// app.use("/api/conversion-events", conversionEventsRouter);
// app.use("/api/touchpoints", touchpointsRouter);
// app.use("/api/attribution", attributionRouter);
// app.use("/api/reports", reportsRouter);
// app.use("/api/journeys", journeysRouter);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	logger.error("Unhandled error", { error: err.message });
	res.status(500).json({ error: "An unexpected error occurred" });
});

app.listen(PORT, () => {
	logger.info(`API server started on http://localhost:${PORT}`);
});

export default app;
