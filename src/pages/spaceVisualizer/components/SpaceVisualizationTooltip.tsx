import React from "react";
import { Box, Typography } from "@mui/material";
import { Tooltip } from "@visx/tooltip";
import type { Node } from "../loader";

interface SpaceVisualizationTooltipProps {
  tooltipData: Node | null;
  tooltipLeft: number | undefined;
  tooltipTop: number | undefined;
  tooltipFields?: string[];
}

export const SpaceVisualizationTooltip: React.FC<
  SpaceVisualizationTooltipProps
> = ({ tooltipData, tooltipLeft, tooltipTop, tooltipFields }) => {
  if (
    !tooltipData ||
    !tooltipFields?.length ||
    tooltipLeft === undefined ||
    tooltipTop === undefined
  )
    return null;

  return (
    <Tooltip
      left={tooltipLeft}
      top={tooltipTop}
      style={{
        position: "absolute",
        backgroundColor: "white",
        padding: "8px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <Box>
        {tooltipFields.map((field) => (
          <Typography key={field} variant="body2">
            {field}: {String(tooltipData[field])}
          </Typography>
        ))}
      </Box>
    </Tooltip>
  );
};
