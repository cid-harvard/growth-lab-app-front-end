import {
  FullWidthContent,
} from '../../styling/Grid';
import styled from 'styled-components/macro';
import {navHeight} from '../../components/navigation/TopLevelStickyNav';

export const activeLinkColor = '#c2ba4b';
export const backgroundColor = '#e5e6e6';

export const HubContentContainer = styled(FullWidthContent)`
  padding-top: ${navHeight}rem;
  background-color: ${backgroundColor};
  border-bottom: solid 1rem #fff;
`;
