import React from 'react';
import Radar from 'react-d3-radar';

export interface Variable {
  key: string;
  label: string;
}

export interface Set extends Variable {
  values: object;
}

interface Props {
  maxValue: number;
  variables: Variable[];
  sets: Set[];
  StyleContainer: (props: any) => JSX.Element;
}

const SpiderChart = (props: Props) => {
  const { maxValue, variables, sets, StyleContainer } = props;

  return (
    <StyleContainer>
      <Radar
        width={500}
        height={500}
        padding={70}
        domainMax={maxValue}
        data={{variables, sets}}/>
    </StyleContainer>
  );
};

export default SpiderChart;