import React, {useEffect} from 'react';
import styled from 'styled-components/macro';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  linearGradientBackground,
  backgroundPattern,
  linkBlue,
} from './Utils';
import {FullWidthContentContainer} from '../../styling/Grid';
import {secondaryFont} from '../../styling/styleUtils';
import StandardFooter from '../../components/text/StandardFooter';
import Helmet from 'react-helmet';

const zigZagPattern = require('./images/pattern.svg');

const Root = styled(FullWidthContentContainer)`
  padding: 3rem 1rem;
`;

const ZigZagContentCard = styled.div`
  position: relative;
  z-index: 10;
  padding: 3rem 1rem 1rem 3rem;
  margin-bottom: 4rem;

  &:before {
    content: '';
    width: 300px;
    height: 300px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
    padding-top: 2rem;
    padding-left: 0.35rem;
    box-sizing: border-box;
    background-image: url("${zigZagPattern}");
  }
`;

const ZigZagContent = styled.div`
  background-color: #f9fdfc;
  color: #474747;
  font-family: ${secondaryFont};
  padding: 3rem;
  font-size: 1.2rem;
  line-height: 1.8;
  position: relative;
  z-index: 10;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
    padding-top: 2rem;
    padding-left: 0.35rem;
    box-sizing: border-box;
    background-image: url("${zigZagPattern}");
    opacity: 0.3;
  }
`;

const Title = styled.h1`
  font-weight: 600;
  color: ${linkBlue};
  text-transform: uppercase;
  margin-bottom: 3rem;
  display: flex;
  align-items: flex-end;
  line-height: 0.8;

  &:after {
    content: '';
    margin-left: 0.75rem;
    flex-grow: 1;
    height: 4px;
    background-image: ${linearGradientBackground};
  }
`;

const Content = styled.p`
  line-height: 1.7;
  margin-bottom: 3rem;

  a {
    color: ${linkBlue};
    text-decoration: none;

    &:hover {
      border-bottom: solid 1px ${linkBlue};
    }
  }
`;

const metaTitle = 'About | Harvard Growth Lab Digital Hub';

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
        backgroundColor={linearGradientBackground}
        backgroundImage={backgroundPattern}
      />
      <HubContentContainer>
        <Root>
          <ZigZagContentCard>
            <ZigZagContent>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
              proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </ZigZagContent>
          </ZigZagContentCard>
          <Title>About</Title>
          <Content>
            <a href='/about'>Harvard's Growth Lab</a> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
             Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Content>
        </Root>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default AboutPage;