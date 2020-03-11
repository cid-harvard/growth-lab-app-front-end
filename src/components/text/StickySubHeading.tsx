import React from 'react';
import styled from 'styled-components';
import {gridSmallMediaWidth} from '../../styling/Grid';
import { mobileHeight} from '../navigation/StickySideNav';
import {
  lightBorderColor,
} from '../../styling/styleUtils';

const StickyH2 = styled.h2`
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-top: 2px solid ${lightBorderColor};
  margin: 0;
  padding: 1rem 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media(max-width: ${gridSmallMediaWidth}px) {
    top: ${mobileHeight}px;
    text-align: center;
  }
`;

const HighlightBackground = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
`;

interface Props {
  title: string;
  highlightColor: string;
}

const StickySubHeading = (props: Props) => {
  const {title, highlightColor} = props;
  return (
    <StickyH2>
      <HighlightBackground style={{backgroundColor: highlightColor}}>
        {title}
      </HighlightBackground>
    </StickyH2>
  );
}

export default StickySubHeading;