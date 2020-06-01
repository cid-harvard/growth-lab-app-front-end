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

const SplashScreenContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const PlaceholderSpace = styled.div`
  height: 2000px;
`;

const LandingPage = () => {

  const containerNodeRef = createRef<HTMLDivElement>();

  const [isNavOverContent, setIsNavOverContent] = useState(false);
  const [activeView, setActiveView] = useState<View>(View.grid);

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
  const navBackgroundColor = isNavOverContent ? backgroundColor : 'transparent';
  useScrollBehavior({
    navAnchors: ['#' + hubId],
    smooth: false,
  });

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
            <h2>Hub</h2>
            <PlaceholderSpace/>
          </ContentColumn>
        </Grid>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default LandingPage;