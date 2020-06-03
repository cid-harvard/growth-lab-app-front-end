import {
  FullWidthContent,
} from '../../styling/Grid';
import styled from 'styled-components/macro';
import {navHeight} from '../../components/navigation/TopLevelStickyNav';

export const activeLinkColor = '#c2ba4b';
export const backgroundColor = '#e5e6e6';

export const HubContentContainer = styled(FullWidthContent)`
  padding: ${navHeight}rem 1rem 0;
  background-color: ${backgroundColor};
  border-bottom: solid 1rem #fff;

  @media (max-width: 590px) {
    padding: ${navHeight}rem 0.5rem 0;
  }
`;
