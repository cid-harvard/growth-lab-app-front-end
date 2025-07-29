import React from "react";
import { Typography, Box } from "@mui/material";
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
  "Reinvent Industrial Base":
    "Few nearby opportunities call for coordinated long jumps into complex industries that open future diversification pathways.",
  "Climb the Complexity Ladder":
    "Diversify into progressively more complex products in green value chains, considering related products as a starting point.",
  "Harness Nearby Opportunities":
    "Ample space to diversify calls for leveraging existing successes to enter more complex production.",
  "Maintain Competitive Edge":
    "With good presence in complex green industries, gains come from developing new products and maintaining competitiveness.",
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
    `${countryName}'s existing capabilities in green industrial clusters afford many opportunities to diversify into related clusters. To create a winning green growth strategy, ${countryName} may consider the following policy approach:`,

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
  return (
    <Typography
      variant={variant}
      sx={{
        whiteSpace: "pre-line",
        textAlign: "left",
        ...sx,
      }}
    >
      {children}
    </Typography>
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
        mb: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <div
        style={{
          backgroundColor: strategicPosition.color,
          color: "white",
          padding: "6px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <BookmarkIcon sx={{ fontSize: "16px" }} />
        <span style={{ textDecoration: "underline" }}>
          {strategicPosition.label}
        </span>
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

      <FormattedText>
        {STRATEGIC_POSITION_TEMPLATE.getPolicyDescription(
          strategicPosition.label,
        )}
      </FormattedText>
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
