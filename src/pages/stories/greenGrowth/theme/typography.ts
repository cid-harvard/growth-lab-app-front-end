import { TypographyOptions } from "@mui/material/styles/createTypography";

export const typography: TypographyOptions = {
  fontFamily:
    'Source Sans Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: 16, // Base font size from Figma

  // Heading variants matching Figma exactly
  h1: {
    fontSize: "24px", // GREENPLEXITY brand title
    fontWeight: 600,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif", // Brand font for titles
  },
  h2: {
    fontSize: "20px", // Main section headings (exact from Figma)
    fontWeight: 700,
    lineHeight: "22px",
    textTransform: "capitalize",
  },
  h3: {
    fontSize: "18px", // Sub-headings and secondary highlights (exact from Figma)
    fontWeight: 600,
    lineHeight: "22px",
    textTransform: "capitalize",
  },
  h4: {
    fontSize: "16px", // Legend titles and control labels (exact from Figma)
    fontWeight: 600,
    lineHeight: "22px",
  },
  h5: {
    fontSize: "14px", // Tab buttons and smaller labels (exact from Figma)
    fontWeight: 700,
    lineHeight: "20px",
  },
  h6: {
    fontSize: "14px", // Small headings and back buttons (exact from Figma)
    fontWeight: 600,
    lineHeight: "20px",
  },

  // Body text variants
  body1: {
    fontSize: "16px", // Main body text (exact from Figma)
    fontWeight: 400,
    lineHeight: "22px",
  },
  body2: {
    fontSize: "14px", // Legend items and secondary content (exact from Figma)
    fontWeight: 400,
    lineHeight: "20px",
  },
  caption: {
    fontSize: "12px", // Footer buttons and smallest text (exact from Figma)
    fontWeight: 600,
    lineHeight: "16px",
  },

  // Button text
  button: {
    fontSize: "16px", // Control button text (exact from Figma)
    fontWeight: 400,
    lineHeight: "24px",
    textTransform: "none",
  },
};

// Custom typography variants for specific use cases
export const customTypographyVariants = {
  "brand-title": {
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: "20px",
    fontFamily: "Source Sans Pro, sans-serif",
    color: "white",
  },
  "main-heading": {
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "22px",
    textTransform: "capitalize",
  },
  "sub-heading": {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "22px",
    textTransform: "capitalize",
  },
  "highlight-text": {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "22px",
    textTransform: "capitalize",
    color: "#106496", // Blue highlight color from Figma
  },
  "secondary-text": {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: "22px",
    textTransform: "capitalize",
    color: "rgba(16, 100, 150, 0.5)", // Faded blue from Figma
  },
  "body-text": {
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "22px",
    textTransform: "capitalize",
  },
  "control-text": {
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "24px",
  },
  "control-text-bold": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
  },
  "legend-title": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "40px", // Specific line-height from Figma
  },
  "legend-item": {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "40px", // Specific line-height from Figma
  },
  "tab-button": {
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "20px",
  },
  "small-button": {
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
  },
  "footer-button": {
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: "16px",
    color: "#5C5C5C", // Footer text color from Figma
  },
  "atlas-title": {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "22px",
  },
  "atlas-content": {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "20px",
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
