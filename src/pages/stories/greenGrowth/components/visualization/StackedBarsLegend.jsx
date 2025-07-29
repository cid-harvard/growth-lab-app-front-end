import React from "react";
import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";

const StackedBarsLegend = ({ groups, isMobile }) => {
  const theme = useTheme();

  if (!groups || groups.length === 0) return null;

  // Always show clusters now
  const groupLabel = "Product Clusters";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        py: isMobile ? 2 : 1,
        p: 0,
        m: 0,
      }}
    >
      <Box
        sx={{
          width: "auto",
          maxWidth: "100%",
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2,
          backgroundColor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 3 : 4,
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          {/* How to Read Section */}
          <Box display="flex" flexDirection="row" gap={1.5}>
            <Typography
              variant="chart-legend-title"
              sx={{
                m: 0,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              How to Read
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
                alignItems: isMobile ? "center" : "flex-start",
              }}
            >
              {/* Above Expectation Bars */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: isMobile ? "30px" : "40px",
                    height: "8px",
                    backgroundColor: "#2E7D32",
                    borderRadius: "2px",
                  }}
                />
                <Typography variant="chart-legend-item">
                  Above Expectation
                </Typography>
              </Box>

              {/* Below Expectation Bars */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: isMobile ? "30px" : "40px",
                    height: "8px",
                    backgroundColor: "#D32F2F",
                    borderRadius: "2px",
                  }}
                />
                <Typography variant="chart-legend-item">
                  Below Expectation
                </Typography>
              </Box>

              {/* Expected Performance Line */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: "1px",
                    height: isMobile ? "20px" : "25px",
                    backgroundColor: "black",
                    borderRadius: "1px",
                  }}
                />
                <Typography variant="chart-legend-item">
                  Expected Performance
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StackedBarsLegend;
