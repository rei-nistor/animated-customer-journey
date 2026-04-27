import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, type SankeyGraph } from "d3-sankey";
import type { SankeyData } from "../data/mock-journeys";

interface SankeyFlowProps {
	data: SankeyData;
	width?: number;
	height?: number;
	onAnimationStart?: () => void;
	onAnimationEnd?: () => void;
}

export const CHANNEL_COLORS: Record<string, string> = {
	"Paid Search": "#4285f4",
	"Social Media": "#ea4335",
	Email: "#fbbc04",
	"Organic Search": "#34a853",
	Direct: "#8e44ad",
	"Landing Page": "#5dade2",
	"Product Page": "#48c9b0",
	Cart: "#f39c12",
	Purchase: "#27ae60",
	"Drop-off": "#95a5a6",
};

function nodeColor(name: string): string {
	return CHANNEL_COLORS[name] ?? "#888";
}

const TRANSITION_MS = 500;

export function SankeyFlow({
	data,
	width = 900,
	height = 500,
	onAnimationStart,
	onAnimationEnd,
}: SankeyFlowProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);
		const margin = { top: 20, right: 140, bottom: 20, left: 20 };
		const innerW = width - margin.left - margin.right;
		const innerH = height - margin.top - margin.bottom;

		const sankeyGen = sankey<{ name: string }, {}>()
			.nodeId((d: any) => d.index)
			.nodeWidth(18)
			.nodePadding(14)
			.nodeSort(null)
			.extent([[0, 0], [innerW, innerH]]);

		const graph: SankeyGraph<{ name: string }, {}> = sankeyGen({
			nodes: data.nodes.map((d) => ({ ...d })),
			links: data.links.map((d) => ({ ...d })),
		});

		if (isFirstRender.current) {
			// --- Initial build: animate links drawing in, nodes fading in ---
			isFirstRender.current = false;

			svg.selectAll("*").remove();
			svg.attr("viewBox", `0 0 ${width} ${height}`);

			const g = svg
				.append("g")
				.attr("class", "sankey-root")
				.attr("transform", `translate(${margin.left},${margin.top})`);

			g.append("g").attr("class", "links").attr("fill", "none");
			g.append("g").attr("class", "nodes");

			buildLinks(g, graph, true);
			buildNodes(g, graph, true);
		} else {
			// --- Model switch: crossfade to new layout ---
			onAnimationStart?.();
			const g = svg.select<SVGGElement>("g.sankey-root");

			g.transition()
				.duration(TRANSITION_MS / 2)
				.attr("opacity", 0)
				.on("end", () => {
					buildLinks(g, graph, false);
					buildNodes(g, graph, false);

					g.transition()
						.duration(TRANSITION_MS)
						.attr("opacity", 1)
						.on("end", () => onAnimationEnd?.());
				});
		}
	}, [data, width, height]);

	return (
		<svg
			ref={svgRef}
			style={{ width: "100%", maxWidth: width, height: "auto" }}
		/>
	);
}

function buildLinks(
	g: d3.Selection<SVGGElement, unknown, null, undefined>,
	graph: SankeyGraph<{ name: string }, {}>,
	animate: boolean,
) {
	const linkGroup = g
		.select<SVGGElement>("g.links")
		.attr("stroke-opacity", 0.35)
		.selectAll<SVGPathElement, (typeof graph.links)[0]>("path")
		.data(graph.links, (_d: any, i: number) => i)
		.join("path")
		.attr("d", sankeyLinkHorizontal())
		.attr("stroke", (d: any) => nodeColor(d.source.name))
		.attr("stroke-width", (d: any) => Math.max(1, d.width ?? 1));

	if (animate) {
		linkGroup
			.attr("stroke-dasharray", function (this: SVGPathElement) {
				const len = this.getTotalLength();
				return `${len} ${len}`;
			})
			.attr("stroke-dashoffset", function (this: SVGPathElement) {
				return this.getTotalLength();
			})
			.transition()
			.duration(1200)
			.ease(d3.easeCubicInOut)
			.attr("stroke-dashoffset", 0);
	}

	linkGroup
		.on("mouseover", function () { d3.select(this).attr("stroke-opacity", 0.6); })
		.on("mouseout", function () { d3.select(this).attr("stroke-opacity", 0.35); });

	linkGroup
		.selectAll("title")
		.data((d: any) => [d])
		.join("title")
		.text((d: any) => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} visitors`);
}

function buildNodes(
	g: d3.Selection<SVGGElement, unknown, null, undefined>,
	graph: SankeyGraph<{ name: string }, {}>,
	animate: boolean,
) {
	const nodeGroup = g
		.select<SVGGElement>("g.nodes")
		.selectAll<SVGGElement, (typeof graph.nodes)[0]>("g")
		.data(graph.nodes, (_d: any, i: number) => i)
		.join("g");

	// Rect
	nodeGroup
		.selectAll<SVGRectElement, (typeof graph.nodes)[0]>("rect")
		.data((d) => [d])
		.join("rect")
		.attr("x", (d: any) => d.x0)
		.attr("y", (d: any) => d.y0)
		.attr("width", (d: any) => d.x1 - d.x0)
		.attr("height", (d: any) => Math.max(1, d.y1 - d.y0))
		.attr("fill", (d: any) => nodeColor(d.name))
		.attr("rx", 3)
		.attr("opacity", animate ? 0 : 1)
		.call((sel) => {
			if (animate) sel.transition().duration(600).attr("opacity", 1);
		});

	// Primary label
	nodeGroup
		.selectAll<SVGTextElement, (typeof graph.nodes)[0]>("text.label")
		.data((d) => [d])
		.join("text")
		.attr("class", "label")
		.attr("x", (d: any) => (d.x0 < (graph.nodes[0] as any)?.x1 + 400 / 2 ? d.x1 + 8 : d.x0 - 8))
		.attr("y", (d: any) => (d.y0 + d.y1) / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", (d: any) => (d.x0 < 400 ? "start" : "end"))
		.text((d: any) => d.name)
		.attr("font-size", "13px")
		.attr("font-family", "system-ui, sans-serif")
		.attr("fill", "#333")
		.attr("font-weight", 500)
		.attr("opacity", animate ? 0 : 1)
		.call((sel) => {
			if (animate) sel.transition().delay(400).duration(600).attr("opacity", 1);
		});

	// Value label
	nodeGroup
		.selectAll<SVGTextElement, (typeof graph.nodes)[0]>("text.value")
		.data((d) => [d])
		.join("text")
		.attr("class", "value")
		.attr("x", (d: any) => (d.x0 < 400 ? d.x1 + 8 : d.x0 - 8))
		.attr("y", (d: any) => (d.y0 + d.y1) / 2 + 16)
		.attr("dy", "0.35em")
		.attr("text-anchor", (d: any) => (d.x0 < 400 ? "start" : "end"))
		.text((d: any) => `${(d.value ?? 0).toLocaleString()}`)
		.attr("font-size", "11px")
		.attr("font-family", "system-ui, sans-serif")
		.attr("fill", "#888")
		.attr("opacity", animate ? 0 : 1)
		.call((sel) => {
			if (animate) sel.transition().delay(600).duration(600).attr("opacity", 1);
		});

	// Tooltip
	nodeGroup
		.selectAll("title")
		.data((d: any) => [d])
		.join("title")
		.text((d: any) => `${d.name}\n${(d.value ?? 0).toLocaleString()} total flow`);
}
