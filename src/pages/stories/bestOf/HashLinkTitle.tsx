import React from 'react';
import styled from 'styled-components';

const Root = styled.h2`
  position: relative;

  &:hover {
    .anchor-link a {
      display: block;
    }
  }
`;

const AnchorLink = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1.5rem;
  padding-right: 1.5rem;

  a {
    border: none;
    font-weight: 600;
    display: none;
  }
`;

export default ({id, children}: {id: string | undefined, children: React.ReactNode}) => {
  return (
    <Root>
      <AnchorLink className={'anchor-link'}>
        <a href={'#' + id}>#</a>
      </AnchorLink>
      {children}
    </Root>
  );
};