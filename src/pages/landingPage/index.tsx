import React, {
  createRef,
  useState,
  useEffect,
} from 'react';
import {
  FullWidthHeader,
} from '../../styling/Grid';
import SplashScreen from './SplashScreen2';
import styled from 'styled-components/macro';
import TopLevelNav from './TopLevelNav';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  backgroundColor,
} from './Utils';
import {Grid, NavColumn, ContentColumn} from './Grid';
import StandardFooter from '../../components/text/StandardFooter';
import {hubId} from '../../routing/routes';
import {navHeight} from '../../components/navigation/TopLevelStickyNav';
import StickySideNav, {View} from './components/StickySideNav';
import GridView from './hubViews/GridView';
import ListView from './hubViews/ListView';
import SearchView from './hubViews/SearchView';
import { useLocation } from 'react-router';
import queryString from 'query-string';

const SplashScreenContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const PlaceholderSpace = styled.div`
  height: 2000px;
`;

const sampleKeywords = [
  'Albania',
  'Jordan',
  'Indonesia',
  'Colombia',
  'International',
  'FDI',
  'Growth Diagnostic',
  'Trade Data',
  'Open Source',
  'Python',
  'Product Space',
];

const sampleCategories = [
  'Atlas Projects',
  'Country Dashboards',
  'Research Tools',
  'Prototypes / Codes',
];

// examples: /?query=albania%20tool&keywords=usa,jordan,albania&categories=usa,jordan,albania#hub
export interface QueryString {
  query?: string;
  keywords?: string[];
  categories?: string[];
}

const LandingPage = () => {

  const {search} = useLocation();
  const parsedQuery: QueryString | undefined = queryString.parse(search, {arrayFormat: 'comma'});

  const containerNodeRef = createRef<HTMLDivElement>();

  const [isNavOverContent, setIsNavOverContent] = useState(false);

  const defaultActiveView = parsedQuery !== undefined && (
                              (parsedQuery.query !== undefined && parsedQuery.query.length) ||
                              (parsedQuery.keywords !== undefined && parsedQuery.keywords.length) ||
                              (parsedQuery.categories !== undefined && parsedQuery.categories.length)
                            ) ? View.search : View.grid;
  const [activeView, setActiveView] = useState<View>(defaultActiveView);

  useEffect(()=>{
    const cachedRef = containerNodeRef.current as HTMLDivElement,
      observer = new IntersectionObserver(
        ([e]) => setIsNavOverContent(e.isIntersecting),
        {rootMargin: `0px 0px -${window.innerHeight - (navHeight * 16)}px 0px`},
      );

    observer.observe(cachedRef);

    // unmount
    return () => observer.unobserve(cachedRef);
  }, [containerNodeRef]);

  const linkColor = isNavOverContent ? '#333' : '#fff';
  const activeColor = isNavOverContent ? activeLinkColor : '#fff';
  const navBackgroundColor = isNavOverContent ? backgroundColor : 'rgba(255, 255, 255, 0.2)';
  useScrollBehavior({
    navAnchors: ['#' + hubId],
    smooth: false,
  });

  let contentView: React.ReactElement<any> | null;
  if (activeView === View.grid) {
    contentView = (
      <GridView />
    );
  } else if (activeView === View.list) {
    contentView = (
      <ListView />
    );
  } else if (activeView === View.search) {
    const initialQuery = parsedQuery && parsedQuery.query !== undefined ? parsedQuery.query : '';
    const initialSelectedKeywords = parsedQuery && parsedQuery.keywords !== undefined ? parsedQuery.keywords : [];
    const initialSelectedCategories = parsedQuery && parsedQuery.categories !== undefined ? parsedQuery.categories : [];
    contentView = (
      <SearchView
        initialQuery={initialQuery}
        keywords={sampleKeywords}
        initialSelectedKeywords={initialSelectedKeywords}
        categories={sampleCategories}
        initialSelectedCategories={initialSelectedCategories}
      />
    );
  } else {
    console.error('Invalid view type ' + activeView);
    contentView = null;
  }

  return (
    <>
      <TopLevelNav
        linkColor={linkColor}
        showTitle={isNavOverContent}
        activeColor={activeColor}
        backgroundColor={navBackgroundColor}
      />
      <FullWidthHeader>
        <SplashScreenContainer>
          <SplashScreen />
        </SplashScreenContainer>
      </FullWidthHeader>
      <HubContentContainer id={hubId} ref={containerNodeRef}>
        <Grid>
          <NavColumn>
            <StickySideNav
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </NavColumn>
          <ContentColumn>
            {contentView}
            <PlaceholderSpace/>
          </ContentColumn>
        </Grid>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default LandingPage;