import { useTransition, animated, config } from "@react-spring/web";
import { interpolate } from "flubber";
import { useScreenSize } from "@visx/responsive";
import { memo, useMemo, useRef } from "react";
import "./scrollyCanvas.css";
import { colorScale } from "../../utils";
import { useSupplyChainBubbles } from "./useSupplyChainBubbles";
import { useRecoilValue } from "recoil";
import { countrySelectionState } from "../ScollamaStory";
import { yearSelectionState } from "../ScollamaStory";
import { useStackedBars } from "./useStackedBars";
import Legend from "./Legend";
import Box from "@mui/material/Box";
import SupplyChainCircle from "./SupplyChainCircle";
import { useMediaQuery, useTheme } from "@mui/material";

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
});

const ScrollyCanvas = ({
  view,
  showTooltip,
  hideTooltip,
  onScroll,
  prevBase,
}) => {
  const yearSelection = useRecoilValue(yearSelectionState);
  const countrySelection = useRecoilValue(countrySelectionState);
  const { fill, stroke, legendHeight } = view;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const screenSize = useScreenSize({ debounceTime: 150 });
  const width = useMemo(
    () => (isMobile ? screenSize.width : screenSize.width - 160),
    [screenSize.width, isMobile],
  );
  const { childBubbles, parentCircles } = useSupplyChainBubbles({
    year: yearSelection,
    countryId: countrySelection,
    width: width,
    height: isMobile ? screenSize.height - legendHeight : screenSize.height,
    fill,
    stroke,
  });

  const { bars, expectedOverlays } = useStackedBars({
    year: yearSelection,
    countryId: countrySelection,
    width: width,
    height: isMobile ? screenSize.height - legendHeight : screenSize.height,
  });

  const layouts = useMemo(
    () => ({
      bubbles: childBubbles,
      bars: bars,
    }),
    [childBubbles, bars],
  );

  const currentLayout = useMemo(() => layouts[view.base], [view.base, layouts]);
  const previousLayout = useMemo(() => layouts[prevBase], [prevBase, layouts]);
  const isAnimating = useRef(false);
  const finishedAnimation = useRef();

  const layoutArray = useMemo(
    () => Array.from(currentLayout.values()),
    [currentLayout],
  );
  const transitions = useTransition(layoutArray, {
    from: { fillOpacity: 1, transition: 0, stroke: "white" },
    enter: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      transition: 1,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
    }),
    update: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      transition: 1,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
    }),
    leave: { fillOpacity: 0, transition: 1, stroke: "white" },
    keys: (item) => `${item?.data?.product?.code}-${item?.parentId}`,
    reset: view.base !== prevBase && finishedAnimation.current !== view.base,
    onStart: () => (isAnimating.current = true),
    onRest: () => {
      finishedAnimation.current = view.base;
      isAnimating.current = false;
    },
    config:
      view.base !== prevBase
        ? { ...config.molasses, friction: 60 }
        : config.default,
  });

  const flubberInterpolator = (fromShape, toShape) => {
    const interpolator = interpolate(fromShape, toShape);
    return (t) => interpolator(t);
  };

  return (
    <>
      <Box
        sx={{
          ml: isMobile ? 0 : 4,
          marginTop: 2,
          fontSize: "clamp(20px, 2vw, 23px)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: isMobile ? "100%" : "100vw",
          px: isMobile ? 2 : 0,
        }}
      >
        {view.title}
      </Box>

      {isMobile && <Legend key={view.legend} mode={view.legend} />}

      <svg
        style={{
          position: "absolute",
          top: isMobile ? `calc(12% + ${legendHeight}px)` : "12%",
          left: "0",
          width: width,
        }}
        width="100%"
        height={isMobile ? "88%" : "88%"}
        preserveAspectRatio="xMidYMid meet"
      >
        {view.base === "bars" && (
          <>
            {expectedOverlays.map((overlay) => {
              return (
                <g
                  key={`supply-chain-${overlay.parentId}`}
                  className="parent-circle"
                >
                  <rect
                    x={60}
                    y={overlay.coords[0][1]}
                    width={overlay.coords[0][0] - 60}
                    height={overlay.coords[1][1] - overlay.coords[0][1]}
                    fill="#f0f0f0"
                    fillOpacity={0.7}
                  />
                </g>
              );
            })}
          </>
        )}
        {view.base === "bubbles" &&
          parentCircles.map((circle) => (
            <SupplyChainCircle
              key={circle.id}
              circle={circle}
              isAnimating={isAnimating}
            />
          ))}
        {transitions((style, node) => {
          return (
            <animated.path
              key={`${node.id}-${node.parentId}`}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              d={style.transition.to((o) => {
                const prevCoords = previousLayout?.get?.(node.id)?.coords ||
                  currentLayout?.get?.(node.id)?.coords || [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                  ];
                const currCoords = currentLayout?.get?.(node.id)?.coords || [
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                ];
                if (
                  previousLayout?.get?.(node.id)?.type ===
                    currentLayout?.get?.(node.id)?.type ||
                  finishedAnimation.current === view.base
                ) {
                  return flubberInterpolator(prevCoords, currCoords)(1);
                } else {
                  return flubberInterpolator(prevCoords, currCoords)(o);
                }
              })}
              strokeOpacity={style.strokeOpacity}
              fill={colorScale(childBubbles?.get?.(node.id)?.parentId)}
              style={style}
              fillOpacity={style.fillOpacity}
              onMouseEnter={(event) => {
                const { clientX, clientY } = event;
                !isAnimating.current &&
                  showTooltip({
                    tooltipData: {
                      ...node,
                      radius: childBubbles?.get?.(node.id)?.radius,
                    },
                    tooltipLeft: clientX,
                    tooltipTop: clientY,
                  });
              }}
              onMouseLeave={() => hideTooltip()}
            />
          );
        })}
        {view.base === "bars" && (
          <>
            {expectedOverlays.map((overlay) => {
              const actualValue = Array.from(bars.values())
                .filter((bar) => bar.parentId === overlay.parentId)
                .reduce((sum, bar) => sum + bar.exportValue, 0);

              return (
                <g
                  key={`supply-chain-${overlay.parentId}`}
                  className="parent-circle"
                >
                  <rect
                    x={overlay.coords[0][0]}
                    y={overlay.coords[0][1]}
                    width={5}
                    height={overlay.coords[1][1] - overlay.coords[0][1]}
                    fill="black"
                    fillOpacity={0.7}
                  />

                  <text
                    x={60}
                    y={overlay.coords[0][1] - 8}
                    fontSize="16px"
                    textAnchor="start"
                    fontWeight="600"
                  >
                    {overlay.name} Actual Value: {formatter.format(actualValue)}{" "}
                    | World Average: {formatter.format(overlay.expectedTotal)}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>

      {!isMobile && <Legend key={view.legend} mode={view.legend} />}

      {view.base === "bubbles" &&
        parentCircles.map((circle) => (
          <div
            className="parent-circle"
            key={`text-${circle.id}`}
            style={{
              position: "absolute",
              left: `${circle.x}px`,
              bottom: `calc(${screenSize.height - (circle.y - circle.radius - (isMobile ? 0 : 10))}px - ${
                isMobile ? `calc(12% + ${legendHeight}px)` : "12%"
              })`,
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: isMobile ? "none" : `${circle.radius * 2}px`,
              fontSize: `clamp(12px, 1.5vw, ${isMobile ? "14px" : "18px"})`,
              pointerEvents: "none",
            }}
          >
            {circle.name}
          </div>
        ))}
    </>
  );
};

export default memo(ScrollyCanvas);
