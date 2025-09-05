import { createTheme } from "@mui/material/styles";
import { typography, customTypographyVariants } from "./typography";
import { controlColors, controlComponentOverrides } from "./controlComponents";
import {
  chartTypographyVariants,
  chartStyles,
  chartColors,
} from "./chartElements";

// Color palette - matching Figma export exactly
const palette = {
  primary: {
    main: controlColors.primary, // #3AA0C1
    dark: controlColors.primaryDark, // #2685BD
    light: controlColors.secondary, // #53C2C9
  },
  secondary: {
    main: controlColors.secondary, // #53C2C9
    light: controlColors.secondaryLight, // rgba(83, 194, 201, 0.25)
    dark: controlColors.primaryDark, // #2685BD
  },
  text: {
    primary: controlColors.text, // #000000
    secondary: controlColors.textSecondary, // #106496
    disabled: controlColors.textDisabled, // #5C5C5C
  },
  background: {
    default: "#FFFFFF",
    paper: controlColors.background, // #FFFFFF
  },
  divider: controlColors.border, // #777777
  grey: {
    50: "#F5F5F5",
    100: "#EEEEEE",
    200: "#E0E0E0",
    300: "#CCCCCC",
    400: "#AAAAAA",
    500: controlColors.neutral, // #5C5C5C
    600: "#555555",
    700: controlColors.text, // #000000
    800: "#222222",
    900: "#111111",
  },
  // Custom colors from Figma
  custom: {
    highlightBlue: controlColors.textSecondary, // #106496
    fadedBlue: controlColors.textSecondaryFaded, // rgba(16, 100, 150, 0.5)
    tealAccent: controlColors.secondary, // #53C2C9
    tealLight: controlColors.secondaryLight, // rgba(83, 194, 201, 0.25)
    footerBg: controlColors.backgroundFooter, // rgba(0, 0, 0, 0.10)
    legendHigh: controlColors.legendHigh, // #000000
    legendMid: controlColors.legendMid, // #808080
    legendLow: controlColors.legendLow, // #D3D3D3
  },
};

// Combine all typography variants
const allTypographyVariants = {
  ...customTypographyVariants,
  ...chartTypographyVariants,
};

// Create base theme with typography and palette
const baseTheme = createTheme({
  palette,
  typography: {
    ...typography,
    // Add custom font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  spacing: 8,
});

// Main greenGrowth theme with component overrides
const greenGrowthTheme = createTheme(baseTheme, {
  components: {
    ...controlComponentOverrides,
    MuiTypography: {
      variants: Object.entries(allTypographyVariants).map(([name, style]) => ({
        props: { variant: name as any },
        style,
      })),
      styleOverrides: {
        root: {
          // Original variants
          "&.brand-title": customTypographyVariants["brand-title"],
          "&.main-heading": customTypographyVariants["main-heading"],
          "&.sub-heading": customTypographyVariants["sub-heading"],
          "&.highlight-text": customTypographyVariants["highlight-text"],
          "&.secondary-text": customTypographyVariants["secondary-text"],
          "&.body-text": customTypographyVariants["body-text"],
          "&.control-text": customTypographyVariants["control-text"],
          "&.control-text-bold": customTypographyVariants["control-text-bold"],
          "&.legend-title": customTypographyVariants["legend-title"],
          "&.legend-item": customTypographyVariants["legend-item"],
          "&.tab-button": customTypographyVariants["tab-button"],
          "&.small-button": customTypographyVariants["small-button"],
          "&.footer-button": customTypographyVariants["footer-button"],
          "&.atlas-title": customTypographyVariants["atlas-title"],
          "&.atlas-content": customTypographyVariants["atlas-content"],

          // Chart variants
          "&.chart-axis-label": chartTypographyVariants["chart-axis-label"],
          "&.chart-axis-tick": chartTypographyVariants["chart-axis-tick"],
          "&.chart-axis-direction":
            chartTypographyVariants["chart-axis-direction"],
          "&.chart-tooltip-title":
            chartTypographyVariants["chart-tooltip-title"],
          "&.chart-tooltip-content":
            chartTypographyVariants["chart-tooltip-content"],
          "&.chart-legend-title": chartTypographyVariants["chart-legend-title"],
          "&.chart-legend-item": chartTypographyVariants["chart-legend-item"],
          "&.chart-legend-item-small":
            chartTypographyVariants["chart-legend-item-small"],
          "&.chart-annotation": chartTypographyVariants["chart-annotation"],
          "&.chart-data-label": chartTypographyVariants["chart-data-label"],
          "&.chart-column-header":
            chartTypographyVariants["chart-column-header"],
          "&.chart-large-label": chartTypographyVariants["chart-large-label"],
          "&.chart-title": chartTypographyVariants["chart-title"],
          "&.chart-attribution": chartTypographyVariants["chart-attribution"],
        },
      },
    },
  },
});

// Theme utilities for consistent usage
export const themeUtils = {
  // Spacing helpers
  spacing: (multiplier: number) => baseTheme.spacing(multiplier),

  // Animation helpers
  transition: (
    properties: string[],
    duration: keyof typeof baseTheme.transitions.duration = "standard",
  ) =>
    properties
      .map(
        (prop) =>
          `${prop} ${baseTheme.transitions.duration[duration]}ms ${baseTheme.transitions.easing.easeInOut}`,
      )
      .join(", "),

  // Responsive helpers
  breakpoints: baseTheme.breakpoints,

  // Color helpers
  colors: controlColors,

  // Typography helpers
  typography: customTypographyVariants,

  // Chart-specific helpers
  chart: {
    typography: chartTypographyVariants,
    styles: chartStyles,
    colors: chartColors,

    // Helper to get responsive font size for charts
    getResponsiveFontSize: (desktopSize: number, mobileSize?: number) => {
      const mobile = mobileSize || Math.max(desktopSize - 2, 8);
      return {
        fontSize: `${desktopSize}px`,
        "@media (max-width:600px)": {
          fontSize: `${mobile}px`,
        },
      };
    },

    // Helper to apply tooltip styling
    getTooltipSx: () => chartStyles.tooltip,

    // Helper to apply legend container styling
    getLegendContainerSx: () => chartStyles.legendContainer,

    // Helper to apply annotation background styling
    getAnnotationBackgroundSx: () => chartStyles.annotationBackground,

    // Helper to get axis styling for recharts/d3
    getAxisProps: () => ({
      stroke: chartStyles.axis.axisStroke,
      strokeWidth: chartStyles.axis.axisStrokeWidth,
      tickStroke: chartStyles.axis.tickStroke,
      tickStrokeWidth: chartStyles.axis.tickStrokeWidth,
    }),

    // Helper to get grid styling for recharts/d3
    getGridProps: () => ({
      stroke: chartStyles.grid.stroke,
      strokeWidth: chartStyles.grid.strokeWidth,
      strokeDasharray: chartStyles.grid.strokeDasharray,
    }),
  },
};

// TypeScript module augmentation for custom palette
declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      highlightBlue: string;
      fadedBlue: string;
      tealAccent: string;
      tealLight: string;
      footerBg: string;
      legendHigh: string;
      legendMid: string;
      legendLow: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      highlightBlue?: string;
      fadedBlue?: string;
      tealAccent?: string;
      tealLight?: string;
      footerBg?: string;
      legendHigh?: string;
      legendMid?: string;
      legendLow?: string;
    };
  }

  interface TypographyVariants {
    fontWeightSemiBold: number;
    "chart-title": React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    fontWeightSemiBold?: number;
    "chart-title"?: React.CSSProperties;
  }
}

export default greenGrowthTheme;
