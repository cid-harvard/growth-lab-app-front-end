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
  Switch,
} from 'react-router-dom';
import GlobalStyles from './styling/GlobalStyles';
import Helmet from 'react-helmet';
import { Root } from './styling/Grid';
import { Routes } from './routing/routes';
import debounce from 'lodash/debounce';
import './styling/fonts/fonts.css';
import Loading from './components/general/Loading';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import ReactGA from 'react-ga';
import { overlayPortalContainerId } from './Utils';
import styled from 'styled-components/macro';

if (process.env.REACT_APP_GOOGLE_ANALYTICS_ID) {
  ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID, {debug: false});
}
const TrackedRoute = (props: any) => {
  useEffect(() => {
    const page = props.location.pathname + window.location.search;
    ReactGA.set({page});
    ReactGA.pageview(page);
  }, [props.location.pathname]);

  return (
    <Route {...props}/>
  );
};

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
const JordanTool = lazy(() => import('./pages/jordanTool'));
const JordanOverview = lazy(() => import('./pages/jordanTool/overviewPage'));
const PageNotFound = lazy(() => import('./pages/pageNotFound'));

export interface IAppContext {
  windowWidth: number;
}

export const AppContext = createContext<IAppContext>({windowWidth: window.innerWidth});

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
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

  const defaultMetaTitle = 'Harvard Growth Lab Digital Hub';
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
                <Switch>
                  <TrackedRoute exact path={Routes.Landing}
                    render={(props: any) => <LandingPage {...props} />}
                  />
                  <TrackedRoute exact path={Routes.About}
                    render={(props: any) => <AboutPage {...props} />}
                  />
                  <TrackedRoute exact path={Routes.Community}
                    render={(props: any) => <CommunityPage {...props} />}
                  />
                  <TrackedRoute exact path={Routes.AlbaniaTool}
                    render={(props: any) => <AlbaniaTool {...props} />}
                  />
                  <TrackedRoute exact path={Routes.JordanTool}
                    render={(props: any) => <JordanTool {...props} />}
                  />
                  <TrackedRoute exact path={Routes.JordanOverview}
                    render={(props: any) => <JordanOverview {...props} />}
                  />
                  <TrackedRoute exact path={Routes.AlbaniaStory}
                    render={(props: any) => <AlbaniaStory {...props} />}
                  />
                  {/* If none of the above routes are found show the 404 page */}
                  <TrackedRoute component={PageNotFound} />
                </Switch>
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
