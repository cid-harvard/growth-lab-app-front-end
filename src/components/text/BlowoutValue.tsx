import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
  padding: 1rem;
  text-align: center;
`;

const Value = styled.div`
  font-weight: 600;
  font-size: 3.75rem;
`;

interface Props {
  color: string;
  value: string | null;
  description: string | null;
}

const TextBlock = ({value, color, description}: Props) => {
  return (
    <Root>
      <Value style={{color}}>{value}</Value>
      <p>{description}</p>
    </Root>
  );
};

export default TextBlock;