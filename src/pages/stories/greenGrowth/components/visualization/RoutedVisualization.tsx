import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tooltip, useTooltip } from "@visx/tooltip";
import ScrollyCanvas, { formatter } from "./ScrollyCanvas";
import { Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import { useSupplyChainBubbles } from "./useSupplyChainBubbles";
import { useScreenSize } from "@visx/responsive";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { color } from "d3-color";
import { Routes } from "../../../../../metadata";
import { useCountryName } from "../../queries/useCountryName";

const RoutedVisualization = () => {
  const yearSelection = useYearSelection();
  const countrySelection = useCountrySelection();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const countryName = useCountryName();

  const screenSize = useScreenSize({ debounceTime: 150 });
  const width = useMemo(
    () => (isMobile ? screenSize.width : screenSize.width - 160), // Match original Scrolly width calculation
    [screenSize.width, isMobile],
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // Define all steps configuration
  const steps = useMemo(
    () => [
      {
        route: Routes.GreenGrowthOverview,
        title: "Green Value Chains and Their Components",
        base: "bubbles",
        tooltip: [],
        modalContent:
          "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
        legend: "size",
        legendHeight: 50,
        source: "Source: Growth Lab research",
      },
      {
        route: Routes.GreenGrowthAdvantage,
        title: "Comparative Advantage Across Green Value Chains",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        modalContent: `Here is ${countryName}'s competitiveness across different green value chains.`,
        legend: "rca",
        legendHeight: 50,
        source: "Source: Growth Lab research",
      },
      {
        route: Routes.GreenGrowthMinerals,
        title: "Critical Mineral Opportunities Across Value Chains",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        stroke: "minerals",
        modalContent:
          "Critical minerals power the energy transition, since they form important inputs to many different energy technologies. Minerals are circled here with black borders. For the world to decarbonize, mineral producers will need to quickly scale-up production, which represents an important green growth opportunity for many countries. This requires mineral deposits and good mining policy.",
        legend: "minerals",
        legendHeight: 50,
        source: "Source: Growth Lab research",
      },
      {
        route: Routes.GreenGrowthCompetitiveness,
        title: "Competitiveness in Green Value Chains",
        base: "bars",
        tooltip: [{ field: "value", title: "Export Value" }],
        modalContent: `This shows ${countryName}'s actual presence (colored bar) in each green value chain versus the level if ${countryName} had average competitiveness in all value chain components (black line), revealing ${countryName}'s areas of strength and concentration.`,
        legend: "production",
        legendHeight: 50,
        source: "Source: Growth Lab research",
      },
    ],
    [countryName],
  );

  // Find current step based on route
  const currentStepIndex = useMemo(() => {
    const index = steps.findIndex((step) => step.route === location.pathname);
    return index >= 0 ? index : 0;
  }, [location.pathname, steps]);

  // Track previous step for smooth animations
  const [animationState, setAnimationState] = useState({
    currentStep: currentStepIndex,
    prevStep: currentStepIndex,
    isTransitioning: false,
  });

  useEffect(() => {
    if (currentStepIndex !== animationState.currentStep) {
      // Start transition
      setAnimationState((prev) => ({
        currentStep: currentStepIndex,
        prevStep: prev.currentStep,
        isTransitioning: true,
      }));

      // End transition after animation completes
      const timer = setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          prevStep: currentStepIndex,
          isTransitioning: false,
        }));
      }, 1500); // Give time for animation to complete

      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, animationState.currentStep]);

  const { currentView, prevBase } = useMemo(() => {
    const currentView = steps[animationState.currentStep];
    const prevView = steps[animationState.prevStep];
    const prevBase = prevView?.base || currentView?.base || "bubbles";
    return { currentView, prevView, prevBase };
  }, [animationState.currentStep, animationState.prevStep, steps]);

  const { childBubbles } = useSupplyChainBubbles({
    year: yearSelection,
    countryId: countrySelection,
    width: width,
    height: isMobile
      ? screenSize.height - currentView.legendHeight
      : screenSize.height,
    fill: currentView?.fill,
    stroke: currentView?.stroke,
  });

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        paddingTop: "60px",
      }}
    >
      <ScrollyCanvas
        key="routed-visualization" // Stable key to prevent remounting
        view={currentView}
        prevBase={prevBase}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        onScroll={undefined}
      />

      {tooltipOpen && tooltipData && (
        <svg
          style={{
            position: "absolute",
            top: isMobile ? `calc(12% + ${currentView.legendHeight}px)` : "12%",
            left: "0",
            width: width,
            height: isMobile
              ? `calc(88% - ${currentView.legendHeight}px)`
              : "88%",
            pointerEvents: "none",
          }}
          width={width}
          height={
            isMobile
              ? screenSize.height - currentView.legendHeight
              : screenSize.height
          }
          preserveAspectRatio="xMidYMid meet"
        >
          {currentView.base === "bubbles" &&
            (tooltipData as any)?.data?.product?.code &&
            Array.from(childBubbles.values())
              .filter(
                (bubble: any) =>
                  bubble.data.product.code ===
                  (tooltipData as any).data.product.code,
              )
              .map((bubble: any) => (
                <circle
                  key={`highlight-${bubble.id}`}
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.r}
                  fill="none"
                  stroke="black"
                  strokeWidth={2}
                  strokeOpacity={1}
                />
              ))}
          {currentView.base === "bars" &&
            (tooltipData as any)?.expectedExports && (
              <path
                d={
                  (tooltipData as any)?.coords
                    ?.map(
                      (point: any, i: number) =>
                        `${i === 0 ? "M" : "L"} ${point[0]} ${point[1]}`,
                    )
                    .join(" ") + " Z"
                }
                fill={color((tooltipData as any).fill)
                  ?.brighter(0.75)
                  .toString()}
                fillOpacity={0.5}
                stroke="none"
              />
            )}
        </svg>
      )}

      {tooltipOpen && tooltipData && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <Typography
            sx={{
              fontSize: "16px",
              mb: 1,
              color: "black",
            }}
          >
            {(tooltipData as any)?.data?.product?.nameShortEn} (
            {(tooltipData as any)?.data?.product?.code})
          </Typography>

          {currentView.tooltip?.length > 0 && (
            <hr style={{ width: "95%", margin: "10px 0" }} />
          )}

          <Box sx={{ display: "grid", gap: 1 }}>
            {currentView.tooltip.map(({ field, title }) => {
              let value = (tooltipData as any)[field] ?? 0;
              if (field === "value") {
                value = formatter.format(value);
              } else {
                value = Number(value).toFixed(2);
              }
              return (
                <Box key={field}>
                  <Typography sx={{ color: "black" }}>
                    {title}: <b>{value}</b>
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Tooltip>
      )}
    </div>
  );
};

export default RoutedVisualization;
