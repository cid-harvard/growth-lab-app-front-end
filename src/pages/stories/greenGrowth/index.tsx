import React from "react";
// import Story from "./components/Story";
import ScrollamaStory from "./components/ScollamaStory";
import { RecoilRoot } from "recoil";
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
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ScrollamaStory />
      </ThemeProvider>
    </RecoilRoot>
  );
};

export default GreenGrowth;
