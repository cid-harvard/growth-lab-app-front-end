import React, { useEffect } from "react";
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

// Add dynamic CSS for collapsed sidebar constraints
const addCollapsedSidebarStyles = () => {
  const styleId = "collapsed-sidebar-constraints";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* When sidebar is collapsed, only add top constraint to prevent overlap */
      .sidebar-collapsed .content-area {
        margin-top: 70px !important;
        height: calc(100vh - 70px) !important;
        transition: all 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }
};

// Layout component for story steps with navigation
const StoryStepLayout = () => {
  useEffect(() => {
    addCollapsedSidebarStyles();

    const handleSidebarToggle = (event: any) => {
      if (event.detail.isCondensed) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <StoryNavigation />
      <Box
        className="content-area"
        sx={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          minWidth: 0,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

// Layout component for radar with padding
const RadarLayout = () => {
  useEffect(() => {
    addCollapsedSidebarStyles();

    const handleSidebarToggle = (event: any) => {
      if (event.detail.isCondensed) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <StoryNavigation />
      <Box
        className="content-area"
        sx={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          minWidth: 0,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

// Layout component for takeoff with footer
const TakeoffLayout = () => {
  useEffect(() => {
    addCollapsedSidebarStyles();

    const handleSidebarToggle = (event: any) => {
      if (event.detail.isCondensed) {
        document.body.classList.add("sidebar-collapsed");
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <StoryNavigation />
      <Box
        className="content-area"
        sx={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          minWidth: 0,
          transition: "all 0.3s ease-in-out",
        }}
      >
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
            <Route path="competitiveness" element={<RoutedVisualization />} />
            <Route
              path="strategic-position"
              element={<RoutedVisualization />}
            />
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
