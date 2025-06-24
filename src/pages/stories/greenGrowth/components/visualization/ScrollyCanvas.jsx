import { useTransition, animated, config } from "@react-spring/web";
import { ParentSize } from "@visx/responsive";
import { memo, useMemo } from "react";
import "./scrollyCanvas.css";

import { useSupplyChainBubbles } from "./useSupplyChainBubbles";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import Legend from "./Legend";
import Box from "@mui/material/Box";
import SupplyChainCircle from "./SupplyChainCircle";
import { useMediaQuery, useTheme, Typography } from "@mui/material";

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
      isVisible: bubble.data.product.code === hoveredProductCode,
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

  const { childBubbles, parentCircles } = useSupplyChainBubbles({
    year: yearSelection,
    countryId: countrySelection,
    width: width,
    height: height,
    fill,
    stroke,
  });

  const bubbleArray = useMemo(
    () => (childBubbles ? Array.from(childBubbles.values()) : []),
    [childBubbles],
  );

  const transitions = useTransition(bubbleArray, {
    from: { fillOpacity: 0 },
    enter: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
    }),
    update: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
    }),
    leave: { fillOpacity: 0 },
    keys: (item) => item.id,
    config: config.default,
  });

  return (
    <>
      {isMobile && <Legend key={view.legend} mode={view.legend} />}

      <Box
        sx={{
          position: "relative",
          marginTop: isMobile ? `calc(2% + ${legendHeight}px)` : "2%",
          height: isMobile ? `calc(96vh - ${legendHeight}px)` : "96vh",
          overflow: "hidden",
        }}
      >
        {/* Instruction text */}
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: isMobile ? 10 : 20,
            left: isMobile ? 10 : 20,
            zIndex: 10,
            color: "#333",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: isMobile ? "4px 8px" : "6px 12px",
            borderRadius: "4px",
            fontSize: isMobile ? "12px" : "14px",
            fontWeight: "500",
            pointerEvents: "none",
            textShadow: "0px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          👆 Click on a value chain to see its products
        </Typography>
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: "0",
            width: width,
          }}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          {parentCircles.map((circle) => (
            <SupplyChainCircle key={circle.id} circle={circle} />
          ))}

          {transitions((style, node) => (
            <animated.circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.r}
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
            hoveredProductCode={tooltipData?.data?.product?.code}
          />
        </svg>

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
              fontSize: `clamp(12px, 1.5vw, ${isMobile ? "15px" : "20px"})`,
              fontWeight: "600",
              color: "#333",
              textShadow: "0px 0px 3px rgba(255,255,255,0.8)",
              pointerEvents: "none",
            }}
          >
            {circle.name}
          </div>
        ))}
      </Box>

      {!isMobile && <Legend key={view.legend} mode={view.legend} />}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          position: "absolute",
          right: isMobile ? 40 : 200,
          bottom: isMobile ? 4 : 10,
        }}
      >
        {view.source}
      </Typography>
    </>
  );
};

const ScrollyCanvas = ({ view, showTooltip, hideTooltip, tooltipData }) => {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "600px" }}>
      <ParentSize>
        {({ width, height }) => (
          <ScrollyCanvasInternal
            view={view}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            tooltipData={tooltipData}
            width={width}
            height={height}
          />
        )}
      </ParentSize>
    </div>
  );
};

export default memo(ScrollyCanvas);
