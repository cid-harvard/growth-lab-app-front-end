import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  linearGradientBackground,
  backgroundPattern,
} from './Utils';
import {FullWidthContentContainer} from '../../styling/Grid';
import StandardFooter from '../../components/text/StandardFooter';

const PlaceholderSpace = styled.div`
  height: 2000px;
`;

const AboutPage = () => {
  useEffect(() => scrollToTop({smooth: false}), []);

  return (
    <>
      <TopLevelNav
        linkColor={'#fff'}
        activeColor={activeLinkColor}
        showTitle={true}
        backgroundColor={linearGradientBackground}
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