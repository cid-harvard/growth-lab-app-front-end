import React, { useMemo } from "react";
import { Tooltip, useTooltip } from "@visx/tooltip";
import ScrollyCanvas, { formatter } from "./ScrollyCanvas";
import { Typography, Box } from "@mui/material";
import { useSupplyChainBubbles } from "./useSupplyChainBubbles";
import { useScreenSize } from "@visx/responsive";
import { yearSelectionState } from "../ScollamaStory";
import { countrySelectionState } from "../ScollamaStory";
import { useRecoilValue } from "recoil";

const Scrolly = ({ steps, currentStep, prevStep, onStepChange }) => {
  const yearSelection = useRecoilValue(yearSelectionState);
  const countrySelection = useRecoilValue(countrySelectionState);
  // Get screen dimensions for the overlay
  const screenSize = useScreenSize({ debounceTime: 150 });
  const width = useMemo(() => screenSize.width - 160, [screenSize.width]);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();
  const { currentView, prevBase } = useMemo(() => {
    const currentView = steps[currentStep];
    const prevView = steps[prevStep];
    const prevBase = prevView.base;
    return { currentView, prevView, prevBase };
  }, [currentStep, prevStep, steps]);
  // Get bubble data for highlighting
  const { childBubbles } = useSupplyChainBubbles({
    year: yearSelection,
    countryId: countrySelection,
    width: width,
    height: screenSize.height,
    fill: currentView?.fill,
    stroke: currentView?.stroke,
  });

  return (
    <div style={{ height: "100vh", position: "relative", paddingTop: "60px" }}>
      <ScrollyCanvas
        view={currentView}
        totalSteps={steps.length}
        prevBase={prevBase}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        countrySelection={countrySelection}
        yearSelection={yearSelection}
      />

      {tooltipOpen && tooltipData && currentView.base === "bubbles" && (
        <svg
          style={{
            position: "absolute",
            top: "12%",
            left: "0",
            width,
            pointerEvents: "none",
          }}
          width="100%"
          height="88%"
          preserveAspectRatio="xMidYMid meet"
        >
          {Array.from(childBubbles.values())
            .filter(
              (bubble) =>
                bubble.data.product.code === tooltipData.data.product.code,
            )
            .map((bubble) => (
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
        </svg>
      )}

      {/* Existing Tooltip */}
      {tooltipOpen && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <Typography
            sx={{
              fontSize: "16px",
              mb: 1,
              color: "black",
            }}
          >
            {tooltipData.data.product.nameShortEn} (
            {tooltipData.data.product.code})
          </Typography>

          {currentView.tooltip?.length > 0 && (
            <hr style={{ width: "95%", margin: "10px 0" }} />
          )}

          <Box sx={{ display: "grid", gap: 1 }}>
            {currentView.tooltip.map(({ field, title }) => {
              let value = tooltipData[field] ?? 0;
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

export default Scrolly;
