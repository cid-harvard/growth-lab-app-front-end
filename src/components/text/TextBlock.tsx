import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.div`
  padding: 1rem;
`;

export enum Alignment {
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center',
}

interface Props {
  children: React.ReactNode;
  align?: Alignment;
}

const TextBlock = ({children, align}: Props) => {
  let style: React.CSSProperties | undefined;
  if (align === Alignment.Center) {
    style = {margin: 'auto'};
  } else if (align === Alignment.Bottom) {
    style = {marginTop: 'auto'};
  } else {
    style = undefined;
  }
  return (
    <Root style={style}>
      {children}
    </Root>
  );
};

export default TextBlock;