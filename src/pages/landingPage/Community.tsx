import React, {useEffect} from 'react';
import TopLevelNav from './TopLevelNav';
import { scrollToTop } from '../../hooks/useScrollBehavior';
import {
  activeLinkColor,
  HubContentContainer,
  navBackgroundColor,
  backgroundPattern,
  Root,
  ZigZagContentCard,
  ZigZagContent,
  Title,
  Content,
} from './Utils';
import StandardFooter from '../../components/text/StandardFooter';
import Helmet from 'react-helmet';

const metaTitle = 'Community | Harvard Growth Lab Viz Hub';

const CommunityPage = () => {
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
        <Root>
          <ZigZagContentCard>
            <ZigZagContent>
              Interdisciplinary collaboration is the engine of our work.  Get in touch to share your related projects, proposals and prototypes!
            </ZigZagContent>
          </ZigZagContentCard>
          <Title>Community</Title>
          <Content>
            The Viz Hub is a portfolio of visualization tools and supporting software packages, powered by <a href='https://growthlab.hks.harvard.edu/'>Harvard’s Growth Lab’s</a> research.
          </Content>

          <Content>
            All projects found on the Viz Hub are built in-house by the Growth Lab’s Digital Development &amp; Design Team, an interdisciplinary group that connects economic and policy research with best practices from information design, software development, data science, product management, and digital humanities.  We believe that easy-to-use software can be a vital channel to effectively interpret and analyze complex concepts.
          </Content>

          <Content>
            Our tools are used by a global community of policymakers, scholars, investors, and journalists as important resources for understanding a country’s economic structure.  To promote information sharing and collaborative problem-solving, the majority of our software platforms and packages are free, public goods, available through open source licensing.
          </Content>

          <Content>
            Are you looking to collaborate on complementary projects?  Do you have ideas or critique to share?  We welcome all interest and inquiries and invite you to <a href='mailto:growthlabtools@hks.harvard.edu'>drop us a line</a> or find us on <a href='https://github.com/cid-harvard'>Github</a> and <a href='https://twitter.com/HarvardGrwthLab'>Twitter</a>.
          </Content>
        </Root>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default CommunityPage;