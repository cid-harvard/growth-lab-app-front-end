import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  navBackgroundColor,
  backgroundPattern,
} from './Utils';
import {FullWidthContentContainer} from '../../styling/Grid';
import StandardFooter from '../../components/text/StandardFooter';
import Helmet from 'react-helmet';

const PlaceholderSpace = styled.div`
  height: 2000px;
`;

const metaTitle = 'Community | Harvard Growth Lab Digital Hub';

const AboutPage = () => {
  useEffect(() => scrollToTop({smooth: false}), []);

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta property='og:title' content={metaTitle} />
      </Helmet>
      <TopLevelNav
        linkColor={'#fff'}
        activeColor={activeLinkColor}
        showTitle={true}
        backgroundColor={navBackgroundColor}
        backgroundImage={backgroundPattern}
      />
      <HubContentContainer>
        <FullWidthContentContainer>
          <h2>Community</h2>
          <PlaceholderSpace/>
        </FullWidthContentContainer>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default AboutPage;