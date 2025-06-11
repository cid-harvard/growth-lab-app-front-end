import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
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

const NavigationContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: 0,
  top: 0,
  width: "320px",
  height: "100vh",
  backgroundColor: "#ffffff",
  borderRight: "1px solid #e0e0e0",
  display: "flex",
  flexDirection: "column",
  zIndex: 100,
  overflowY: "auto",
  [theme.breakpoints.down("md")]: {
    width: "280px",
  },
  [theme.breakpoints.down("sm")]: {
    position: "relative",
    width: "100%",
    height: "auto",
    maxHeight: "40vh",
    top: 0,
  },
}));

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
  gap: "16px",
  paddingTop: "8px",
  minWidth: "20px",
});

const StepIndicator = styled(Box)<{ active?: boolean; completed?: boolean }>(
  ({ active, completed }) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
    backgroundColor: completed ? "#4A90A4" : active ? "#4A90A4" : "#e0e0e0",
    border: active
      ? "3px solid #4A90A4"
      : completed
        ? "none"
        : "2px solid #e0e0e0",
    boxShadow: active ? "0 0 0 2px rgba(74, 144, 164, 0.2)" : "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  }),
);

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
    title: "In Which Clusters Am I Most Competitive? (Well Positioned)",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "advantage",
    route: Routes.GreenGrowthAdvantage,
    title: "What Is My Strategic Policy Approach?",
    modalContent:
      "Green Value Chains Include A Range Of Products From Critical Minerals To Final Goods. These Products Require Distinct Productive Capabilities. Each Circle Represents An Input For A Green Value Chain That Is Critical For The Energy Transition. These Products Require Distinct Productive Capabilities. Each Circle Represents An Input For A Green Value Chain That Is Critical For The Energy Transition.",
  },
  {
    id: "minerals",
    route: Routes.GreenGrowthMinerals,
    title: "What Are My Opportunities?",
    modalContent:
      "Critical minerals power the energy transition, since they form important inputs to many different energy technologies. Minerals are circled here with black borders. For the world to decarbonize, mineral producers will need to quickly scale-up production. This represents an important green growth opportunity for many countries. This requires mineral deposits and good mining policy.",
  },
  {
    id: "value-chains",
    route: "/greenplexity/value-chains",
    title: "Green Value Chain Structure",
    modalContent:
      "Explore how green value chains connect to manufacturing clusters and individual products. This interactive view shows the hierarchical structure of green technologies, from broad value chains down to specific products. Click on value chains or clusters to dive deeper into the connections.",
  },
  {
    id: "competitiveness",
    route: Routes.GreenGrowthCompetitiveness,
    title: "Competitiveness in Green Value Chains",
    modalContent:
      "This shows your country's actual presence (colored bar) in each green value chain versus the level if your country had average competitiveness in all value chain components (black line). This reveals your country's areas of strength and concentration.",
  },
  {
    id: "opportunities",
    route: "/greenplexity/opportunities",
    title: "High-Value Opportunities to Enter Green Value Chains",
    modalContent:
      "What opportunities in green value chains should your country enter? Diversifying into new, more complex products drives economic growth. Countries are more successful at entering new industries that build on existing capabilities. So your country's best opportunities will often be new industries that leverage its existing capabilities. The graph shows which opportunities are most feasible and attractive for your country. Your country's best opportunities are towards the top right of the graph.",
  },
  {
    id: "dimensions",
    route: "/greenplexity/dimensions",
    title: "Dimensions of Opportunities in Green Value Chains",
    modalContent:
      "These diagrams compare green value chain opportunities across five key dimensions, to provide more perspective on the feasibility and attractiveness of different opportunities. Use the search to select products to compare across dimensions like complexity, feasibility, and market growth.",
  },
  {
    id: "takeoff",
    route: "/greenplexity/takeoff",
    title: "Your Green Growth Strategy",
    modalContent:
      "The energy transition offers your country a defining opportunity for growth. Your country must act quickly to create a winning strategy for green growth, or risk being left behind. Get in touch to learn more about creating your green growth strategy.",
  },
];

interface StoryNavigationProps {
  currentStep?: string;
}

const StoryNavigation: React.FC<StoryNavigationProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleStepClick = (route: string) => {
    navigate(route);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      navigate(navigationSteps[currentStepIndex - 1].route);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      navigate(navigationSteps[currentStepIndex + 1].route);
    }
  };

  return (
    <NavigationContainer>
      {/* Header */}
      <SidebarHeader>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            marginBottom: 0.5,
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
            {navigationSteps.map((step, index) => {
              const isActive = location.pathname === step.route;
              const isCompleted = index < currentStepIndex;

              return (
                <StepIndicator
                  key={step.id}
                  active={isActive}
                  completed={isCompleted}
                  onClick={() => handleStepClick(step.route)}
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
