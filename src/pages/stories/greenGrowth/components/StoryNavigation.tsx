import { useState } from "react";
import { createPortal } from "react-dom";
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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GrowthLabLogoPNG from "../../../../assets/GL_logo_white.png";
import { useSidebar } from "./SidebarContext";
import ShareModal from "./ShareModal";
import GlossaryModal from "./GlossaryModal";
import DownloadModal from "./DownloadModal";
import LearningModal from "./LearningModal";
import HierarchyLegend from "./HierarchyLegend";
import { useStrategicPosition } from "../hooks/useStrategicPosition";
import {
  replaceCountryPlaceholder,
  getProcessedModalContent,
  FormattedText,
  StrategicPositionContent,
} from "./TextUtils";

const drawerWidth = 420;

// Dynamic country flag loader (CRA/Webpack)
// Using `require.context` to resolve files from `src/assets/country_flags`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flagContext: any = (require as any).context(
  "../../../../assets/country_flags",
  false,
  /^\.\/Flag-.*\.(svg|png)$/,
);

const getFlagSrc = (iso3Code?: string): string | null => {
  const keys = flagContext.keys();
  const upper = (iso3Code || "").toUpperCase();
  const candidates = [`./Flag-${upper}.svg`, `./Flag-${upper}.png`];
  for (const k of candidates) {
    if (keys.includes(k)) {
      const mod = flagContext(k);
      return (mod && (mod.default || mod)) as string;
    }
  }
  const fallback = "./Flag-Undeclared.png";
  if (keys.includes(fallback)) {
    const mod = flagContext(fallback);
    return (mod && (mod.default || mod)) as string;
  }
  return null;
};

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
    id: "clusters",
    route: Routes.GreenGrowthClusters,
    title: "Which industrial clusters drive green growth?",
    modalContent:
      "Industrial clusters represent groups of related products that require similar productive capabilities and tend to be produced in the same places. This view shows all green industrial clusters and their component products, revealing the manufacturing communities that drive the green economy. Clusters can span multiple value chains, showing how capabilities transfer across different green technologies.",
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
      "[Country]'s existing capabilities in green industrial clusters afford [many/few] opportunities to diversify into related clusters. To create a winning green growth strategy, [Country] may consider the following policy approach:",
  },
  {
    id: "value-chains",
    route: "/greenplexity/value-chains",
    title: "What Manufacturing communities are contained in value chains?",
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
  {
    id: "summary",
    route: "/greenplexity/summary",
    title: "[country] in Summary",
    modalContent:
      "This page summarizes your recommended green growth approach and highlights top clusters to prioritize next.",
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [learningModalOpen, setLearningModalOpen] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [hoverOverlay, setHoverOverlay] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: "", x: 0, y: 0, visible: false });

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
      // If we're on the radar (dimensions) step and currently viewing "/table",
      // do not preserve the sub-route when navigating to a different step.
      const preserve = !(
        currentStep?.id === "dimensions" && getCurrentSubRoute() === "/table"
      );
      const urlWithParams = buildUrlWithParams(
        navigationSteps[currentStepIndex - 1].route,
        preserve,
      );
      navigate(urlWithParams);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      // If we're on the radar (dimensions) step and currently viewing "/table",
      // do not preserve the sub-route when navigating to a different step.
      const preserve = !(
        currentStep?.id === "dimensions" && getCurrentSubRoute() === "/table"
      );
      const urlWithParams = buildUrlWithParams(
        navigationSteps[currentStepIndex + 1].route,
        preserve,
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
          onClick={() => setLearningModalOpen(true)}
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
        borderRight: "1px solid #777777", // Right border to separate from viz area
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
                  cursor: "pointer",
                }}
                onClick={handleHome}
              >
                GREENPLEXITY
              </Typography>
              <a href="https://growthlab.app/" aria-label="Growth Lab Home">
                <img
                  src={GrowthLabLogoPNG}
                  alt="Growth Lab"
                  style={{ height: "25px", marginLeft: "12px" }}
                />
              </a>
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
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Autocomplete
              disableClearable
              blurOnSelect
              size="small"
              sx={{
                flex: 1,
                "& .MuiAutocomplete-popupIndicator": {
                  color: "white",
                  transform: "rotate(0deg)",
                  transition: "transform 150ms ease",
                },
                "& .MuiAutocomplete-popupIndicatorOpen": {
                  transform: "rotate(180deg)",
                },
              }}
              popupIcon={<KeyboardArrowDownIcon />}
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
              renderOption={(props, option: any) => {
                const src = getFlagSrc(option.iso3Code);
                return (
                  <li {...props}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {src && (
                        <img
                          src={src}
                          alt=""
                          width={20}
                          height={14}
                          style={{ borderRadius: 2 }}
                        />
                      )}
                      {option.nameEn}
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Country xyz"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "18px",
                      color: "white",
                      "& fieldset": { borderColor: "white" },
                      "&:hover fieldset": { borderColor: "white" },
                      "&.Mui-focused fieldset": { borderColor: "white" },
                      "& .MuiInputBase-input::placeholder": {
                        color: "white",
                        opacity: 0.7,
                      },
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiAutocomplete-popupIndicator": { color: "white" },
                    "& .MuiAutocomplete-clearIndicator": { color: "white" },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (() => {
                      const selected = countries.find(
                        (c: any) => c.countryId === countrySelection,
                      );
                      const src = selected
                        ? getFlagSrc(selected.iso3Code)
                        : null;
                      return (
                        <>
                          {src && (
                            <img
                              src={src}
                              alt=""
                              width={20}
                              height={14}
                              style={{ marginRight: 8, borderRadius: 2 }}
                            />
                          )}
                          {params.InputProps.startAdornment}
                        </>
                      );
                    })(),
                  }}
                />
              )}
            />
          </Box>

          <Select
            variant="outlined"
            size="small"
            IconComponent={KeyboardArrowDownIcon}
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
              "& .MuiSelect-icon": {
                color: "white",
                top: "50%",
                transform: "translateY(-50%) rotate(0deg)",
                transition: "transform 150ms ease",
              },
              "& .MuiSelect-icon.MuiSelect-iconOpen": {
                transform: "translateY(-50%) rotate(180deg)",
              },
              "& .MuiSelect-select": {
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
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
        {/* Main content area with indicators and text */}
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            flex: 1, // Take up all available space
            minHeight: 0, // Allow flex shrinking
            overflow: "visible",
            alignItems: "flex-start",
          }}
        >
          {/* Progress Indicators */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              minWidth: "24px",
              width: "24px",
              height: "100%", // Take full height of the container
              flexShrink: 0,
              overflow: "visible",
              position: "relative",
              zIndex: (theme) => theme.zIndex.drawer + 2,
              pt: 12,
            }}
          >
            {/* Home Icon */}
            <Box
              onClick={handleHome}
              sx={{
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flexShrink: 0,
                "&:hover": { transform: "scale(1.1)" },
                "& .MuiSvgIcon-root": {
                  fontSize: "20px",
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
              const isHovered = hoveredStep === step.id;

              return (
                <Box
                  key={step.id}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    height: "24px",
                    width: "18px", // Only take space for the circle
                    zIndex: isHovered ? 1000 : 1,
                    overflow: "visible",
                  }}
                  onMouseEnter={(e) => {
                    setHoveredStep(step.id);
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setHoverOverlay({
                      text: getStepTitle(step),
                      x: rect.left,
                      y: rect.top + rect.height / 2 - 12,
                      visible: true,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredStep(null);
                    setHoverOverlay((prev) => ({ ...prev, visible: false }));
                  }}
                  onClick={() => handleStepClick(step.route)}
                >
                  {/* Indicator: use takeoff icon for summary step, circle otherwise */}
                  {step.id === "summary" ? (
                    <Box
                      sx={{
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        zIndex: 2,
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    >
                      <FlightTakeoffIcon
                        sx={{ fontSize: 26, color: "#2685BD" }}
                      />
                      {isActive && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "-5px",
                            left: "-5px",
                            right: "-5px",
                            bottom: "-5px",
                            border: "2px solid #2685BD",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: "#2685BD",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        zIndex: 2,
                        "&:hover": { transform: "scale(1.1)" },
                        "&::after": isActive
                          ? {
                              content: '""',
                              position: "absolute",
                              top: "-5px",
                              left: "-5px",
                              right: "-5px",
                              bottom: "-5px",
                              border: "2px solid #2685BD",
                              borderRadius: "50%",
                            }
                          : {},
                      }}
                    />
                  )}

                  {/* Remove white center dot as per image suggestion */}

                  {/* Expanded overlay */}
                  {/* Hover overlay handled via portal */}
                </Box>
              );
            })}
          </Box>

          {/* Content area with navigation buttons */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: "20px 16px 20px 4px",
            }}
          >
            {/* Previous Button - aligned with content */}
            <Button
              startIcon={<ArrowUpward />}
              onClick={handlePrevious}
              disabled={currentStepIndex <= 0}
              sx={{
                fontWeight: "semibold",
                textTransform: "none",
                fontSize: "18px",
                justifyContent: "flex-start",
                minHeight: "45px",
                padding: "8px 0",
                color: "#106496",
                opacity: 0.5, // Only the up button is de-emphasized
                mb: 2,
                "&:hover": { backgroundColor: "rgba(74, 144, 164, 0.08)" },
                "&:disabled": { color: "#ccc" },
              }}
            >
              {previousStep ? getStepTitle(previousStep) : "Previous"}
            </Button>

            {currentStep && currentStep.id !== "summary" && (
              <>
                <Typography
                  variant="h6"
                  sx={(theme) => ({
                    fontWeight: theme.typography.fontWeightBold,
                    fontSize: "22px",
                    marginBottom: 3,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                    textTransform: "uppercase",
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
                {/* Show hierarchy legend for bubble visualization steps */}
                {(currentStep.id === "overview" ||
                  currentStep.id === "advantage" ||
                  currentStep.id === "clusters") && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        fontSize: "16px",
                        textAlign: "left",
                      }}
                    >
                      How to Read:
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <HierarchyLegend
                        layoutMode={
                          currentStep.id === "overview"
                            ? "flat"
                            : currentStep.id === "advantage"
                              ? "clustered"
                              : currentStep.id === "clusters"
                                ? "clusters-only"
                                : "flat"
                        }
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}

            {/* Next Button - aligned with content, normal opacity */}
            <Button
              startIcon={<ArrowDownward />}
              onClick={handleNext}
              disabled={currentStepIndex >= navigationSteps.length - 1}
              sx={{
                textTransform: "none",
                fontSize: "18px",
                fontWeight: "semibold",
                justifyContent: "flex-start",
                minHeight: "45px",
                padding: "8px 0",
                color: "#106496",
                mt: 2,
                "&:hover": { backgroundColor: "rgba(74, 144, 164, 0.08)" },
                "&:disabled": { color: "#ccc" },
              }}
            >
              {nextStep ? getStepTitle(nextStep) : "Next"}
            </Button>
          </Box>
        </Box>
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
          <a href="https://growthlab.app/" aria-label="Growth Lab Home">
            <img
              src={GrowthLabLogoPNG}
              alt="Growth Lab"
              style={{ height: "20px", marginRight: "8px" }}
            />
          </a>
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
        <a href="https://growthlab.app/" aria-label="Growth Lab Home">
          <img
            src={GrowthLabLogoPNG}
            alt="Growth Lab"
            style={{ height: "20px", marginRight: "8px" }}
          />
        </a>
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
      {hoverOverlay.visible &&
        createPortal(
          <Box
            sx={{
              position: "fixed",
              left: hoverOverlay.x,
              top: hoverOverlay.y,
              transform: "translateX(0)",
              height: "24px",
              backgroundColor: "#2685BD",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              paddingLeft: "26px",
              paddingRight: 1,
              zIndex: (theme) => theme.zIndex.modal + 1,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              {hoverOverlay.text}
            </Typography>
          </Box>,
          document.body,
        )}
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
            <a href="https://growthlab.app/" aria-label="Growth Lab Home">
              <img
                src={GrowthLabLogoPNG}
                alt="Growth Lab"
                style={{ height: "20px", marginRight: "8px" }}
              />
            </a>
            <Typography
              variant="h6"
              noWrap
              sx={{ cursor: "pointer" }}
              onClick={handleHome}
            >
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

      {/* Learning Modal */}
      <LearningModal
        open={learningModalOpen}
        onClose={() => setLearningModalOpen(false)}
      />
    </Box>
  );
};

export default StoryNavigation;
