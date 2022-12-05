import React, {useEffect, useRef, useState} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';

export const overlayPortalContainerId = 'overlayPortalContainerId';

const overlayPortalZIndex = 3000;

export const OverlayPortal = () => (
  <div
    id={overlayPortalContainerId}
    style={{
      position: 'relative',
      zIndex: overlayPortalZIndex,
    }}
    tabIndex={-1}
  />
);

export const mobileWidth = 600; // in px

const Root = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
`;

interface Dimensions {
  width: string;
  height: string;
}

const Container = styled.div<{dimensions: Dimensions}>`
  position: relative;
  max-height: 90%;
  max-width: ${({dimensions: {width}}) => width};
  height: ${({dimensions: {height}}) => height};

  @media screen and (max-width: ${mobileWidth}px), screen and (max-height: 800px) {
    max-height: calc(100vh - 4rem);
    max-width: calc(100vw - 4rem);
    margin: auto;
    overflow: auto;
  }
`;

const Content = styled.div`
  overflow: auto;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, .1);
  }

  @media screen and (max-width: ${mobileWidth}px), screen and (max-height: 800px) {
    overflow: visible;
  }
`;

export interface Props {
  children: React.ReactNode;
  onClose: (() => void) | undefined;
  width: string;
  height: string;
}

const Modal = (props: Props) => {
  const {
    children, onClose, width, height,
  } = props;

  const overlayPortalContainerNodeRef = useRef<HTMLElement | null>(null);

  const [isModalRendered, setIsModalRendered] = useState<boolean>(false);

  useEffect(() => {
    const node = document.querySelector<HTMLElement>(`#${overlayPortalContainerId}`);
    if (node !== null) {
      overlayPortalContainerNodeRef.current = node;
      overlayPortalContainerNodeRef.current.focus();
      setIsModalRendered(true);
    }
  }, []);

  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose ? onClose() : null;
    document.addEventListener('keydown', closeOnEsc);
    return () => document.removeEventListener('keydown', closeOnEsc);
  }, [onClose]);

  let modal: React.ReactElement<any> | null;
  if (isModalRendered === true && overlayPortalContainerNodeRef.current !== null) {
    modal = createPortal((
      <Root>
        <Overlay onClick={onClose} />
        <Container dimensions={{width, height}}>
          <Content>
            {children}
          </Content>
        </Container>
      </Root>
    ), overlayPortalContainerNodeRef.current);
  } else {
    modal = null;
  }

  return modal;
};

export default Modal;
