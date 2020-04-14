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

const LandingPage = lazy(() => import('./pages/landingPage'));
const AlbaniaTool = lazy(() => import('./pages/albaniaTool'));
const JordanTool = lazy(() => import('./pages/jordanTool'));
const PageNotFound = lazy(() => import('./pages/pageNotFound'));

export interface IAppContext {
  windowWidth: number;
}

export const AppContext = createContext<IAppContext>({windowWidth: window.innerWidth});

const client = new ApolloClient({
  uri: 'http://hgl-app-staging.cid-labs.com/graphql',
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

  const defaultMetaTitle = 'Country Tools - The Growth Lab at Harvard Kennedy School';
  const defaultMetaDescription = 'Explore the Country Tools from the Growth Lab at Harvard Kennedy School';

  // REMOVE THIS ONCE WE MOVE TO AWS
  const basename = window.location.host === 'cid-harvard.github.io'
    ? '/country-tools-front-end' : undefined;

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
          <Router basename={basename}>
            <Root>
              <GlobalStyles />
              <Suspense fallback={<Loading />}>
                <Switch>
                  <Route exact path={Routes.Landing}
                    render={(props: any) => <LandingPage {...props} />}
                  />
                  <Route exact path={Routes.AlbaniaTool}
                    render={(props: any) => <AlbaniaTool {...props} />}
                  />
                  <Route exact path={Routes.JordanTool}
                    render={(props: any) => <JordanTool {...props} />}
                  />
                  {/* If none of the above routes are found show the 404 page */}
                  <Route component={PageNotFound} />
                </Switch>
              </Suspense>
            </Root>
          </Router>
        </ApolloProvider>
      </AppContext.Provider>
    </>
  );
}

export default App;
