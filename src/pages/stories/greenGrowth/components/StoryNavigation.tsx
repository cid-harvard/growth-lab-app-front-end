import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  ArrowUpward,
  ArrowDownward,
  Download,
  Share,
  MenuBook,
  Lightbulb,
} from "@mui/icons-material";
import { Routes } from "../../../../metadata";
import { useUrlParams } from "../hooks/useUrlParams";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/shared";
import { Autocomplete, TextField, Select } from "@mui/material";
import GrowthLabLogoPNG from "../../../../assets/GL_logo_white.png";
import HowToReadPNG from "../how-to-read.png";
import { useSidebar } from "./SidebarContext";
import ShareModal from "./ShareModal";
import GlossaryModal from "./GlossaryModal";
import DownloadModal from "./DownloadModal";
import { useStrategicPosition } from "../hooks/useStrategicPosition";
import {
  replaceCountryPlaceholder,
  getProcessedModalContent,
  FormattedText,
  StrategicPositionContent,
} from "./TextUtils";

const drawerWidth = 420;

interface NavigationStep {
  id: string;
  route: string;
  title: string;
  modalContent: string;
}

const navigationSteps: NavigationStep[] = [
  {
    id: "introduction",
    route: Routes.GreenGrowthIntroduction,
    title: "Tutorial: Which green value chains drive decarbonization?",
    modalContent:
      "The path to decarbonization runs through these green value chains, connecting everything from raw materials to finished green technologies.\n\nEach value chain requires distinct capabilities. In fact, products are often co-produced together in clusters that share common knowhow.\n\nGreenplexity visualizes these green industrial clusters – sets of related products that tend to be produced in the same place - and the green value chains that use these products.",
  },
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
    title: "Which clusters is [country] already present in?",
    modalContent:
      "This visualization reveals where [Country] is already active within green industrial clusters – including their component products and overarching green value chains. These existing strengths can unlock green growth opportunities by entering related production that requires similar knowhow.",
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
    title: "Which green clusters punch above or below their weight?",
    modalContent:
      "This visualization reveals where [Country] leads in green clusters – and those clusters which offer [Country] potential growth. Clusters to the right of the line outperform expectations, contributing a larger share of [Country]'s exports than global averages predict. Clusters to the left lag behind, underperforming relative to the country's existing capabilities.",
  },
  {
    id: "strategic-position",
    route: Routes.GreenGrowthStrategicPosition,
    title: "Which green policy approach fits [country]'s capabilities?",
    modalContent:
      "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
  },
  {
    id: "opportunities",
    route: "/greenplexity/opportunities",
    title: "What are [country]'s green growth opportunities?",
    modalContent:
      "As decarbonization accelerates, green growth involves entering new clusters that are poised for rapid expansion. Countries are more successful at entering clusters that build on existing capabilities. This chart identifies the green clusters where [country] can gain the most, based on 2 dimensions: feasibility (existing capabilities) and attractiveness (future benefits).\n\nThe highlighted clusters strike the balance between what [country] can do today and high-value prospects for the future.",
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use existing sidebar context but adapt for MUI standards
  const { isCondensed, toggleSidebar } = useSidebar();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = React.useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = React.useState(false);

  const {
    countrySelection,
    setCountrySelection,
    yearSelection,
    setYearSelection,
  } = useUrlParams();
  const { data } = useQuery(GET_COUNTRIES);
  const countries = data?.ggLocationCountryList || [];
  const availableYears = Array.from({ length: 12 }, (_, i) => 2023 - i);

  // Get strategic position for dynamic content
  const strategicPosition = useStrategicPosition(
    countrySelection,
    Number.parseInt(yearSelection),
  );

  // Get current country name
  const getCurrentCountryName = () => {
    return (
      countries.find((country: any) => country.countryId === countrySelection)
        ?.nameEn || "your country"
    );
  };

  const getCurrentStepIndex = () => {
    // Check for exact match first
    const exactMatch = navigationSteps.findIndex(
      (step) => location.pathname === step.route,
    );
    if (exactMatch !== -1) return exactMatch;

    // Check for sub-route matches (e.g., /dimensions/table matches /dimensions)
    return navigationSteps.findIndex((step) =>
      location.pathname.startsWith(step.route + "/"),
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

  // Get current sub-route (e.g., "/table" from "/dimensions/table")
  const getCurrentSubRoute = () => {
    const currentStep = navigationSteps.find(
      (step) =>
        location.pathname === step.route ||
        location.pathname.startsWith(step.route + "/"),
    );
    if (currentStep && location.pathname.startsWith(currentStep.route + "/")) {
      return location.pathname.substring(currentStep.route.length);
    }
    return "";
  };

  // Build URL with current parameters and preserve sub-routes
  const buildUrlWithParams = (
    basePath: string,
    preserveSubRoute: boolean = true,
  ) => {
    const subRoute = preserveSubRoute ? getCurrentSubRoute() : "";
    const fullPath = basePath + subRoute;

    const params = new URLSearchParams();
    if (countrySelection) {
      params.set("country", String(countrySelection));
    }
    if (yearSelection) {
      params.set("year", String(yearSelection));
    }
    return `${fullPath}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleStepClick = (route: string) => {
    // When clicking step indicators, go to base route (don't preserve sub-routes)
    const params = new URLSearchParams();
    if (countrySelection) {
      params.set("country", String(countrySelection));
    }
    if (yearSelection) {
      params.set("year", String(yearSelection));
    }
    const urlWithParams = `${route}${params.toString() ? `?${params.toString()}` : ""}`;
    navigate(urlWithParams);

    // Close mobile drawer after navigation
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleHome = () => {
    const params = new URLSearchParams();
    if (countrySelection) {
      params.set("country", String(countrySelection));
    }
    if (yearSelection) {
      params.set("year", String(yearSelection));
    }
    const urlWithParams = `/greenplexity${params.toString() ? `?${params.toString()}` : ""}`;
    navigate(urlWithParams);
    if (isMobile) {
      setMobileOpen(false);
    }
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

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      toggleSidebar();
    }
  };

  const handleShareModalOpen = () => {
    setShareModalOpen(true);
  };

  const handleShareModalClose = () => {
    setShareModalOpen(false);
  };

  const handleGlossaryModalOpen = () => {
    setGlossaryModalOpen(true);
  };

  const handleGlossaryModalClose = () => {
    setGlossaryModalOpen(false);
  };

  const handleDownloadModalOpen = () => {
    setDownloadModalOpen(true);
  };

  const handleDownloadModalClose = () => {
    setDownloadModalOpen(false);
  };

  // Helper function to replace country placeholder in titles
  const getStepTitle = (step: NavigationStep) => {
    return replaceCountryPlaceholder(step.title, getCurrentCountryName());
  };

  // Action bar component
  const actionBarContent = (
    <Box
      sx={(theme) => ({
        backgroundColor:
          theme.palette.custom?.footerBg || "rgba(0, 0, 0, 0.10)",
        p: 2,
        flexShrink: 0, // Fixed at bottom
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Button
          startIcon={<Download />}
          size="large"
          onClick={handleDownloadModalOpen}
          sx={{
            flex: 1,
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "36px",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          DOWNLOAD
        </Button>
        <Button
          startIcon={<Share />}
          size="large"
          onClick={handleShareModalOpen}
          sx={{
            flex: 1,
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "36px",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          SHARE
        </Button>
        <Button
          startIcon={<MenuBook />}
          size="large"
          onClick={handleGlossaryModalOpen}
          sx={{
            flex: 1,
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "36px",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          GLOSSARY
        </Button>
        <Button
          startIcon={<Lightbulb />}
          size="small"
          sx={{
            flex: 1,
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "36px",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          LEARN
        </Button>
      </Box>
    </Box>
  );

  // Shared drawer content
  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e0e0e0", // Right border to separate from viz area
      }}
    >
      {/* Header - Fixed at top */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
          color: "white",
          p: 1,
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        {/* Title and logo section - only show on desktop */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: "24px",
                  fontFamily: "Source Sans Pro, sans-serif",
                  fontWeight: 600,
                  lineHeight: "20px",
                  letterSpacing: "0.5px",
                }}
              >
                GREENPLEXITY
              </Typography>
              <img
                src={GrowthLabLogoPNG}
                alt="Growth Lab"
                style={{ height: "25px", marginLeft: "12px" }}
              />
            </Box>

            {/* Close button for desktop */}
            <IconButton
              onClick={toggleSidebar}
              size="small"
              sx={{
                color: "white",
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "1px solid white",
                borderRadius: "4px",

                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Controls */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Autocomplete
            disableClearable
            blurOnSelect
            size="small"
            sx={{ flex: 1 }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "14px",
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "white" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                    "& .MuiInputBase-input::placeholder": {
                      color: "white",
                      opacity: 0.7,
                    },
                  },
                  "& .MuiAutocomplete-popupIndicator": { color: "white" },
                  "& .MuiAutocomplete-clearIndicator": { color: "white" },
                }}
              />
            )}
          />

          <Select
            variant="outlined"
            size="small"
            value={yearSelection}
            onChange={(e: any) => setYearSelection(e.target.value)}
            sx={{
              fontSize: "14px",
              minWidth: "100px",
              maxHeight: "40px",
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& .MuiSelect-icon": { color: "white" },
              "& .MuiSelect-select": { color: "white" },
            }}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year.toString()}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Scrollable Navigation Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto", // Enable vertical scrolling for entire navigation
          overflowX: "hidden",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // Allow flex item to shrink below content size
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "3px",
            "&:hover": {
              background: "#a8a8a8",
            },
          },
        }}
      >
        {/* Previous Button */}
        <Button
          startIcon={<ArrowUpward />}
          onClick={handlePrevious}
          disabled={currentStepIndex <= 0}
          sx={{
            fontWeight: "semibold",
            textTransform: "none",
            fontSize: "18px",
            justifyContent: "flex-start",
            minHeight: "85px",
            padding: "8px 16px",
            color: "#106496",

            "&:hover": { backgroundColor: "rgba(74, 144, 164, 0.08)" },
            "&:disabled": { color: "#ccc" },
          }}
        >
          {previousStep ? getStepTitle(previousStep) : "Previous"}
        </Button>

        {/* Main content area with indicators and text */}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            mb: 2, // Add margin bottom for spacing
          }}
        >
          {/* Progress Indicators */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "16px",
              minWidth: "24px",
              width: "24px",
              paddingTop: "60px",
              flexShrink: 0,
            }}
          >
            {/* Home Icon */}
            <Box
              onClick={handleHome}
              sx={{
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flexShrink: 0,
                "&:hover": { transform: "scale(1.1)" },
                "& .MuiSvgIcon-root": {
                  fontSize: "16px",
                  color: "#2685BD",
                },
              }}
              title="Go to Greenplexity Home"
            >
              <HomeIcon />
            </Box>

            {/* Step indicators */}
            {navigationSteps.map((step) => {
              const isActive =
                location.pathname === step.route ||
                location.pathname.startsWith(step.route + "/");
              return (
                <Box
                  key={step.id}
                  onClick={() => handleStepClick(step.route)}
                  title={step.title}
                  sx={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#2685BD",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                    flexShrink: 0,
                    "&:hover": { transform: "scale(1.1)" },
                    "&::after": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          top: "-4px",
                          left: "-4px",
                          right: "-4px",
                          bottom: "-4px",
                          border: "2px solid #2685BD",
                          borderRadius: "50%",
                        }
                      : {},
                  }}
                />
              );
            })}
          </Box>

          {/* Content area */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: "20px 16px 20px 0",
            }}
          >
            {currentStep && (
              <>
                <Typography
                  variant="h6"
                  sx={(theme) => ({
                    fontWeight: theme.typography.fontWeightBold,
                    fontSize: theme.typography.h2.fontSize,
                    marginBottom: 3,
                    color: theme.palette.text.primary,
                    lineHeight: theme.typography.h5.lineHeight,
                  })}
                >
                  {getStepTitle(currentStep)}
                </Typography>
                {currentStep.id === "strategic-position" ? (
                  <StrategicPositionContent
                    countryName={getCurrentCountryName()}
                    strategicPosition={strategicPosition}
                  />
                ) : (
                  <FormattedText>
                    {getProcessedModalContent(
                      currentStep.modalContent,
                      getCurrentCountryName(),
                    )}
                  </FormattedText>
                )}
                {currentStep.id === "advantage" && (
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <img
                      src={HowToReadPNG}
                      alt="How to read the visualization"
                      style={{
                        maxWidth: "90%",
                        height: "auto",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Next Button */}
        <Button
          endIcon={<ArrowDownward />}
          onClick={handleNext}
          disabled={currentStepIndex >= navigationSteps.length - 1}
          sx={{
            textTransform: "none",
            fontSize: "18px",
            fontWeight: "semibold",
            justifyContent: "flex-start",
            minHeight: "85px",
            padding: "8px 16px",
            color: "#106496",
            "&:hover": { backgroundColor: "rgba(74, 144, 164, 0.08)" },
            "&:disabled": { color: "#ccc" },
          }}
        >
          {nextStep ? getStepTitle(nextStep) : "Next"}
        </Button>
      </Box>

      {/* Action Bar - Fixed at bottom */}
      {actionBarContent}
    </Box>
  );

  // Mobile condensed view (AppBar only)
  if (isCondensed && isMobile) {
    return (
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          height: "60px",
          background:
            "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
        }}
      >
        <Toolbar
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={GrowthLabLogoPNG}
            alt="Growth Lab"
            style={{ height: "20px", marginRight: "8px" }}
          />
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "1px solid white",
              borderRadius: "4px",
              padding: "8px",
              marginLeft: 1,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop condensed mode - small fixed header in top-left
  if (isCondensed && !isMobile) {
    return (
      <Box
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "auto",
          height: "60px",
          background:
            "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
          borderRadius: "0 0 8px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: theme.zIndex.drawer + 1,
          padding: 1.5,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: theme.transitions.create(
            ["width", "height", "border-radius"],
            {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            },
          ),
        }}
      >
        <img
          src={GrowthLabLogoPNG}
          alt="Growth Lab"
          style={{ height: "20px", marginRight: "8px" }}
        />
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "1px solid white",
            borderRadius: "4px",
            padding: "8px",
            minWidth: "40px",
            height: "40px",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
            "& .MuiSvgIcon-root": {
              fontSize: "20px",
              color: "white",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            background:
              "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <img
              src={GrowthLabLogoPNG}
              alt="Growth Lab"
              style={{ height: "20px", marginRight: "8px" }}
            />
            <Typography variant="h6" noWrap>
              GREENPLEXITY
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: isCondensed ? 0 : drawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              mt: "64px", // Account for AppBar height
              height: "calc(100vh - 64px)", // Explicit height for mobile
              overflow: "hidden", // Let inner content handle scrolling
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        {!isCondensed && (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                position: "relative",
                border: "none",
                height: "100vh", // Explicit height for desktop
                overflow: "hidden", // Let inner content handle scrolling
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Share Modal */}
      <ShareModal open={shareModalOpen} onClose={handleShareModalClose} />

      {/* Glossary Modal */}
      <GlossaryModal
        open={glossaryModalOpen}
        onClose={handleGlossaryModalClose}
      />

      {/* Download Modal */}
      <DownloadModal
        open={downloadModalOpen}
        onClose={handleDownloadModalClose}
      />
    </Box>
  );
};

export default StoryNavigation;
