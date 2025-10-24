// Chart-specific typography variants
export const chartTypographyVariants = {
  // Axis labels - main labels for X and Y axes
  "chart-axis-label": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    textDecoration: "underline", // For tooltips
    "@media (max-width:600px)": {
      fontSize: "0.75rem", // 12px
      lineHeight: "1rem", // 16px
    },
  },

  // Axis ticks - numerical values on axes
  "chart-axis-tick": {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    lineHeight: "1rem", // 16px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "0.625rem", // 10px
      lineHeight: "0.875rem", // 14px
    },
  },

  // Direction indicators on axes (← Less, More →)
  "chart-axis-direction": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "0.625rem", // 10px
      lineHeight: "0.875rem", // 14px
    },
  },

  // Tooltip titles
  "chart-tooltip-title": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    marginBottom: "8px",
    "@media (max-width:600px)": {
      fontSize: "0.875rem", // 14px
      lineHeight: "1.125rem", // 18px
      marginBottom: "6px",
    },
  },

  // Tooltip content
  "chart-tooltip-content": {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: "1.125rem", // 18px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "0.75rem", // 12px
      lineHeight: "1rem", // 16px
    },
  },

  // Legend titles
  "chart-legend-title": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "0.875rem", // 14px
      lineHeight: "1.125rem", // 18px
    },
  },

  // Legend items
  "chart-legend-item": {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "0.75rem", // 12px
      lineHeight: "1rem", // 16px
    },
  },

  // Small legend items (for dense legends)
  "chart-legend-item-small": {
    fontSize: "0.6875rem", // 11px
    fontWeight: 400,
    lineHeight: "1rem", // 16px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    "@media (max-width:600px)": {
      fontSize: "0.5625rem", // 9px
      lineHeight: "0.875rem", // 14px
    },
  },

  // Chart annotations and instructions
  "chart-annotation": {
    fontSize: "0.875rem", // 14px
    fontWeight: 500,
    lineHeight: "1.125rem", // 18px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "0.75rem", // 12px
      lineHeight: "1rem", // 16px
    },
  },

  // Data labels on charts
  "chart-data-label": {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    lineHeight: "1rem", // 16px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    "@media (max-width:600px)": {
      fontSize: "0.625rem", // 10px
      lineHeight: "0.875rem", // 14px
    },
  },

  // Column headers (like in SankeyTree)
  "chart-column-header": {
    fontSize: "1rem", // 16px
    fontWeight: 700,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#000000",
    textTransform: "uppercase",
    "@media (max-width:600px)": {
      fontSize: "0.625rem", // 10px
      lineHeight: "0.875rem", // 14px
    },
  },

  // Large chart labels (like supply chain names)
  "chart-large-label": {
    fontSize: "clamp(0.75rem, 1.5vw, 1.25rem)", // clamp(12px, 1.5vw, 20px)
    fontWeight: 600,
    lineHeight: "1.2",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#333333",
    textShadow: "0px 0px 3px rgba(255,255,255,0.8)",
    "@media (max-width:600px)": {
      fontSize: "clamp(0.75rem, 1.5vw, 0.9375rem)", // clamp(12px, 1.5vw, 15px)
    },
  },

  // Chart main titles
  "chart-title": {
    fontSize: "1.375rem", // 22px
    fontWeight: 600,
    lineHeight: "1.75rem", // 28px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#298BBC",
    textTransform: "uppercase",
    textAlign: "center",
    "@media (max-width:600px)": {
      fontSize: "1.375rem", // 22px - Keep same size on mobile per spec
      lineHeight: "1.75rem", // 28px
    },
  },

  // Attribution text
  "chart-attribution": {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    lineHeight: "1rem", // 16px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "#666666",
    "@media (max-width:600px)": {
      fontSize: "0.625rem", // 10px
      lineHeight: "0.875rem", // 14px
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
    fontSize: `${desktopSize / 16}rem`, // Convert px to rem
    "@media (max-width:600px)": {
      fontSize: `${mobile / 16}rem`, // Convert px to rem
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
    "chart-title": React.CSSProperties;
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
    "chart-title"?: React.CSSProperties;
    "chart-attribution"?: React.CSSProperties;
  }
}

// Allow using custom chart variants in the Typography `variant` prop
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    "chart-axis-label": true;
    "chart-axis-tick": true;
    "chart-axis-direction": true;
    "chart-tooltip-title": true;
    "chart-tooltip-content": true;
    "chart-legend-title": true;
    "chart-legend-item": true;
    "chart-legend-item-small": true;
    "chart-annotation": true;
    "chart-data-label": true;
    "chart-column-header": true;
    "chart-large-label": true;
    "chart-title": true;
    "chart-attribution": true;
  }
}
