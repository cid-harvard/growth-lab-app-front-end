import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";

interface LegendProps {
  countrySelection: number | null;
}

// RCA legend items for the 3 opacity groups
const RCA_OPACITY_LEGEND_ITEMS = [
  {
    opacity: 1,
    label: "High RCA (≥1.0)",
    description: "Strong Capability",
  },
  {
    opacity: 0.6,
    label: "Medium RCA (0.5-1.0)",
    description: "Moderate Capability",
  },
  { opacity: 0.3, label: "Low RCA (<0.5)", description: "Limited Capability" },
];

export default function Legend({ countrySelection }: LegendProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!countrySelection) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: isMobile ? "10px" : "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto",
        maxWidth: "90%",
        px: 2,
        py: 1.5,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.1)",
        fontSize: isMobile ? "12px" : "14px",
        color: "#333333",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: isMobile ? 2 : 3,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {RCA_OPACITY_LEGEND_ITEMS.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: "fit-content",
            }}
          >
            <Box
              sx={{
                width: isMobile ? "24px" : "30px",
                height: "4px",
                backgroundColor: "#808080",
                opacity: item.opacity,
                border: "1px solid #333333",
                borderRadius: "2px",
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  fontWeight: "bold",
                  color: "#333333",
                  fontSize: isMobile ? "11px" : "13px",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Box>
              <Box
                sx={{
                  fontSize: isMobile ? "9px" : "11px",
                  color: "#666666",
                  lineHeight: 1.1,
                }}
              >
                {item.description}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
