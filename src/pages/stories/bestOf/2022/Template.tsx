import React, {
  MutableRefObject,
} from 'react';
import {
  StoriesGrid,
} from '../../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StickyCenteredContainer,
  Authors,
  ButtonLink as ButtonLinkBase,
  baseColor,
} from '../../../../styling/styleUtils';
import Share from '../../../../components/share';

import TextBlock from '../../../../components/text/TextBlock';
import styled from 'styled-components';
import useScrollingSections from '../../../../hooks/useScrollingSections';
import StandardFooter from '../../../../components/text/StandardFooter';
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../../components/navigation/DefaultHubHeader';

import {
  RootAlternative,
  HeadingAlternative,
  MainNarrativeRoot,
  VizContainer,
  MobileTextAlternate,
  FirstParagraphAlternative,
  FadeInContainer,
} from '../../sharedStyling';
import HashLinkTitle from '../HashLinkTitle';
import FullScreenImage from '../FullScreenImage';
import {storyMobileWidth} from '../../../../styling/Grid';



const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${storyMobileWidth}px) {
    position: relative;
    z-index: 10;
  }
`;

const DivContainer = styled.div`
  a {
    border: none;
  }
`;

const FadeInImageContainer = styled(FadeInContainer)`
  a {
    border: none;
  }
`;

const ButtonLink = styled(ButtonLinkBase)`
  margin-top: 1rem;
  && { /* needed to override template styling */
    display: inline-block;
    border-color: ${baseColor};
    color: ${baseColor};

    &: hover {
      color: #fff;
    }

    @media (max-width: ${storyMobileWidth}px) {
      background-color: #fff;
      box-shadow: 0px 0px 1px 1px #fff;
    }
  }
`;

const StickyText = styled(StickyContainer)`
  background-color: rgba(0,0,0,0.1);
  padding: 1.5rem;

  @media (max-width: ${storyMobileWidth}px) {
    background-color: unset;
  }
`;

export const StorySectionContainer = styled.div`
  min-height: 50vh;
  position: relative;
`;

const InlineExploreButtonDiv = styled.div`
  display: inline-block;
  float: left;

`;

const InlineShareButtonDiv = styled.div`
  display: inline-block;
  float: right;
  margin-top: 1rem;
  padding: 0.4rem 0.6rem;

  @media (max-width: ${storyMobileWidth}px) {

    * {
      background-color: #fff;
      box-shadow: 0px 0px 1px 1px #fff;

    }
  }
`;


const LineDivider = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: 1px solid #000000;
  margin: 10px 0px;
`;

export interface SectionDatum {
  id: string;
  title: string;
  text: string | React.ReactNode;
  image: string;
  linkText: string | undefined;
  url: string | undefined;
  ref: MutableRefObject<HTMLElement | null>;
}

interface Props {
  metaTitle: string;
  metaDescription: string;
  coverPhotoSrc: {low: string, high: string};
  pageTitle: string;
  dateLine: string;
  byLine: string | React.ReactNode;
  introText: string | React.ReactNode;
  sectionsData: SectionDatum[];
  hasBeenRendered: MutableRefObject<boolean>;
}


const BestOfTemplate = (props: Props) => {
  const {
    metaTitle, metaDescription, coverPhotoSrc, sectionsData,
    pageTitle, dateLine, byLine, introText, hasBeenRendered,
  } = props;

  /*
  For some submissions, the link button to explore more
  should say "Explore the research", rather than "Explore the project".

  The following hash IDs are submissions where the explore more
  button should say "Explore the research".

  */
  const linkToResearch = [
    'better_sanctions_on_russia_needed',
    'countries_diversify_industries_with_similar_occupational_inputs',
    'manufacturing_country_space',
    'south_africa_income_consumption_deciles',
    'remote_work_across_commuting_zones_wyoming',
    'wyoming_outmigration_by_age_bracket',
  ];

  const {section} = useScrollingSections({refs: sectionsData.map(({ref}) => ref)});

  let imageElm: React.ReactElement<any> | null = null;
  const sectionsElms = sectionsData.map(({title, text, image, ref, id, url}, i) => {
    const Wrapper = i === 0 ? FirstParagraphAlternative : MobileTextAlternate;
    const refObject = i === 0 ? undefined : ref as React.RefObject<HTMLDivElement>;
    if (section === i || (section === null && i === 0)) {
      const ImageContainer = i === 0 ? DivContainer : FadeInImageContainer;
      imageElm = (
        <ImageContainer key={image + i}>
          <FullScreenImage src={image} />
        </ImageContainer>
      );

    }

    if(hasBeenRendered.current === true) {
      if(section === i) {
        window.history.pushState('', document.title, window.location.pathname + '#' + id);
      } else if(section === null && i === 0) {
        window.history.pushState('', document.title, window.location.pathname);
      }
    }
    let linkButton: React.ReactElement<any> | null;
    if (url) {
      linkButton = (
        <InlineExploreButtonDiv>
          <ButtonLink href={url}>
            {linkToResearch.includes(id) ? 'Explore the research' : 'Explore the project'}
          </ButtonLink>
        </InlineExploreButtonDiv>
      );
    } else {
      linkButton = null;
    }

    let shareButton: React.ReactElement<any> | null;

      shareButton = (
        <InlineShareButtonDiv>
          <Share useTitle={title}/>
        </InlineShareButtonDiv>
       );


    return (
      <React.Fragment key={'bestof-section-' + title + image + i}>
        <div id={id} />
        <StorySectionContainer>
          <StickyText>
            <Wrapper ref={refObject}>
              <HashLinkTitle id={id}>
                {title}
              </HashLinkTitle>
              <div>{text}</div>
              <LineDivider />
              {linkButton}
              {shareButton}
            </Wrapper>
          </StickyText>
        </StorySectionContainer>
      </React.Fragment>
    );

  });

  if(hasBeenRendered.current === false) {
    hasBeenRendered.current = true;
  }

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
        <link href='https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;700&display=swap' rel='stylesheet' />
      </Helmet>
      <DefaultHubHeader
        backgroundColor={'rgb(75, 75, 75, 0.7)'}
      />
      <SmartCoverPhoto
        highResSrc={coverPhotoSrc.high}
        lowResSrc={coverPhotoSrc.low}
      />
      <RootAlternative style={{borderTop: 'solid 1px #e1e1e1'}}>
        <StoriesGrid>
          <HeadingAlternative>
            <FullWidth>
              <StoryTitle>{pageTitle}</StoryTitle>
              <Authors>{dateLine}</Authors>
              <Authors>{byLine}</Authors>
              <div>{introText}</div>
            </FullWidth>
          </HeadingAlternative>
        </StoriesGrid>
        <StoriesGrid>
          <VizContainer style={{
            position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
            height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
          }}>
            <StickyCenteredContainer>
              {imageElm}
            </StickyCenteredContainer>
          </VizContainer>
          <MainNarrativeRoot ref={
            sectionsData.length && sectionsData[0]
              ? sectionsData[0].ref as React.RefObject<HTMLDivElement>
              : undefined
          }>
            <TextBlock>{sectionsElms}</TextBlock>
          </MainNarrativeRoot>
        </StoriesGrid>
      </RootAlternative>
      <StandardFooter />
    </>
  );
};

export default BestOfTemplate;
