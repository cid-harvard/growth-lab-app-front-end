import React, {
  createRef,
  useState,
  useEffect,
} from 'react';
import {
  FullWidthHeader,
} from '../../styling/Grid';
import SplashScreen from './SplashScreen';
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
import useData from './useData';

const SplashScreenContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const sampleCategories = [
  'Atlas Projects',
  'Country Dashboards',
  'Visual Stories',
  'Prototypes / Experiments',
  'Presentations',
  'Software Packages',
];

const sampleDataKeywords = ['UN Comtrade', 'IMF', 'WDI'];
const sampleStatus = ['Active', 'Archived', 'Complete'];

// examples: /?query=albania%20tool&keywords=usa,jordan,albania&categories=usa,jordan,albania#hub
export interface QueryString {
  query?: string;
  keywords?: string[];
  categories?: string[];
  dataKeywords?: string[];
  status?: string[];
}

const LandingPage = () => {

  const {search} = useLocation();
  const parsedQuery: QueryString | undefined = queryString.parse(search, {arrayFormat: 'comma'});

  const containerNodeRef = createRef<HTMLDivElement>();

  const [isNavOverContent, setIsNavOverContent] = useState(false);

  const defaultActiveView = parsedQuery !== undefined && (
                              (parsedQuery.query !== undefined && parsedQuery.query.length) ||
                              (parsedQuery.keywords !== undefined && parsedQuery.keywords.length) ||
                              (parsedQuery.categories !== undefined && parsedQuery.categories.length) ||
                              (parsedQuery.dataKeywords !== undefined && parsedQuery.dataKeywords.length) ||
                              (parsedQuery.status !== undefined && parsedQuery.status.length)
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

  const {data} = useData();

  let contentView: React.ReactElement<any> | null;
  if (activeView === View.grid) {
    contentView = (
      <GridView data={data} />
    );
  } else if (activeView === View.list) {
    contentView = (
      <ListView data={data} />
    );
  } else if (activeView === View.search) {
    const initialQuery = parsedQuery && parsedQuery.query !== undefined ? parsedQuery.query : '';
    const initialSelectedKeywords = parsedQuery && parsedQuery.keywords !== undefined ? parsedQuery.keywords : [];
    const initialSelectedCategories = parsedQuery && parsedQuery.categories !== undefined ? parsedQuery.categories : [];
    const initialSelectedDataKeywords = parsedQuery && parsedQuery.dataKeywords !== undefined ? parsedQuery.dataKeywords : [];
    const initialSelectedStatus = parsedQuery && parsedQuery.status !== undefined ? parsedQuery.status : [];

    const keywords: string[] = [];
    if (data) {
      data.projects.forEach(p => {
        p.keywords.forEach(word => {
          if (!keywords.includes(word)) {
            keywords.push(word);
          }
        });
      });
    }
    if (data) {
      contentView = (
        <SearchView
          initialQuery={initialQuery}
          keywords={keywords}
          initialSelectedKeywords={initialSelectedKeywords}
          categories={sampleCategories}
          initialSelectedCategories={initialSelectedCategories}
          dataKeywords={sampleDataKeywords}
          initialSelectedDataKeywords={initialSelectedDataKeywords}
          status={sampleStatus}
          initialSelectedStatus={initialSelectedStatus}
          data={data}
        />
      );
    } else {
      contentView = null;
    }
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
          </ContentColumn>
        </Grid>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default LandingPage;