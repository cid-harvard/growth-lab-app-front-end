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
  // StorySectionContainer,
  Authors,
  ButtonLink as ButtonLinkBase,
  baseColor,
} from '../../../../styling/styleUtils';
import TextBlock from '../../../../components/text/TextBlock';
import styled from 'styled-components/macro';
import useScrollingSections from '../../../../hooks/useScrollingSections';
import StandardFooter from '../../../../components/text/StandardFooter';
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../../components/navigation/DefaultHubHeader';
import ShareButtonIcon from '../../../../assets/share.svg';

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
// import {
//   StickyContainer,
// } from '../../../../styling/styleUtils';
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
  }
`;

const ShareButton = styled(ButtonLinkBase)`
  margin-top: 1rem;
  display: inline-block;
  float: right;

  && { /* needed to override template styling */
    border: none;
    color: ${baseColor};
    display: inline-block;
    text-transform: unset;

    &: hover {
      color: #fff;
    }
  }
`;


const StickyText = styled(StickyContainer)`
  background-color: rgba(0,0,0,0.1);
  padding: 1.5rem;
`

export const StorySectionContainer = styled.div`
  min-height: 50vh;
  position: relative;
`;

const StickyFadeIn = styled.div`
  position: sticky;
  top: 0;
  width: auto;
  margin: 0px 20px;
  height: 100px;
  background: linear-gradient(180deg, rgba(242,242,242,1), rgba(242,242,242,0));
  content: '';
  z-index: 100;
`;

const StickyFadeOut = styled.div`
  position: sticky;
  bottom: 0;
  width: auto;
  margin: 0px 20px;
  height: 100px;
  background: linear-gradient(0deg, rgba(242,242,242,1), rgba(242,242,242,0));
  content: '';
  z-index: 100;
`;

const InlineExploreButtonDiv = styled.div`
  display: inline-block;
  float: left;
`;

const InlineShareButtonDiv = styled.div`
  display: inline-block;
  float: right;

`;

const ShareButtonIconElement = styled.div`
  display: inline-block;
  width: 16px;
  margin-right: 5px;
  vertical-align: middle;


  & img {
    width: 100%;
  }

  && {
    &: hover {
      stroke: white;

      & svg {
        stroke: white;
        fill: white;
      }
    }
  
  }
  
`;

export interface SectionDatum {
  id: string | undefined;
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
}

const BestOfTemplate = (props: Props) => {
  const {
    metaTitle, metaDescription, coverPhotoSrc, sectionsData,
    pageTitle, dateLine, byLine, introText,
  } = props;

  const {section} = useScrollingSections({refs: sectionsData.map(({ref}) => ref)});
  // const {location: {hash}} = useHistory();

  let imageElm: React.ReactElement<any> | null = null;
  const sectionsElms = sectionsData.map(({title, text, image, ref, id, url, linkText}, i) => {
    const Wrapper = i === 0 ? FirstParagraphAlternative : MobileTextAlternate;
    const refObject = i === 0 ? undefined : ref as React.RefObject<HTMLDivElement>;
    if (section === i || (section === null && i === 0)) {
      const ImageContainer = i === 0 ? DivContainer : FadeInImageContainer;
      imageElm = (
        <ImageContainer key={image + i}>
          <FullScreenImage src={image} />
        </ImageContainer>
       );

       window.location.hash = `#${id}`;
    }
    let linkButton: React.ReactElement<any> | null;
    if (url) {
      linkButton = (
        <InlineExploreButtonDiv>
          <ButtonLink href={url}>
            {linkText ? linkText : 'Explore the project'}
          </ButtonLink>
        </InlineExploreButtonDiv>
       );
    } else {
       linkButton = null;
    }

    let shareButton: React.ReactElement<any> | null;

      shareButton = (
        <InlineShareButtonDiv>
          <ShareButton href={id}>
            <ShareButtonIconElement>
              <img src={ShareButtonIcon} />
            </ShareButtonIconElement> 
            Share
          </ShareButton>
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
              {linkButton}
              {shareButton}
            </Wrapper>
          </StickyText>
        </StorySectionContainer>
      </React.Fragment>
    );

  });

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
        backgroundColor={'rgb(49 89 97 / 60%)'}
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
            <StickyFadeIn />
            <TextBlock>{sectionsElms}</TextBlock>
            <StickyFadeOut />
          </MainNarrativeRoot>
        </StoriesGrid>
      </RootAlternative>
      <StandardFooter />
    </>
  );
};

export default BestOfTemplate;
