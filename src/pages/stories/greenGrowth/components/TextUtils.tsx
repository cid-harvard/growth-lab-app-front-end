import React from "react";
import { Typography, Box } from "@mui/material";
import { lighten } from "@mui/material/styles";
import { Bookmark as BookmarkIcon } from "@mui/icons-material";

// Utility function to replace country placeholder in text
export const replaceCountryPlaceholder = (
  text: string,
  countryName: string = "your country",
): string => {
  return text.replace(/\[country\]/gi, countryName);
};

// Policy approach descriptions for strategic position
const POLICY_APPROACH_DESCRIPTIONS: { [key: string]: string } = {
  "Strategic Bets Approach":
    "Few nearby opportunities call for coordinated long jumps into strategic areas with future diversification potential.",
  "Parsimonious Industrial Policy Approach":
    "Limited opportunities requires addressing bottlenecks, to help jump short distances, into related products.",
  "Light Touch Approach":
    "Ample space to diversify calls for leveraging existing successes to enter more complex production.",
  "Technological Frontier Approach":
    "Having exploited virtually all, major existing products, gains come from developing new products.",
};

// Type for strategic position - flexible to handle different implementations
interface StrategicPositionType {
  quadrant?: string | null;
  label?: string;
  color?: string;
}

// Template parts for strategic position content
const STRATEGIC_POSITION_TEMPLATE = {
  intro: (countryName: string) =>
    `${countryName}'s existing capabilities in green industrial clusters afford unique opportunities to diversify into related clusters.\n\nTo create a winning green growth strategy, ${countryName} may consider a:`,

  getPolicyDescription: (label: string) =>
    POLICY_APPROACH_DESCRIPTIONS[label] ||
    "Strategic approach information is loading...",

  loading: (countryName: string) =>
    `Analyzing ${countryName}'s strategic position in green growth opportunities...`,
};

// Component for rendering formatted text with proper styling
interface FormattedTextProps {
  children: string;
  variant?: "h6" | "body1";
  sx?: any;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  children,
  variant = "body1",
  sx = {},
}) => {
  // Allow simple rich text: convert newlines to <br/> and preserve <b> tags
  const html = (children || "").replace(/\n/g, "<br/>");
  return (
    <Typography
      variant={variant}
      sx={{
        textAlign: "left",
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Component for strategic position badge
interface StrategicPositionBadgeProps {
  strategicPosition: StrategicPositionType;
}

const StrategicPositionBadge: React.FC<StrategicPositionBadgeProps> = ({
  strategicPosition,
}) => {
  if (!strategicPosition.quadrant || !strategicPosition.label) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <div
        style={{
          color: strategicPosition.color,
          fontSize: "20px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          lineHeight: 1,
        }}
      >
        <BookmarkIcon
          sx={{ fontSize: "20px", color: strategicPosition.color }}
        />
        <span>{strategicPosition.label}</span>
      </div>
    </Box>
  );
};

// Main template component for strategic position content
interface StrategicPositionContentProps {
  countryName: string;
  strategicPosition?: StrategicPositionType;
}

export const StrategicPositionContent: React.FC<
  StrategicPositionContentProps
> = ({ countryName, strategicPosition }) => {
  if (!strategicPosition?.quadrant || !strategicPosition?.label) {
    return (
      <FormattedText>
        {STRATEGIC_POSITION_TEMPLATE.loading(countryName)}
      </FormattedText>
    );
  }

  return (
    <>
      <FormattedText sx={{ mb: 2 }}>
        {STRATEGIC_POSITION_TEMPLATE.intro(countryName)}
      </FormattedText>

      <StrategicPositionBadge strategicPosition={strategicPosition} />
      <Box
        sx={{
          mt: 0.5,
          backgroundColor: lighten(strategicPosition.color || "#2685BD", 0.85),
          borderTop: `4px solid ${strategicPosition.color || "#2685BD"}`,
          p: 2,
        }}
      >
        <FormattedText>
          {STRATEGIC_POSITION_TEMPLATE.getPolicyDescription(
            strategicPosition.label,
          )}
        </FormattedText>
      </Box>
    </>
  );
};

// Simple function to get processed content - no more manual splitting
export const getProcessedModalContent = (
  modalContent: string,
  countryName: string,
): string => {
  // For non-strategic-position steps, just replace country placeholder
  return replaceCountryPlaceholder(modalContent, countryName);
};
