import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.ul`
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-wrap: wrap;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.6rem;
  width: 15%;
  margin-right: 0.4rem;
`;

const LegendBlock = styled.div`
  width: 1rem;
  height: 1rem;
  border: solid 3px transparent;
  margin-right: 0.6rem;
  flex-shrink: 0;
`;

const Label = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
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
      <LegendItem key={label + fill + stroke}  title={label}>
        <LegendBlock
          style={{
            backgroundColor: fill,
            borderColor: stroke,
          }}
        />
        <Label>{label}</Label>
      </LegendItem>
  ));

  return (
    <Root>
      {legendItems}
    </Root>
  );
};

export default Legend;