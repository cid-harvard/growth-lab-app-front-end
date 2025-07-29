import React from "react";
// import Story from "./components/Story";
import RoutedGreenGrowthStory from "./components/RoutedGreenGrowthStory";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import greenGrowthTheme from "./theme";
import "./index.css";

const GreenGrowth = () => {
  return (
    <ThemeProvider theme={greenGrowthTheme}>
      <CssBaseline />
      <RoutedGreenGrowthStory />
    </ThemeProvider>
  );
};

export default GreenGrowth;
