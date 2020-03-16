import React from 'react';
import styled from 'styled-components';

const Root = styled.ul`
  list-style: none;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const LegendBlock = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;
  border: solid 3px transparent;
`;

interface LegendDatum {
  label: string;
  fill: string | undefined;
  stroke: string | undefined;
}

interface Props {
  legendList: LegendDatum[];
}

const Legend = ({legendList}: Props) => {

  const legendItems = legendList.map(({label, fill, stroke}) => (
    <LegendItem key={label + fill + stroke}>
      <LegendBlock
        style={{
          backgroundColor: fill,
          borderColor: stroke,
        }}
      />
      {label}
    </LegendItem>
  ));

  return (
    <Root>
      {legendItems}
    </Root>
  );
};

export default Legend;