/**
 * ForceGraph — D3 force-directed graph for the Note Knowledge Graph view.
 *
 * Renders nodes (notes) and links (backlinks) using an SVG canvas with
 * drag, zoom/pan, and click interactions.
 */

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

export interface GraphNode {
  id: string;
  title: string;
  connections: number;
  // D3 simulation mutates these
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface ForceGraphProps {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  onNodeClick: (nodeId: string) => void;
}

// Node radius: scaled between 6 and 20 based on connection count
function nodeRadius(connections: number): number {
  return Math.min(20, Math.max(6, 6 + connections * 2.5));
}

export function ForceGraph({ data, onNodeClick }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable callback ref to avoid restarting sim on every parent re-render
  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  const buildGraph = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!svg || !container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');

    // Colours
    const bgColor = isDark ? '#111827' : '#f9fafb'; // gray-900 / gray-50
    const connectedNodeFill = isDark ? '#6366f1' : '#4f46e5'; // indigo-500 / indigo-600
    const isolatedNodeFill = isDark ? '#4b5563' : '#9ca3af'; // gray-600 / gray-400
    const linkStroke = isDark
      ? 'rgba(99,102,241,0.25)'
      : 'rgba(79,70,229,0.18)';
    const labelColor = isDark ? '#e5e7eb' : '#374151'; // gray-200 / gray-700
    const highlightStroke = isDark ? '#a5b4fc' : '#818cf8'; // indigo-300 / indigo-400
    const tooltipBg = isDark ? '#1f2937' : '#ffffff';
    const tooltipText = isDark ? '#f3f4f6' : '#111827';
    const tooltipBorder = isDark ? '#374151' : '#e5e7eb';

    // Clear previous render
    d3.select(svg).selectAll('*').remove();

    // Deep-copy nodes & links so D3 can mutate them safely
    const nodes: GraphNode[] = data.nodes.map((n) => ({ ...n }));
    const linksCopy: GraphLink[] = data.links.map((l) => ({
      source:
        typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
      target:
        typeof l.target === 'string' ? l.target : (l.target as GraphNode).id,
    }));

    // Root SVG setup
    const svgSel = d3
      .select(svg)
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', 'Note knowledge graph');

    // Background rect (captures zoom events on empty space)
    svgSel
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', bgColor);

    // Zoom / pan container
    const g = svgSel.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svgSel.call(zoom);

    // --------------- Tooltip ---------------
    // Use a plain div appended to the container
    let tooltip = d3.select(container).select<HTMLDivElement>('.fg-tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select(container)
        .append('div')
        .attr('class', 'fg-tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('display', 'none')
        .style('padding', '8px 10px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('line-height', '1.5')
        .style('max-width', '200px')
        .style('z-index', '50');
    }

    function showTooltip(event: MouseEvent, node: GraphNode) {
      const containerRect = container!.getBoundingClientRect();
      const x = event.clientX - containerRect.left + 12;
      const y = event.clientY - containerRect.top - 10;

      tooltip
        .style('display', 'block')
        .style('left', `${x}px`)
        .style('top', `${y}px`)
        .style('background', tooltipBg)
        .style('color', tooltipText)
        .style('border', `1px solid ${tooltipBorder}`)
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
        .html(
          `<div style="font-weight:600;margin-bottom:2px">${escapeHtml(node.title)}</div>` +
            `<div style="color:${isDark ? '#9ca3af' : '#6b7280'}">` +
            `${node.connections} connection${node.connections !== 1 ? 's' : ''}` +
            `</div>`
        );
    }

    function hideTooltip() {
      tooltip.style('display', 'none');
    }

    // --------------- Force simulation ---------------
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(linksCopy)
          .id((d) => d.id)
          .distance(80)
          .strength(0.5)
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        d3
          .forceCollide<GraphNode>()
          .radius((d) => nodeRadius(d.connections) + 8)
      );

    // --------------- Links ---------------
    const linkSel = g
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', linkStroke)
      .attr('stroke-width', 1.5);

    // --------------- Nodes group ---------------
    const nodeGroup = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('role', 'button')
      .attr('aria-label', (d) => `Note: ${d.title}`)
      .on('click', (_event, d) => {
        onNodeClickRef.current(d.id);
      })
      .on('mouseover', (event, d) => {
        // Highlight the node ring
        d3.select(event.currentTarget as SVGGElement)
          .select('circle')
          .attr('stroke', highlightStroke)
          .attr('stroke-width', 2.5);
        showTooltip(event as MouseEvent, d);
      })
      .on('mousemove', (event, d) => {
        showTooltip(event as MouseEvent, d);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget as SVGGElement)
          .select('circle')
          .attr('stroke', 'none')
          .attr('stroke-width', 0);
        hideTooltip();
      });

    // Circle for each node
    nodeGroup
      .append('circle')
      .attr('r', (d) => nodeRadius(d.connections))
      .attr('fill', (d) =>
        d.connections > 0 ? connectedNodeFill : isolatedNodeFill
      )
      .attr('stroke', 'none');

    // Label below each node
    nodeGroup
      .append('text')
      .text((d) => (d.title.length > 20 ? d.title.slice(0, 20) + '…' : d.title))
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => nodeRadius(d.connections) + 12)
      .attr('font-size', '11px')
      .attr('fill', labelColor)
      .attr('pointer-events', 'none')
      .style('user-select', 'none');

    // --------------- Drag behaviour ---------------
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag);

    // --------------- Tick handler ---------------
    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Cleanup: stop simulation when this effect tears down
    return () => {
      simulation.stop();
      hideTooltip();
    };
  }, [data]);

  useEffect(() => {
    const cleanup = buildGraph();
    return cleanup;
  }, [buildGraph]);

  // Re-run graph on container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      buildGraph();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [buildGraph]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
