import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import StoryNavigation from "./StoryNavigation";
import RoutedVisualization from "./visualization/RoutedVisualization";
import ProductScatter from "./visualization/ProductScatter";
import ProductRadar from "./visualization/ProductRadar";
import SankeyTree from "./visualization/SankeyTree";
import TakeoffPage from "./TakeoffPage";
import Attribution from "./Attribution";
import StandardFooter from "../../../../components/text/StandardFooter";
import Landing from "./Landing";
import "../index.css";

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

// Layout component for story steps with navigation
const StoryStepLayout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StoryNavigation />
      <Box sx={{ flex: 1, marginLeft: "320px" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

// Layout component for radar with padding
const RadarLayout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StoryNavigation />
      <Box sx={{ flex: 1, marginLeft: "320px", paddingTop: "60px" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

// Layout component for takeoff with footer
const TakeoffLayout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StoryNavigation />
      <Box sx={{ flex: 1, marginLeft: "320px" }}>
        <Outlet />
        <Attribution />
        <StandardFooter showGithubLink={false} />
      </Box>
    </Box>
  );
};

// Explore page component
const ExplorePage = () => {
  return (
    <Box>
      <ProductScatter />
      <Box sx={{ minHeight: "100vh" }}>
        <ProductRadar />
      </Box>
      <TakeoffPage />
      <Attribution />
      <StandardFooter showGithubLink={false} />
    </Box>
  );
};

// Landing page with navigation handler
const LandingPage = () => {
  const handleExplore = () => {
    // Navigate to the first step - use relative path since we're nested
    window.location.href = "/greenplexity/overview";
  };

  return <Landing onExplore={handleExplore} />;
};

const RoutedGreenGrowthStory = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="routed-story appRoot">
        <Routes>
          {/* Landing page */}
          <Route index element={<LandingPage />} />

          {/* Story steps with scrolly visualizations */}
          <Route path="" element={<StoryStepLayout />}>
            <Route path="overview" element={<RoutedVisualization />} />
            <Route
              path="competitive-advantage"
              element={<RoutedVisualization />}
            />
            <Route path="critical-minerals" element={<RoutedVisualization />} />
            <Route path="competitiveness" element={<RoutedVisualization />} />
            <Route path="value-chains" element={<SankeyTree />} />
            <Route path="opportunities" element={<ProductScatter />} />
          </Route>

          {/* Dimensions with ProductRadar (needs padding) */}
          <Route path="" element={<RadarLayout />}>
            <Route path="dimensions" element={<ProductRadar />} />
          </Route>

          {/* Takeoff with footer */}
          <Route path="" element={<TakeoffLayout />}>
            <Route path="takeoff" element={<TakeoffPage />} />
          </Route>

          {/* Explore page */}
          <Route path="explore" element={<ExplorePage />} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/greenplexity" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default RoutedGreenGrowthStory;
