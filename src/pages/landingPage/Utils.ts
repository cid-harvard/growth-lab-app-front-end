import {
  FullWidthContent,
} from '../../styling/Grid';
import styled from 'styled-components/macro';
import {navHeight} from '../../components/navigation/TopLevelStickyNav';

export const activeLinkColor = '#fc9b81';
export const backgroundColor = '#e5e6e6';

export const darkBlue = '#2f383f';
export const deepBlue = '#96c4c5';

export const listViewMediumWidth = 1000; // in px
export const listViewSmallWidth = 750; // in px

export const HubContentContainer = styled(FullWidthContent)`
  padding: ${navHeight}rem 1rem 0;
  background-color: ${backgroundColor};
  border-bottom: solid 1rem #fff;

  @media (max-width: 590px) {
    padding: ${navHeight}rem 0.5rem 0;
  }
`;
