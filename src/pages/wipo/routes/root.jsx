import { Outlet } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Footer from "../components/Footer";

const theme = createTheme({
  palette: { primary: { main: "#254d64" } },
  typography: {
    fontFamily: "Source Sans Pro, sans-serif",
  },
  components: {
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: "DM Mono, monospace",
          textTransform: "uppercase",
          fontSize: "14px",
          fontWeight: 500,
          color: "#124E66",
        },
        secondary: {
          fontFamily: "DM Mono, monospace",
          textTransform: "uppercase",
          fontSize: "14px",
          fontWeight: 500,
          color: "#124E66",
        },
      },
    },
  },
});

const Root = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          gridColumn: "1 / -1",
          gridRow: "1 / -1",
        }}
      >
        <Outlet />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Root;
