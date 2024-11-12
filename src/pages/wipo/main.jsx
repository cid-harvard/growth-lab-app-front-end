import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { csv, json } from "d3-fetch";
import Root from "./routes/root";
import ErrorPage from "./error-page.jsx";
import Country from "./routes/country/index.jsx";
import Remuneration from "./routes/country/Remuneration/index.jsx";
import Capabilities from "./routes/country/Capabilities/index.jsx";
import Reccomendations from "./routes/country/Reccomendations/index.jsx";
import Scatterplots from "./routes/country/Remuneration/Scatterplot/index.jsx";
import RemunerationTable from "./routes/country/Remuneration/RemunerationTable.jsx";
import Strengths from "./routes/country/Strengths/index.jsx";
import Treemap from "./routes/country/Strengths/Treemap.jsx";
import StrengthsTable from "./routes/country/Strengths/StrengthsTable.jsx";
import ScatterPlot from "./routes/country/Capabilities/Scatterplot/index.jsx";
import CapabilitiesTable from "./routes/country/Capabilities/CapabilitiesTable.jsx";
import HomePage from "./routes/index/HomePage.jsx";
import ReccomendationsTable from "./routes/country/Reccomendations/ReccomendationsTable.jsx";
import ReccomendationsPlot from "./routes/country/Reccomendations/ReccomendationsPlot/index.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "country/:countryId",
        element: <Country />,
        loader: async ({ params: { countryId } }) =>
          json(`/visualization_inputs/${countryId}_stats.json`),
        children: [
          {
            path: "strengths",
            element: <Strengths />,
            loader: async ({ params: { countryId } }) =>
              csv(`/visualization_inputs/${countryId}_treemap.csv`),
            children: [
              { path: "", element: <Treemap /> },
              { path: "table", element: <StrengthsTable /> },
            ],
          },
          {
            path: "remuneration",
            element: <Remuneration />,
            loader: async () =>
              csv(`/visualization_inputs/innovation_scatterplots.csv`),
            children: [
              { path: "", element: <Scatterplots /> },
              { path: "table", element: <RemunerationTable /> },
            ],
          },
          {
            path: "capabilities",
            element: <Capabilities />,
            loader: async ({ params: { countryId } }) =>
              csv(`/visualization_inputs/${countryId}_capabilities.csv`),
            children: [
              { path: "", element: <ScatterPlot /> },
              { path: "table", element: <CapabilitiesTable /> },
            ],
          },
          {
            path: "reccomendations",
            element: <Reccomendations />,
            loader: async ({ params: { countryId } }) =>
              csv(`/visualization_inputs/${countryId}_expected_realized.csv`),
            children: [
              { path: "", element: <ReccomendationsPlot /> },
              { path: "table", element: <ReccomendationsTable /> },
            ],
          },
        ],
      },
    ],
  },
]);

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
