import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
  padding: 1rem;
`;

interface Props {
  children: React.ReactNode;
}

const TextBlock = ({children}: Props) => {
  return (
    <Root>
      {children}
    </Root>
  );
}

export default TextBlock;