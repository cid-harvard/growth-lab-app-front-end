import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  backgroundColor } from './Utils';
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
        linkColor={'#333'}
        activeColor={activeLinkColor}
        showTitle={true}
        backgroundColor={backgroundColor}
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