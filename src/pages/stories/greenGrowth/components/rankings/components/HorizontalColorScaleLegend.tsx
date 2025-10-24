import { Box, Typography } from "@mui/material";

type HorizontalColorScaleLegendProps = {
  minLabel: string;
  maxLabel: string;
  minColor: string;
  maxColor: string;
  title?: string;
  rootStyles?: React.CSSProperties;
  midColor?: string;
  midAt?: number; // 0..1 position for the midpoint (e.g., where value 0 lies)
  colors?: string[]; // optional multi-stop colors including center color
  discrete?: boolean; // if true, show discrete blocks instead of gradient
};

export const HorizontalColorScaleLegend = (
  props: HorizontalColorScaleLegendProps,
) => {
  const {
    minLabel,
    maxLabel,
    minColor,
    maxColor,
    title,
    rootStyles,
    midColor = "#ffffff",
    midAt,
    colors,
    discrete = false,
  } = props;

  // If discrete mode and colors provided, show discrete blocks
  if (discrete && Array.isArray(colors) && colors.length > 0) {
    return (
      <div style={{ width: "100%", ...rootStyles }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            maxWidth: 520,
            margin: "0 auto",
            mb: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "black", minWidth: 40, textAlign: "right" }}
          >
            {minLabel.toUpperCase()}
          </Typography>
          <div
            style={{
              flex: 1,
              height: 10,
              display: "flex",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e0e0e0",
            }}
          >
            {colors.map((color, index) => (
              <div
                key={`color-block-${index}-${color}`}
                style={{
                  flex: 1,
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
          <Typography
            variant="caption"
            sx={{ color: "black", minWidth: 40, fontSize: 16, fontWeight: 600 }}
          >
            {maxLabel.toUpperCase()}
          </Typography>
        </Box>
        {title ? (
          <Typography
            variant="caption"
            align="center"
            sx={{
              display: "block",
              mt: 0.75,
              color: "black",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
        ) : null}
      </div>
    );
  }

  // Otherwise, show gradient (original behavior)
  const gradient = (() => {
    if (Array.isArray(colors) && colors.length >= 3) {
      const centerIndex = Math.floor(colors.length / 2);
      if (typeof midAt === "number" && midAt >= 0 && midAt <= 1) {
        const leftCount = centerIndex;
        const rightCount = colors.length - centerIndex - 1;
        const stops: string[] = [];
        for (let i = 0; i < leftCount; i++) {
          const pos = midAt * (i / leftCount) * 100;
          stops.push(`${colors[i]} ${pos.toFixed(2)}%`);
        }
        stops.push(`${colors[centerIndex]} ${(midAt * 100).toFixed(2)}%`);
        for (let i = 1; i <= rightCount; i++) {
          const pos = (midAt + (1 - midAt) * (i / rightCount)) * 100;
          stops.push(`${colors[centerIndex + i]} ${pos.toFixed(2)}%`);
        }
        return `linear-gradient(90deg, ${stops.join(", ")})`;
      }
      // Even spacing if no midAt
      const step = 100 / (colors.length - 1);
      const stops = colors.map((c, i) => `${c} ${(i * step).toFixed(2)}%`);
      return `linear-gradient(90deg, ${stops.join(", ")})`;
    }
    if (typeof midAt === "number") {
      return `linear-gradient(90deg, ${minColor} 0%, ${midColor} ${(Math.max(0, Math.min(1, midAt)) * 100).toFixed(2)}%, ${maxColor} 100%)`;
    }
    return `linear-gradient(90deg, ${minColor} 0%, ${maxColor} 100%)`;
  })();

  return (
    <div style={{ width: "100%", ...rootStyles }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "black", minWidth: 40, textAlign: "right" }}
        >
          {minLabel.toUpperCase()}
        </Typography>
        <div
          style={{
            flex: 1,
            height: 10,
            borderRadius: 4,
            background: gradient,
            border: "1px solid #e0e0e0",
          }}
        />
        <Typography variant="caption" sx={{ color: "black", minWidth: 40 }}>
          {maxLabel.toUpperCase()}
        </Typography>
      </Box>
      {title ? (
        <Typography
          variant="caption"
          align="center"
          sx={{ display: "block", mt: 0.75, color: "text.secondary" }}
        >
          {title}
        </Typography>
      ) : null}
    </div>
  );
};
