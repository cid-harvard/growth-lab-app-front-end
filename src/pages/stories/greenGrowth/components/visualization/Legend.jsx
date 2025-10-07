import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import Popover from "@mui/material/Popover";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TuneIcon from "@mui/icons-material/Tune";
import GGTooltip from "../shared/GGTooltip";
import { getTerm } from "../../utils/terms";
import Typography from "@mui/material/Typography";
import { themeUtils } from "../../theme";

const Legend = ({ mode, rcaThreshold = 1.0, onChangeRcaThreshold }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  const thresholdLabel = Number(rcaThreshold).toFixed(1);

  if (!mode) return null;
  const getItems = () => {
    switch (mode) {
      case "rca":
        // Two-category RCA legend with dynamic threshold
        return [
          {
            label: `High (RCA>${thresholdLabel})`,
            color: theme.palette.custom?.legendHigh || "#000000",
            shape: "circle",
          },
          {
            label: `Low (RCA≤${thresholdLabel})`,
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
          <GGTooltip title="Adjust RCA threshold " placement="top">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 1 }}
              aria-label="Adjust RCA threshold"
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </GGTooltip>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Box sx={{ p: 2, width: isMobile ? 240 : 280 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                RCA Threshold
              </Typography>
              <Slider
                min={0}
                max={3}
                step={0.1}
                value={rcaThreshold}
                onChange={(_, v) => onChangeRcaThreshold?.(Number(v))}
                valueLabelDisplay="auto"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button size="small" onClick={() => setAnchorEl(null)}>
                  Close
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      )}
    </Box>
  );
};
export default Legend;
