import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
} from '../../styling/styleUtils';
import { rgba } from 'polished';

const Root = styled.div`
  display: grid;
  padding-right: 0.5rem;
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
  position: relative;
`;

const GhostContent = styled.div`
  width: 100%;
  height: 1.1rem;
  background-color: ${lightBorderColor};
`;

export enum Align {
  Left = 'left',
  Right = 'right',
  Center = 'center',
}

const alignToFlexValue = (align: Align) => {
  switch (align) {
    case Align.Left:
      return 'flex-start';
    case Align.Right:
      return 'flex-end';
    case Align.Center:
      return 'center';
    default:
      return 'flex-start';
  }
};

export interface Column {
  label: string;
  key: string;
  align?: Align;
}

export interface Datum {
  [key: string]: string | number | null | React.ReactNode;
}

interface Props {
  columns: Column[];
  data: Datum[];
  color?: string;
  stickFirstCol?: boolean;
  hideGridLines?: boolean;
  fontSize?: string;
  verticalGridLines?: boolean;
  invertHeading?: boolean;
  showOverflow?: boolean;
}

const DynamicTable = (props: Props) => {
  const {
    columns, data, color, stickFirstCol, hideGridLines, fontSize, verticalGridLines,
    invertHeading, showOverflow,
  } = props;
  const rootStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns.length}, auto)`,
    gridTemplateRows: `repeat(${data.length + 1}, auto)`,
    overflow: showOverflow ? undefined : 'auto',
  };
  const tableHeader = columns.map(({label, align}, i) => {
    let borderRight: string | undefined;
    if (stickFirstCol && i === 0) {
      borderRight = `solid 2px ${lightBorderColor}`;
    } else if (verticalGridLines) {
      borderRight = `solid 1px ${lightBorderColor}`;
    } else {
      borderRight = undefined;
    }
    const style: React.CSSProperties = {
      color: invertHeading ? '#fff' : color,
      backgroundColor: !invertHeading ? undefined : color,
      fontSize,
      textTransform: !color ? 'uppercase' : undefined,
      position: stickFirstCol && i === 0 ? 'sticky' : undefined,
      left: stickFirstCol && i === 0 ? '0' : undefined,
      borderBottom: (hideGridLines || verticalGridLines) ? `solid 2px ${lightBorderColor}` : undefined,
      borderRight,
      justifyContent: alignToFlexValue(align ? align : Align.Left),
    };
    return <Cell style={style} key={label}>{label}</Cell>;
  });
  const rows = data.map((d, i) => {
    const gridRow = i + 2;
    return Object.keys(d).map(function(key: keyof Datum, j) {
      let borderRight: string | undefined;
      if (stickFirstCol && j === 0) {
        borderRight = `solid 2px ${lightBorderColor}`;
      } else if (verticalGridLines) {
        borderRight = `solid 1px ${lightBorderColor}`;
      } else {
        borderRight = undefined;
      }
      const gridColumn = columns.findIndex(c => c.key === key) + 1;
      const style: React.CSSProperties = {
        position: stickFirstCol && j === 0 ? 'sticky' : undefined,
        left: stickFirstCol && j === 0 ? '0' : undefined,
        borderRight,
        gridRow,
        backgroundColor: gridRow % 2 === 0 || !color ? undefined : rgba(color, 0.2),
        borderBottom: hideGridLines ? 'none' : undefined,
        fontSize,
        gridColumn,
        justifyContent: alignToFlexValue(
          columns[gridColumn - 1] && columns[gridColumn - 1].align ? columns[gridColumn - 1].align as Align : Align.Left,
        ),
      };
      if (gridColumn) {
        if (d[key] !== null) {
          return (<Cell style={style} key={(d[key] as string | number).toString() + i + key}>{d[key]}</Cell>);
        } else {
          const minWidth = gridColumn === 1 ? 120 : undefined;
          return (<Cell style={style} key={i + key.toString()}><GhostContent style={{minWidth}} /></Cell>);
        }
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