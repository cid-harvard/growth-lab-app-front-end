import styled, {keyframes} from 'styled-components/macro';
import {
  FullWidthContent,
  storyMobileWidth,
} from '../../styling/Grid';
import {
  StickyContainer,
  primaryFont,
  secondaryFont,
} from '../../styling/styleUtils';

export const backgroundColor = '#f9f9f3';

export const RootStandard = styled(FullWidthContent)`
  padding: 0 1.25rem 8rem;
  color: #333;
  background-color: ${backgroundColor};

  h1,
  h2,
  p {
    font-family: 'Source Serif Pro', serif;
  }

  p {
    font-size: 1.25rem;
  }

  h3 {
    color: #333;
    text-align: center;
    font-family: ${primaryFont};
    text-transform: uppercase;
    font-weight: 400;
  }

  p + h3 {
    margin-top: 3rem;
  }

  a {
    color: #4790b4;
    text-decoration: none;
    border-bottom: solid 1px #4790b4;
  }
`;

export const RootAlternative = styled(FullWidthContent)`
  padding: 0 1.25rem 8rem;
  color: #333;
  background-color: #fff;

  h1 {
    text-transform: uppercase;
    font-size: 2rem;
    font-weight: 400;
  }

  h2 {
    font-family: ${secondaryFont};
    font-weight: 600;
    font-size: 1.25rem;
  }

  p {
    font-size: 1rem;
  }

  h3 {
    color: #333;
    text-align: center;
    font-family: ${primaryFont};
    text-transform: uppercase;
    font-weight: 400;
  }

  p + h3 {
    margin-top: 3rem;
  }

  a {
    color: #4790b4;
    text-decoration: none;
    border-bottom: solid 1px #4790b4;
  }
`;

export const Heading = styled.div`
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  grid-column: 1 / -1;
`;

export const HeadingAlternative = styled.div`
  max-width: 850px;
  margin-left: auto;
  margin-right: auto;
  grid-column: 1 / -1;

  p {
    font-size: 1.15rem;
  }
`;

export const MainNarrativeRoot = styled.div`
position: relative;

@media(max-width: ${storyMobileWidth}px) {
  position: relative;
  z-index: 150 !important;
}
`;
export const VizContainer = styled.div`
  position: relative;
  z-index: 100;

  @media(max-width: ${storyMobileWidth}px) {
    position: sticky;
    bottom: 0;
    top: 0;
    pointer-events: none;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;

    > div {
      transform: scale(0.75);
    }
  }
`;

export const SingleColumnNarrative = styled.div`
  grid-column: 1 / -1;
  margin-top: 5rem;

  p,
  h2 {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
`;

export const StickyText = styled(StickyContainer)`
  top: 10vh;
`;


export const MobileText = styled.div`
  @media (max-width: ${storyMobileWidth}px) {
    position: relative;
    padding: 41vh 0;

    p {
      background-color: ${backgroundColor};
      box-shadow: 0px 0px 15px 5px ${backgroundColor};
    }
  }
`;

export const MobileTextAlternate = styled.div`
  @media (max-width: ${storyMobileWidth}px) {
    position: relative;
    padding: 41vh 0;

    h2,
    p {
      background-color: #fff;
      box-shadow: 0px 0px 15px 5px #fff;
    }
  }
`;


export const FirstParagraph = styled(MobileText)`
  @media (max-width: ${storyMobileWidth}px) {
    padding-top: 20vh;
  }
`;

export const FirstParagraphAlternative = styled(MobileTextAlternate)`
  @media (max-width: ${storyMobileWidth}px) {
    padding-top: 20vh;
  }
`;


const fadein = keyframes`{
    from { opacity: 0; }
    to   { opacity: 1; }
}`;

export const FadeInContainer = styled.div`
  animation: ${fadein} 750ms;
`;

