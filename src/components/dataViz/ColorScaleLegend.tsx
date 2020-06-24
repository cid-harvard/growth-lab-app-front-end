import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.div`
  margin-top: 3rem;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
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

const ColorScaleBarCustom = styled.div`
  height: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
`;

interface BaseProps {
  title: string;
  maxLabel: string | number;
  minLabel: string | number;
}


type Props = BaseProps & ({
  maxColor: string;
  minColor: string;
  gradientString?: undefined;
} | {
  maxColor?: undefined;
  minColor?: undefined;
  gradientString: string;
});

const Legend = (props: Props) => {
  const { maxLabel, minLabel, title } = props;

  const gradientBar = props.minColor && props.maxColor ? (
    <ColorScaleBar
      minColor={props.minColor}
      maxColor={props.maxColor}
    />
  ) : (
    <ColorScaleBarCustom
      style={{background: props.gradientString}}
    />
  );

  return (
    <Root>
      <LabelContainer>
        <div>{minLabel}</div>
        <div>{maxLabel}</div>
      </LabelContainer>
      {gradientBar}
      <div>{title}</div>
    </Root>
  );
};

export default Legend;