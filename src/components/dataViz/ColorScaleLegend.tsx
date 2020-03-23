import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.div`
  max-width: 300px;
  display: flex;
  flex-direction: column;
`;

interface ColorScaleBarProps {
  maxColor: string;
  minColor: string;
}

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
`;

const ColorScaleBar = styled.div<ColorScaleBarProps>`
  height: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  background: linear-gradient(
    90deg,
    ${({minColor}) => minColor} 0%,
    ${({maxColor}) => maxColor} 100%
  );
`;

interface Props {
  maxColor: string;
  minColor: string;
  title: string;
  maxLabel: string | number;
  minLabel: string | number;
}

const Legend = (props: Props) => {
  const { minColor, maxColor, maxLabel, minLabel, title } = props;


  return (
    <Root>
      <LabelContainer>
        <div>{minLabel}</div>
        <div>{maxLabel}</div>
      </LabelContainer>
      <ColorScaleBar
        minColor={minColor}
        maxColor={maxColor}
      />
      <p>{title}</p>
    </Root>
  );
};

export default Legend;