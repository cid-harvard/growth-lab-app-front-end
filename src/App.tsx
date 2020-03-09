import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import GlobalStyles from './styling/GlobalStyles';
import Helmet from 'react-helmet';
import { Root } from './styling/Grid';
import { Routes } from './routing/routes';

const LandingPage = React.lazy(() => import('./pages/landingPage'));
const AlbaniaTool = React.lazy(() => import('./pages/albaniaTool'));
const PageNotFound = React.lazy(() => import('./pages/pageNotFound'));


function App() {

  const defaultMetaTitle = 'Country Tools - The Growth Lab at Harvard Kennedy School';
  const defaultMetaDescription = 'Explore the Country Tools from the Growth Lab at Harvard Kennedy School';

  const basename = window.location.host === 'cid-harvard.github.io'
    ? '/country-tools-front-end' : undefined;

  console.log(window.location.host);

  return (
    <>
      <Helmet>
        {/* Set default meta data values */}
        <title>{defaultMetaTitle}</title>
        <meta name='description' content={defaultMetaDescription} />
        <meta property='og:title' content={defaultMetaTitle} />
        <meta property='og:description' content={defaultMetaDescription} />
      </Helmet>
      <GlobalStyles />
      <Router basename={basename}>
        <Root>
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route exact path={Routes.Landing}
                render={(props: any) => <LandingPage {...props} />}
              />
              <Route exact path={Routes.AlbaniaTool}
                render={(props: any) => <AlbaniaTool {...props} />}
              />
              {/* If none of the above routes are found show the 404 page */}
              <Route component={PageNotFound} />
            </Switch>
          </Suspense>
        </Root>
      </Router>
    </>
  );
}

export default App;
