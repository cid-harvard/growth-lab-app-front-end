import React from 'react';
import styled from 'styled-components';

const Root = styled.iframe`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Layout = ({src}: {src: string}) => {
  return (
    <Root src={src} />
  );
};

export default Layout;