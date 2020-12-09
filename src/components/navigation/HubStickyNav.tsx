import React from 'react';
import styled from 'styled-components/macro';
import {secondaryFont} from '../../styling/styleUtils';

const Root = styled.ul`
  position: sticky;
  top: 0;
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 0.25rem;
`;

// const ListButton = styled.button<{primaryColor: string, isActive: boolean}>`
//   position: relative;
//   background-color: transparent;
//   font-size: 0.85rem;
//   text-transform: uppercase;
//   font-family: ${secondaryFont};
//   padding: 0.25rem 0.25rem;
//   outline: none;

//   &:before {
//     content: '';
//     position: absolute;
//     z-index: -1;
//     bottom: 0;
//     left: 0;
//     right: 0;
//     width: 100%;
//     height: ${({isActive}) => isActive? '0.8rem': '0'};
//     background-color: ${({primaryColor, isActive}) => isActive? primaryColor: 'transparent'};
//     transition: height 0.2s ease;
//   }

//   &:hover, &:focus {
//     &:before {
//       height: 0.8rem;
//       background-color: ${({primaryColor}) => primaryColor};
//     }
//   }
// `;

const ListButton = styled.button<{primaryColor: string, isActive: boolean, $wrap?: boolean}>`
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  font-family: ${secondaryFont};
  font-size: 1.1rem;
  background-color: transparent;
  border: none;
  text-transform: uppercase;
  margin-bottom: 1rem;
  ${({$wrap}) => $wrap ? 'max-width: min-content;' : ''}

  &:hover {
    span {
      width: 100%;
    }
  }

  @media (max-width: 800px) {
    font-size: 0.85rem;
    margin-bottom: 0.8rem;
  }
`;

const Underline = styled.span`
  flex-grow: 1;
  width: 0;
  height: 0.3rem;
  background-color: #fff;
  transition: width 0.15s ease;
`;

export interface LinkItem {
  label: string;
  onClick: () => void;
  isActive: boolean;
  wrap?: boolean;
}

interface Props {
  links: LinkItem[];
  offsetTop?: number;
  primaryColor: string;
}

const HubStickyNav = (props: Props) => {
  const {links, offsetTop, primaryColor} = props;
  const linkItems = links.map(({label, onClick, isActive, wrap}) => (
    <ListItem key={label}>
      <ListButton
        onClick={onClick}
        primaryColor={primaryColor}
        isActive={isActive}
        $wrap={wrap}
      >
        {label}
        <Underline
          style={{
            width: isActive ? '100%' : undefined,
            background: primaryColor,
          }}
        />
      </ListButton>
    </ListItem>
  ));
  return (
    <Root style={{top: offsetTop}}>
      {linkItems}
    </Root>
  );
};

export default HubStickyNav;
