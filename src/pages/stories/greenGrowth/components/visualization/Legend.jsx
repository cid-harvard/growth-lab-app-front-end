import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
import GGTooltip from "../shared/GGTooltip";
import { getTerm } from "../../utils/terms";
import Typography from "@mui/material/Typography";
import { themeUtils } from "../../theme";

const Legend = ({ mode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!mode) return null;
  const getItems = () => {
    switch (mode) {
      case "rca":
        // Two-category RCA legend: >1 and ≤1
        return [
          {
            label: "High (RCA>1)",
            color: theme.palette.custom?.legendHigh || "#000000",
            shape: "circle",
          },
          {
            label: "Low (RCA≤1)",
            color: theme.palette.custom?.legendLow || "#D3D3D3",
            shape: "circle",
          },
        ];
      case "production":
        return [
          {
            label: "Actual Export Value",
            color: theme.palette.grey[500],
            shape: "rect",
          },
          {
            label: "World Average",
            color: theme.palette.text.primary,
            shape: "line",
          },
        ];
      case "size":
        // Size legend is no longer used - products now have fixed sizes
        return [];
      default:
        return [];
    }
  };

  const renderShape = (item) => {
    const shapeContainer = {
      width: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "10px",
      height: isMobile ? "15px" : "20px",
    };

    switch (item.shape) {
      case "circle":
        return (
          <div
            style={{
              ...shapeContainer,
            }}
          >
            <div
              style={{
                width: isMobile ? "15px" : "20px",
                height: isMobile ? "15px" : "20px",
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
          </div>
        );
      case "rect":
        return (
          <div style={shapeContainer}>
            <div
              style={{
                width: "30px",
                height: isMobile ? "15px" : "20px",
                backgroundColor: item.color,
              }}
            />
          </div>
        );
      case "line":
        return (
          <div style={shapeContainer}>
            <div
              style={{
                width: "4px",
                height: isMobile ? "15px" : "20px",
                backgroundColor: item.color,
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const items = getItems();

  return (
    <Box
      sx={{
        width: "100%",
        px: 2,
        py: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 2 : 3,
        flexWrap: "nowrap",
      }}
    >
      {mode === "production" && (
        <>
          <GGTooltip
            title={getTerm("worldAverageExport").description}
            placement="top"
          >
            <Typography
              variant="chart-legend-title"
              sx={{
                textDecoration: "underline",
                cursor: "help",
                mr: 2,
                mb: 0,
                whiteSpace: "nowrap",
              }}
            >
              Export Value:
            </Typography>
          </GGTooltip>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: isMobile ? 1 : 2,
              alignItems: "center",
              flexWrap: "nowrap",
            }}
          >
            {items.map((item, index) => (
              <Box
                key={`legend-item-${item.label}-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ...themeUtils.chart.typography["chart-legend-item"],
                  lineHeight: "40px", // Specific line-height from Figma override
                  whiteSpace: "nowrap",
                  ...(item.style || {}),
                }}
              >
                {renderShape(item)}
                <span>{item.label}</span>
              </Box>
            ))}
          </Box>
        </>
      )}
      {mode === "rca" && (
        <Box
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            alignItems: "center",
            justifyContent: "center",
            columnGap: isMobile ? 2 : 3,
          }}
        >
          <GGTooltip title={getTerm("rca").description} placement="top">
            <Typography
              variant="chart-legend-title"
              sx={{
                mb: 0,
                whiteSpace: "nowrap",
                fontWeight: 600,
                borderBottom: "1px solid currentColor",
                cursor: "help",
              }}
            >
              Economic Competitiveness
            </Typography>
          </GGTooltip>
          {items.map((item, index) => (
            <Box
              key={`legend-item-${item.label}-${index}`}
              sx={{
                display: "flex",
                alignItems: "center",
                ...themeUtils.chart.typography["chart-legend-item"],
                whiteSpace: "nowrap",
                ...(item.style || {}),
              }}
            >
              {renderShape(item)}
              <span>{item.label}</span>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
export default Legend;
