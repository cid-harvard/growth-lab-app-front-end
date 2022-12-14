import React, { useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import raw from 'raw.macro';

const infoCircleSVG =  raw('../../assets/info-circle.svg');

export enum TooltipPosition {
  Automatic = 'automatic',
  Bottom = 'bottom',
}

export enum TooltipTheme {
  Light = 'light',
  Dark = 'dark',
}

const lightBorderColor = '#dcdcdc'; // really light gray color for subtle borders between elements
const backgroundDark = '#2e353f'; // dark blue gray
const overlayPortalContainerId = 'overlayPortalContainerId';


const farEndOfScreenToggleClass = 'tooltip-at-right-end-of-screen';
export const arrowContainerClassName = 'tooltip-arrow-container-class';
const flipArrowClassName = 'tooltip-arrow-flip-side-class';

//#region Styling
const Root = styled.span`
  cursor: help;
  width: 0.7rem;
  height: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10000px;
  margin: 0 0.4rem;
`;

const MoreInformationI = styled.span`
  display: inline-block;
  width: 0.7rem;
  height: 0.7rem;
  line-height: 0;

  svg {
    width: 100%;
    height: 100%;

    circle {
      fill: ${backgroundDark};
    }

    path {
      fill: #fff;
    }
  }
`;

const TooltipBase = styled.div<{$theme: TooltipTheme | undefined, $overrideStyles: boolean | undefined}>`
  position: fixed;
  z-index: 3000;
  max-width: 16rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  ${({$overrideStyles}) => $overrideStyles ? 'padding-bottom: 0.5rem;' : 'padding: 0.5rem;'}
  opacity: 0;
  transition: opacity 0.15s ease;
  color: ${backgroundDark};
  background-color: ${({$theme}) => $theme === TooltipTheme.Dark ? backgroundDark : '#fff'};
  color: ${({$theme}) => $theme === TooltipTheme.Dark ? '#fff' : backgroundDark};
  border: 1px solid ${({$theme}) => $theme === TooltipTheme.Dark ? backgroundDark : lightBorderColor};
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  pointer-events: none;

  &.${farEndOfScreenToggleClass} .${arrowContainerClassName} {
    justify-content: flex-end;
    padding-right: 0.7rem;
    box-sizing: border-box;
  }

  &.${flipArrowClassName} .${arrowContainerClassName} {
    transform: translate(0, -100%);
    top: 0;

    div {
      &:before {
        top: -1px;
        transform: rotate(180deg);
      }

      &:after {
        transform: rotate(180deg);
      }
    }
  }
`;

const ArrowContainer = styled.div<{$position: TooltipPosition | undefined}>`
  width: 100%;
  height: 0.5rem;
  display: flex;
  justify-content: center;
  position: absolute;
  transform: ${({$position}) => $position === TooltipPosition.Bottom
    ? 'translate(0, -100%)'
    : 'translate(0, 100%)'};
  ${({$position}) => $position === TooltipPosition.Bottom
    ? 'top: 0;'
    : ''}
`;

const Arrow = styled.div<{$theme: TooltipTheme | undefined, $position: TooltipPosition | undefined}>`
  width: 0.5rem;
  height: 0.5rem;
  position: relative;
  z-index: -1;
  display: flex;
  justify-content: center;
  transform: translate(-150%, 0);

  &:before {
    content: '';
    position: absolute;
    top: ${({$position}) => $position === TooltipPosition.Bottom
      ? '-1px' : '0'
    };
    left: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 9px solid ${({$theme}) => $theme === TooltipTheme.Dark ? backgroundDark : lightBorderColor};
    ${({$position}) => $position === TooltipPosition.Bottom
      ? 'transform: rotate(180deg);'
      : ''}
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 1px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid ${({$theme}) => $theme === TooltipTheme.Dark ? backgroundDark : '#fff'};
    ${({$position}) => $position === TooltipPosition.Bottom
      ? 'transform: rotate(180deg);'
      : ''}
  }
`;

const GenericSpan = styled.span`
  cursor: help;
`;
//#endregion
let timeout: number;

interface Props {
  explanation: React.ReactNode | null;
  children?: React.ReactNode;
  cursor?: string;
  theme?: TooltipTheme;
  tooltipPosition?: TooltipPosition;
  overrideStyles?: boolean;
  delay?: number;
}

const Tooltip = (props: Props) => {
  const {
    explanation, children, cursor, theme, tooltipPosition, overrideStyles, delay,
  } = props;
  const rootEl = useRef<HTMLDivElement | null>(null);
  const tooltipEl = useRef<HTMLDivElement | null>(null);
  const overlayPortalContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isTooltipShown, setIsTooltipShown] = useState<boolean>(false);
  const [coords, setCoords] = useState<{top: number, left: number}>({top: 0, left: 0});

  useLayoutEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${overlayPortalContainerId}`);
    overlayPortalContainerNodeRef.current = node;
    const tooltipElm = tooltipEl.current;
    const rootElm = rootEl.current;
    if (tooltipElm !== null && rootElm !== null) {
      const {top, left} = coords;
      const tooltipSpacing = 15;
      const tooltipHeight = tooltipElm.offsetHeight;
      const tooltipWidth = tooltipElm.offsetWidth;
      let tooltipTopValue = top - tooltipSpacing - tooltipHeight;
      let tooltipLeftValue = left - (tooltipWidth / 2);
      if (tooltipTopValue < 0 || tooltipPosition === TooltipPosition.Bottom) {
        // tooltip will be above the window
        tooltipTopValue = top + (tooltipSpacing * 2);
        tooltipElm.classList.add(flipArrowClassName);
      } else {
        tooltipElm.classList.remove(flipArrowClassName);
      }
      if (tooltipLeftValue < tooltipSpacing) {
        tooltipLeftValue = tooltipSpacing;
      }
      if ((tooltipLeftValue + (tooltipWidth + tooltipSpacing)) > window.innerWidth) {
        // tooltip will exceed the windows width
        tooltipLeftValue = window.innerWidth - tooltipWidth - tooltipSpacing;
      }
      if (window.innerWidth - left < tooltipSpacing * 3) {
        // tooltip is at the far end of the screen
        tooltipElm.classList.add(farEndOfScreenToggleClass);
      } else {
        tooltipElm.classList.remove(farEndOfScreenToggleClass);
      }
      tooltipElm.style.cssText = `
        left: ${tooltipLeftValue}px;
        top: ${tooltipTopValue}px;
        opacity: 1;
      `;
    }
  }, [isTooltipShown, coords, tooltipPosition]);
  const overlayPortalContainerNode = overlayPortalContainerNodeRef.current;

  const arrow = overrideStyles ? null : (
    <ArrowContainer $position={tooltipPosition} className={arrowContainerClassName}>
      <Arrow $theme={theme} $position={tooltipPosition} />
    </ArrowContainer>
  );

  let tooltip: React.ReactPortal | null;
  if (isTooltipShown !== false && overlayPortalContainerNode !== null && explanation) {
    tooltip = ReactDOM.createPortal((
      <TooltipBase
        ref={tooltipEl}
        $theme={theme}
        $overrideStyles={overrideStyles}
      >
        {explanation}
        {arrow}
      </TooltipBase>
    ), overlayPortalContainerNode);
  } else {
    tooltip = null;
  }

  const onMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
    if (delay) {
      timeout = setTimeout(() => setIsTooltipShown(true), delay) as any;
    } else {
      setIsTooltipShown(true);
    }
  };
  const onMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
    clearTimeout(timeout);
    setIsTooltipShown(false);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
  };

  if (children !== undefined) {
    return (
      <GenericSpan
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        ref={rootEl}
        style={{cursor}}
      >
        {children}
        {tooltip}
      </GenericSpan>
    );
  } else {
    return (
      <Root
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{cursor}}
        ref={rootEl}
      >
        <MoreInformationI
          dangerouslySetInnerHTML={{__html: infoCircleSVG}}
        />
        {tooltip}
      </Root>
    );
  }
};

export default Tooltip;
