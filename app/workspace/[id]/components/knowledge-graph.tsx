"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { WorkspaceService } from "@/lib/supabase/services/workspace";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: number;
  radius?: number;
  color?: string;
  [key: string]: any;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
  type?: string;
}

interface KnowledgeGraphProps {
  workspaceId: string;
}

interface RawNode {
  id: number;
  name?: string;
  group?: number;
  [key: string]: any;
}

interface RawLink {
  source: number;
  target: number;
  value?: number;
  [key: string]: any;
}

interface FetchResult {
  data: {
    nodes: RawNode[];
    links: RawLink[];
  } | null;
  error: { message: string; [key: string]: any } | null;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ workspaceId }): React.ReactElement => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  const [originalNodes, setOriginalNodes] = useState<Node[]>([]);
  const [originalLinks, setOriginalLinks] = useState<Link[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [graphConfig, setGraphConfig] = useState({
    chargeStrength: -600,
    linkDistance: 80,
    linkStrength: 0.5,
    nodeSize: 12,
    showLabels: true,
    colorScheme: d3.schemeCategory10,
  });

  // Color scale for different node groups
  const colorScale = d3.scaleOrdinal(graphConfig.colorScheme);

  // Node size scale based on connections
  const getNodeSize = (node: Node) => {
    const connections = filteredLinks.filter(
      link => 
        (typeof link.source === 'object' ? link.source.id : link.source) === node.id ||
        (typeof link.target === 'object' ? link.target.id : link.target) === node.id
    ).length;
    return Math.max(graphConfig.nodeSize, Math.sqrt(connections * 50));
  };

  useEffect(() => {
    const ws = new WorkspaceService();
    setIsLoading(true);
    setError(null);

    ws.getKnowledgeGraph(workspaceId)
      .then(({ data, error: fetchError }: FetchResult) => {
        if (fetchError) {
          toast.error("Error fetching graph data: " + fetchError.message);
          setError("Failed to load graph data: " + fetchError.message);
          setOriginalNodes([]);
          setOriginalLinks([]);
        } else if (data && data.nodes && data.links) {
          const fetchedNodes: Node[] = data.nodes.map((n: RawNode) => ({
            ...n,
            id: n.id.toString(),
            name: n.name || ("Node " + n.id.toString()),
            group: n.group === undefined ? 0 : n.group,
            radius: graphConfig.nodeSize,
            color: colorScale(n.group?.toString() || "0"),
          }));
          const fetchedLinks: Link[] = data.links.map((l: RawLink) => ({
            ...l,
            source: l.source.toString(),
            target: l.target.toString(),
            value: l.value === undefined ? 1 : l.value,
          }));
          setOriginalNodes(fetchedNodes);
          setOriginalLinks(fetchedLinks);
        } else {
          toast.error("Received no data or incomplete data from the server.");
          setError("Received no data or incomplete data.");
          setOriginalNodes([]);
          setOriginalLinks([]);
        }
      })
      .catch((err: any) => {
        console.error("Unexpected error fetching graph data:", err);
        toast.error("An unexpected error occurred while fetching graph data.");
        setError("An unexpected error occurred: " + (err.message || "Unknown error"));
        setOriginalNodes([]);
        setOriginalLinks([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [workspaceId, graphConfig.nodeSize]);

  useEffect(() => {
    if (isLoading) {
      setFilteredNodes([]);
      setFilteredLinks([]);
      return;
    }
    if (!originalNodes.length) {
      setFilteredNodes([]);
      setFilteredLinks([]);
      return;
    }

    let newFilteredNodes: Node[];
    if (searchTerm.trim() === "") {
      newFilteredNodes = [...originalNodes];
    } else {
      newFilteredNodes = originalNodes.filter((node: Node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredNodes(newFilteredNodes);

    // Update node sizes based on connections
    newFilteredNodes = newFilteredNodes.map(node => ({
      ...node,
      radius: getNodeSize(node),
    }));

    const filteredNodeIds = new Set(newFilteredNodes.map((n: Node) => n.id));
    const newFilteredLinks = originalLinks.filter((link: Link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as Node).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as Node).id;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });
    setFilteredLinks(newFilteredLinks);
  }, [originalNodes, originalLinks, searchTerm, isLoading]);

  const drag = (simulation: d3.Simulation<Node, Link> | null) => {
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, any>, d: Node) {
      if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      setSelectedNode(d);
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, any>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, any>, d: Node) {
      if (!event.active && simulation) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag<SVGCircleElement, Node>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || isLoading || error) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "));

    // Clear previous content
    if (gRef.current) {
      d3.select(gRef.current).selectAll("*").remove();
    } else {
      const gElement = svg.append("g").node();
      if (gElement) gRef.current = gElement;
    }

    const g = d3.select(gRef.current);
    if (!g.node()) return;

    if (filteredNodes.length === 0) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#888")
        .text(searchTerm ? "No nodes match your search." : (originalNodes.length > 0 ? "All nodes filtered out." : "No data to display."));
      if (simulationRef.current) simulationRef.current.stop();
      return;
    }

    // Create arrow marker for directed links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
      .attr("id", d => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // Initialize force simulation
    simulationRef.current = d3.forceSimulation(filteredNodes)
      .force("link", d3.forceLink<Node, Link>(filteredLinks)
        .id(d => d.id)
        .distance(graphConfig.linkDistance)
        .strength(graphConfig.linkStrength))
      .force("charge", d3.forceManyBody().strength(graphConfig.chargeStrength))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide().radius(d => (d as Node).radius! + 5));

    // Create links
    const links = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(filteredLinks)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value))
      .attr("marker-end", "url(#end)");

    // Create nodes
    const nodes = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(filteredNodes)
      .join("circle")
      .attr("r", d => d.radius!)
      .attr("fill", d => d.color!)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulationRef.current) as any);

    // Add hover effects
    nodes
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function(event, d) {
        if (d !== selectedNode) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        }
      })
      .on("click", (event, d) => {
        setSelectedNode(selectedNode?.id === d.id ? null : d);
      });

    // Add node labels
    if (graphConfig.showLabels) {
      const labels = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(filteredNodes)
        .join("text")
        .text(d => d.name)
        .attr("font-size", "10px")
        .attr("fill", "#333")
        .attr("paint-order", "stroke")
        .attr("stroke", "#fff")
        .attr("stroke-width", "0.2px")
        .attr("dx", d => d.radius! + 5)
        .attr("dy", ".35em");

      // Update label positions on tick
      simulationRef.current.on("tick", () => {
        links
          .attr("x1", d => (d.source as Node).x!)
          .attr("y1", d => (d.source as Node).y!)
          .attr("x2", d => (d.target as Node).x!)
          .attr("y2", d => (d.target as Node).y!);

        nodes
          .attr("cx", d => d.x!)
          .attr("cy", d => d.y!);

        labels
          .attr("x", d => d.x! + d.radius! + 5)
          .attr("y", d => d.y!);
      });
    } else {
      // Update without labels
      simulationRef.current.on("tick", () => {
        links
          .attr("x1", d => (d.source as Node).x!)
          .attr("y1", d => (d.source as Node).y!)
          .attr("x2", d => (d.target as Node).x!)
          .attr("y2", d => (d.target as Node).y!);

        nodes
          .attr("cx", d => d.x!)
          .attr("cy", d => d.y!);
      });
    }

    // Setup zoom behavior
    if (!zoomRef.current) {
      zoomRef.current = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });
    }

    svg.call(zoomRef.current);

    // Center the graph
    const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2);
    svg.call(zoomRef.current.transform, initialTransform);

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [filteredNodes, filteredLinks, graphConfig, selectedNode, isLoading, error]);

  const handleConfigChange = (key: keyof typeof graphConfig, value: any) => {
    setGraphConfig(prev => ({ ...prev, [key]: value }));
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-150px)]">
      <Card className="p-4 space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search nodes by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            onClick={() => handleConfigChange("showLabels", !graphConfig.showLabels)}
          >
            {graphConfig.showLabels ? "Hide Labels" : "Show Labels"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Charge Strength</label>
            <Slider
              value={[Math.abs(graphConfig.chargeStrength)]}
              min={100}
              max={2000}
              step={100}
              onValueChange={([value]) => handleConfigChange("chargeStrength", -value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Link Distance</label>
            <Slider
              value={[graphConfig.linkDistance]}
              min={30}
              max={200}
              step={10}
              onValueChange={([value]) => handleConfigChange("linkDistance", value)}
            />
          </div>
        </div>

        {selectedNode && (
          <div className="p-4 space-y-2 border rounded-lg">
            <h3 className="font-semibold">Selected Node: {selectedNode.name}</h3>
            <p className="text-sm text-muted-foreground">Group: {selectedNode.group}</p>
            <p className="text-sm text-muted-foreground">
              Connections: {filteredLinks.filter(l => 
                (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id ||
                (typeof l.target === 'object' ? l.target.id : l.target) === selectedNode.id
              ).length}
            </p>
          </div>
        )}
      </Card>

      <div ref={containerRef} className="flex-grow relative border rounded-lg overflow-hidden bg-background mt-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-lg text-muted-foreground">Loading graph data...</div>
          </div>
        )}
        {!isLoading && error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-6 bg-destructive/10 border-destructive/20 border rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  );
};

export default KnowledgeGraph; 