import React, {
  MutableRefObject,
} from 'react';
import {
  StoriesGrid,
} from '../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StickyContainer,
  StorySectionContainer,
  Authors,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components/macro';
import useScrollingSections from '../../../hooks/useScrollingSections';
import StandardFooter from '../../../components/text/StandardFooter';
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../components/navigation/DefaultHubHeader';
import {
  Root,
  Heading,
  MainNarrativeRoot,
  VizContainer,
  StickyText,
  MobileText,
  FirstParagraph,
  FadeInContainer,
} from '../sharedStyling';

const Image = styled.img`
  width: 100%;
`;

const DivContainer = styled.div``;


interface SectionDatum {
  title: string;
  text: string | React.ReactNode;
  image: string;
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
  const sectionsElms = sectionsData.map(({title, text, image, ref}, i) => {
    const Wrapper = i === 0 ? FirstParagraph : MobileText;
    const refObject = i === 0 ? undefined : ref as React.RefObject<HTMLDivElement>;
    if (section === i || section === null) {
      const ImageContainer = i === 0 ? DivContainer : FadeInContainer;
      imageElm = (
        <ImageContainer key={image + i}>
          <Image src={image} alt='' title='' />
        </ImageContainer>
       );
    }
    return (
      <StorySectionContainer key={'bestof-section-' + title + image + i}>
        <StickyText>
          <Wrapper ref={refObject}>
            <h2>{title}</h2>
            <div>{text}</div>
          </Wrapper>
        </StickyText>
      </StorySectionContainer>
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
      <Root>
        <StoriesGrid>
          <Heading>
            <FullWidth>
              <StoryTitle>{pageTitle}</StoryTitle>
              <Authors>{dateLine}</Authors>
              <Authors>{byLine}</Authors>
              <div>{introText}</div>
            </FullWidth>
          </Heading>
        </StoriesGrid>
        <StoriesGrid>
          <VizContainer style={{
            position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
            height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
          }}>
            <StickyContainer>
              {imageElm}
            </StickyContainer>
          </VizContainer>
          <MainNarrativeRoot ref={
            sectionsData.length && sectionsData[0]
              ? sectionsData[0].ref as React.RefObject<HTMLDivElement>
              : undefined
          }>
            <TextBlock>{sectionsElms}</TextBlock>
          </MainNarrativeRoot>
        </StoriesGrid>
      </Root>
      <StandardFooter />
    </>
  );
};

export default BestOfTemplate;
