import React, {
  MutableRefObject,
} from 'react';
import {
  StoriesGrid,
} from '../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StickyCenteredContainer,
  StorySectionContainer,
  Authors,
  ButtonLink as ButtonLinkBase,
  baseColor,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components/macro';
import useScrollingSections from '../../../hooks/useScrollingSections';
import StandardFooter from '../../../components/text/StandardFooter';
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../components/navigation/DefaultHubHeader';
import {
  RootAlternative,
  HeadingAlternative,
  MainNarrativeRoot,
  VizContainer,
  StickyText,
  MobileTextAlternate,
  FirstParagraphAlternative,
  FadeInContainer,
} from '../sharedStyling';
import HashLinkTitle from './HashLinkTitle';
import FullScreenImage from './FullScreenImage';

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
    border-color: ${baseColor};
    color: ${baseColor};

    &: hover {
      color: #fff;
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
    }
    let linkButton: React.ReactElement<any> | null;
    if (url) {
      linkButton = (
        <div>
          <ButtonLink href={url}>
            {linkText ? linkText : 'Explore the project'}
          </ButtonLink>
        </div>
       );
    } else {
       linkButton = null;
    }
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
      <DefaultHubHeader />
      <SmartCoverPhoto
        highResSrc={coverPhotoSrc.high}
        lowResSrc={coverPhotoSrc.low}
      />
      <RootAlternative>
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
