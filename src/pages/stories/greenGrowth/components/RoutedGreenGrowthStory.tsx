import React from "react";
import { Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import StoryNavigation from "./StoryNavigation";
import RoutedVisualization from "./visualization/RoutedVisualization";
import ProductScatter from "./visualization/ProductScatter";
import ProductRadar from "./visualization/ProductRadar";
import SankeyTree from "./visualization/SankeyTree";
import ValueChainsHierarchy from "./ValueChainsHierarchy";
import TakeoffPage from "./TakeoffPage";
import Attribution from "./Attribution";
import StandardFooter from "../../../../components/text/StandardFooter";
import Landing from "./Landing";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { ImageCaptureProvider } from "../hooks/useImageCaptureContext";
import greenGrowthTheme from "../theme";
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
            padding: 2, // Add some padding for radar charts
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Layout component for takeoff with footer
const TakeoffLayout = () => {
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
          overflow: "auto", // Allow scrolling for footer content
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
        <Box sx={{ minHeight: "100%" }}>
          <Box
            sx={{
              height: {
                xs: isCondensed ? "calc(100vh - 180px)" : "calc(100vh - 184px)",
                md: isCondensed ? "calc(100vh - 180px)" : "calc(100vh - 120px)",
              },
            }}
          >
            <Outlet />
          </Box>
          <Attribution />
          <StandardFooter showGithubLink={false} />
        </Box>
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
      <Box sx={{ flex: 1, minHeight: "33.33%" }}>
        <TakeoffPage />
      </Box>
      <Attribution />
      <StandardFooter showGithubLink={false} />
    </Box>
  );
};

// Landing page with navigation handler
const LandingPage = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    // Navigate to the first step - use React Router to preserve any existing URL params
    navigate("/greenplexity/introduction");
  };

  return <Landing onExplore={handleExplore} />;
};

const RoutedGreenGrowthStory = () => {
  return (
    <SidebarProvider>
      <ImageCaptureProvider>
        <ThemeProvider theme={greenGrowthTheme}>
          <CssBaseline />
          <div className="routed-story appRoot">
            <Routes>
              {/* Landing page */}
              <Route index element={<LandingPage />} />

              {/* Story steps with scrolly visualizations */}
              <Route path="" element={<StoryStepLayout />}>
                <Route path="introduction" element={<ValueChainsHierarchy />} />
                <Route path="overview" element={<RoutedVisualization />} />
                <Route
                  path="competitive-advantage"
                  element={<RoutedVisualization />}
                />
                <Route
                  path="competitiveness"
                  element={<RoutedVisualization />}
                />
                <Route
                  path="strategic-position"
                  element={<RoutedVisualization />}
                />
                <Route path="value-chains" element={<SankeyTree />} />
                <Route path="value-chains/table" element={<SankeyTree />} />
                <Route path="opportunities" element={<ProductScatter />} />
                <Route
                  path="opportunities/table"
                  element={<ProductScatter />}
                />
              </Route>

              {/* Dimensions with ProductRadar (needs padding) */}
              <Route path="" element={<RadarLayout />}>
                <Route path="dimensions" element={<ProductRadar />} />
                <Route path="dimensions/table" element={<ProductRadar />} />
              </Route>

              {/* Takeoff with footer */}
              <Route path="" element={<TakeoffLayout />}>
                <Route path="takeoff" element={<TakeoffPage />} />
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
        </ThemeProvider>
      </ImageCaptureProvider>
    </SidebarProvider>
  );
};

export default RoutedGreenGrowthStory;
