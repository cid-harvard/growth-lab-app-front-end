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
  Navigate,
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
import { SidebarProvider } from "./pages/stories/greenGrowth/components/SidebarContext";

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
    ReactGA.send({ hitType: "pageview", page });
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
const BestOf2024 = lazy(() => import("./pages/stories/bestOf/2024"));
const NamibiaTool = lazy(() => import("./pages/namibiaTool"));
const CustomProductSpaceTool = lazy(
  () => import("./pages/iframeTools/CreateYourProductSpace"),
);
const CustomIndustrySpaceTool = lazy(
  () => import("./pages/iframeTools/CreateYourIndustrySpace"),
);
const PageNotFound = lazy(() => import("./pages/pageNotFound"));
const RoutedGreenGrowthStory = lazy(
  () => import("./pages/stories/greenGrowth/components/RoutedGreenGrowthStory"),
);
const GreenEciExperiment = lazy(
  () => import("./pages/stories/greenGrowth/experimental"),
);
const TangleTreeExperiment = lazy(
  () => import("./pages/stories/greenGrowth/experimental"),
);
const SugiyamaDAGExperiment = lazy(
  () =>
    import("./pages/stories/greenGrowth/experimental/SugiyamaDAGExperiment"),
);
const TreeGrowthExperiment = lazy(
  () => import("./pages/stories/greenGrowth/experimental/TreeGrowthExperiment"),
);
const CirclePackMapExperiment = lazy(
  () =>
    import("./pages/stories/greenGrowth/experimental/CirclePackMapExperiment"),
);
const ProductSpaceClusterBoundaries = lazy(
  () =>
    import("./pages/stories/greenGrowth/experimental/ProductSpaceClusterBoundaries"),
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
        path: routingRoutes.BestOf2024,
        element: <BestOf2024 />,
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
        path: "greenplexity/*",
        element: <RoutedGreenGrowthStory />,
      },
      {
        path: "green-growth",
        element: <Navigate to="/greenplexity" replace />,
      },
      {
        path: routingRoutes.GreenEciBumpChart,
        element: <GreenEciExperiment />,
      },
      {
        path: routingRoutes.TangleTreeExperiment,
        element: <TangleTreeExperiment />,
      },
      {
        path: routingRoutes.SugiyamaDAGExperiment,
        element: <SugiyamaDAGExperiment />,
      },
      {
        path: routingRoutes.TreeGrowthExperiment,
        element: (
          <SidebarProvider>
            <TreeGrowthExperiment />
          </SidebarProvider>
        ),
      },
      {
        path: routingRoutes.CirclePackMapExperiment,
        element: <CirclePackMapExperiment />,
      },
      {
        path: routingRoutes.ProductSpaceClusterBoundaries,
        element: <ProductSpaceClusterBoundaries />,
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
