import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
} from '../../styling/styleUtils';
import { rgba } from 'polished';

const Root = styled.div`
  display: grid;
  padding-right: 0.5rem;
  overflow: auto;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
`;

const Cell = styled.div`
  border-bottom: solid 1px ${lightBorderColor};
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  padding: 0.45rem;
  background-color: #fff;
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
  color?: string;
  stickFirstCol?: boolean;
  hideGridLines?: boolean;
  fontSize?: string;
}

const DynamicTable = (props: Props) => {
  const {columns, data, color, stickFirstCol, hideGridLines, fontSize} = props;
  const rootStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns.length}, auto)`,
    gridTemplateRows: `repeat(${data.length + 1}, auto)`,
    whiteSpace: stickFirstCol ? 'nowrap' : undefined,
  };
  const tableHeader = columns.map(({label}, i) => {
    const style: React.CSSProperties = {
      color, fontSize,
      textTransform: !color ? 'uppercase' : undefined,
      position: stickFirstCol && i === 0 ? 'sticky' : undefined,
      left: stickFirstCol && i === 0 ? '0' : undefined,
      borderBottom: hideGridLines ? `solid 2px ${lightBorderColor}` : undefined,
    };
    return <Cell style={style} key={label}>{label}</Cell>;
  });
  const rows = data.map((d, i) => {
    const gridRow = i + 2;
    return Object.keys(d).map(function(key: keyof Datum, j) {
      const style: React.CSSProperties = {
        position: stickFirstCol && j === 0 ? 'sticky' : undefined,
        left: stickFirstCol && j === 0 ? '0' : undefined,
        borderRight: stickFirstCol && j === 0
          ? `solid 2px ${lightBorderColor}` : undefined,
        gridRow,
        backgroundColor: gridRow % 2 === 0 || !color ? undefined : rgba(color, 0.2),
        borderBottom: hideGridLines ? 'none' : undefined,
        fontSize,
      };
      const gridColumn = columns.findIndex(c => c.key === key) + 1;
      if (gridColumn) {
        return (<Cell style={style} key={d[key].toString() + i + key}>{d[key]}</Cell>);
      } else {
        return null;
      }
    });
  });
  return (
    <Root style={rootStyle}>
      {tableHeader}
      {rows}
    </Root>
  );
};

export default DynamicTable;