import type { RefObject, FC } from "react";
import { useMemo, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Zoom } from "@visx/zoom";
import { useTooltip } from "@visx/tooltip";
import { ParentSize } from "@visx/responsive";
import { localPoint } from "@visx/event";
import * as d3 from "d3";
import { SpaceVisualizationControls } from "./components/SpaceVisualizationControls";
import { SpaceVisualizationContent } from "./components/SpaceVisualizationContent";
import { SpaceVisualizationTooltip } from "./components/SpaceVisualizationTooltip";
import { SpaceVisualizationHighlight } from "./components/SpaceVisualizationHighlight";
import type { Node } from "./loader";

interface FieldNames {
  id: string;
  x: string;
  y: string;
  source: string;
  target: string;
  radius?: string;
  tooltip?: string[];
  category?: string;
  metaId?: string;
  metaName?: string;
  metaColor?: string;
}

interface RadiusConfig {
  min: number;
  max: number;
  scale: string;
  fixedSize?: number;
}

interface SpaceVisualizationProps {
  nodes: Node[];
  fieldNames: FieldNames;
  showAllLinks: boolean;
  clusterColorMap: Map<string, string>;
  allLinks: { x1: number; y1: number; x2: number; y2: number }[];
  svgRef: RefObject<SVGSVGElement>;
  radiusConfig?: RadiusConfig;
  defaultMetadata?: Array<{
    cluster_name: string;
    cluster_name_short: string;
    cluster_col: string;
  }>;
  metadata?: Array<{
    [key: string]: string | number | undefined;
  }>;
}

const SpaceVisualizationInner: React.FC<
  SpaceVisualizationProps & { width: number; height: number }
> = ({
  nodes,
  fieldNames,
  showAllLinks,
  clusterColorMap,
  allLinks,
  svgRef,
  radiusConfig,
  defaultMetadata,
  metadata,
  width,
  height,
}) => {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string>("");
  const [highlightedNodeId, setHighlightedNodeId] = useState<
    string | undefined
  >();
  const [showLegend, setShowLegend] = useState(true);
  const zoomRef = useRef<{ reset: () => void } | null>(null);
  const margin = useMemo(
    () => ({ top: 50, right: 50, bottom: 50, left: 50 }),
    [],
  );

  // Compute data extents only once to use in both scales
  const dataExtents = useMemo(() => {
    const xValues = nodes
      .map((d) => {
        const value = Number.parseFloat(d[fieldNames.x] as string);
        return Number.isNaN(value) ? 0 : value;
      })
      .filter((v) => !Number.isNaN(v));

    const yValues = nodes
      .map((d) => {
        const value = Number.parseFloat(d[fieldNames.y] as string);
        return Number.isNaN(value) ? 0 : value;
      })
      .filter((v) => !Number.isNaN(v));

    const xExtent = d3.extent(xValues) as [number, number];
    const yExtent = d3.extent(yValues) as [number, number];

    return {
      x: xExtent,
      y: yExtent,
      xRange: xExtent[1] - xExtent[0],
      yRange: yExtent[1] - yExtent[0],
    };
  }, [nodes, fieldNames.x, fieldNames.y]);

  const { xScale, yScale } = useMemo(() => {
    const viewportWidth = width - margin.left - margin.right;
    const viewportHeight = height - margin.top - margin.bottom;

    if (dataExtents.xRange > 0 && dataExtents.yRange > 0) {
      const dataAspectRatio = dataExtents.xRange / dataExtents.yRange;
      const viewportAspectRatio = viewportWidth / viewportHeight;
      let adjustedWidth = viewportWidth;
      let adjustedHeight = viewportHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (dataAspectRatio > viewportAspectRatio) {
        adjustedHeight = viewportWidth / dataAspectRatio;
        offsetY = (viewportHeight - adjustedHeight) / 2;
      } else {
        adjustedWidth = viewportHeight * dataAspectRatio;
        offsetX = (viewportWidth - adjustedWidth) / 2;
      }

      const xScale = d3
        .scaleLinear()
        .domain(dataExtents.x)
        .range([margin.left + offsetX, margin.left + offsetX + adjustedWidth])
        .nice();

      const yScale = d3
        .scaleLinear()
        .domain(dataExtents.y)
        .range([margin.top + offsetY + adjustedHeight, margin.top + offsetY])
        .nice();

      return { xScale, yScale };
    }

    const xScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])
      .nice();

    return { xScale, yScale };
  }, [width, height, margin, dataExtents]);

  const initialTransform = useMemo(() => {
    if (!nodes.length) return { scale: 1, translateX: 0, translateY: 0 };

    const dataCenterX = (dataExtents.x[0] + dataExtents.x[1]) / 2;
    const dataCenterY = (dataExtents.y[0] + dataExtents.y[1]) / 2;

    const mappedCenterX = xScale(dataCenterX);
    const mappedCenterY = yScale(dataCenterY);

    const viewportCenterX =
      (width - margin.left - margin.right) / 2 + margin.left;
    const viewportCenterY =
      (height - margin.top - margin.bottom) / 2 + margin.top;

    const translateX = viewportCenterX - mappedCenterX;
    const translateY = viewportCenterY - mappedCenterY;

    return { scale: 1, translateX, translateY };
  }, [nodes, width, height, xScale, yScale, margin, dataExtents]);

  const radiusScale = useMemo(() => {
    if (!fieldNames.radius) {
      if (radiusConfig?.fixedSize !== undefined) {
        return (value: number) => radiusConfig.fixedSize ?? 10;
      }
      return (value: number) => 10;
    }

    const values = nodes
      .map((node) => {
        const value = fieldNames.radius ? node[fieldNames.radius] : undefined;
        if (value === undefined) return Number.NaN;
        return typeof value === "number"
          ? value
          : Number.parseFloat(String(value));
      })
      .filter((v) => !Number.isNaN(v));

    if (values.length === 0) {
      return (value: number) => 10;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    let scale:
      | d3.ScaleLinear<number, number>
      | d3.ScaleLogarithmic<number, number>
      | d3.ScalePower<number, number>;

    switch (radiusConfig?.scale) {
      case "log":
        scale = d3.scaleLog().domain([min, max]);
        break;
      case "sqrt":
        scale = d3.scaleSqrt().domain([min, max]);
        break;
      case "pow":
        scale = d3.scalePow().exponent(2).domain([min, max]);
        break;
      default:
        scale = d3.scaleLinear().domain([min, max]);
    }

    scale.range([radiusConfig?.min ?? 5, radiusConfig?.max ?? 15]);

    return (value: number) => scale(value);
  }, [nodes, fieldNames.radius, radiusConfig]);

  // Create a shared fallback color scale for categories
  const categoryColorScale = useMemo(() => {
    // Get unique categories from nodes
    const categories = Array.from(
      new Set(
        nodes
          .map((node) => String(node[fieldNames.category || ""]))
          .filter(Boolean),
      ),
    );

    // Create scale with proper domain
    return d3.scaleOrdinal(d3.schemeCategory10).domain(categories);
  }, [nodes, fieldNames.category]);

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<Node>();

  const handleDownload = async () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = "space-visualization.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  };

  const handleNodeMouseEnter = useMemo(
    () => (node: Node, event: React.MouseEvent) => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: node,
          tooltipLeft: point.x,
          tooltipTop: point.y,
        });
        setHighlightedNodeId(String(node[fieldNames.id]));
      }
    },
    [showTooltip, fieldNames.id],
  );

  const handleNodeMouseLeave = useMemo(
    () => () => {
      hideTooltip();
      setHighlightedNodeId(undefined);
    },
    [hideTooltip],
  );

  const handleResetZoom = () => {
    if (zoomRef.current) {
      zoomRef.current.reset();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "#fafbfc",
        position: "relative",
      }}
    >
      <SpaceVisualizationControls
        onDownload={handleDownload}
        selectedNodeIds={selectedNodeIds}
        onSelectedNodeIdsChange={setSelectedNodeIds}
        onResetZoom={handleResetZoom}
        showLegend={showLegend}
        onShowLegendChange={setShowLegend}
      />

      {width > 0 && height > 0 && (
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          scaleXMin={1 / 8}
          scaleXMax={8}
          scaleYMin={1 / 8}
          scaleYMax={8}
          initialTransformMatrix={{
            scaleX: initialTransform.scale,
            scaleY: initialTransform.scale,
            translateX: initialTransform.translateX,
            translateY: initialTransform.translateY,
            skewX: 0,
            skewY: 0,
          }}
        >
          {(zoom) => {
            zoomRef.current = zoom;
            return (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  touchAction: "none",
                }}
              >
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  style={{ background: "#fff" }}
                  onWheel={zoom.handleWheel}
                  onMouseDown={zoom.dragStart}
                  onMouseMove={zoom.dragMove}
                  onMouseUp={zoom.dragEnd}
                  onMouseLeave={zoom.dragEnd}
                  onDoubleClick={zoom.reset}
                >
                  {/* Background rectangle for visual consistency */}
                  <rect width="100%" height="100%" fill="#fff" />

                  {/* Content group with zoom transform */}
                  <g transform={zoom.toString()}>
                    <SpaceVisualizationContent
                      nodes={nodes}
                      fieldNames={fieldNames}
                      showAllLinks={showAllLinks}
                      clusterColorMap={clusterColorMap}
                      allLinks={allLinks}
                      selectedNodeIds={selectedNodeIds}
                      xScale={xScale}
                      yScale={yScale}
                      radiusScale={radiusScale}
                      onNodeMouseEnter={handleNodeMouseEnter}
                      onNodeMouseLeave={handleNodeMouseLeave}
                      metadata={metadata}
                      categoryColorScale={categoryColorScale}
                    />
                    <SpaceVisualizationHighlight
                      nodes={nodes}
                      fieldNames={fieldNames}
                      clusterColorMap={clusterColorMap}
                      allLinks={allLinks}
                      xScale={xScale}
                      yScale={yScale}
                      radiusScale={radiusScale}
                      highlightedNodeId={highlightedNodeId}
                      metadata={metadata}
                      categoryColorScale={categoryColorScale}
                    />
                  </g>

                  {showLegend &&
                    ((defaultMetadata && defaultMetadata.length > 0) ||
                      (fieldNames.category &&
                        fieldNames.metaId &&
                        fieldNames.metaName &&
                        fieldNames.metaColor)) &&
                    (() => {
                      let legendItems: Array<{ name: string; color: string }> =
                        [];

                      if (defaultMetadata && defaultMetadata.length > 0) {
                        legendItems = defaultMetadata.map((meta) => ({
                          name: meta.cluster_name_short,
                          color: meta.cluster_col,
                        }));
                      } else if (
                        fieldNames.category &&
                        fieldNames.metaId &&
                        fieldNames.metaName &&
                        fieldNames.metaColor
                      ) {
                        const categories = new Set(
                          nodes
                            .map((node) =>
                              String(node[fieldNames.category || ""]),
                            )
                            .filter(Boolean),
                        );

                        for (const category of Array.from(categories)) {
                          const meta = metadata?.find(
                            (m) =>
                              String(m[fieldNames.metaId || ""]) === category,
                          );
                          if (meta) {
                            legendItems.push({
                              name: String(meta[fieldNames.metaName || ""]),
                              color: String(meta[fieldNames.metaColor || ""]),
                            });
                          } else if (category) {
                            // Last-ditch fallback: use D3 color scale when no metadata exists
                            legendItems.push({
                              name: category,
                              color: categoryColorScale(category),
                            });
                          }
                        }
                      }

                      if (legendItems.length === 0) return null;

                      const legendWidth = 200;
                      const legendHeight = legendItems.length * 27 + 30;
                      const legendMarginRight = 10;
                      const x = Math.max(
                        legendMarginRight,
                        width - legendWidth - legendMarginRight,
                      );
                      const y = 10;
                      return (
                        <g transform={`translate(${x}, ${y})`}>
                          <rect
                            width={legendWidth}
                            height={legendHeight}
                            fill="white"
                            stroke="#ccc"
                            rx={8}
                          />
                          <text
                            x={16}
                            y={28}
                            fontSize={12}
                            fill="#333"
                            style={{ fontFamily: "inherit" }}
                          >
                            Categories
                          </text>
                          {legendItems.map((item, i) => (
                            <g
                              key={item.name}
                              transform={`translate(16, ${48 + i * 25})`}
                            >
                              <circle cx={10} cy={6} r={8} fill={item.color} />
                              <text
                                x={30}
                                y={10}
                                fontSize={12}
                                fill="#333"
                                style={{ fontFamily: "inherit" }}
                              >
                                {item.name}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                </svg>

                <SpaceVisualizationTooltip
                  tooltipData={tooltipData || null}
                  tooltipLeft={tooltipLeft}
                  tooltipTop={tooltipTop}
                  tooltipFields={fieldNames.tooltip}
                />
              </div>
            );
          }}
        </Zoom>
      )}
    </Box>
  );
};

const SpaceVisualization: React.FC<SpaceVisualizationProps> = (props) => {
  return (
    <ParentSize>
      {({ width, height }) => (
        <SpaceVisualizationInner {...props} width={width} height={height} />
      )}
    </ParentSize>
  );
};

export default SpaceVisualization;
