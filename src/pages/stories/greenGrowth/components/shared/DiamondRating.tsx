import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export const computeDiamondRatings = (
  values: Array<number | null | undefined>,
) => {
  const valid = values
    .filter((v) => typeof v === "number" && !Number.isNaN(Number(v)))
    .map((v) => Number(v as number))
    .sort((a, b) => a - b);
  if (valid.length === 0) {
    return {
      getRating: (_v: number | null | undefined) => 0,
    };
  }

  const getRating = (v: number | null | undefined): number => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return 0;
    const value = Number(v);
    let lo = 0;
    let hi = valid.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (valid[mid] <= value) lo = mid + 1;
      else hi = mid - 1;
    }
    const rankIndex = Math.max(0, Math.min(valid.length - 1, lo - 1));
    const percentile = valid.length === 1 ? 1 : (rankIndex + 1) / valid.length;
    const decile = Math.min(10, Math.max(1, Math.floor(percentile * 10)));
    const rating = Math.min(5, Math.max(1, Math.ceil(decile / 2)));
    return rating;
  };

  return { getRating };
};

export const DiamondRow: React.FC<{
  count: number;
  size?: "small" | "medium";
}> = ({ count, size }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const total = 5;
  const pixelSize = size === "small" ? 10 : isMobile ? 10 : 12;
  const gap = size === "small" ? 6 : isMobile ? 6 : 8;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: `${gap}px` }}>
      {Array.from({ length: total }).map((_, idx) => {
        const filled = idx < count;
        // eslint-disable-next-line react/no-array-index-key
        return (
          <Box
            key={idx}
            component="span"
            sx={{
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
              transform: "rotate(45deg)",
              borderRadius: "2px",
              border: `2px solid ${theme.palette.grey[500]}`,
              backgroundColor: filled ? theme.palette.grey[600] : "transparent",
              boxSizing: "border-box",
              display: "inline-block",
            }}
          />
        );
      })}
    </Box>
  );
};

export default DiamondRow;
