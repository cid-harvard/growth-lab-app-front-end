import { useTransition, animated, config } from "@react-spring/web";
import { ParentSize } from "@visx/responsive";
import { memo, useMemo, useState } from "react";
import "./scrollyCanvas.css";
import { getSupplyChainColor } from "../../utils";
import PointerIcon from "../../../../../assets/pointer.svg";

import { useSupplyChainBubbles } from "./useSupplyChainBubbles";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import Legend from "./Legend";
import Box from "@mui/material/Box";
import SupplyChainCircle from "./SupplyChainCircle";
import {
  useMediaQuery,
  useTheme,
  Typography,
  Button,
  ButtonGroup,
} from "@mui/material";
import { VisualizationLoading } from "../shared";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";
import { themeUtils } from "../../theme";
import { useRef, useEffect } from "react";
import html2canvas from "html2canvas";

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
});

// Memoized highlight layer component to prevent unnecessary re-renders
const HighlightLayer = memo(({ childBubbles, hoveredProductCode }) => {
  const highlights = useMemo(() => {
    if (!childBubbles || !hoveredProductCode) return [];

    return Array.from(childBubbles.values()).map((bubble) => ({
      id: bubble.id,
      x: bubble.x,
      y: bubble.y,
      r: bubble.r,
      isVisible:
        bubble.data?.product?.code === hoveredProductCode ||
        bubble.product?.code === hoveredProductCode,
    }));
  }, [childBubbles, hoveredProductCode]);

  return (
    <g className="highlight-layer">
      {highlights.map((highlight) => (
        <circle
          key={`highlight-${highlight.id}`}
          cx={highlight.x}
          cy={highlight.y}
          r={highlight.r}
          fill="none"
          stroke="black"
          strokeWidth={2}
          strokeOpacity={1}
          style={{
            opacity: highlight.isVisible ? 1 : 0,
            transition: "opacity 0.1s ease-in-out",
            pointerEvents: "none",
          }}
        />
      ))}
    </g>
  );
});

// Memoized cluster layer component for clustered layout
const ClusterLayer = memo(({ clusterCircles, layoutMode }) => {
  // Prepare cluster data with animation values
  const clustersWithAnimationValues = useMemo(() => {
    if (layoutMode !== "clustered") return [];

    return clusterCircles.map((circle) => ({
      ...circle,
      targetRadius: circle.radius || 0,
    }));
  }, [clusterCircles, layoutMode]);

  const clusterTransitions = useTransition(clustersWithAnimationValues, {
    from: { strokeOpacity: 0, r: 0 },
    enter: (item) => ({
      strokeOpacity: 0.8,
      r: item.targetRadius,
    }),
    update: (item) => ({
      strokeOpacity: 0.8,
      r: item.targetRadius,
    }),
    leave: { strokeOpacity: 0, r: 0 },
    keys: (item) => item.id,
    config: { ...config.default, duration: 400 },
  });

  return (
    <g className="cluster-layer">
      {clusterTransitions((style, circle) => (
        <animated.circle
          key={circle.id}
          cx={circle.x}
          cy={circle.y}
          r={style.r}
          fill="none"
          stroke={getSupplyChainColor(circle.parentId)}
          strokeWidth={1}
          strokeOpacity={style.strokeOpacity}
          pointerEvents="none"
        />
      ))}
    </g>
  );
});

// Internal component that receives dimensions from ParentSize
const ScrollyCanvasInternal = ({
  view,
  showTooltip,
  hideTooltip,
  tooltipData,
  width,
  height,
}) => {
  const yearSelection = useYearSelection();
  const countrySelection = useCountrySelection();
  const { fill, stroke = null, legendHeight } = view;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Image capture functionality
  const chartContainerRef = useRef(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // State for layout mode toggle
  const [layoutMode, setLayoutMode] = useState("flat");

  const { childBubbles, parentCircles, clusterCircles, loading, error } =
    useSupplyChainBubbles({
      year: yearSelection,
      countryId: countrySelection,
      width: width,
      height: height,
      fill,
      stroke,
      layoutMode,
    });

  const bubbleArray = useMemo(
    () => (childBubbles ? Array.from(childBubbles.values()) : []),
    [childBubbles],
  );

  const transitions = useTransition(bubbleArray, {
    from: (item) => ({ fillOpacity: 0, x: item.x, y: item.y, r: 0 }),
    enter: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
      x: item.x,
      y: item.y,
      r: item.r,
    }),
    update: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
      x: item.x,
      y: item.y,
      r: item.r,
    }),
    leave: { fillOpacity: 0, r: 0 },
    keys: (item) => item.id,
    config: { ...config.gentle, duration: 800 },
  });

  // Register/unregister image capture function
  useEffect(() => {
    const handleCaptureImage = async () => {
      if (!chartContainerRef.current) {
        console.warn("Chart container not found");
        return;
      }

      try {
        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: chartContainerRef.current.offsetWidth,
          height: chartContainerRef.current.offsetHeight,
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `supply_chain_bubbles_${countrySelection}_${yearSelection}_${layoutMode}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    };

    registerCaptureFunction(handleCaptureImage);

    return () => {
      unregisterCaptureFunction();
    };
  }, [
    registerCaptureFunction,
    unregisterCaptureFunction,
    countrySelection,
    yearSelection,
    layoutMode,
  ]);

  // Show loading state while data is being fetched
  if (loading) {
    return <VisualizationLoading message="" />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#666",
        }}
      >
        Unable to load visualization data
      </div>
    );
  }

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {isMobile && <Legend key={view.legend} mode={view.legend} />}

      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          padding: isMobile ? "8px" : "12px",
        }}
      >
        {/* Layout Mode Toggle */}
        <ButtonGroup
          size="small"
          sx={{
            position: "absolute",
            top: isMobile ? 8 : 12,
            right: isMobile ? 8 : 12,
            zIndex: 20,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "6px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            variant={layoutMode === "flat" ? "contained" : "outlined"}
            onClick={() => setLayoutMode("flat")}
            sx={{
              fontSize: isMobile ? "11px" : "12px",
              padding: isMobile ? "4px 8px" : "6px 12px",
              minWidth: "auto",
            }}
          >
            Flat
          </Button>
          <Button
            variant={layoutMode === "clustered" ? "contained" : "outlined"}
            onClick={() => setLayoutMode("clustered")}
            sx={{
              fontSize: isMobile ? "11px" : "12px",
              padding: isMobile ? "4px 8px" : "6px 12px",
              minWidth: "auto",
            }}
          >
            Clustered
          </Button>
        </ButtonGroup>

        {/* Instruction text */}
        <Typography
          variant="chart-annotation"
          sx={{
            position: "absolute",
            top: 20,
            left: isMobile ? 8 : 12,
            zIndex: 10,
            ...themeUtils.chart.getAnnotationBackgroundSx(),
            pointerEvents: "none",
            textShadow: "0px 1px 2px rgba(0,0,0,0.1)",
            fontSize: "16px",
            fontWeight: "semibold",
          }}
        >
          <img
            src={PointerIcon}
            alt="pointer"
            style={{
              width: "auto",
              height: "26px",
              marginRight: "4px",
              verticalAlign: "text-top",
            }}
          />{" "}
          {layoutMode === "clustered"
            ? "Click on a bubble to see its products"
            : "Click on a bubble to see its products"}
        </Typography>

        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Supply chain circles */}
          {parentCircles.map((circle) => (
            <SupplyChainCircle key={circle.id} circle={circle} />
          ))}
          {/* Cluster circles layer (on top of products) */}
          <ClusterLayer
            clusterCircles={clusterCircles}
            layoutMode={layoutMode}
          />

          {/* Product bubbles */}
          {transitions((style, node) => (
            <animated.circle
              key={node.id}
              cx={style.x}
              cy={style.y}
              r={style.r}
              fill={style.fill}
              fillOpacity={style.fillOpacity}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeOpacity={style.strokeOpacity}
              onMouseEnter={(event) => {
                const { clientX, clientY } = event;
                showTooltip({
                  tooltipData: {
                    ...node,
                    radius: node.radius,
                  },
                  tooltipLeft: clientX,
                  tooltipTop: clientY,
                });
              }}
              onMouseLeave={() => hideTooltip()}
            />
          ))}

          {/* Highlight circles layer */}
          <HighlightLayer
            childBubbles={childBubbles}
            hoveredProductCode={
              tooltipData?.data?.product?.code || tooltipData?.product?.code
            }
          />
        </svg>

        {/* Supply chain labels */}
        {parentCircles.map((circle) => (
          <div
            className="parent-circle"
            key={`text-${circle.id}`}
            style={{
              position: "absolute",
              left: `${circle.x}px`,
              bottom: `calc(100% - ${circle.y - circle.radius - 15}px)`,
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: isMobile ? "none" : `${circle.radius * 2.2}px`,
              ...themeUtils.chart.typography["chart-large-label"],
              pointerEvents: "none",
            }}
          >
            {circle.name}
          </div>
        ))}
      </Box>

      {!isMobile && <Legend key={view.legend} mode={view.legend} />}
      <Typography
        variant="chart-attribution"
        sx={{
          position: "absolute",
          right: isMobile ? 40 : 200,
          bottom: isMobile ? 4 : 10,
        }}
      >
        {view.source}
      </Typography>
    </Box>
  );
};

const ScrollyCanvas = ({ view, showTooltip, hideTooltip, tooltipData }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ParentSize>
        {({ width, height }) => {
          if (width === 0 || height === 0) {
            return null;
          }
          return (
            <ScrollyCanvasInternal
              view={view}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              tooltipData={tooltipData}
              width={width}
              height={height}
            />
          );
        }}
      </ParentSize>
    </div>
  );
};

export default memo(ScrollyCanvas);
