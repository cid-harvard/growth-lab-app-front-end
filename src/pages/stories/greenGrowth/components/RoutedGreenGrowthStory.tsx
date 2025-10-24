// React import not required for JSX runtime
import {
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import StoryNavigation from "./StoryNavigation";
import RoutedVisualization from "./visualization/RoutedVisualization";
import ProductScatter from "./visualization/ProductScatter";
import ProductRadar from "./visualization/ProductRadar";
import ClusterTree from "./visualization/ClusterTree/index";
import ValueChainsHierarchy from "./ValueChainsHierarchy";

import SummaryPage from "./SummaryPage";
import RankingsPage from "./rankings";
import Attribution from "./Attribution";
import StandardFooter from "../../../../components/text/StandardFooter";
import Landing from "./Landing";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { ImageCaptureProvider } from "../hooks/useImageCaptureContext";
import { SelectionDataModalProvider } from "../hooks/useSelectionDataModal";
import SelectionDataModal from "./SelectionDataModal";
import greenGrowthTheme from "../theme";
import GreenplexityHeader from "./GreenplexityHeader";

import "../index.css";

// Layout component for story steps with navigation
const StoryStepLayout = () => {
  const { isCondensed } = useSidebar();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <StoryNavigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Adjust height to account for top bar when condensed
          height: {
            xs: isCondensed ? "calc(100vh - 60px)" : "calc(100vh - 64px)",
            md: isCondensed ? "calc(100vh - 60px)" : "100vh",
          },
          overflow: "hidden",
          // Adjust margin for condensed state - both mobile and desktop
          marginTop: {
            xs: isCondensed ? "60px" : "64px",
            md: isCondensed ? "60px" : 0,
          },
          transition: (theme) =>
            theme.transitions.create(["margin", "height"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
            padding: "8px", // Add consistent padding at layout level
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Layout component for radar with padding
const RadarLayout = () => {
  const { isCondensed } = useSidebar();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <StoryNavigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Adjust height to account for top bar when condensed
          height: {
            xs: isCondensed ? "calc(100vh - 60px)" : "calc(100vh - 64px)",
            md: isCondensed ? "calc(100vh - 60px)" : "100vh",
          },
          overflow: "hidden",
          marginTop: {
            xs: isCondensed ? "60px" : "64px",
            md: isCondensed ? "60px" : 0,
          },
          transition: (theme) =>
            theme.transitions.create(["margin", "height"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            padding: "8px", // Add consistent padding for radar charts
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Layout for Summary (no sidebar) with footer
const SummaryLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <GreenplexityHeader position="fixed" heightPx={60} maxWidth="lg" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: "60px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Main content area that grows to fill available space */}
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        {/* Footer components that render inline after content */}
        <Attribution />
        <StandardFooter showGithubLink={false} />
      </Box>
    </Box>
  );
};

// Explore page component
const ExplorePage = () => {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Box sx={{ flex: 1, minHeight: "33.33%" }}>
        <ProductScatter />
      </Box>
      <Box sx={{ flex: 1, minHeight: "33.33%" }}>
        <ProductRadar />
      </Box>

      <Attribution />
      <StandardFooter showGithubLink={false} />
    </Box>
  );
};

// Landing page with navigation handler
const LandingPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const handleExplore = () => {
    // Navigate to the first step - use React Router to preserve any existing URL params
    navigate({ pathname: "/greenplexity/tutorial", search });
  };

  return <Landing onExplore={handleExplore} />;
};

const RoutedGreenGrowthStory = () => {
  return (
    <SidebarProvider>
      <ImageCaptureProvider>
        <SelectionDataModalProvider>
          <ThemeProvider theme={greenGrowthTheme}>
            <CssBaseline />
            <div className="routed-story appRoot">
              <Routes>
                {/* Landing page */}
                <Route index element={<LandingPage />} />

                {/* Story steps with scrolly visualizations */}
                <Route path="" element={<StoryStepLayout />}>
                  <Route path="tutorial" element={<ValueChainsHierarchy />} />
                  <Route
                    path="value-chains-products"
                    element={<RoutedVisualization />}
                  />
                  <Route
                    path="value-clusters"
                    element={<RoutedVisualization />}
                  />
                  <Route
                    path="cluster-products"
                    element={<RoutedVisualization />}
                  />
                  <Route
                    path="cluster-trade"
                    element={<RoutedVisualization />}
                  />
                  <Route
                    path="cluster-market"
                    element={<RoutedVisualization />}
                  />
                  <Route path="strategy" element={<RoutedVisualization />} />
                  <Route path="connections" element={<ClusterTree />} />
                  <Route path="connections/table" element={<ClusterTree />} />
                  <Route path="opportunities" element={<ProductScatter />} />
                  <Route
                    path="opportunities/table"
                    element={<ProductScatter />}
                  />
                </Route>

                {/* Products with ProductRadar (needs padding) */}
                <Route path="" element={<RadarLayout />}>
                  <Route path="products" element={<ProductRadar />} />
                  <Route path="products/table" element={<ProductRadar />} />
                </Route>

                {/* Summary (no sidebar) with footer */}
                <Route path="" element={<SummaryLayout />}>
                  <Route path="summary" element={<SummaryPage />} />
                  <Route path="rankings" element={<RankingsPage />} />
                  <Route path="rankings/map" element={<RankingsPage />} />
                </Route>

                {/* Explore page */}
                <Route path="explore" element={<ExplorePage />} />

                {/* Fallback redirect */}
                <Route
                  path="*"
                  element={<Navigate to="/greenplexity" replace />}
                />
              </Routes>
            </div>
            {/* Global contextual selection modal */}
            <SelectionDataModal />
          </ThemeProvider>
        </SelectionDataModalProvider>
      </ImageCaptureProvider>
    </SidebarProvider>
  );
};

export default RoutedGreenGrowthStory;
