import React from 'react';
import { StoriesGrid, storyMobileWidth } from '../../../../styling/Grid';
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

// Styled components from 2022 template
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
  && {
    /* needed to override template styling */
    display: inline-block;
    border-color: ${baseColor};
    color: ${baseColor};

    &:hover {
      color: #fff;
    }

    @media (max-width: ${storyMobileWidth}px) {
      background-color: #fff;
      box-shadow: 0px 0px 1px 1px #fff;
    }
  }
`;

const StickyText = styled(StickyContainer)`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1.5rem;

  @media (max-width: ${storyMobileWidth}px) {
    background-color: unset;
  }
`;

const StorySectionContainer = styled.div`
  min-height: 50vh;
  position: relative;
`;

const LineDivider = styled.hr`
  border: none;
  border-top: 1px solid #e1e1e1;
  margin: 1.5rem 0;
`;

export interface SectionDatum {
  id: string;
  title: string;
  text: React.ReactNode;
  image: string;
  ref: React.RefObject<HTMLParagraphElement>;
  url?: string;
  linkText?: string;
  source?: string;
}

interface Props {
  metaTitle: string;
  metaDescription: string;
  coverPhotoSrc: {
    high: string;
    low: string;
  };
  pageTitle: string;
  dateLine: string;
  byLine: React.ReactNode;
  introText: React.ReactNode;
  sectionsData: SectionDatum[];
  hasBeenRendered: React.MutableRefObject<boolean>;
}

const BestOfTemplate = (props: Props) => {
  const {
    metaTitle,
    metaDescription,
    coverPhotoSrc,
    sectionsData,
    pageTitle,
    dateLine,
    byLine,
    introText,
    hasBeenRendered,
  } = props;

  const { section } = useScrollingSections({
    refs: sectionsData.map(({ ref }) => ref),
  });

  let imageElm: React.ReactElement<any> | null = null;
  const sectionsElms = sectionsData.map(
    ({ title, text, image, ref, id, url, source }, i) => {
      const Wrapper = i === 0 ? FirstParagraphAlternative : MobileTextAlternate;
      const refObject =
        i === 0 ? undefined : (ref as React.RefObject<HTMLDivElement>);

      if (section === i || (section === null && i === 0)) {
        const ImageContainer = i === 0 ? DivContainer : FadeInImageContainer;
        imageElm = (
          <ImageContainer key={image + i}>
            <FullScreenImage src={image} />
          </ImageContainer>
        );
      }

      if (hasBeenRendered.current === false) {
        hasBeenRendered.current = true;
      }

      if (hasBeenRendered.current === true) {
        if (section === i) {
          window.history.pushState(
            '',
            document.title,
            window.location.pathname + '#' + id,
          );
        } else if (section === null && i === 0) {
          window.history.pushState(
            '',
            document.title,
            window.location.pathname,
          );
        }
      }

      const linkButton = url ? (
        <ButtonLink href={url}>Explore the project</ButtonLink>
      ) : null;

      const sourceText = source ? (
        <em>
          <br />
          <br />
          Source: {source}
        </em>
      ) : null;

      return (
        <React.Fragment key={'bestof-section-' + title + image + i}>
          <div id={id} />
          <StorySectionContainer>
            <StickyText>
              <Wrapper ref={refObject}>
                <HashLinkTitle id={id}>{title}</HashLinkTitle>
                <div>
                  {text}
                  {sourceText}
                </div>
                <LineDivider />
                {linkButton}
                <Share useTitle={title} />
              </Wrapper>
            </StickyText>
          </StorySectionContainer>
        </React.Fragment>
      );
    },
  );

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
        <link
          href='https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;700&display=swap'
          rel='stylesheet'
        />
      </Helmet>
      <DefaultHubHeader backgroundColor={'rgb(75, 75, 75, 0.7)'} />
      <SmartCoverPhoto
        highResSrc={coverPhotoSrc.high}
        lowResSrc={coverPhotoSrc.low}
      />
      <RootAlternative style={{ borderTop: 'solid 1px #e1e1e1' }}>
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
          <VizContainer
            style={{
              position:
                window.innerWidth < 700 && section !== null
                  ? 'sticky'
                  : undefined,
              height:
                window.innerWidth < 700 && section !== null
                  ? 'auto'
                  : undefined,
            }}
          >
            <StickyCenteredContainer>{imageElm}</StickyCenteredContainer>
          </VizContainer>
          <MainNarrativeRoot
            ref={
              sectionsData.length && sectionsData[0]
                ? (sectionsData[0].ref as React.RefObject<HTMLDivElement>)
                : undefined
            }
          >
            <TextBlock>{sectionsElms}</TextBlock>
          </MainNarrativeRoot>
        </StoriesGrid>
      </RootAlternative>
      <StandardFooter />
    </>
  );
};

export default BestOfTemplate;
