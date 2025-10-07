import { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import CirclePack from "./CirclePack";
import { SharedTooltip } from "../shared";
import StrategicPositionChart from "./StrategicPositionChart";
import StackedBarsChart from "./StackedBarsChart";
// no-op

import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { Routes } from "../../../../../metadata";
import { useCountryName } from "../../queries/useCountryName";

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
        title: "Green Value Chains and Products",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        layoutMode: "flat",
        modalContent: `This visualization reveals where ${countryName} is already active within green industrial clusters – including their component products and overarching green value chains. These existing strengths can unlock green growth opportunities by entering related production that requires similar knowhow.`,
        legend: "rca",
        legendHeight: 50,
      },
      {
        route: Routes.GreenGrowthAdvantage,
        title: "Green Manufacturing Communities",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        layoutMode: "clustered",
        modalContent: `Manufacturing communities represent clusters of related products that tend to be produced in the same place. This clustered view shows how green products group together based on shared productive capabilities. Each cluster represents a distinct set of knowhow and industrial capabilities.`,
        legend: "rca",
        legendHeight: 50,
      },
      {
        route: Routes.GreenGrowthClusters,
        title: "Industrial Clusters & Products",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        layoutMode: "clusters-only",
        modalContent: `Industrial clusters represent groups of related products that require similar productive capabilities and tend to be produced in the same places. This view shows all green industrial clusters and their component products, revealing the manufacturing communities that drive the green economy.`,
        legend: "rca",
        legendHeight: 50,
      },
      {
        route: Routes.GreenGrowthCompetitiveness,
        title: "Competitiveness in Green Value Chains",
        base: "bars",
        tooltip: [],
        modalContent: `This shows ${countryName}'s actual presence (colored bar) in each green value chain versus the level if ${countryName} had average competitiveness in all value chain components (black line). This reveals ${countryName}'s areas of strength and concentration.`,
        legend: "",
        legendHeight: 0,
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
      },
    ],
    [countryName],
  );

  // Find current step based on route (support sub-routes like "/comparison")
  const currentStepIndex = useMemo(() => {
    const exactIndex = steps.findIndex(
      (step) => step.route === location.pathname,
    );
    if (exactIndex !== -1) return exactIndex;
    const prefixIndex = steps.findIndex(
      (step) =>
        location.pathname === step.route ||
        location.pathname.startsWith(step.route + "/"),
    );
    return prefixIndex >= 0 ? prefixIndex : 0;
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
    const isComparisonSubroute = location.pathname.startsWith(
      Routes.GreenGrowthCompetitiveness + "/comparison",
    );
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StackedBarsChart
          year={yearSelection}
          countryId={countrySelection}
          mode={isComparisonSubroute ? "comparison" : "presence"}
        />
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
      <CirclePack
        key="routed-visualization" // Stable key to prevent remounting
        view={currentView}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      />
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={(tooltipLeft || 0) + 14}
          top={(tooltipTop || 0) + 14}
          className="gg-unskinned-tooltip"
        >
          <SharedTooltip payload={tooltipData as never} />
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default RoutedVisualization;
