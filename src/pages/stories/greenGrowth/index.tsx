import React from "react";
// import Story from "./components/Story";
import RoutedGreenGrowthStory from "./components/RoutedGreenGrowthStory";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

const GreenGrowth = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RoutedGreenGrowthStory />
    </ThemeProvider>
  );
};

export default GreenGrowth;
