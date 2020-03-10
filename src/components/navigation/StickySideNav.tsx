import React from 'react';
import { NavContainer } from '../../styling/Grid';
import styled from 'styled-components';

const Ul = styled.ul`
  position: sticky;
  top: 0;
`;

const StickySideNav = () => {
  return (
    <NavContainer>
      <Ul>
        <li>StickySideNav</li>
      </Ul>
    </NavContainer>
  );
}

export default StickySideNav;