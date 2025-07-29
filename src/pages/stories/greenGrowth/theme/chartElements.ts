// Chart-specific typography variants
export const chartTypographyVariants = {
  // Axis labels - main labels for X and Y axes
  "chart-axis-label": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    textDecoration: "underline", // For tooltips
    "@media (max-width:600px)": {
      fontSize: "12px",
      lineHeight: "16px",
    },
  },

  // Axis ticks - numerical values on axes
  "chart-axis-tick": {
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "16px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "10px",
      lineHeight: "14px",
    },
  },

  // Direction indicators on axes (← Less, More →)
  "chart-axis-direction": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "10px",
      lineHeight: "14px",
    },
  },

  // Tooltip titles
  "chart-tooltip-title": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    marginBottom: "8px",
    "@media (max-width:600px)": {
      fontSize: "14px",
      lineHeight: "18px",
      marginBottom: "6px",
    },
  },

  // Tooltip content
  "chart-tooltip-content": {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "18px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "12px",
      lineHeight: "16px",
    },
  },

  // Legend titles
  "chart-legend-title": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "22px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "14px",
      lineHeight: "18px",
    },
  },

  // Legend items
  "chart-legend-item": {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "12px",
      lineHeight: "16px",
    },
  },

  // Small legend items (for dense legends)
  "chart-legend-item-small": {
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: "16px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "9px",
      lineHeight: "14px",
    },
  },

  // Chart annotations and instructions
  "chart-annotation": {
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "18px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "12px",
      lineHeight: "16px",
    },
  },

  // Data labels on charts
  "chart-data-label": {
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "16px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "10px",
      lineHeight: "14px",
    },
  },

  // Column headers (like in SankeyTree)
  "chart-column-header": {
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    textTransform: "uppercase",
    "@media (max-width:600px)": {
      fontSize: "10px",
      lineHeight: "14px",
    },
  },

  // Large chart labels (like supply chain names)
  "chart-large-label": {
    fontSize: "clamp(12px, 1.5vw, 20px)",
    fontWeight: 600,
    lineHeight: "1.2",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    textShadow: "0px 0px 3px rgba(255,255,255,0.8)",
    "@media (max-width:600px)": {
      fontSize: "clamp(12px, 1.5vw, 15px)",
    },
  },

  // Attribution text
  "chart-attribution": {
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "16px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#666666",
    "@media (max-width:600px)": {
      fontSize: "10px",
      lineHeight: "14px",
    },
  },
} as const;

// Chart-specific styling utilities
export const chartStyles = {
  // Tooltip container styling
  tooltip: {
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "12px 16px",
    maxWidth: "300px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
    fontFamily: "Source Sans Pro, sans-serif",
    "@media (max-width:600px)": {
      padding: "8px 12px",
      maxWidth: "250px",
    },
  },

  // Legend container styling
  legendContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "4px",
    padding: "12px 16px",
    "@media (max-width:600px)": {
      padding: "8px 12px",
    },
  },

  // Chart annotation background
  annotationBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "6px 12px",
    borderRadius: "4px",
    "@media (max-width:600px)": {
      padding: "4px 8px",
    },
  },

  // Axis styling
  axis: {
    tickStroke: "#e0e0e0",
    tickStrokeWidth: 1,
    axisStroke: "#e0e0e0",
    axisStrokeWidth: 1,
  },

  // Grid styling
  grid: {
    stroke: "#e0e0e0",
    strokeWidth: 0.5,
    strokeDasharray: "3 3",
  },
} as const;

// Responsive font size helpers
export const getResponsiveChartFontSize = (
  desktopSize: number,
  mobileSize?: number,
) => {
  const mobile = mobileSize || Math.max(desktopSize - 2, 8);
  return {
    fontSize: `${desktopSize}px`,
    "@media (max-width:600px)": {
      fontSize: `${mobile}px`,
    },
  };
};

// Helper to get chart typography variant
export const getChartTypography = (
  variant: keyof typeof chartTypographyVariants,
) => {
  return chartTypographyVariants[variant];
};

// Helper to apply chart styling consistently
export const applyChartStyling = (element: keyof typeof chartStyles) => {
  return chartStyles[element];
};

// Chart color utilities
export const chartColors = {
  text: {
    primary: "#000000",
    secondary: "#333333",
    muted: "#666666",
    disabled: "#999999",
  },
  background: {
    tooltip: "#ffffff",
    legend: "rgba(255, 255, 255, 0.95)",
    annotation: "rgba(255, 255, 255, 0.9)",
  },
  border: {
    light: "#e0e0e0",
    medium: "#cccccc",
    dark: "#999999",
  },
  grid: {
    light: "#f5f5f5",
    medium: "#e0e0e0",
  },
} as const;

// TypeScript module augmentation for custom chart variants
declare module "@mui/material/styles" {
  interface TypographyVariants {
    "chart-axis-label": React.CSSProperties;
    "chart-axis-tick": React.CSSProperties;
    "chart-axis-direction": React.CSSProperties;
    "chart-tooltip-title": React.CSSProperties;
    "chart-tooltip-content": React.CSSProperties;
    "chart-legend-title": React.CSSProperties;
    "chart-legend-item": React.CSSProperties;
    "chart-legend-item-small": React.CSSProperties;
    "chart-annotation": React.CSSProperties;
    "chart-data-label": React.CSSProperties;
    "chart-column-header": React.CSSProperties;
    "chart-large-label": React.CSSProperties;
    "chart-attribution": React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    "chart-axis-label"?: React.CSSProperties;
    "chart-axis-tick"?: React.CSSProperties;
    "chart-axis-direction"?: React.CSSProperties;
    "chart-tooltip-title"?: React.CSSProperties;
    "chart-tooltip-content"?: React.CSSProperties;
    "chart-legend-title"?: React.CSSProperties;
    "chart-legend-item"?: React.CSSProperties;
    "chart-legend-item-small"?: React.CSSProperties;
    "chart-annotation"?: React.CSSProperties;
    "chart-data-label"?: React.CSSProperties;
    "chart-column-header"?: React.CSSProperties;
    "chart-large-label"?: React.CSSProperties;
    "chart-attribution"?: React.CSSProperties;
  }
}
