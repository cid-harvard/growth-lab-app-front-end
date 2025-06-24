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
import { SidebarProvider, useSidebar } from "./SidebarContext";
import "../index.css";

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

// Custom hook to manage sidebar-related styles and body classes
const useSidebarStyles = () => {
  const { isCondensed } = useSidebar();

  useEffect(() => {
    const styleId = "collapsed-sidebar-constraints";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        /* When sidebar is collapsed, give visualizations maximum space */
        .sidebar-collapsed .content-area {
          margin-top: 60px !important;
          height: calc(100vh - 60px) !important;
          transition: all 0.3s ease-in-out;
          padding: 0 !important;
        }
        
        /* Ensure visualizations use full available space */
        .sidebar-collapsed .visualization-container {
          height: 100% !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* When sidebar is open, provide appropriate constraints */
        .content-area {
          height: 100vh;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }
        
        .visualization-container {
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (isCondensed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("sidebar-collapsed");
    };
  }, [isCondensed]);
};

// Layout component for story steps with navigation
const StoryStepLayout = () => {
  useSidebarStyles();

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
          padding: 0,
          margin: 0,
        }}
      >
        <Box
          className="visualization-container"
          sx={{ height: "100%", width: "100%" }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Layout component for radar with padding
const RadarLayout = () => {
  useSidebarStyles();

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
          padding: 0,
          margin: 0,
        }}
      >
        <Box
          className="visualization-container"
          sx={{ height: "100%", width: "100%" }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Layout component for takeoff with footer
const TakeoffLayout = () => {
  useSidebarStyles();

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
          padding: 0,
          margin: 0,
        }}
      >
        <Box
          className="visualization-container"
          sx={{ height: "100%", width: "100%" }}
        >
          <Outlet />
        </Box>
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
      }}
    >
      <Box sx={{ flex: 1 }}>
        <ProductScatter />
      </Box>
      <Box sx={{ flex: 1 }}>
        <ProductRadar />
      </Box>
      <Box sx={{ flex: 1 }}>
        <TakeoffPage />
      </Box>
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
    <SidebarProvider>
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
    </SidebarProvider>
  );
};

export default RoutedGreenGrowthStory;
