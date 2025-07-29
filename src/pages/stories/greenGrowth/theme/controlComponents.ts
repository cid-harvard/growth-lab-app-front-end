// Color palette for controls - matching Figma export exactly
export const controlColors = {
  primary: "#3AA0C1", // Active button color
  primaryDark: "#2685BD", // Navigation/bullet color
  secondary: "#53C2C9", // Teal accent/borders
  secondaryLight: "rgba(83, 194, 201, 0.25)", // Light teal backgrounds (exact from Figma)
  neutral: "#5C5C5C", // Footer/icon color
  border: "#777777", // Gray borders (exact from Figma)
  borderActive: "#53C2C9", // Active borders
  borderDark: "#000000", // Black borders (exact from Figma)
  borderLight: "#FFFFFF", // White borders (exact from Figma)
  background: "#FFFFFF", // White background
  backgroundHover: "#F5F5F5",
  backgroundActive: "#E8F4F8",
  backgroundFooter: "rgba(0, 0, 0, 0.10)", // Footer background (exact from Figma)
  text: "#000000", // Primary text
  textSecondary: "#106496", // Highlighted text blue
  textSecondaryFaded: "rgba(16, 100, 150, 0.5)", // Semi-transparent blue
  textDisabled: "#5C5C5C", // Footer text
  textWhite: "#FFFFFF", // White text on dark backgrounds
  legendHigh: "#000000", // High RCA legend
  legendMid: "#808080", // Mid RCA legend
  legendLow: "#D3D3D3", // Low RCA legend
} as const;

// Control sizing constants - matching Figma export exactly
export const controlSizes = {
  height: {
    small: "33px", // Dropdown height (exact from Figma)
    medium: "36px", // Large button group height (exact from Figma)
    large: "34px", // Back button height (exact from Figma)
  },
  padding: {
    small: "8px 12px",
    medium: "10px 16px",
    large: "12px 20px",
  },
  borderRadius: {
    small: "4px", // Consistent 4px border radius from Figma
    medium: "4px", // All controls use 4px
    large: "4px", // All controls use 4px
  },
  fontSize: {
    small: "14px", // Small control text (exact from Figma)
    medium: "16px", // Standard control text (exact from Figma)
    large: "16px", // Large control text (exact from Figma)
  },
} as const;

// Enhanced Material-UI component overrides
export const controlComponentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: controlSizes.borderRadius.medium,
        textTransform: "none",
        fontWeight: 400,
        fontSize: controlSizes.fontSize.medium,
        lineHeight: "24px",
        minHeight: controlSizes.height.medium,
        "&:hover": {
          backgroundColor: controlColors.backgroundHover,
        },
      },
      contained: {
        backgroundColor: controlColors.primary,
        color: controlColors.textWhite,
        "&:hover": {
          backgroundColor: controlColors.primaryDark,
        },
      },
      outlined: {
        borderColor: controlColors.border,
        color: controlColors.text,
        "&:hover": {
          borderColor: controlColors.borderActive,
          backgroundColor: controlColors.backgroundHover,
        },
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        borderRadius: controlSizes.borderRadius.medium,
        textTransform: "none",
        fontWeight: 400,
        fontSize: controlSizes.fontSize.medium,
        lineHeight: "24px",
        minHeight: controlSizes.height.medium,
        padding: controlSizes.padding.medium,
        border: `1px solid ${controlColors.border}`,
        color: controlColors.text,
        "&:hover": {
          backgroundColor: controlColors.backgroundHover,
        },
        "&.Mui-selected": {
          backgroundColor: controlColors.primary, // #3AA0C1
          color: "white",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: controlColors.primaryDark,
          },
        },
      },
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        "& .MuiToggleButton-root": {
          border: `1px solid ${controlColors.border}`,
          "&:not(:first-of-type)": {
            borderLeft: `1px solid ${controlColors.border}`,
            marginLeft: 0,
          },
          "&.Mui-selected": {
            backgroundColor: controlColors.primary, // #3AA0C1 from Figma
            border: `1px solid ${controlColors.borderActive}`,
          },
        },
      },
    },
  },
  MuiButtonGroup: {
    styleOverrides: {
      root: {
        "& .MuiButton-root": {
          borderRadius: 0,
          border: `1px solid ${controlColors.border}`,
          minHeight: controlSizes.height.medium,
          fontSize: controlSizes.fontSize.medium,
          fontWeight: 400,
          "&:not(:last-child)": {
            borderRight: `1px solid ${controlColors.border}`,
          },
          "&.Mui-selected, &[aria-pressed='true']": {
            backgroundColor: controlColors.primary, // #3AA0C1
            color: controlColors.textWhite,
            border: `1px solid ${controlColors.borderActive}`,
            "&:hover": {
              backgroundColor: controlColors.primaryDark,
            },
          },
        },
        "& .MuiButton-root:first-of-type": {
          borderTopLeftRadius: controlSizes.borderRadius.medium,
          borderBottomLeftRadius: controlSizes.borderRadius.medium,
        },
        "& .MuiButton-root:last-of-type": {
          borderTopRightRadius: controlSizes.borderRadius.medium,
          borderBottomRightRadius: controlSizes.borderRadius.medium,
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: controlSizes.borderRadius.medium,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: controlColors.border,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: controlColors.borderActive,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: controlColors.borderActive,
          borderWidth: "1px",
        },
      },
      select: {
        minHeight: controlSizes.height.small,
        padding: "8px 14px",
        fontSize: controlSizes.fontSize.medium,
        fontWeight: 400,
        lineHeight: "24px",
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: controlSizes.borderRadius.medium,
        minHeight: controlSizes.height.small,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: controlColors.border,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: controlColors.borderActive,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: controlColors.borderActive,
          borderWidth: "1px",
        },
      },
      input: {
        padding: "8px 14px",
        fontSize: controlSizes.fontSize.medium,
        fontWeight: 400,
        lineHeight: "24px",
      },
    },
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        "& .MuiInputLabel-root": {
          fontSize: controlSizes.fontSize.medium,
          fontWeight: 400,
          color: controlColors.text,
          "&.Mui-focused": {
            color: controlColors.textSecondary,
          },
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontSize: controlSizes.fontSize.small,
        fontWeight: 700,
        lineHeight: "20px",
        minHeight: controlSizes.height.large,
        color: controlColors.text,
        "&.Mui-selected": {
          color: controlColors.textSecondary,
          fontWeight: 700,
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: controlColors.primary,
        height: "3px",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: controlSizes.borderRadius.medium,
        fontSize: controlSizes.fontSize.small,
        fontWeight: 600,
        height: controlSizes.height.small,
      },
      filled: {
        backgroundColor: controlColors.secondaryLight,
        color: controlColors.text,
        border: `1px solid ${controlColors.borderActive}`,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: controlColors.text,
        color: controlColors.textWhite,
        fontSize: controlSizes.fontSize.small,
        fontWeight: 400,
        borderRadius: controlSizes.borderRadius.small,
        padding: "8px 12px",
      },
    },
  },
} as const;
