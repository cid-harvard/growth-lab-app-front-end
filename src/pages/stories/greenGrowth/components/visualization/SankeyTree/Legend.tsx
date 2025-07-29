import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { getRCALegendItems } from "../../../utils/rcaConfig";
import { themeUtils } from "../../../theme";

interface LegendProps {
  countrySelection: number | null;
}

export default function Legend({ countrySelection }: LegendProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (countrySelection === null || countrySelection === undefined) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        mt: isMobile ? 2 : 3,
        mb: isMobile ? 1 : 2,
        px: isMobile ? 1 : 2,
      }}
    >
      <Box
        sx={{
          width: "auto",
          maxWidth: isMobile ? "95%" : "90%",
          px: isMobile ? 1 : 2,
          py: isMobile ? 1 : 1.5,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: isMobile ? 1 : 2,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {getRCALegendItems().map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minWidth: "fit-content",
              }}
            >
              <Box
                sx={{
                  width: isMobile ? "20px" : "24px",
                  height: "3px",
                  backgroundColor: "#808080",
                  opacity: item.opacity,
                  border: `1px solid ${themeUtils.chart.colors.text.primary}`,
                  borderRadius: "2px",
                }}
              />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    ...themeUtils.chart.typography["chart-legend-item"],

                    fontWeight: "bold",
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </Box>
                <Box
                  sx={{
                    ...themeUtils.chart.typography["chart-legend-item-small"],
                  }}
                >
                  {item.description}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
