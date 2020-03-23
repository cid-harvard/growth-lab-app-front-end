import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
} from '../../styling/styleUtils';
import { rgba } from 'polished';

const Root = styled.div`
  display: grid;
  padding-right: 0.5rem;
`;

const Cell = styled.div`
  border-bottom: solid 1px ${lightBorderColor};
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  padding: 0.45rem;
`;

export interface Column {
  label: string;
  key: string;
}

export interface Datum {
  [key: string]: string | number;
}

interface Props {
  columns: Column[];
  data: Datum[];
  color: string;
}

const DynamicTable = (props: Props) => {
  const {columns, data, color} = props;
  const rootGrid: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns.length}, auto)`,
    gridTemplateRows: `repeat(${data.length + 1}, auto)`,
  };
  const tableHeader = columns.map(({label}) => <Cell style={{color}} key={label}>{label}</Cell>);
  const rows = data.map((d, i) => {
    const gridRow = i + 2;
    const backgroundColor = gridRow % 2 === 0 ? undefined : rgba(color, 0.08);
    return Object.keys(d).map(function(key: keyof Datum) {
      const gridColumn = columns.findIndex(c => c.key === key) + 1;
      if (gridColumn) {
        return (<Cell style={{gridColumn, gridRow, backgroundColor}} key={d[key].toString() + i}>{d[key]}</Cell>);
      } else {
        return null;
      }
    });
  });
  return (
    <Root style={rootGrid}>
      {tableHeader}
      {rows}
    </Root>
  );
};

export default DynamicTable;