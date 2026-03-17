import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, type SankeyGraph } from "d3-sankey";
import type { SankeyData } from "../data/mock-journeys";

interface SankeyFlowProps {
	data: SankeyData;
	width?: number;
	height?: number;
}

const CHANNEL_COLORS: Record<string, string> = {
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

export function SankeyFlow({ data, width = 900, height = 500 }: SankeyFlowProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!svgRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const margin = { top: 20, right: 140, bottom: 20, left: 20 };
		const innerW = width - margin.left - margin.right;
		const innerH = height - margin.top - margin.bottom;

		const g = svg
			.attr("viewBox", `0 0 ${width} ${height}`)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Build the Sankey layout
		const sankeyGen = sankey<{ name: string }, {}>()
			.nodeId((_d, i) => i)
			.nodeWidth(18)
			.nodePadding(14)
			.nodeSort(null)
			.extent([
				[0, 0],
				[innerW, innerH],
			]);

		const graph: SankeyGraph<{ name: string }, {}> = sankeyGen({
			nodes: data.nodes.map((d) => ({ ...d })),
			links: data.links.map((d) => ({ ...d })),
		});

		// --- Links ---
		const linkGroup = g
			.append("g")
			.attr("fill", "none")
			.attr("stroke-opacity", 0.35)
			.selectAll("path")
			.data(graph.links)
			.join("path")
			.attr("d", sankeyLinkHorizontal())
			.attr("stroke", (d: any) => nodeColor(d.source.name))
			.attr("stroke-width", (d: any) => Math.max(1, d.width ?? 1));

		// Animate links: grow from left
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

		// Hover effect on links
		linkGroup
			.on("mouseover", function () {
				d3.select(this).attr("stroke-opacity", 0.6);
			})
			.on("mouseout", function () {
				d3.select(this).attr("stroke-opacity", 0.35);
			});

		// Link tooltip
		linkGroup.append("title").text(
			(d: any) => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} visitors`,
		);

		// --- Nodes ---
		const nodeGroup = g
			.append("g")
			.selectAll("g")
			.data(graph.nodes)
			.join("g");

		// Node rectangles
		nodeGroup
			.append("rect")
			.attr("x", (d: any) => d.x0)
			.attr("y", (d: any) => d.y0)
			.attr("width", (d: any) => d.x1 - d.x0)
			.attr("height", (d: any) => Math.max(1, d.y1 - d.y0))
			.attr("fill", (d: any) => nodeColor(d.name))
			.attr("rx", 3)
			// Animate: fade in
			.attr("opacity", 0)
			.transition()
			.duration(600)
			.attr("opacity", 1);

		// Node labels
		nodeGroup
			.append("text")
			.attr("x", (d: any) => (d.x0 < innerW / 2 ? d.x1 + 8 : d.x0 - 8))
			.attr("y", (d: any) => (d.y0 + d.y1) / 2)
			.attr("dy", "0.35em")
			.attr("text-anchor", (d: any) => (d.x0 < innerW / 2 ? "start" : "end"))
			.text((d: any) => d.name)
			.attr("font-size", "13px")
			.attr("font-family", "system-ui, sans-serif")
			.attr("fill", "#333")
			.attr("font-weight", 500)
			.attr("opacity", 0)
			.transition()
			.delay(400)
			.duration(600)
			.attr("opacity", 1);

		// Node value labels (smaller)
		nodeGroup
			.append("text")
			.attr("x", (d: any) => (d.x0 < innerW / 2 ? d.x1 + 8 : d.x0 - 8))
			.attr("y", (d: any) => (d.y0 + d.y1) / 2 + 16)
			.attr("dy", "0.35em")
			.attr("text-anchor", (d: any) => (d.x0 < innerW / 2 ? "start" : "end"))
			.text((d: any) => `${(d.value ?? 0).toLocaleString()}`)
			.attr("font-size", "11px")
			.attr("font-family", "system-ui, sans-serif")
			.attr("fill", "#888")
			.attr("opacity", 0)
			.transition()
			.delay(600)
			.duration(600)
			.attr("opacity", 1);

		// Node tooltip
		nodeGroup
			.append("title")
			.text((d: any) => `${d.name}\n${(d.value ?? 0).toLocaleString()} total flow`);
	}, [data, width, height]);

	return (
		<svg
			ref={svgRef}
			style={{ width: "100%", maxWidth: width, height: "auto" }}
		/>
	);
}
