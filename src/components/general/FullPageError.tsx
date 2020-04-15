import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.div`
  background-color: #fbfbfb;
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Text = styled.div`
  margin-top: 2rem;
  color: #333;
`;

interface Props {
  message: string;
}

const FullPageError = ({message}: Props) => {
  return (
    <Root>
      <Text>
        <h3>
          There was an error retrieving the data. Please refresh the page or contact the Growth Lab if this continues
        </h3>
        <p>
          {message}
        </p>
      </Text>
    </Root>
  );
};

export default FullPageError;