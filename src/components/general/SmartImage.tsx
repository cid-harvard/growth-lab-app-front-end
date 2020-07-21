import React, {useState} from 'react';
import styled from 'styled-components/macro';

const Root = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

const Image = styled.img`
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

interface Props {
  lowResSrc: string;
  highResSrc: string;
}

const SmartImage = ({highResSrc, lowResSrc}: Props) => {
  const [highResLoaded, setHighResLoaded] = useState<boolean>(false);

  return (
    <Root>
      <Image src={highResSrc} title={''} onLoad={() => setHighResLoaded(true)} />
      <Image src={lowResSrc} title={''} style={{opacity: highResLoaded ? 0 : 1}} />
    </Root>
  );
};

export default SmartImage;
