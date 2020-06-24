import React, { useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { lightBorderColor } from '../../styling/styleUtils';
import { overlayPortalContainerId } from '../../Utils';

//#region Styling
const Root = styled.span`
  cursor: help;
  background-color: #333;
  color: white;
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10000px;
  margin-left: 0.5rem;
`;

const MoreInformationI = styled.span`
  font-family: 'Times New Roman', 'Times', 'Georiga', serif;
  font-style: italic;
  font-weight: 600;
`;

const TooltipBase = styled.div`
  position: fixed;
  z-index: 3000;
  width: 16rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.15s ease;
  color: #333;
  background-color: #fff;
  border: 1px solid ${lightBorderColor};
  border-radius: 4px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25);
`;

const GenericSpan = styled.span`
  cursor: help;
`;
//#endregion

interface Props {
  explanation: React.ReactNode;
  children?: React.ReactNode;
  cursor?: string;
}

const Tooltip = (props: Props) => {
  const {explanation, children, cursor} = props;
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
      if (tooltipTopValue < 0) {
        // tooltip will be above the window
        tooltipTopValue = top + tooltipSpacing;
      }
      if (tooltipLeftValue < tooltipSpacing) {
        tooltipLeftValue = tooltipSpacing;
      }
      if ((tooltipLeftValue + (tooltipWidth + tooltipSpacing)) > window.innerWidth) {
        // tooltip will exceed the windows width
        tooltipLeftValue = window.innerWidth - tooltipWidth - tooltipSpacing;
      }
      tooltipElm.style.cssText = `
        left: ${tooltipLeftValue}px;
        top: ${tooltipTopValue}px;
        opacity: 1;
      `;
    }
  }, [isTooltipShown, coords]);
  const overlayPortalContainerNode = overlayPortalContainerNodeRef.current;

  let tooltip: React.ReactPortal | null;
  if (isTooltipShown !== false && overlayPortalContainerNode !== null) {
    tooltip = ReactDOM.createPortal((
      <TooltipBase ref={tooltipEl}>
        {explanation}
      </TooltipBase>
    ), overlayPortalContainerNode);
  } else {
    tooltip = null;
  }

  const onMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
    setIsTooltipShown(true);
  };
  const onMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    setCoords({top: e.clientY, left: e.clientX});
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
        <MoreInformationI>i</MoreInformationI>
        {tooltip}
      </Root>
    );
  }
};

export default Tooltip;
