import React from 'react';
import styled, {keyframes} from 'styled-components/macro';

const Root = styled.div`
  background-color: #fbfbfb;
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Ring = styled.div`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
`;
const animation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const ChildBase = styled.div`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #bebebe;
  border-radius: 50%;
  animation: ${animation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #bebebe transparent transparent transparent;
`;

const FirstChild = styled(ChildBase)`
  animation-delay: -0.45s;
`;
const SecondChild = styled(ChildBase)`
  animation-delay: -0.3s;
`;
const ThirdChild = styled(ChildBase)`
  animation-delay: -0.15s;
`;

const Text = styled.div`
  margin-top: 2rem;
  color: #333;
`;

const Loading = () => {
  return (
    <Root>
      <Ring>
        <FirstChild></FirstChild>
        <SecondChild></SecondChild>
        <ThirdChild></ThirdChild>
        <ChildBase></ChildBase>
      </Ring>
      <Text>Loading...</Text>
    </Root>
  );
};

export default Loading;