import React from 'react';
import styled from 'styled-components/macro';
import TopLevelNav from '../../landingPage/TopLevelNav';
import {
  activeLinkColor,
  HubContentContainer,
  linearGradientBackground,
  backgroundPattern,
  Root,
  ZigZagContentCard,
  ZigZagContent,
  Content as ContentBase,
} from '../../landingPage/Utils';
import StandardFooter from '../../../components/text/StandardFooter';
import Helmet from 'react-helmet';
import meta from '../../../metadata';

const metadata = meta.get(meta.Routes.JordanOverview);

const TitleContainer = styled(ZigZagContentCard)`
  overflow: hidden;
  padding-bottom: 0;
`;
const Title = styled(ZigZagContent)`
  text-transform: uppercase;
  font-size: 1.4rem;
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
`;

const mobileWidth = 900; // in px

const Content = styled(ContentBase)`
  font-size: 0.8rem;

  @media (max-width: ${mobileWidth}px) {
    font-size: 1rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 3rem;

  @media (max-width: ${mobileWidth}px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto auto;
  }
`;

const ContentContainer = styled.div`
  grid-column: 1;
  grid-row: 1;

  @media (max-width: ${mobileWidth}px) {
    grid-row: 2;
  }
`;

const ImageBase = styled.img`
  max-width: 100%;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3);
`;


const JordanOverviewPage = () => {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta property='og:title' content={metadata.title} />
        <meta name='description' content={metadata.description} />
        <meta property='og:description' content={metadata.description} />
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
          <TitleContainer>
            <Title>A Roadmap for Export Diversification: Jordan’s Complexity Profile</Title>
          </TitleContainer>
          <Grid>
            <ContentContainer>
              <Content>
                Harvard Growth Lab’s Jordan Complexity Dashboard was developed in 2019 as part of the “Macroeconomic Stability and Long Term Growth in Jordan” project.
              </Content>
              <Content>
                The tool provides a roadmap for identifying the economic activities with the highest potential to diversify Jordan’s export basket and drive growth, while supporting higher wages.
              </Content>
              <Content>
                The methodology used to identify and prioritize high potential industries is summarized <a href='http://cid-harvard.github.io/jordan/Summary.pdf'>here</a>. This tool can be used in combination with the Growth Lab’s <a href='https://atlas.cid.harvard.edu/explore?country=113'>Atlas of Economic Complexity</a> to explore the country’s global trade patterns in detail.
              </Content>
              <Content>
                Due to data usage requirements, the tool is accessible only by Growth Lab and counterparts at the Government of Jordan.
              </Content>
            </ContentContainer>
            <ImageBase src={require('./images/image-1.png')} />
            <ImageBase src={require('./images/image-2.png')} />
            <ImageBase src={require('./images/image-3.png')} />
          </Grid>
        </Root>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default JordanOverviewPage;
