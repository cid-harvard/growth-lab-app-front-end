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
import { useMediaQuery, useTheme, Typography } from "@mui/material";
import ExpectedOverlay from "./ExpectedOverlay";

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
    legendHeight: isMobile ? legendHeight : 0,
    isMobile,
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
        {view.base === "bars" &&
          expectedOverlays.map((overlay) => (
            <ExpectedOverlay
              key={overlay.parentId}
              overlay={overlay}
              bars={bars}
              isMobile={isMobile}
            />
          ))}
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
              bottom: isMobile
                ? `calc(88% - ${legendHeight}px - ${circle.y - circle.radius - 3}px)`
                : `calc(88% - ${circle.y - circle.radius - 10}px)`,
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

export default memo(ScrollyCanvas);
