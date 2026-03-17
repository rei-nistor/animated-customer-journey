const API_BASE = "/api";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { "Content-Type": "application/json" },
		...init,
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: res.statusText }));
		throw new Error(body.error ?? `HTTP ${res.status}`);
	}
	return res.json() as Promise<T>;
}

export const apiClient = {
	get: <T>(path: string) => fetchJSON<T>(path),
	post: <T>(path: string, body?: unknown) =>
		fetchJSON<T>(path, {
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),
};
