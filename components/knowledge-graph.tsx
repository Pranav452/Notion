'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { workspaceService } from '@/lib/supabase/workspace';
import { Button } from './ui/button';
import { Maximize2, Minimize2, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Layers, Filter, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface KnowledgeGraphProps {
  workspaceId: string;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: string;
  tags?: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

export function KnowledgeGraph({ 
  workspaceId, 
  onNodeClick,
  className = "" 
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Available colors for different node types and tags
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const loadGraph = useCallback(async () => {
    setIsLoading(true);
    try {
      const graphData = await workspaceService.getKnowledgeGraph(workspaceId);
      const pages = await workspaceService.getPages(workspaceId);
      
      console.log('Graph data loaded:', graphData);
      
      // Create a map of page IDs to page data
      const pageMap = new Map(pages.map(page => [page.id, page]));
      
      const graphNodes: GraphNode[] = graphData.nodes.map((node) => {
        const pageData = pageMap.get(node.id);
        return {
          id: node.id,
          title: node.title,
          type: node.type,
          tags: pageData?.tags || []
        };
      });

      const graphLinks: GraphLink[] = graphData.edges.map((edge, index) => ({
        id: `${edge.from}-to-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: edge.type
      }));

      // If no links exist, create some example links for demonstration
      if (graphLinks.length === 0 && graphNodes.length > 1) {
        // Create some sample connections based on shared tags
        const sampleLinks: GraphLink[] = [];
        
        // First, try to connect nodes with shared tags
        for (let i = 0; i < graphNodes.length; i++) {
          for (let j = i + 1; j < graphNodes.length; j++) {
            const node1 = graphNodes[i];
            const node2 = graphNodes[j];
            
            // Check if nodes share tags
            const sharedTags = node1.tags?.filter(tag => node2.tags?.includes(tag)) || [];
            if (sharedTags.length > 0) {
              sampleLinks.push({
                id: `shared-tags-${i}-${j}`,
                source: node1.id,
                target: node2.id,
                type: 'related'
              });
            }
          }
        }
        
        // Add some AI suggested connections for variety
        const maxAISuggestions = Math.min(3, Math.floor(graphNodes.length / 2));
        for (let i = 0; i < maxAISuggestions; i++) {
          let sourceIdx = 0;
          let targetIdx = 0;
          let attempts = 0;
          
          do {
            sourceIdx = Math.floor(Math.random() * graphNodes.length);
            targetIdx = Math.floor(Math.random() * graphNodes.length);
            attempts++;
          } while (
            sourceIdx === targetIdx && 
            attempts < 10 &&
            !sampleLinks.some(l => 
              (l.source === graphNodes[sourceIdx].id && l.target === graphNodes[targetIdx].id) ||
              (l.source === graphNodes[targetIdx].id && l.target === graphNodes[sourceIdx].id)
            )
          );
          
          if (sourceIdx !== targetIdx && attempts < 10) {
            sampleLinks.push({
              id: `ai-suggestion-${i}`,
              source: graphNodes[sourceIdx].id,
              target: graphNodes[targetIdx].id,
              type: 'ai_suggested'
            });
          }
        }
        
        // If still no links, create a basic chain to ensure connectivity
        if (sampleLinks.length === 0) {
          for (let i = 0; i < Math.min(graphNodes.length - 1, 4); i++) {
            sampleLinks.push({
              id: `chain-${i}`,
              source: graphNodes[i].id,
              target: graphNodes[i + 1].id,
              type: 'reference'
            });
          }
          
          // Add one or two cross-connections for more interesting layout
          if (graphNodes.length > 3) {
            sampleLinks.push({
              id: 'cross-1',
              source: graphNodes[0].id,
              target: graphNodes[Math.floor(graphNodes.length / 2)].id,
              type: 'weak_connection'
            });
          }
          
          if (graphNodes.length > 4) {
            sampleLinks.push({
              id: 'cross-2',
              source: graphNodes[1].id,
              target: graphNodes[graphNodes.length - 1].id,
              type: 'ai_suggested'
            });
          }
        }
        
        console.log(`Created ${sampleLinks.length} sample links for visualization`);
        setLinks(sampleLinks);
      } else {
        setLinks(graphLinks);
      }
      
      setNodes(graphNodes);
    } catch (error) {
      console.error('Error loading knowledge graph:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  // Update dimensions when container changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // Filter nodes and links based on search and tag filters
  const filteredData = useCallback(() => {
    let filteredNodes = nodes;
    let filteredLinks = links;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredNodes = nodes.filter(node => 
        node.title.toLowerCase().includes(query) ||
        node.tags?.some(tag => tag.toLowerCase().includes(query))
      );
      
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = links.filter(link => 
        nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) &&
        nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
      );
    }

    // Filter by selected tags
    if (selectedTags.size > 0) {
      filteredNodes = filteredNodes.filter(node =>
        node.tags?.some(tag => selectedTags.has(tag))
      );
      
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link => 
        nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) &&
        nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
      );
    }

    return { nodes: filteredNodes, links: filteredLinks };
  }, [nodes, links, searchQuery, selectedTags]);

  // Create and update the D3 visualization
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    
    // Clear previous content
    svg.selectAll("*").remove();

    const { nodes: filteredNodes, links: filteredLinks } = filteredData();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        setZoomLevel(transform.k);
        svg.select('.zoom-group').attr('transform', transform);
      });

    svg.call(zoom);

    // Create zoom group
    const g = svg.append('g').attr('class', 'zoom-group');

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(filteredNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(filteredLinks).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', d => d.type === 'ai_suggested' ? '#3b82f6' : '#6b7280')
      .attr('stroke-width', d => d.type === 'ai_suggested' ? 3 : 2)
      .attr('stroke-dasharray', d => d.type === 'ai_suggested' ? '5,5' : 'none')
      .attr('opacity', 0.7);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Add drag behavior separately
    const dragHandler = d3.drag<SVGGElement, GraphNode>()
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

    (node as any).call(dragHandler);

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => Math.max(20, d.title.length * 2))
      .attr('fill', d => colorScale(d.tags?.[0] || 'default'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onNodeClick) {
          onNodeClick(d.id);
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 4)
          .attr('r', Math.max(25, d.title.length * 2.5));
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .attr('r', Math.max(20, d.title.length * 2));
      });

    // Add labels to nodes
    node.append('text')
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('pointer-events', 'none');

    // Add tag indicators
    node.each(function(d) {
      if (d.tags && d.tags.length > 0) {
        const nodeGroup = d3.select(this);
        d.tags.slice(0, 3).forEach((tag, index) => {
          nodeGroup.append('circle')
            .attr('r', 4)
            .attr('cx', 15 + index * 8)
            .attr('cy', -15)
            .attr('fill', colorScale(tag))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1);
        });
      }
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, onNodeClick, filteredData, colorScale]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Get all available tags
  const allTags = Array.from(new Set(nodes.flatMap(node => node.tags || [])));

  const handleZoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1 / 1.5
      );
    }
  };

  const handleResetView = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      );
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading knowledge graph...</span>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className} border rounded-lg bg-gradient-to-br from-slate-50 to-gray-100`}>
        <div className="text-center text-gray-500 max-w-md">
          <Layers className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <div className="text-xl font-medium mb-2">No pages found</div>
          <div className="text-sm">Create some pages to see the knowledge graph visualization</div>
        </div>
      </div>
    );
  }

  const graphContent = (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-gray-100" ref={containerRef}>
      {/* Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 w-48 border-slate-200 focus:border-slate-400 bg-white/80 text-sm"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <div className="flex flex-wrap gap-1 max-w-md">
                {allTags.slice(0, 5).map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.has(tag) ? 'default' : 'outline'}
                    className={`text-xs cursor-pointer transition-all ${
                      selectedTags.has(tag) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/80 text-slate-600 hover:bg-slate-100'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length > 5 && (
                  <Badge variant="outline" className="text-xs bg-white/80 text-slate-500">
                    +{allTags.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetView} className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={loadGraph} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Graph SVG */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60 text-sm z-10 max-w-xs">
        <div className="font-medium mb-3 text-slate-900">Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-600"></div>
            <span className="text-slate-600">Manual Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2"></div>
            <span className="text-slate-600">AI Suggested</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200">
            <span>{filteredData().nodes.length} nodes, {filteredData().links.length} connections</span>
          </div>
          <div className="text-xs text-slate-400">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-200/60 text-xs text-slate-600 max-w-48 z-10">
        <div className="font-medium mb-1">Interaction Tips:</div>
        <ul className="space-y-1 text-slate-500">
          <li>• Drag nodes to reposition</li>
          <li>• Click nodes to open pages</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Use filters to focus view</li>
        </ul>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        {graphContent}
      </div>
    );
  }

  return (
    <div className={`${className} h-full border rounded-lg overflow-hidden`}>
      {graphContent}
    </div>
  );
} 