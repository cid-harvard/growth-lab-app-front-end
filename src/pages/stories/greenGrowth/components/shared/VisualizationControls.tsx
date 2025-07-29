import React, { useEffect } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  useTheme,
  useMediaQuery,
  Slider,
} from "@mui/material";
import { useVisualizationControls } from "../../hooks/useVisualizationControls";
import { useSidebar } from "../SidebarContext";

export interface ControlOption {
  value: string;
  label: string;
}

export interface ButtonGroupControl {
  type: "buttonGroup";
  label: string;
  options: ControlOption[];
  selected: string;
  onChange: (value: string) => void;
  // Optional: specify a default value for URL persistence
  defaultValue?: string;
  // Optional: specify a custom key for URL params (defaults to label)
  paramKey?: string;
}

export interface SliderControl {
  type: "slider";
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  // Optional: specify a default value for URL persistence
  defaultValue?: number;
  // Optional: specify a custom key for URL params (defaults to label)
  paramKey?: string;
  // Optional: custom formatter for the label
  formatLabel?: (value: number) => string;
}

export type ControlGroup = ButtonGroupControl | SliderControl;

// Legacy interface for backward compatibility
export interface LegacyControlGroup {
  label: string;
  options: ControlOption[];
  selected: string;
  onChange: (value: string) => void;
  // Optional: specify a default value for URL persistence
  defaultValue?: string;
  // Optional: specify a custom key for URL params (defaults to label)
  paramKey?: string;
}

interface VisualizationControlsProps {
  controlGroups: (ControlGroup | LegacyControlGroup)[];
  // Optional styling props
  backgroundColor?: string;
  borderColor?: string;
  spacing?: number | string;
  // Optional: disable URL persistence (default: true)
  persistInUrl?: boolean;
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  controlGroups,
  backgroundColor = "white",
  spacing = 3,
  persistInUrl = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { getControlValue, setControlValue } = useVisualizationControls();
  const { isCondensed } = useSidebar();

  // Normalize legacy control groups to new format
  const normalizedControlGroups: ControlGroup[] = controlGroups.map((group) => {
    if ("type" in group) {
      return group; // Already new format
    } else {
      // Convert legacy format to new ButtonGroupControl
      return {
        type: "buttonGroup",
        label: group.label,
        options: group.options,
        selected: group.selected,
        onChange: group.onChange,
        defaultValue: group.defaultValue,
        paramKey: group.paramKey,
      } as ButtonGroupControl;
    }
  });

  // Create enhanced control groups with URL persistence
  const enhancedControlGroups = normalizedControlGroups.map((group) => {
    if (!persistInUrl) {
      return group; // Return original group if persistence is disabled
    }

    const paramKey =
      group.paramKey || group.label.toLowerCase().replace(/\s+/g, "-");

    if (group.type === "slider") {
      const defaultValue = group.defaultValue ?? group.min;
      const urlValue = parseFloat(
        getControlValue(paramKey, defaultValue.toString()),
      );
      const currentValue = !isNaN(urlValue) ? urlValue : group.value;

      return {
        ...group,
        value: currentValue,
        onChange: (value: number) => {
          group.onChange(value);
          setControlValue(paramKey, value.toString(), defaultValue.toString());
        },
      };
    } else {
      const defaultValue = group.defaultValue || group.options[0]?.value || "";
      const urlValue = getControlValue(paramKey, defaultValue);
      const currentValue =
        urlValue !== defaultValue ? urlValue : group.selected;

      return {
        ...group,
        selected: currentValue,
        onChange: (value: string) => {
          group.onChange(value);
          setControlValue(paramKey, value, defaultValue);
        },
      };
    }
  });

  // Sync URL state with component state on mount and route changes
  useEffect(() => {
    if (!persistInUrl) return;

    normalizedControlGroups.forEach((group) => {
      const paramKey =
        group.paramKey || group.label.toLowerCase().replace(/\s+/g, "-");

      if (group.type === "slider") {
        const defaultValue = group.defaultValue ?? group.min;
        const urlValue = parseFloat(
          getControlValue(paramKey, defaultValue.toString()),
        );

        if (
          !isNaN(urlValue) &&
          urlValue !== group.value &&
          urlValue !== defaultValue
        ) {
          group.onChange(urlValue);
        }
      } else {
        const defaultValue =
          group.defaultValue || group.options[0]?.value || "";
        const urlValue = getControlValue(paramKey, defaultValue);

        if (urlValue !== group.selected && urlValue !== defaultValue) {
          group.onChange(urlValue);
        }
      }
    });
  }, [normalizedControlGroups, getControlValue, persistInUrl]);

  // Calculate positioning based on sidebar state
  const getPositionStyles = () => {
    if (isMobile) {
      return {
        position: "sticky" as const,
        top: isCondensed ? 64 : 0,
        left: 0,
        right: 0,
        zIndex: 100,
      };
    }

    if (isCondensed) {
      return {
        position: "sticky" as const,
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        marginLeft: "200px",
      };
    }

    return {
      position: "sticky" as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    };
  };

  return (
    <Box
      sx={{
        ...getPositionStyles(),
        backgroundColor,
        padding: {
          xs: theme.spacing(1.5, 2),
          md: theme.spacing(2, 3),
        },
        transition: theme.transitions.create(
          ["padding", "margin", "margin-left"],
          {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
          },
        ),
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: spacing,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "flex-start",
          flexWrap: "wrap",
        }}
      >
        {enhancedControlGroups.map((group, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: isMobile
                ? "100%"
                : group.type === "slider"
                  ? "250px"
                  : "auto",
              maxWidth: group.type === "slider" ? "300px" : "auto",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontWeight: 600,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {group.type === "slider" && group.formatLabel
                ? group.formatLabel(group.value)
                : group.label}
            </Typography>

            {group.type === "slider" ? (
              <Slider
                value={group.value}
                onChange={(_, newValue) => group.onChange(newValue as number)}
                min={group.min}
                max={group.max}
                step={group.step}
                sx={{
                  color: "#3AA0C1",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#3AA0C1",
                    border: "2px solid #ffffff",
                    "&:hover": {
                      boxShadow: "0px 0px 0px 8px rgba(58, 160, 193, 0.16)",
                    },
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "#3AA0C1",
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              />
            ) : (
              <ButtonGroup
                size="small"
                sx={{
                  height: "auto",
                  border: "1px solid #000000",
                  borderRadius: "4px",
                  overflow: "hidden",
                  "& .MuiButton-root": {
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 400,
                    padding: theme.spacing(0.75, 1.5),
                    minWidth: "auto",
                    border: "none !important",
                    borderRadius: 0,
                  },
                }}
              >
                {group.options.map((option, optionIndex, array) => (
                  <Button
                    key={option.value}
                    onClick={() => group.onChange(option.value)}
                    sx={{
                      backgroundColor:
                        group.selected === option.value ? "#3AA0C1" : "white",
                      color:
                        group.selected === option.value ? "white" : "#000000",
                      borderRight:
                        optionIndex < array.length - 1
                          ? "1px solid #000000 !important"
                          : "none !important",
                      "&:hover": {
                        backgroundColor:
                          group.selected === option.value
                            ? "#3AA0C1"
                            : "#f5f5f5",
                        borderRight:
                          optionIndex < array.length - 1
                            ? "1px solid #000000 !important"
                            : "none !important",
                      },
                      "&:focus": {
                        boxShadow: "none",
                      },
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </ButtonGroup>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VisualizationControls;
