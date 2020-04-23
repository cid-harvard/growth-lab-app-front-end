import React from 'react';
import styled from 'styled-components';
import {lighten} from 'polished';

const Root = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 1rem;
  font-size: 0.85rem;
  margin-top: 3rem;
`;

const ListContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li<{color: string}>`
  display: flex;
  align-items: center;
  margin-bottom: 0.55rem;

  &::before {
    content: '';
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2000px;
    background-color: ${({color}) => color};
    margin-right: 0.6rem;
    flex-shrink: 0;
  }
`;

const HighlightedItem = styled(ListItem)`
  margin-left: auto;

  &::before {
    border: solid 0.6rem ${({color}) => lighten(1, color)};
  }
`;

interface LegendItem {
  color: string;
  label: string;
}

interface Props {
  items: LegendItem[];
  highlighted?: LegendItem;
}

const HowToReadDots = ({items, highlighted}: Props) => {
  const legendItems = items.map(({color, label}) => <ListItem color={color} key={label + color}>{label}</ListItem>);
  const highlightedItem = highlighted ? (
    <HighlightedItem color={highlighted.color}>{highlighted.label}</HighlightedItem>
  ) : null;
  return (
    <Root>
      <ListContainer>
        {legendItems}
      </ListContainer>
      {highlightedItem}
    </Root>
  );
};

export default HowToReadDots;