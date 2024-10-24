import React, {
  Suspense,
  createContext,
  lazy,
  useState,
  useEffect,
} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import GlobalStyles from './styling/GlobalStyles';
import Helmet from 'react-helmet';
import { Root } from './styling/Grid';
import { Routes as routingRoutes } from './routing/routes';
import debounce from 'lodash/debounce';
import './styling/fonts/fonts.css';
import Loading from './components/general/Loading';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import ReactGA from 'react-ga4';
import { overlayPortalContainerId } from './Utils';
import styled from 'styled-components';

if (process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID) {

  ReactGA.initialize([
    {
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_GA4_ID,
    }
  ]);

}
// const TrackedRoute = (props: any) => {
//   useEffect(() => {
//     const page = props.location.pathname + window.location.search;
//     ReactGA.send({hitType: "pageview", page: page});
//   }, [props.location.pathname]);

//   return (
//     <Route {...props}/>
//   );
// };

const overlayPortalZIndex = 3000;

const OverlayPortal = styled.div`
  position: relative;
  z-index: ${overlayPortalZIndex};
`;

const LandingPage = lazy(() => import('./pages/landingPage'));
const AboutPage = lazy(() => import('./pages/landingPage/About'));
const CommunityPage = lazy(() => import('./pages/landingPage/Community'));
const AlbaniaTool = lazy(() => import('./pages/albaniaTool'));
const AlbaniaStory = lazy(() => import('./pages/stories/albania'));
const NamibiaWalvisBayStory = lazy(() => import('./pages/stories/namibiaWalvisBay'));
const PortEcosystemsStory = lazy(() => import('./pages/stories/portEcosystems'));
const JordanTool = lazy(() => import('./pages/jordanTool'));
const JordanOverview = lazy(() => import('./pages/jordanTool/overviewPage'));
const BestOf2020 = lazy(() => import('./pages/stories/bestOf/2020'));
const BestOf2021 = lazy(() => import('./pages/stories/bestOf/2021'));
const BestOf2022 = lazy(() => import('./pages/stories/bestOf/2022'));
const NamibiaTool = lazy(() => import('./pages/namibiaTool'));
const CustomProductSpaceTool = lazy(() => import('./pages/iframeTools/CreateYourProductSpace'));
const CustomIndustrySpaceTool = lazy(() => import('./pages/iframeTools/CreateYourIndustrySpace'));
const PageNotFound = lazy(() => import('./pages/pageNotFound'));
const GreenGrowth = lazy(() => import('./pages/stories/greenGrowth'));

export interface IAppContext {
  windowWidth: number;
}

export const AppContext = createContext<IAppContext>({windowWidth: window.innerWidth});

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  cache: new InMemoryCache()
});

function App() {

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  const appContext = {windowWidth};


  useEffect(() => {
    const updateWindowWidth = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 500);
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  const defaultMetaTitle = 'Harvard Growth Lab Viz Hub';
  const defaultMetaDescription = 'Translating Growth Lab research into powerful online tools and interactive storytelling';

  return (
    <>
      <AppContext.Provider value={appContext}>
        <Helmet>
          {/* Set default meta data values */}
          <title>{defaultMetaTitle}</title>
          <meta name='description' content={defaultMetaDescription} />
          <meta property='og:title' content={defaultMetaTitle} />
          <meta property='og:description' content={defaultMetaDescription} />
        </Helmet>
        <ApolloProvider client={client}>
          <Router>
            <Root>
              <GlobalStyles />
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path={routingRoutes.Landing} element={<LandingPage />} />
                  <Route path={routingRoutes.About} element={<AboutPage />} />
                  <Route path={routingRoutes.Community} element={<CommunityPage />} />
                  <Route path={routingRoutes.AlbaniaTool} element={<AlbaniaTool />} />
                  <Route path={routingRoutes.JordanTool} element={<JordanTool />} />
                  <Route path={routingRoutes.JordanOverview} element={<JordanOverview />} />
                  <Route path={routingRoutes.AlbaniaStory} element={<AlbaniaStory />} />
                  <Route path={routingRoutes.BestOf2020} element={<BestOf2020 />} />
                  <Route path={routingRoutes.BestOf2021} element={<BestOf2021 />} />
                  <Route path={routingRoutes.BestOf2022} element={<BestOf2022 />} />
                  <Route path={routingRoutes.NamibiaTool} element={<NamibiaTool />} />
                  <Route path={routingRoutes.CustomProductSpace} element={<CustomProductSpaceTool />} />
                  <Route path={routingRoutes.CustomIndustrySpace} element={<CustomIndustrySpaceTool />} />
                  <Route path={routingRoutes.NamibiaWalvisBay} element={<NamibiaWalvisBayStory />} />
                  <Route path={routingRoutes.PortEcosystemsStory} element={<PortEcosystemsStory />} />
                  <Route path={routingRoutes.GreenGrowth} element={<GreenGrowth />} />
                  {/* If none of the above routes are found show the 404 page */}
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </Suspense>
                <OverlayPortal id={overlayPortalContainerId} />
            </Root>
          </Router>
        </ApolloProvider>
      </AppContext.Provider>
    </>
  );
}

export default App;
