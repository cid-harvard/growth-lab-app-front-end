import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.ul`
  list-style: none;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const LegendBlock = styled.div`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
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