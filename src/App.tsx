import React, {
  Suspense,
  createContext,
  lazy,
  useState,
  useEffect,
} from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import GlobalStyles from "./styling/GlobalStyles";
import Helmet from "react-helmet";
import { Root } from "./styling/Grid";
import { Routes as routingRoutes } from "./routing/routes";
import debounce from "lodash/debounce";
import "./styling/fonts/fonts.css";
import Loading from "./components/general/Loading";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import ReactGA from "react-ga4";
import { overlayPortalContainerId } from "./Utils";
import styled from "styled-components";
import { json, csv } from "d3-fetch";

if (process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID) {
  ReactGA.initialize([
    {
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID,
    },
  ]);
}

const useTrackPageView = () => {
  const routerLocation = useLocation();
  useEffect(() => {
    const page = routerLocation.pathname + window.location.search;
    ReactGA.send({ hitType: "pageview", page: page });
  }, [routerLocation]);
};
const GATracker = () => {
  useTrackPageView();
  return null;
};

const overlayPortalZIndex = 3000;

const OverlayPortal = styled.div`
  position: relative;
  z-index: ${overlayPortalZIndex};
`;

const LandingPage = lazy(() => import("./pages/landingPage"));
const AboutPage = lazy(() => import("./pages/landingPage/About"));
const CommunityPage = lazy(() => import("./pages/landingPage/Community"));
const AlbaniaTool = lazy(() => import("./pages/albaniaTool"));
const AlbaniaStory = lazy(() => import("./pages/stories/albania"));
const NamibiaWalvisBayStory = lazy(
  () => import("./pages/stories/namibiaWalvisBay"),
);
const PortEcosystemsStory = lazy(
  () => import("./pages/stories/portEcosystems"),
);
const JordanTool = lazy(() => import("./pages/jordanTool"));
const JordanOverview = lazy(() => import("./pages/jordanTool/overviewPage"));
const BestOf2020 = lazy(() => import("./pages/stories/bestOf/2020"));
const BestOf2021 = lazy(() => import("./pages/stories/bestOf/2021"));
const BestOf2022 = lazy(() => import("./pages/stories/bestOf/2022"));
const NamibiaTool = lazy(() => import("./pages/namibiaTool"));
const CustomProductSpaceTool = lazy(
  () => import("./pages/iframeTools/CreateYourProductSpace"),
);
const CustomIndustrySpaceTool = lazy(
  () => import("./pages/iframeTools/CreateYourIndustrySpace"),
);
const PageNotFound = lazy(() => import("./pages/pageNotFound"));
const GreenGrowth = lazy(() => import("./pages/stories/greenGrowth"));

const WIPORoot = lazy(() => import("./pages/wipo/routes/root"));
const WIPOHomePage = lazy(() => import("./pages/wipo/routes/index/HomePage"));
const WIPOCountry = lazy(() => import("./pages/wipo/routes/country"));
const WIPOStrengths = lazy(
  () => import("./pages/wipo/routes/country/Strengths"),
);
const WIPORemuneration = lazy(
  () => import("./pages/wipo/routes/country/Remuneration"),
);
const WIPOCapabilities = lazy(
  () => import("./pages/wipo/routes/country/Capabilities"),
);
const WIPOReccomendations = lazy(
  () => import("./pages/wipo/routes/country/Reccomendations"),
);
const WIPOTreemap = lazy(
  () => import("./pages/wipo/routes/country/Strengths/Treemap"),
);
const WIPOStrengthsTable = lazy(
  () => import("./pages/wipo/routes/country/Strengths/StrengthsTable"),
);
const WIPOScatterplots = lazy(
  () => import("./pages/wipo/routes/country/Remuneration/Scatterplot"),
);
const WIPORemunerationTable = lazy(
  () => import("./pages/wipo/routes/country/Remuneration/RemunerationTable"),
);
const WIPOCapabilitiesScatterplot = lazy(
  () => import("./pages/wipo/routes/country/Capabilities/Scatterplot"),
);
const WIPOCapabilitiesTable = lazy(
  () => import("./pages/wipo/routes/country/Capabilities/CapabilitiesTable"),
);
const WIPOReccomendationsPlot = lazy(
  () =>
    import("./pages/wipo/routes/country/Reccomendations/ReccomendationsPlot"),
);
const WIPOReccomendationsTable = lazy(
  () =>
    import("./pages/wipo/routes/country/Reccomendations/ReccomendationsTable"),
);

export interface IAppContext {
  windowWidth: number;
}

export const AppContext = createContext<IAppContext>({
  windowWidth: window.innerWidth,
});

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  cache: new InMemoryCache(),
});

const defaultMetaTitle = "Harvard Growth Lab Viz Hub";
const defaultMetaDescription =
  "Translating Growth Lab research into powerful online tools and interactive storytelling";

const AppWrapper = () => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const appContext = { windowWidth };

  useEffect(() => {
    const updateWindowWidth = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 500);
    window.addEventListener("resize", updateWindowWidth);
    return () => {
      window.removeEventListener("resize", updateWindowWidth);
    };
  }, []);

  return (
    <AppContext.Provider value={appContext}>
      <Helmet>
        <title>{defaultMetaTitle}</title>
        <meta name="description" content={defaultMetaDescription} />
        <meta property="og:title" content={defaultMetaTitle} />
        <meta property="og:description" content={defaultMetaDescription} />
      </Helmet>
      <ApolloProvider client={client}>
        <Root>
          <GlobalStyles />
          <GATracker />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
          <OverlayPortal id={overlayPortalContainerId} />
        </Root>
      </ApolloProvider>
    </AppContext.Provider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,
    children: [
      {
        path: routingRoutes.Landing,
        element: <LandingPage />,
      },
      {
        path: routingRoutes.About,
        element: <AboutPage />,
      },
      {
        path: routingRoutes.Community,
        element: <CommunityPage />,
      },
      {
        path: routingRoutes.AlbaniaTool,
        element: <AlbaniaTool />,
      },
      {
        path: routingRoutes.JordanTool,
        element: <JordanTool />,
      },
      {
        path: routingRoutes.JordanOverview,
        element: <JordanOverview />,
      },
      {
        path: routingRoutes.AlbaniaStory,
        element: <AlbaniaStory />,
      },
      {
        path: routingRoutes.BestOf2020,
        element: <BestOf2020 />,
      },
      {
        path: routingRoutes.BestOf2021,
        element: <BestOf2021 />,
      },
      {
        path: routingRoutes.BestOf2022,
        element: <BestOf2022 />,
      },
      {
        path: routingRoutes.NamibiaTool,
        element: <NamibiaTool />,
      },
      {
        path: routingRoutes.CustomProductSpace,
        element: <CustomProductSpaceTool />,
      },
      {
        path: routingRoutes.CustomIndustrySpace,
        element: <CustomIndustrySpaceTool />,
      },
      {
        path: routingRoutes.NamibiaWalvisBay,
        element: <NamibiaWalvisBayStory />,
      },
      {
        path: routingRoutes.PortEcosystemsStory,
        element: <PortEcosystemsStory />,
      },
      {
        path: routingRoutes.GreenGrowth,
        element: <GreenGrowth />,
      },
      {
        path: "wipo",
        element: <WIPORoot />,
        children: [
          {
            index: true,
            element: <WIPOHomePage />,
          },
          {
            path: "country/:countryId",
            element: <WIPOCountry />,
            loader: async ({ params: { countryId } }) =>
              json(`/visualization_inputs/${countryId}_stats.json`),
            children: [
              {
                path: "strengths",
                element: <WIPOStrengths />,
                loader: async ({ params: { countryId } }) =>
                  csv(`/visualization_inputs/${countryId}_treemap.csv`),
                children: [
                  { path: "", element: <WIPOTreemap /> },
                  { path: "table", element: <WIPOStrengthsTable /> },
                ],
              },
              {
                path: "remuneration",
                element: <WIPORemuneration />,
                loader: async () =>
                  csv(`/visualization_inputs/innovation_scatterplots.csv`),
                children: [
                  { path: "", element: <WIPOScatterplots /> },
                  { path: "table", element: <WIPORemunerationTable /> },
                ],
              },
              {
                path: "capabilities",
                element: <WIPOCapabilities />,
                loader: async ({ params: { countryId } }) =>
                  csv(`/visualization_inputs/${countryId}_capabilities.csv`),
                children: [
                  { path: "", element: <WIPOCapabilitiesScatterplot /> },
                  { path: "table", element: <WIPOCapabilitiesTable /> },
                ],
              },
              {
                path: "reccomendations",
                element: <WIPOReccomendations />,
                loader: async ({ params: { countryId } }) =>
                  csv(
                    `/visualization_inputs/${countryId}_expected_realized.csv`,
                  ),
                children: [
                  { path: "", element: <WIPOReccomendationsPlot /> },
                  { path: "table", element: <WIPOReccomendationsTable /> },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
