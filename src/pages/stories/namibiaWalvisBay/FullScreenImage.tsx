import React, {useState} from 'react';
import styled, {keyframes} from 'styled-components/macro';
import {CloseButtonBig} from '../../../styling/styleUtils';

const Root = styled.div`
  top: 0;
  left: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.1s ease-in-out;
  box-sizing: border-box;
  max-height: 100vh;
`;

const scaleIn = keyframes`{
    from { transform: scale(0.45); }
    to   { transform: scale(1); }
}`;

const Image = styled.img`
  max-width: 100%;
  max-height: 80vh;
  cursor: zoom-in;

  &.scale-in {
    animation: ${scaleIn} 150ms;
  }
`;


const FullScreenImage = ({src}: {src: string}) => {
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  const style: React.CSSProperties = fullscreen ? {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    padding: '4rem',
  } : {};

  const closeButton = fullscreen ? <CloseButtonBig /> : null;

  if(fullscreen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return (
    <Root
      style={style}
      onClick={() => setFullscreen(!fullscreen)}
    >
      <Image
        src={src}
        alt=''
        title=''
        className={fullscreen ? 'scale-in' : undefined}
        style={{cursor: fullscreen ? 'zoom-out' : 'zoom-in'}}
      />
      {closeButton}
    </Root>
  );

};

export default FullScreenImage;
