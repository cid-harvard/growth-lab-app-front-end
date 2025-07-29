import React, { useMemo, useEffect, useState } from "react";
import * as d3 from "d3";
import styled from "styled-components";

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: visible;
  margin: 0 auto 20px auto;
`;

const ChartHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
`;

const ChartTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-weight: 400;
  font-size: 1.3rem;
`;

const SVGContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-height: 400px;
  overflow: visible;
  width: 100%;
`;

const ResponsiveSVG = styled.svg`
  width: 100%;
  height: auto;
  min-height: 400px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: #fafafa;
`;

const StatsContainer = styled.div`
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 8px 8px;
  font-size: 0.9rem;
  color: #6c757d;
`;

// Types
interface DAGNode {
  id: string;
  data?: any;
}

interface DAGLink {
  source: string;
  target: string;
}

interface DAGData {
  nodes: DAGNode[];
  links: DAGLink[];
}

interface SugiyamaDAGProps {
  data: DAGData;
  title?: string;
  nodeRadius?: number;
  layering?: string;
  decross?: string;
  coord?: string;
  spline?: string;
  arrows?: boolean;
  width?: number;
  height?: number;
  nodeDataMap?: { [key: string]: any };
  horizontalGap?: number;
  verticalGap?: number;
  chartPadding?: number;
}

// React components for rendering
interface EdgeProps {
  points: [number, number][];
  sourceColor: string;
  targetColor: string;
  curve: any;
  id: string;
  isAnimated?: boolean;
  edgeWeight?: number;
  showEdgeLabel?: boolean;
  edgeData?: any;
}

const Edge: React.FC<EdgeProps> = ({
  points,
  sourceColor,
  targetColor,
  curve,
  id,
  isAnimated = false,
  edgeWeight = 1,
  showEdgeLabel = false,
  edgeData,
}) => {
  const line = d3.line().curve(curve || d3.curveLinear);
  const pathData = line(points);

  const gradientId = `gradient-${id}`;
  const [start, end] = [points[0], points[points.length - 1]];

  // Enhanced curve styling with weight-based scaling
  const getCurveStyle = (curveName: string, weight: number) => {
    const baseWidth = 2 + weight * 2;
    const styles = {
      // Stepped curves
      step: {
        strokeDasharray: "8,4",
        strokeWidth: baseWidth * 1.5,
        strokeLinecap: "square" as const,
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))",
      },
      stepBefore: {
        strokeDasharray: "12,4",
        strokeWidth: baseWidth * 1.5,
        strokeLinecap: "square" as const,
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))",
      },
      stepAfter: {
        strokeDasharray: "4,8",
        strokeWidth: baseWidth * 1.5,
        strokeLinecap: "square" as const,
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))",
      },

      // Linear curves
      linear: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 2,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.1))",
      },

      // Smooth curves
      basis: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.2,
        opacity: 0.9,
        strokeLinecap: "round" as const,
        filter: "blur(0.5px)",
      },
      basisClosed: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.2,
        opacity: 0.9,
        strokeLinecap: "round" as const,
        filter: "blur(0.5px)",
      },
      basisOpen: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.2,
        opacity: 0.9,
        strokeLinecap: "round" as const,
        filter: "blur(0.5px)",
      },

      // Cardinal curves
      cardinal: {
        strokeDasharray: "2,2",
        strokeWidth: baseWidth * 1.3,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.15))",
      },
      cardinalClosed: {
        strokeDasharray: "3,3",
        strokeWidth: baseWidth * 1.3,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.15))",
      },
      cardinalOpen: {
        strokeDasharray: "1,3",
        strokeWidth: baseWidth * 1.3,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.15))",
      },

      // Catmull-Rom curves
      catmullRom: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.4,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))",
      },
      catmullRomClosed: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.4,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))",
      },
      catmullRomOpen: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.4,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.2))",
      },

      // Monotone curves
      monotoneX: {
        strokeDasharray: "5,2",
        strokeWidth: baseWidth * 1.1,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.1))",
      },
      monotoneY: {
        strokeDasharray: "7,3",
        strokeWidth: baseWidth * 1.1,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.1))",
      },

      // Natural curve
      natural: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 1.3,
        strokeLinecap: "round" as const,
        filter: "drop-shadow(1.5px 1.5px 2px rgba(0,0,0,0.15))",
        opacity: 0.95,
      },

      // Bundle curve (for edge bundling effects)
      bundle: {
        strokeDasharray: "none",
        strokeWidth: baseWidth * 0.8,
        strokeLinecap: "round" as const,
        filter: "blur(1px)",
        opacity: 0.7,
      },

      default: {
        strokeDasharray: "none",
        strokeWidth: baseWidth,
        strokeLinecap: "round" as const,
        filter: "none",
      },
    };

    return styles[curveName as keyof typeof styles] || styles.default;
  };

  const curveStyle = getCurveStyle(curve?.name || "default", edgeWeight);

  // Calculate path length for animations
  const pathLength = useMemo(() => {
    if (!pathData) return 0;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    return path.getTotalLength();
  }, [pathData]);

  // Edge label positioning
  const midPoint = useMemo(() => {
    if (points.length < 2) return [0, 0];
    const midIndex = Math.floor(points.length / 2);
    return points[midIndex];
  }, [points]);

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          x1={start[0]}
          y1={start[1]}
          x2={end[0]}
          y2={end[1]}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={sourceColor} />
          <stop
            offset="50%"
            stopColor={d3.interpolateRgb(sourceColor, targetColor)(0.5)}
          />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>

        {/* Pattern definitions for special curve types */}
        <pattern
          id={`pattern-${id}`}
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <circle cx="4" cy="4" r="1" fill={sourceColor} opacity="0.3" />
        </pattern>

        {/* Filter definitions for advanced effects */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main edge path */}
      <path
        d={pathData || ""}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={curveStyle.strokeWidth}
        strokeDasharray={curveStyle.strokeDasharray}
        strokeLinecap={curveStyle.strokeLinecap}
        strokeLinejoin="round"
        opacity={"opacity" in curveStyle ? curveStyle.opacity : 1}
        filter={curveStyle.filter}
        style={{
          ...(isAnimated && {
            strokeDasharray: `${pathLength}`,
            strokeDashoffset: `${pathLength}`,
            animation: `dash-${id} 2s ease-in-out infinite`,
          }),
        }}
      />

      {/* Animated flow indicator for high-weight edges */}
      {edgeWeight > 2 && (
        <circle r="3" fill={targetColor} opacity="0.8">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href={`#path-${id}`} />
          </animateMotion>
        </circle>
      )}

      {/* Edge label */}
      {showEdgeLabel && edgeData && (
        <text
          x={midPoint[0]}
          y={midPoint[1] - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#666"
          fontFamily="sans-serif"
          style={{ pointerEvents: "none" }}
        >
          {edgeData.label || edgeData.weight || ""}
        </text>
      )}

      {/* Animation keyframes */}
      {isAnimated && (
        <style>
          {`
            @keyframes dash-${id} {
              to {
                stroke-dashoffset: 0;
              }
            }
          `}
        </style>
      )}
    </>
  );
};

interface ArrowProps {
  points: [number, number][];
  color: string;
  nodeRadius: number;
}

const Arrow: React.FC<ArrowProps> = ({ points, color, nodeRadius }) => {
  const [[sx, sy], [ex, ey]] = points.slice(-2);
  const dx = sx - ex;
  const dy = sy - ey;
  const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;

  const arrowSize = (nodeRadius * nodeRadius) / 5.0;
  const arrowLen = Math.sqrt((4 * arrowSize) / Math.sqrt(3));
  const arrow = d3.symbol().type(d3.symbolTriangle).size(arrowSize);

  return (
    <path
      d={arrow() || ""}
      fill={color}
      stroke="white"
      strokeWidth={1.5}
      strokeDasharray={`${arrowLen},${arrowLen}`}
      transform={`translate(${ex}, ${ey}) rotate(${angle})`}
    />
  );
};

interface NodeProps {
  x: number;
  y: number;
  color: string;
  nodeRadius: number;
  label: string;
}

const Node: React.FC<NodeProps> = ({ x, y, color, nodeRadius, label }) => {
  // Truncate label if too long
  const maxLength = Math.max(3, Math.floor(nodeRadius / 3));
  const truncatedLabel =
    label.length > maxLength ? label.slice(0, maxLength) + "..." : label;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={nodeRadius} fill={color} stroke="#fff" strokeWidth={2} />
      <text
        textAnchor="middle"
        dy="0.35em"
        fill="white"
        fontSize={`${Math.max(10, nodeRadius / 2)}px`}
        fontWeight="bold"
        fontFamily="sans-serif"
        style={{ pointerEvents: "none" }}
      >
        {truncatedLabel}
      </text>
    </g>
  );
};

// Import d3-dag types and functions
declare global {
  interface Window {
    d3: any;
  }
}

const SugiyamaDAG: React.FC<SugiyamaDAGProps> = ({
  data,
  title = "D3-DAG Sugiyama Layout",
  nodeRadius = 5,
  layering = "Simplex (shortest edges)",
  decross = "Two Layer Greedy (fast)",
  coord = "Simplex (medium)",
  spline = "Default",
  arrows = true,
  horizontalGap = 20,
  verticalGap = 50,
  chartPadding = 40,
}) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [d3Dag, setD3Dag] = useState<any>(null);

  // Load d3-dag library
  useEffect(() => {
    const loadD3Dag = async () => {
      try {
        const d3DagModule = await import("d3-dag");
        setD3Dag(d3DagModule);
        console.log("✅ d3-dag loaded successfully");
      } catch (error) {
        console.error("❌ Failed to load d3-dag via ES modules:", error);
        const script = document.createElement("script");
        script.src =
          "https://unpkg.com/d3-dag@1.0.0-1/bundle/d3-dag.umd.min.js";
        script.onload = () => {
          const globalD3Dag = (window as any).d3dag || (window as any).d3;
          if (globalD3Dag) {
            setD3Dag(globalD3Dag);
            console.log("✅ d3-dag loaded from CDN");
          } else {
            console.error("❌ d3-dag not found on global object");
          }
        };
        script.onerror = () => {
          console.error("❌ Failed to load d3-dag from CDN");
        };
        document.head.appendChild(script);
      }
    };
    loadD3Dag();
  }, []);

  // Configuration maps
  const layerings = useMemo(() => {
    if (!d3Dag) return new Map();
    return new Map([
      ["Simplex (shortest edges)", d3Dag.layeringSimplex?.() || null],
      ["Longest Path (minimum height)", d3Dag.layeringLongestPath?.() || null],
    ]);
  }, [d3Dag]);

  const decrossings = useMemo(() => {
    if (!d3Dag) return new Map();
    return new Map([
      [
        "Two Layer Greedy (fast)",
        d3Dag
          .decrossTwoLayer?.()
          ?.order(
            d3Dag.twolayerGreedy?.()?.base(d3Dag.twolayerAgg?.()) ||
              d3Dag.twolayerGreedy?.(),
          ) || null,
      ],
      [
        "Two Layer Agg (fast)",
        d3Dag.decrossTwoLayer?.()?.order(d3Dag.twolayerAgg?.()) || null,
      ],
      [
        "Optimal (can be very slow)",
        d3Dag.decrossOpt?.()?.check?.("slow") || d3Dag.decrossOpt?.() || null,
      ],
      [
        "Two Layer Opt (can be very slow)",
        d3Dag
          .decrossTwoLayer?.()
          ?.order(
            d3Dag.twolayerOpt?.()?.check?.("slow") || d3Dag.twolayerOpt?.(),
          ) || null,
      ],
    ]);
  }, [d3Dag]);

  const coords = useMemo(() => {
    if (!d3Dag) return new Map();
    return new Map([
      ["Simplex (medium)", d3Dag.coordSimplex?.() || null],
      ["Quadratic (can be slow)", d3Dag.coordQuad?.() || null],
      ["Greedy (fast)", d3Dag.coordGreedy?.() || null],
      ["Center (fast)", d3Dag.coordCenter?.() || null],
    ]);
  }, [d3Dag]);

  const splines = useMemo(() => {
    return new Map([
      ["Default", undefined],
      ["Linear", d3.curveLinear],
      ["Monotone Y", d3.curveMonotoneY],
      ["Catmull-Rom", d3.curveCatmullRom],
      ["Step", d3.curveStep],
      ["Step Before", d3.curveStepBefore],
      ["Step After", d3.curveStepAfter],
      ["Basis", d3.curveBasis],
      ["Cardinal", d3.curveCardinal],
    ]);
  }, []);

  // Create DAG and layout
  const laidout = useMemo(() => {
    if (!d3Dag || !data) return null;

    const start = performance.now();
    try {
      const dagReader = d3Dag
        .graphConnect()
        .sourceId((d: any) => d.source)
        .targetId((d: any) => d.target)
        .nodeDatum((id: string) => ({ id }));

      const dag = dagReader(
        data.links.map((link: DAGLink) => ({
          source: link.source,
          target: link.target,
        })),
      );

      // Warn user about slow algorithms
      const isSlowAlgorithm = decross.includes("very slow");
      const nodeCount = dag.nnodes();
      const linkCount = [...dag.links()].length;

      if (isSlowAlgorithm && nodeCount > 50) {
        console.warn(
          `⚠️ Using "${decross}" with ${nodeCount} nodes and ${linkCount} links may be very slow!`,
        );
      }

      // Get decrossing strategy with fallback
      let decrossStrategy = decrossings.get(decross);

      // Fallback to fast algorithm if optimal fails on large graphs
      if (!decrossStrategy && isSlowAlgorithm) {
        console.warn(
          `⚠️ Falling back to fast decrossing strategy for large graph`,
        );
        decrossStrategy = d3Dag
          .decrossTwoLayer?.()
          ?.order(d3Dag.twolayerGreedy?.());
      }

      const layout = d3Dag
        .sugiyama()
        .layering(layerings.get(layering) || d3Dag.layeringSimplex?.())
        .decross(
          decrossStrategy ||
            d3Dag.decrossTwoLayer?.()?.order(d3Dag.twolayerGreedy?.()),
        )
        .coord(coords.get(coord) || d3Dag.coordSimplex?.())
        .nodeSize([2 * nodeRadius, 2 * nodeRadius])
        .gap([horizontalGap, verticalGap]);

      if (d3Dag.tweakShape && d3Dag.shapeEllipse) {
        layout.tweaks([
          d3Dag.tweakShape(
            [2 * nodeRadius, 2 * nodeRadius],
            d3Dag.shapeEllipse,
          ),
        ]);
      }

      const { width: layoutWidth, height: layoutHeight } = layout(dag);
      const time = performance.now() - start;

      setRenderTime(time);

      return {
        dag,
        width: layoutWidth,
        height: layoutHeight,
        time,
      };
    } catch (error) {
      console.error("❌ Error creating DAG layout:", error);

      // Try fallback with fastest algorithm
      if (decross.includes("very slow")) {
        console.log("🔄 Attempting fallback with fast algorithm...");
        try {
          const dagReader = d3Dag
            .graphConnect()
            .sourceId((d: any) => d.source)
            .targetId((d: any) => d.target)
            .nodeDatum((id: string) => ({ id }));

          const dag = dagReader(
            data.links.map((link: DAGLink) => ({
              source: link.source,
              target: link.target,
            })),
          );

          const layout = d3Dag
            .sugiyama()
            .layering(d3Dag.layeringSimplex?.())
            .decross(d3Dag.decrossTwoLayer?.()?.order(d3Dag.twolayerGreedy?.()))
            .coord(d3Dag.coordSimplex?.())
            .nodeSize([2 * nodeRadius, 2 * nodeRadius])
            .gap([horizontalGap, verticalGap]);

          const { width: layoutWidth, height: layoutHeight } = layout(dag);
          const time = performance.now() - start;
          setRenderTime(time);

          console.log("✅ Fallback layout successful");
          return {
            dag,
            width: layoutWidth,
            height: layoutHeight,
            time,
          };
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }
      }

      return null;
    }
  }, [
    data,
    d3Dag,
    layering,
    decross,
    coord,
    nodeRadius,
    horizontalGap,
    verticalGap,
    layerings,
    decrossings,
    coords,
  ]);

  // Prepare rendering data
  const renderData = useMemo(() => {
    if (!laidout) return null;

    const { dag, width: layoutWidth, height: layoutHeight } = laidout;

    // Calculate dimensions with padding
    const totalWidth = layoutWidth + chartPadding * 2;
    const totalHeight = layoutHeight + chartPadding * 2;

    // Initialize color map
    const steps = dag.nnodes();
    const interp = d3.interpolateRainbow;
    const colorMap: { [key: string]: string } = {};
    [...dag.nodes()].forEach((node: any, i: number) => {
      colorMap[node.data.id] = interp(i / steps);
    });

    // Get curve function with detailed debugging
    const selectedCurve = splines.get(spline);
    const fallbackCurve =
      coord === "Simplex (medium)" ? d3.curveMonotoneY : d3.curveCatmullRom;
    const curve = selectedCurve ?? fallbackCurve;

    return {
      dag,
      totalWidth,
      totalHeight,
      colorMap,
      curve,
      padding: chartPadding,
    };
  }, [laidout, spline, coord, splines, chartPadding]);

  if (!d3Dag) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>{title}</ChartTitle>
        </ChartHeader>
        <SVGContainer>
          <div>Loading D3-DAG library...</div>
        </SVGContainer>
      </ChartContainer>
    );
  }

  if (!renderData) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>{title}</ChartTitle>
        </ChartHeader>
        <SVGContainer>
          <div>Processing layout...</div>
        </SVGContainer>
      </ChartContainer>
    );
  }

  const { dag, totalWidth, totalHeight, colorMap, curve, padding } = renderData;

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <SVGContainer>
        <ResponsiveSVG
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${padding}, ${padding})`}>
            {/* Render edges */}
            {[...dag.links()].map((link: any, i: number) => (
              <Edge
                key={`edge-${i}-${link.source.data.id}-${link.target.data.id}`}
                points={link.points}
                sourceColor={colorMap[link.source.data.id]}
                targetColor={colorMap[link.target.data.id]}
                curve={curve}
                id={`${i}-${link.source.data.id}-${link.target.data.id}`}
                isAnimated={link.weight > 2}
                edgeWeight={link.weight}
                showEdgeLabel={link.weight > 2}
                edgeData={link.data}
              />
            ))}

            {/* Render arrows */}
            {arrows &&
              [...dag.links()].map((link: any, i: number) => (
                <Arrow
                  key={`arrow-${i}-${link.source.data.id}-${link.target.data.id}`}
                  points={link.points}
                  color={colorMap[link.target.data.id]}
                  nodeRadius={nodeRadius}
                />
              ))}

            {/* Render nodes */}
            {[...dag.nodes()].map((node: any) => {
              const label = node.data?.data?.name || node.data.id;
              return (
                <Node
                  key={`node-${node.data.id}`}
                  x={node.x}
                  y={node.y}
                  color={colorMap[node.data.id]}
                  nodeRadius={nodeRadius}
                  label={label}
                />
              );
            })}
          </g>
        </ResponsiveSVG>
      </SVGContainer>
      {renderTime > 0 && (
        <StatsContainer>
          The layout took {renderTime.toFixed(1)} milliseconds to compute.
        </StatsContainer>
      )}
    </ChartContainer>
  );
};

export default SugiyamaDAG;
