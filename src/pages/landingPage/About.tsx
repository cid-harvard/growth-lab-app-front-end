import React, {useEffect} from 'react';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  linearGradientBackground,
  backgroundPattern,
  Root,
  ZigZagContentCard,
  ZigZagContent,
  Title,
  Content,
} from './Utils';
import StandardFooter from '../../components/text/StandardFooter';
import Helmet from 'react-helmet';

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