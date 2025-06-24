import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import {
  ArrowBack,
  ArrowForward,
  Menu,
  Close,
  Home,
} from "@mui/icons-material";
import { Routes } from "../../../../metadata";
import { useUrlParams } from "../hooks/useUrlParams";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/shared";
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

const NavigationContainer = styled(Box)<{ isCondensed?: boolean }>(
  ({ isCondensed }) => ({
    position: isCondensed ? "fixed" : "relative",
    left: 0,
    top: 0,
    width: isCondensed ? "60px" : "320px",
    height: isCondensed ? "60px" : "100vh",
    backgroundColor: "#ffffff",
    borderRight: isCondensed ? "none" : "1px solid #e0e0e0",
    borderBottom: isCondensed ? "1px solid #e0e0e0" : "none",
    borderRadius: isCondensed ? "0 0 8px 0" : "0",
    display: "flex",
    flexDirection: "column",
    zIndex: isCondensed ? 1000 : 1,
    overflowY: isCondensed ? "hidden" : "auto",
    transition: "all 0.3s ease-in-out",
    boxShadow: isCondensed ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
    flexShrink: 0,
  }),
);

const ToggleButton = styled(IconButton)<{ isCondensed?: boolean }>(
  ({ isCondensed }) => ({
    position: "absolute",
    top: isCondensed ? "50%" : "12px",
    right: isCondensed ? "50%" : "12px",
    transform: isCondensed ? "translate(50%, -50%)" : "none",
    zIndex: 101,
    backgroundColor: isCondensed ? "transparent" : "rgba(255,255,255,0.9)",
    border: isCondensed ? "none" : "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: isCondensed ? "12px" : "6px",
    "&:hover": {
      backgroundColor: isCondensed
        ? "rgba(74, 144, 164, 0.1)"
        : "rgba(255,255,255,1)",
    },
    "& .MuiSvgIcon-root": {
      fontSize: isCondensed ? "24px" : "20px",
      color: isCondensed ? "#4A90A4" : "#666",
    },
  }),
);

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: "#4A90A4",
  color: "white",
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  flex: 1,
  display: "flex",
  flexDirection: "column",
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  backgroundColor: "#f8f9fa",
  borderBottom: "1px solid #e0e0e0",
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  "& .MuiOutlinedInput-root": {
    fontSize: "14px",
    "& fieldset": { borderColor: "#d0d7de" },
    "&:hover fieldset": { borderColor: "#0969da" },
    "&.Mui-focused fieldset": { borderColor: "#0969da" },
  },
}));

const StyledSelect = styled(Select)(() => ({
  fontSize: "14px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d0d7de",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0969da",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0969da",
  },
}));

// Top navigation button
const TopNavButton = styled(Button)({
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 500,
  marginBottom: "24px",
  justifyContent: "flex-start",
  minHeight: "60px", // Fixed height to prevent layout shift
  alignItems: "flex-start",

  "&:disabled": {
    color: "#ccc",
  },
});

// Main content area with step indicators on the left
const MainContentArea = styled(Box)({
  display: "flex",
  flex: 1,
  gap: "20px",
  marginBottom: "24px",
});

// Progress indicators container - positioned to the left of content
const ProgressContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "16px",
  paddingTop: "8px",
  minWidth: "24px",
  height: "320px", // Fixed height to prevent movement
  position: "relative",
});

const HomeIcon = styled(Box)({
  width: "16px",
  height: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "16px",
    color: "#4A90A4",
  },
});

const StepIndicator = styled(Box)<{ active?: boolean }>(({ active }) => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  backgroundColor: "#4A90A4",
  cursor: "pointer",
  transition: "all 0.2s ease",
  position: "relative",
  "&:hover": {
    transform: "scale(1.1)",
  },
  "&::after": active
    ? {
        content: '""',
        position: "absolute",
        top: "-4px",
        left: "-4px",
        right: "-4px",
        bottom: "-4px",
        border: "2px solid #4A90A4",
        borderRadius: "50%",
      }
    : {},
}));

// Current step content display
const CurrentStepContent = styled(Box)({
  flex: 1,
});

// Bottom navigation button
const BottomNavButton = styled(Button)({
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 500,
  marginTop: "auto",
  "&:disabled": {
    color: "#ccc",
  },
});

interface NavigationStep {
  id: string;
  route: string;
  title: string;
  modalContent: string;
}

const navigationSteps: NavigationStep[] = [
  {
    id: "overview",
    route: Routes.GreenGrowthOverview,
    title: "What is a green value chain?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "advantage",
    route: Routes.GreenGrowthAdvantage,
    title: "Where Is My Country in Green Value Chains?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "value-chains",
    route: "/greenplexity/value-chains",
    title: "What Manufacturing communities are contained in value chains?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "competitiveness",
    route: Routes.GreenGrowthCompetitiveness,
    title: "In which clusters am I most competitive?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "strategic-position",
    route: Routes.GreenGrowthStrategicPosition,
    title: "What is my strategic policy approach?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "opportunities",
    route: "/greenplexity/opportunities",
    title: "What are My Opportunities?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "dimensions",
    route: "/greenplexity/dimensions",
    title: "What are My Opportunities?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
];

interface StoryNavigationProps {
  currentStep?: string;
}

const StoryNavigation: React.FC<StoryNavigationProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCondensed, setIsCondensed] = useState(false);

  const {
    countrySelection,
    setCountrySelection,
    yearSelection,
    setYearSelection,
  } = useUrlParams();
  const { data } = useQuery(GET_COUNTRIES);
  const countries = data?.ggLocationCountryList || [];
  const availableYears = Array.from({ length: 11 }, (_, i) => 2022 - i);

  const getCurrentStepIndex = () => {
    return navigationSteps.findIndex(
      (step) => location.pathname === step.route,
    );
  };

  const currentStepIndex = getCurrentStepIndex();
  const currentStep = navigationSteps[currentStepIndex];
  const previousStep =
    currentStepIndex > 0 ? navigationSteps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < navigationSteps.length - 1
      ? navigationSteps[currentStepIndex + 1]
      : null;

  // Build URL with current parameters
  const buildUrlWithParams = (basePath: string) => {
    const params = new URLSearchParams();
    if (countrySelection) {
      params.set("country", String(countrySelection));
    }
    if (yearSelection) {
      params.set("year", String(yearSelection));
    }
    return `${basePath}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleStepClick = (route: string) => {
    const urlWithParams = buildUrlWithParams(route);
    navigate(urlWithParams);
  };

  const handleHome = () => {
    const urlWithParams = buildUrlWithParams("/greenplexity");
    navigate(urlWithParams);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const urlWithParams = buildUrlWithParams(
        navigationSteps[currentStepIndex - 1].route,
      );
      navigate(urlWithParams);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      const urlWithParams = buildUrlWithParams(
        navigationSteps[currentStepIndex + 1].route,
      );
      navigate(urlWithParams);
    }
  };

  const toggleNavigation = () => {
    const newCondensedState = !isCondensed;
    setIsCondensed(newCondensedState);

    // Emit event to notify layout about state change
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", {
        detail: { isCondensed: newCondensedState },
      }),
    );
  };

  if (isCondensed) {
    return (
      <NavigationContainer isCondensed={true}>
        <ToggleButton isCondensed={true} onClick={toggleNavigation}>
          <Menu />
        </ToggleButton>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer isCondensed={false}>
      {/* Toggle Button */}
      <ToggleButton isCondensed={false} onClick={toggleNavigation}>
        <Close />
      </ToggleButton>

      {/* Header */}
      <SidebarHeader>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            marginBottom: 0.5,
            textAlign: "center",
          }}
        >
          GREENPLEXITY
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              backgroundColor: "white",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          Growth Lab
        </Typography>
      </SidebarHeader>

      {/* Controls */}
      <ControlsContainer>
        <StyledAutocomplete
          disableClearable
          blurOnSelect
          value={
            countries.find(
              (country: any) => country.countryId === countrySelection,
            ) || null
          }
          onChange={(_: any, newValue: any) => {
            setCountrySelection(newValue ? newValue.countryId : null);
          }}
          options={countries}
          getOptionLabel={(option: any) => option.nameEn}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Country xyz"
              size="small"
            />
          )}
        />
        <FormControl fullWidth size="small">
          <StyledSelect
            value={yearSelection}
            onChange={(e: any) => setYearSelection(e.target.value)}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year.toString()}>
                {year}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      </ControlsContainer>

      {/* Content */}
      <SidebarContent>
        {/* Previous Button at Top with step title */}
        <TopNavButton
          startIcon={<ArrowBack />}
          onClick={handlePrevious}
          disabled={currentStepIndex <= 0}
        >
          {previousStep ? previousStep.title : "Previous"}
        </TopNavButton>

        {/* Main content area with indicators on left and text on right */}
        <MainContentArea>
          {/* Progress Indicators on the left */}
          <ProgressContainer>
            {/* Home Icon */}
            <HomeIcon onClick={handleHome} title="Go to Greenplexity Home">
              <Home />
            </HomeIcon>

            {navigationSteps.map((step) => {
              const isActive = location.pathname === step.route;

              return (
                <StepIndicator
                  key={step.id}
                  active={isActive}
                  onClick={() => handleStepClick(step.route)}
                  title={step.title}
                />
              );
            })}
          </ProgressContainer>

          {/* Current Step Content on the right */}
          <CurrentStepContent>
            {currentStep && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    marginBottom: 2,
                    color: "#333",
                  }}
                >
                  {currentStep.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "#666",
                  }}
                >
                  {currentStep.modalContent}
                </Typography>
              </>
            )}
          </CurrentStepContent>
        </MainContentArea>

        {/* Next Button at Bottom with step title */}
        <BottomNavButton
          endIcon={<ArrowForward />}
          onClick={handleNext}
          disabled={currentStepIndex >= navigationSteps.length - 1}
        >
          {nextStep ? nextStep.title : "Next"}
        </BottomNavButton>
      </SidebarContent>
    </NavigationContainer>
  );
};

export default StoryNavigation;
