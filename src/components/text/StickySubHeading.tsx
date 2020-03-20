import React, {useEffect, useRef, useContext} from 'react';
import styled from 'styled-components';
import {gridSmallMediaWidth} from '../../styling/Grid';
import { mobileHeight} from '../navigation/StickySideNav';
import {
  lightBorderColor,
} from '../../styling/styleUtils';
import { AppContext } from '../../App';

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
  z-index: 100;

  @media(max-width: ${gridSmallMediaWidth}px) {
    top: ${mobileHeight}px;
    text-align: center;
    border-top: none;
  }
`;

const HighlightBackground = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
`;

interface Props {
  title: string;
  highlightColor: string;
  onHeightChange?: (height: number) => void;
}

const StickySubHeading = (props: Props) => {
  const {title, highlightColor} = props;

  const { windowWidth } = useContext(AppContext);
  const containerNodeRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (containerNodeRef && containerNodeRef.current && props.onHeightChange) {
      const node = containerNodeRef.current;
      props.onHeightChange(node.clientHeight);
    }
  }, [containerNodeRef, windowWidth, props]);

  return (
    <StickyH2 ref={containerNodeRef}>
      <HighlightBackground style={{backgroundColor: highlightColor}}>
        {title}
      </HighlightBackground>
    </StickyH2>
  );
};

export default StickySubHeading;