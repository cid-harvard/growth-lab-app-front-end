import { useState } from "react";
import { Box, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";

interface NavigationStep {
  id: string;
  route: string;
  title: string;
  hoverText: string;
  modalContent: string;
}

interface NavigationIndicatorsProps {
  navigationSteps: NavigationStep[];
  currentStepIndex: number;
  onStepClick: (route: string) => void;
}

interface HoverOverlay {
  text: string;
  x: number;
  y: number;
  visible: boolean;
  isActive: boolean;
}

const NavigationIndicators: React.FC<NavigationIndicatorsProps> = ({
  navigationSteps,
  currentStepIndex,
  onStepClick,
}) => {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [hoverOverlay, setHoverOverlay] = useState<HoverOverlay>({
    text: "",
    x: 0,
    y: 0,
    visible: false,
    isActive: false,
  });

  return (
    <>
      {/* Progress Indicators - Left Column (independently scrollable) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: "40px",
          width: "40px",
          height: "100%",
          flexShrink: 0,
          overflowY: "auto",
          overflowX: "visible",
          position: "relative",
          zIndex: (theme) => theme.zIndex.drawer + 2,
          pl: "10px", // Align with the arrow icon in the button
          pr: 1,
          py: "10px",
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        {/* Inner wrapper for centering content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            margin: "auto 0", // This centers the content vertically
          }}
        >
          {/* Home Icon */}
          <Box
            component={Link}
            to="/greenplexity"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              cursor: "pointer",
              color: "#2685BD",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
                color: "#1a5f8f",
              },
            }}
          >
            <HomeIcon sx={{ fontSize: "1.25rem" }} />
          </Box>

          {/* Step indicators - pills */}
          {navigationSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isHovered = hoveredStep === step.id;
            const isFuturePage = index > currentStepIndex;

            return (
              <Box
                key={step.id}
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "32px", // Fixed height for consistent spacing
                  width: "100%",
                  zIndex: isHovered ? 1000 : 1,
                  overflow: "visible",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  setHoveredStep(step.id);
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  // Calculate x position with gap from pill or stroke edge
                  // Container centers the pill, so we find center + half pill width
                  const pillRightEdge = rect.left + rect.width / 2 + 6; // 6 = half of 12px pill width
                  const gap = 4; // Gap between pill/stroke and tooltip
                  // If active, add stroke offset (4px) and border width (2px)
                  const xPosition = isActive
                    ? pillRightEdge + 6 + gap
                    : pillRightEdge + gap;
                  setHoverOverlay({
                    text: step.hoverText,
                    x: xPosition,
                    y: rect.top + rect.height / 2 - 10,
                    visible: true,
                    isActive: isActive,
                  });
                }}
                onMouseLeave={() => {
                  setHoveredStep(null);
                  setHoverOverlay((prev) => ({
                    ...prev,
                    visible: false,
                  }));
                }}
                onClick={() => onStepClick(step.route)}
              >
                {/* Pill indicator */}
                <Box
                  sx={{
                    width: "12px",
                    height: "24px", // Fixed height instead of relative
                    borderRadius: "12px",
                    backgroundColor: isFuturePage
                      ? "rgba(38, 133, 189, 0.3)"
                      : "#2685BD",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                    zIndex: 2,
                    boxSizing: "border-box",
                    flexShrink: 0, // Prevent shrinking
                    "&:hover": { transform: "scale(1.05)" },
                    "&::after": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          top: "-4px",
                          left: "-4px",
                          width: "20px", // Explicit width: 12px + 4px on each side
                          height: "32px", // Explicit height: 24px + 4px on each side
                          border: "2px solid #2685BD",
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                          opacity: 1,
                          boxSizing: "border-box",
                        }
                      : {
                          content: '""',
                          position: "absolute",
                          top: "-4px",
                          left: "-4px",
                          width: "20px", // Explicit width: 12px + 4px on each side
                          height: "32px", // Explicit height: 24px + 4px on each side
                          border: "2px solid #2685BD",
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                          opacity: 0,
                          boxSizing: "border-box",
                        },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Hover overlay tooltip */}
      {hoverOverlay.visible && (
        <Box
          sx={{
            position: "fixed",
            left: hoverOverlay.x,
            top: hoverOverlay.y,
            transform: "translateX(0)",
            height: "20px",
            backgroundColor: "#2685BD",
            borderRadius: "4px", // Rectangle with slight rounding
            display: "flex",
            alignItems: "center",
            paddingLeft: 1.5,
            paddingRight: 1.5,
            paddingTop: 1,
            paddingBottom: 1,
            zIndex: (theme) => theme.zIndex.modal + 1,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Typography
            sx={{
              color: "white",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {hoverOverlay.text}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default NavigationIndicators;
