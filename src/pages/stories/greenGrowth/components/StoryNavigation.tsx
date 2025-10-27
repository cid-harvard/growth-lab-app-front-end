import { useState, useMemo, useRef } from "react";
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
import { createFilterOptions } from "@mui/material/Autocomplete";
import type { AutocompleteCloseReason } from "@mui/material/Autocomplete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GrowthLabLogoPNG from "../../../../assets/GL_logo_white.png";
import { useSidebar } from "./SidebarContext";
import ShareModal from "./ShareModal";
import GlossaryModal from "./GlossaryModal";
import DownloadModal from "./DownloadModal";
import LearningModal from "./LearningModal";
import HierarchyLegend from "./HierarchyLegend";
import NavigationIndicators from "./NavigationIndicators";
import { useStrategicPosition } from "../hooks/useStrategicPosition";
import {
  replaceCountryPlaceholder,
  getProcessedModalContent,
  FormattedText,
  StrategicPositionContent,
} from "./TextUtils";

// Use percentage for mobile, fixed px for desktop
const drawerWidth = 420; // Desktop width in px
const mobileDrawerWidth = "min(90vw, 420px)"; // Mobile: 90% of viewport or 420px max

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
  hoverText: string;
  modalContent: string;
}

const navigationSteps: NavigationStep[] = [
  {
    id: "tutorial",
    route: Routes.GreenGrowthTutorial,
    title: "Tutorial: Which green value chains drive decarbonization?",
    hoverText: "Tutorial",
    modalContent:
      "The path to decarbonization runs through these green value chains.\n\nEach green value chain is composed of products used in clean energy technologies, from raw materials to finished green technologies.\n\nMany products appear in more than one value chain. Products requiring similar capabilities naturally group into green industrial clusters.",
  },
  {
    id: "value-chains-products",
    route: Routes.GreenGrowthValueChainsProducts,
    title: "Which green products does [country] already produce?",
    hoverText: "Value Chains & Products",
    modalContent:
      "[Country] is active today in the highlighted products in green value chains.",
  },
  {
    id: "value-clusters",
    route: Routes.GreenGrowthValueClusters,
    title: "Which industrial clusters does [country] participate in?",
    hoverText: "Value Chains, Clusters & Products",
    modalContent:
      "Products requiring similar capabilities are grouped into green industrial clusters within each value chain. By focusing on clusters, current strengths point the way to new green growth opportunities to enter related products.",
  },
  {
    id: "cluster-products",
    route: Routes.GreenGrowthClusterProducts,
    title: "Where is [country] active across all industrial clusters?",
    hoverText: "Active Clusters",
    modalContent:
      "This grid shows where [country] is active in every green industrial cluster and their component products. Exploring related products within clusters reveals how existing capabilities allow [Country] to enter new green value chains.",
  },
  {
    id: "cluster-trade",
    route: Routes.GreenGrowthClusterTrade,
    title: "What are [country]'s largest industrial clusters?",
    hoverText: "Cluster Performance",
    modalContent:
      "This chart highlights the most competitive industrial clusters in [Country], as measured by their export volume and shaded by [country]'s relative strength in the cluster.",
  },
  {
    id: "strategy",
    route: Routes.GreenGrowthStrategy,
    title: "What strategic approach fits [country]'s current capabilities?",
    hoverText: "Strategy",
    modalContent:
      "[Country]'s existing capabilities in green industrial clusters afford unique opportunities to diversify into related clusters. \n\n To create a winning green growth strategy, [Country] may consider a:\n\nRecommended Strategic Approach",
  },
  {
    id: "opportunities",
    route: Routes.GreenGrowthOpportunities,
    title: "Which clusters offer green growth opportunities for [country]?",
    hoverText: "Cluster Opportunities",
    modalContent:
      "Some green clusters offer a stronger fit for [Country]'s green growth strategy, striking the right balance between feasibility and attractiveness. Here are some high-potential clusters to study further.",
  },
  {
    id: "connections",
    route: Routes.GreenGrowthConnections,
    title: "Which opportunities does this cluster connect [Country] to?",
    hoverText: "Cluster Connections",
    modalContent:
      "Explore some of [Country]'s strategic green clusters, across its connections to value chains and related products. This view maps those connections, showing how strengthening one cluster can unlock opportunities across multiple value chains and spotlighting the closely related products most likely to boost [Country]'s green-growth footprint.",
  },
  {
    id: "products",
    route: Routes.GreenGrowthProducts,
    title: "Which green products should [Country] prioritize next?",
    hoverText: "Product Opportunities",
    modalContent:
      "[Country] can help the world decarbonize by diversifying into new green industrial clusters.\n\nStrategic clusters include products that aim to balance:\n<b>Complexity</b>: more complex products tend to support higher wages\n<b>Opportunity Gain</b>: higher values hold more connections to other complex products, creating more opportunities for future diversification.\n<b>Feasibility</b>: higher values indicate that a greater share of the required capabilities exists in a given location.\n<b>Product Market Size</b>: total global trade value of trade for the given product.\n<b>Product Market Growth</b>: relative percentage change in a product's global market share compared to its average market share over the previous 3 years.",
  },
  {
    id: "summary",
    route: "/greenplexity/summary",
    title: "[country] in Summary",
    hoverText: "Summary",
    modalContent:
      "[Country] can help the world decarbonize by diversifying into new green industrial clusters. Strategic clusters include products that aim to balance:",
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

  // Control Autocomplete open state to avoid instant reopen on chevron click
  const [countryAutocompleteOpen, setCountryAutocompleteOpen] = useState(false);
  const ignoreNextCountryOpenRef = useRef(false);

  const {
    countrySelection,
    setCountrySelection,
    yearSelection,
    setYearSelection,
  } = useUrlParams();
  const { data } = useQuery(GET_COUNTRIES);
  const countries = useMemo(
    () => data?.gpLocationCountryList || [],
    [data?.gpLocationCountryList],
  );

  const sortedCountries = useMemo(
    () =>
      [...countries].sort((a: any, b: any) =>
        (a?.nameEn || "").localeCompare(b?.nameEn || "", undefined, {
          sensitivity: "base",
        }),
      ),
    [countries],
  );

  const countryFilterOptions = useMemo(
    () =>
      createFilterOptions<any>({
        stringify: (option: any) =>
          [
            option?.nameEn,
            option?.nameShortEn,
            option?.nameEs,
            option?.nameShortEs,
            option?.iso3Code,
            option?.iso2Code,
            option?.nameAbbrEn,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
      }),
    [],
  );
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
    // Special handling: treat cluster-market as part of cluster-trade step
    if (
      location.pathname === Routes.GreenGrowthClusterMarket ||
      location.pathname.startsWith(Routes.GreenGrowthClusterMarket + "/")
    ) {
      return navigationSteps.findIndex(
        (step) => step.route === Routes.GreenGrowthClusterTrade,
      );
    }

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
        false,
      );
      navigate(urlWithParams);
    } else {
      // On the first step (or unknown), go to Greenplexity landing page
      const params = new URLSearchParams();
      if (countrySelection) {
        params.set("country", String(countrySelection));
      }
      if (yearSelection) {
        params.set("year", String(yearSelection));
      }
      const urlWithParams = `/greenplexity${params.toString() ? `?${params.toString()}` : ""}`;
      navigate(urlWithParams);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      const urlWithParams = buildUrlWithParams(
        navigationSteps[currentStepIndex + 1].route,
        false,
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

  // Helper function to get dynamic content for cluster performance steps
  const getClusterPerformanceContent = () => {
    const isMarketSharePage =
      location.pathname === Routes.GreenGrowthClusterMarket ||
      location.pathname.startsWith(Routes.GreenGrowthClusterMarket + "/");

    if (isMarketSharePage) {
      return {
        title: "Where does [Country] lead in global market share?",
        content:
          "This chart highlights the industrial clusters with the largest global market share, shaded by [Country]'s relative strength in the cluster.",
      };
    }

    // Default to cluster trade page
    return {
      title: "What are [Country]'s largest industrial clusters?",
      content:
        "This chart highlights the most competitive industrial clusters in [Country], as measured by their export volume and shaded by [country]'s relative strength in the cluster.",
    };
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
            fontSize: "0.75rem",
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
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "2.25rem", // 36px in rem for better mobile scaling
            padding: { xs: "0.25rem 0.5rem", md: "0.5rem 1rem" }, // Responsive padding
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
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "2.25rem", // 36px in rem for better mobile scaling
            padding: { xs: "0.25rem 0.5rem", md: "0.5rem 1rem" }, // Responsive padding
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
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#5C5C5C",
            minHeight: "2.25rem", // 36px in rem for better mobile scaling
            padding: { xs: "0.25rem 0.5rem", md: "0.5rem 1rem" }, // Responsive padding
            lineHeight: "1.1",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          VALUE CHAIN CONNECTIONS
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
              ml: 1,
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
                  fontSize: "1.5rem",
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
              <a href="/" aria-label="Growth Lab Home">
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
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", ml: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Autocomplete
              disableClearable
              blurOnSelect
              size="small"
              open={countryAutocompleteOpen}
              onOpen={(_: React.SyntheticEvent) => {
                if (ignoreNextCountryOpenRef.current) {
                  ignoreNextCountryOpenRef.current = false;
                  return;
                }
                setCountryAutocompleteOpen(true);
              }}
              onClose={(
                _: React.SyntheticEvent,
                reason: AutocompleteCloseReason,
              ) => {
                if (reason === "toggleInput") {
                  ignoreNextCountryOpenRef.current = true;
                  setTimeout(() => {
                    ignoreNextCountryOpenRef.current = false;
                  }, 0);
                }
                setCountryAutocompleteOpen(false);
              }}
              openOnFocus={false}
              slotProps={{
                popupIndicator: {
                  onMouseDown: (e: React.MouseEvent) => {
                    if (countryAutocompleteOpen) {
                      e.preventDefault();
                    }
                  },
                },
              }}
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
              options={sortedCountries}
              filterOptions={countryFilterOptions}
              isOptionEqualToValue={(option: any, value: any) =>
                option?.countryId === value?.countryId
              }
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
                  placeholder="Country Search..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1.125rem",
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
              fontSize: "0.875rem",
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
          px: 1.5,
          py: 0.5,
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
        {/* Previous Button - subtle at top */}
        <Button
          startIcon={
            <ArrowUpward
              sx={{
                fontSize: "1.75rem !important",
                color: "#106496 !important",
                opacity: "1 !important",
              }}
            />
          }
          onClick={handlePrevious}
          disabled={false}
          sx={{
            fontWeight: 500,
            textTransform: "none",
            fontSize: "1rem",
            justifyContent: "flex-start",
            minHeight: { xs: "3.5rem", md: "4.25rem" }, // 56px mobile, 68px desktop
            height: { xs: "auto", md: "4.25rem" }, // Flexible on mobile, fixed on desktop
            padding: { xs: "0.75rem 0.625rem", md: "1rem 0.625rem" }, // Responsive padding
            color: "#106496",
            opacity: 0.7,
            backgroundColor: "rgba(74, 144, 164, 0.02)",
            borderRadius: "0.5rem", // 8px in rem
            mt: 1,
            "&:hover": {
              backgroundColor: "rgba(74, 144, 164, 0.08)",
              color: "#106496",
              opacity: 1,
            },
            "&:disabled": { color: "#ccc" },
            "& .MuiButton-startIcon": {
              marginRight: "10px",
              alignSelf: "flex-start",
              mt: "2px",
            },
            "& .MuiButton-label": {
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: "1.4",
              alignItems: "flex-start",
            },
          }}
        >
          {previousStep ? getStepTitle(previousStep) : "Greenplexity Home"}
        </Button>

        {/* Main content area with indicators and text */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: "0.5rem", md: "0.75rem" }, // Responsive gap
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            alignItems: "stretch",
          }}
        >
          {/* Progress Indicators - Left Column */}
          <NavigationIndicators
            navigationSteps={navigationSteps}
            currentStepIndex={currentStepIndex}
            onStepClick={handleStepClick}
          />

          {/* Content area - Right Column (independently scrollable) */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              overflowY: "auto",
              overflowX: "hidden",
              pr: { xs: 1, md: 2 }, // Less padding on mobile
              minHeight: 0,
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
            {currentStep && currentStep.id !== "summary" && (
              <>
                <Typography
                  variant="h6"
                  sx={(theme) => ({
                    fontWeight: theme.typography.fontWeightBold,
                    fontSize: "1.375rem",
                    marginBottom: 3,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                  })}
                >
                  {currentStep.id === "cluster-trade"
                    ? replaceCountryPlaceholder(
                        getClusterPerformanceContent().title,
                        getCurrentCountryName(),
                      )
                    : getStepTitle(currentStep)}
                </Typography>
                {currentStep.id === "strategy" ? (
                  <StrategicPositionContent
                    countryName={getCurrentCountryName()}
                    strategicPosition={strategicPosition}
                  />
                ) : currentStep.id === "cluster-trade" ? (
                  <FormattedText>
                    {replaceCountryPlaceholder(
                      getClusterPerformanceContent().content,
                      getCurrentCountryName(),
                    )}
                  </FormattedText>
                ) : (
                  <FormattedText>
                    {getProcessedModalContent(
                      currentStep.modalContent,
                      getCurrentCountryName(),
                    )}
                  </FormattedText>
                )}
                {/* Show hierarchy legend for bubble visualization steps */}
                {(currentStep.id === "value-chains-products" ||
                  currentStep.id === "value-clusters" ||
                  currentStep.id === "cluster-products") && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        fontSize: "1rem",
                        textAlign: "left",
                      }}
                    >
                      How to Read:
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <HierarchyLegend
                        layoutMode={
                          currentStep.id === "value-chains-products"
                            ? "flat"
                            : currentStep.id === "value-clusters"
                              ? "clustered"
                              : currentStep.id === "cluster-products"
                                ? "clusters-only"
                                : "flat"
                        }
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Next Button - prominent at bottom */}
        <Button
          startIcon={<ArrowDownward sx={{ fontSize: "1.75rem !important" }} />}
          onClick={handleNext}
          disabled={currentStepIndex >= navigationSteps.length - 1}
          sx={{
            textTransform: "none",
            fontSize: "1.25rem",
            fontWeight: 600,
            justifyContent: "flex-start",
            minHeight: { xs: "3.5rem", md: "4.25rem" }, // 56px mobile, 68px desktop
            height: { xs: "auto", md: "4.25rem" }, // Flexible on mobile, fixed on desktop
            padding: { xs: "0.75rem 0.625rem", md: "1rem 0.625rem" }, // Responsive padding
            color: "#106496",
            backgroundColor: "rgba(74, 144, 164, 0.1)",
            borderRadius: "0.5rem", // 8px in rem
            "&:hover": { backgroundColor: "rgba(74, 144, 164, 0.16)" },
            "&:disabled": {
              color: "#ccc",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            "& .MuiButton-startIcon": {
              marginRight: "12px",
              alignSelf: "flex-start",
              mt: "2px",
            },
            "& .MuiButton-label": {
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: "1.4",
              alignItems: "flex-start",
            },
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
          height: "3.75rem", // 60px in rem for better scaling
          minHeight: "3.75rem",
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
          <a href="/" aria-label="Growth Lab Home">
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
              borderRadius: "0.25rem", // 4px in rem
              padding: "0.5rem", // 8px in rem
              marginLeft: 1,
              minWidth: "2.5rem", // Ensure consistent size on mobile
              minHeight: "2.5rem",
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
          height: "3.75rem", // 60px in rem
          minHeight: "3.75rem",
          background:
            "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
          borderRadius: "0 0 0.5rem 0", // 8px in rem
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: theme.zIndex.drawer + 1,
          padding: 1.5,
          boxShadow: "0 0.125rem 0.5rem rgba(0,0,0,0.1)", // 2px 8px in rem
          transition: theme.transitions.create(
            ["width", "height", "border-radius"],
            {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            },
          ),
        }}
      >
        <a href="/" aria-label="Growth Lab Home">
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
            borderRadius: "0.25rem", // 4px in rem
            padding: "0.5rem", // 8px in rem
            minWidth: "2.5rem", // 40px in rem
            height: "2.5rem", // 40px in rem
            "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
            "& .MuiSvgIcon-root": {
              fontSize: "1.25rem",
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
            <a href="/" aria-label="Growth Lab Home">
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
              width: mobileDrawerWidth, // Responsive width for mobile
              mt: "4rem", // Account for AppBar height (64px = 4rem)
              height: "calc(100vh - 4rem)", // Explicit height for mobile
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
