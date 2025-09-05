export const CLICK_HINT_DEFAULTS = {
  // Typography
  fontSize: {
    mobile: 14,
    desktop: 16,
  },
  fontWeight: 600 as const,
  color: "#000",

  // Icon sizing and spacing
  iconHeight: 35,
  iconSpacing: 39, // SVG text x-offset from icon
  iconMarginRight: 12, // HTML spacing between icon and text

  // SVG text vertical offset relative to icon
  textYOffset: 24,
};

export type ClickHintDefaults = typeof CLICK_HINT_DEFAULTS;
