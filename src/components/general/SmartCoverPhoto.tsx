import React, {useState} from 'react';
import styled from 'styled-components';

const Root = styled.div`
  grid-column: 1 / -1;
  height: 40vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
`;

const Image = styled.img`
  object-fit: cover;
  width: 100%;
  min-height: 100%;
  height: 0;
  grid-row: 1;
  grid-column: 1;
  transition: opacity 0.25s ease;
`;

interface Props {
  lowResSrc: string;
  highResSrc: string;
}

const SmartCoverPhoto = ({highResSrc, lowResSrc}: Props) => {
  const [highResLoaded, setHighResLoaded] = useState<boolean>(false);

  return (
    <Root>
      <Image src={highResSrc} title={''} onLoad={() => setHighResLoaded(true)} />
      <Image src={lowResSrc} title={''} style={{opacity: highResLoaded ? 0 : 1}} />
    </Root>
  );
};

export default SmartCoverPhoto;
