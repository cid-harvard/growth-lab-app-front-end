import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tooltip, useTooltip } from "@visx/tooltip";
import ScrollyCanvas, { formatter } from "./ScrollyCanvas";
import StrategicPositionChart from "./StrategicPositionChart";
import StackedBarsChart from "./StackedBarsChart";
import { Typography, Box } from "@mui/material";

import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { Routes } from "../../../../../metadata";
import { useCountryName } from "../../queries/useCountryName";
import { themeUtils } from "../../theme";

const RoutedVisualization = () => {
  const yearSelection = useYearSelection();
  const countrySelection = useCountrySelection();
  const location = useLocation();
  const countryName = useCountryName();

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
        route: Routes.GreenGrowthCompetitiveness,
        title: "Competitiveness in Green Value Chains",
        base: "bars",
        tooltip: [],
        modalContent: `This shows ${countryName}'s actual presence (colored bar) in each green value chain versus the level if ${countryName} had average competitiveness in all value chain components (black line). This reveals ${countryName}'s areas of strength and concentration.`,
        legend: "",
        legendHeight: 0,
        source: "Source: Growth Lab research",
      },
      {
        route: Routes.GreenGrowthStrategicPosition,
        title: "Strategic Position in Green Growth",
        base: "strategicPosition",
        tooltip: [],
        modalContent:
          "This scatter plot shows each country's strategic position in green growth opportunities, revealing areas of strength and potential for development across different economic contexts.",
        legend: "",
        legendHeight: 0,
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

  const currentView = useMemo(() => {
    return steps[animationState.currentStep];
  }, [animationState.currentStep, steps]);

  // Render Strategic Position Chart for strategic base type
  if (currentView?.base === "strategicPosition") {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
        }}
      >
        <StrategicPositionChart />
      </div>
    );
  }

  // Render Stacked Bars Chart for bars base type
  if (currentView?.base === "bars") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StackedBarsChart year={yearSelection} countryId={countrySelection} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ScrollyCanvas
        key="routed-visualization" // Stable key to prevent remounting
        view={currentView}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        tooltipData={tooltipData}
      />
      {tooltipOpen && tooltipData && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <Box
            sx={{
              ...themeUtils.chart.getTooltipSx(),
              maxWidth: "300px",
              textAlign: "left",
            }}
          >
            <Typography
              sx={{
                ...themeUtils.chart.typography["chart-tooltip-title"],
                mb: 0.5,
              }}
            >
              {(tooltipData as any)?.data?.product?.nameShortEn ||
                (tooltipData as any)?.data?.nameShortEn ||
                "Unknown Product"}
            </Typography>
            <Typography
              sx={{
                ...themeUtils.chart.typography["chart-tooltip-content"],
                display: "block",
                mb: 0.5,
              }}
            >
              Code:{" "}
              {(tooltipData as any)?.data?.product?.code ||
                (tooltipData as any)?.data?.code}
            </Typography>
            <Typography
              sx={{
                ...themeUtils.chart.typography["chart-tooltip-content"],
                display: "block",
              }}
            >
              Export Value:{" "}
              {formatter.format((tooltipData as any)?.data?.exportValue || 0)}
            </Typography>
            {(tooltipData as any)?.data?.exportRca && (
              <Typography
                sx={{
                  ...themeUtils.chart.typography["chart-tooltip-content"],
                  display: "block",
                }}
              >
                RCA: {(tooltipData as any)?.data?.exportRca.toFixed(2)}
              </Typography>
            )}
          </Box>
        </Tooltip>
      )}
    </div>
  );
};

export default RoutedVisualization;
