import styled from 'styled-components/macro';

const mediumScreenSize = 800; // in px

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(5rem, 1fr) minmax(auto, 1200px) 1fr;
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: ${mediumScreenSize}px) {
    grid-template-columns: minmax(10rem, 1fr) minmax(auto, 1200px) 1fr;
  }
`;

export const NavColumn = styled.div`
  grid-column: 1;

`;

export const ContentColumn = styled.div`
  grid-column: 2;


`;