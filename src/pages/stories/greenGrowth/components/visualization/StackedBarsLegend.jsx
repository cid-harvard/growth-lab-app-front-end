import { Box, Typography } from "@mui/material";

const StackedBarsLegend = ({ groups, isMobile }) => {
  if (!groups || groups.length === 0) return null;

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
          <Box
            display="flex"
            flexDirection="row"
            gap={1.5}
            sx={{ alignItems: "center" }}
          >
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
                alignItems: "center",
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
                    backgroundColor: "#268fbd",
                    borderRadius: "2px",
                  }}
                />
                <Typography variant="chart-legend-item">
                  Outperforming Clusters
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
                    backgroundColor: "#f1b47d",
                    borderRadius: "2px",
                  }}
                />
                <Typography variant="chart-legend-item">
                  Underperforming Clusters
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
                    width: "2px",
                    height: isMobile ? "20px" : "25px",
                    backgroundColor: "rgb(51,51,51)",
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
