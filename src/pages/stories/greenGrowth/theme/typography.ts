import { TypographyOptions } from "@mui/material/styles/createTypography";

export const typography: TypographyOptions = {
  fontFamily:
    'Source Sans Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: 16, // Base font size from Figma

  // Heading variants matching Figma exactly
  h1: {
    fontSize: "1.5rem", // 24px - GREENPLEXITY brand title
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif", // Brand font for titles
  },
  h2: {
    fontSize: "1.25rem", // 20px - Main section headings
    fontWeight: 700,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
  },
  h3: {
    fontSize: "1.125rem", // 18px - Sub-headings and secondary highlights
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
  },
  h4: {
    fontSize: "1rem", // 16px - Legend titles and control labels
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
  },
  h5: {
    fontSize: "0.875rem", // 14px - Tab buttons and smaller labels
    fontWeight: 700,
    lineHeight: "1.25rem", // 20px
  },
  h6: {
    fontSize: "0.875rem", // 14px - Small headings and back buttons
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
  },

  // Body text variants
  body1: {
    fontSize: "1rem", // 16px - Main body text
    fontWeight: 400,
    lineHeight: "1.375rem", // 22px
  },
  body2: {
    fontSize: "0.875rem", // 14px - Legend items and secondary content
    fontWeight: 400,
    lineHeight: "1.25rem", // 20px
  },
  caption: {
    fontSize: "0.75rem", // 12px - Footer buttons and smallest text
    fontWeight: 600,
    lineHeight: "1rem", // 16px
  },

  // Button text
  button: {
    fontSize: "1rem", // 16px - Control button text
    fontWeight: 400,
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
  },
};

// Custom typography variants for specific use cases
export const customTypographyVariants = {
  "brand-title": {
    fontSize: "1.5rem", // 24px
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
    fontFamily: "Source Sans Pro, sans-serif",
    color: "white",
  },
  "main-heading": {
    fontSize: "1.25rem", // 20px
    fontWeight: 700,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
  },
  "sub-heading": {
    fontSize: "1.125rem", // 18px
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
  },
  "highlight-text": {
    fontSize: "1.125rem", // 18px
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
    color: "#106496", // Blue highlight color from Figma
  },
  "secondary-text": {
    fontSize: "1.125rem", // 18px
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
    color: "rgba(16, 100, 150, 0.5)", // Faded blue from Figma
  },
  "body-text": {
    fontSize: "1rem", // 16px
    fontWeight: 400,
    lineHeight: "1.375rem", // 22px
    textTransform: "capitalize",
  },
  "control-text": {
    fontSize: "1rem", // 16px
    fontWeight: 400,
    lineHeight: "1.5rem", // 24px
  },
  "control-text-bold": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.5rem", // 24px
  },
  "legend-title": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "2.5rem", // 40px - Specific line-height from Figma
  },
  "legend-item": {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: "2.5rem", // 40px - Specific line-height from Figma
  },
  "tab-button": {
    fontSize: "0.875rem", // 14px
    fontWeight: 700,
    lineHeight: "1.25rem", // 20px
  },
  "small-button": {
    fontSize: "0.875rem", // 14px
    fontWeight: 600,
    lineHeight: "1.25rem", // 20px
  },
  "footer-button": {
    fontSize: "0.75rem", // 12px
    fontWeight: 600,
    lineHeight: "1rem", // 16px
    color: "#5C5C5C", // Footer text color from Figma
  },
  "atlas-title": {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.375rem", // 22px
  },
  "atlas-content": {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: "1.25rem", // 20px
  },
} as const;

// TypeScript module augmentation for custom variants
declare module "@mui/material/styles" {
  interface TypographyVariants {
    "brand-title": React.CSSProperties;
    "main-heading": React.CSSProperties;
    "sub-heading": React.CSSProperties;
    "highlight-text": React.CSSProperties;
    "secondary-text": React.CSSProperties;
    "body-text": React.CSSProperties;
    "control-text": React.CSSProperties;
    "control-text-bold": React.CSSProperties;
    "legend-title": React.CSSProperties;
    "legend-item": React.CSSProperties;
    "tab-button": React.CSSProperties;
    "small-button": React.CSSProperties;
    "footer-button": React.CSSProperties;
    "atlas-title": React.CSSProperties;
    "atlas-content": React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    "brand-title"?: React.CSSProperties;
    "main-heading"?: React.CSSProperties;
    "sub-heading"?: React.CSSProperties;
    "highlight-text"?: React.CSSProperties;
    "secondary-text"?: React.CSSProperties;
    "body-text"?: React.CSSProperties;
    "control-text"?: React.CSSProperties;
    "control-text-bold"?: React.CSSProperties;
    "legend-title"?: React.CSSProperties;
    "legend-item"?: React.CSSProperties;
    "tab-button"?: React.CSSProperties;
    "small-button"?: React.CSSProperties;
    "footer-button"?: React.CSSProperties;
    "atlas-title"?: React.CSSProperties;
    "atlas-content"?: React.CSSProperties;
  }
}
