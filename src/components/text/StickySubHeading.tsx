import React, {useEffect, createRef, useContext, useState} from 'react';
import styled from 'styled-components/macro';
import {gridSmallMediaWidth} from '../../styling/Grid';
import { mobileHeight} from '../navigation/StickySideNav';
import {
  lightBorderColor,
} from '../../styling/styleUtils';
import { AppContext } from '../../App';

const StickyH2 = styled.h2`
  position: sticky;
  top: -2px;
  background-color: rgba(255, 255, 255, 0.9);
  border-top: 2px solid ${lightBorderColor};
  border-bottom: 1px solid ${lightBorderColor};
  margin: 0;
  padding: 1.5rem 0 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 2px;
  z-index: 100;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  @media(max-width: ${gridSmallMediaWidth}px) {
    top: ${mobileHeight}px;
    text-align: center;
    border-top: none;
  }
`;

const HighlightBorder = styled.span`
  display: inline-block;
  border-bottom: 6px solid ${lightBorderColor};
`;

interface Props {
  title: string;
  highlightColor: string;
  onHeightChange?: (height: number) => void;
}

const StickySubHeading = (props: Props) => {
  const {title, highlightColor} = props;

  const { windowWidth } = useContext(AppContext);
  const containerNodeRef = createRef<HTMLHeadingElement>();

  const [isSticky, setIsSticky] = useState(false);

  useEffect(()=>{
    const cachedRef = containerNodeRef.current as HTMLHeadingElement,
      observer = new IntersectionObserver(
        ([e]) => setIsSticky(e.intersectionRatio < 1),
        {threshold: [1]},
      );

    observer.observe(cachedRef);

    // unmount
    return () => observer.unobserve(cachedRef);
  }, [containerNodeRef]);

  useEffect(() => {
    if (containerNodeRef && containerNodeRef.current && props.onHeightChange) {
      const node = containerNodeRef.current;
      props.onHeightChange(node.clientHeight);
    }
  }, [containerNodeRef, windowWidth, props]);

  return (
    <StickyH2 ref={containerNodeRef} style={{borderBottomColor: isSticky ? highlightColor : 'transparent'}}>
      <HighlightBorder style={{borderColor: highlightColor}}>
        {title}
      </HighlightBorder>
    </StickyH2>
  );
};

export default StickySubHeading;