import {
  FullWidthContent,
  FullWidthContentContainer,
} from '../../styling/Grid';
import styled from 'styled-components/macro';
import {navHeight} from '../../components/navigation/TopLevelStickyNav';
import {
  ProjectCategories,
} from './graphql/graphQLTypes';

import {secondaryFont} from '../../styling/styleUtils';

export const activeLinkColor = '#fc9b81';
export const backgroundColor = '#fff';
export const linearGradientBackground = 'linear-gradient(to left, #2f383f, #96c4c5)';
export const backgroundPattern = require('./pattern-background.png');

export const darkBlue = '#2f383f';
export const deepBlue = '#96c4c5';
export const linkBlue = 'rgb(101, 168, 170)';

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

export const getCategoryString = (value: ProjectCategories | null) => {
  if (value === ProjectCategories.ATLAS_PROJECTS) {
    return 'Atlas Projects';
  } else if (value === ProjectCategories.COUNTRY_DASHBOARDS) {
    return 'Country Dashboards';
  } else if (value === ProjectCategories.VISUAL_STORIES) {
    return 'Visual Stories';
  } else if (value === ProjectCategories.PROTOTYPES_EXPERIMENTS) {
    return 'Prototypes&#8203;/&#8203;Experiments';
  } else if (value === ProjectCategories.PRESENTATIONS) {
    return 'Presentations';
  } else if (value === ProjectCategories.SOFTWARE_PACKAGES) {
    return 'Software Packages';
  } else {
    return '';
  }
};

export const queryStringToCategory = (value: string) => {
  return value.toUpperCase() as ProjectCategories;
};

const zigZagPattern = require('./images/pattern.svg');

export const Root = styled(FullWidthContentContainer)`
  padding: 3rem 1rem;
`;

export const ZigZagContentCard = styled.div`
  position: relative;
  z-index: 10;
  padding: 3rem 1rem 1rem 3rem;
  margin-bottom: 4rem;

  &:before {
    content: '';
    width: 300px;
    height: 300px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
    padding-top: 2rem;
    padding-left: 0.35rem;
    box-sizing: border-box;
    background-image: url("${zigZagPattern}");
  }
`;

export const ZigZagContent = styled.div`
  background-color: #f9fdfc;
  color: #474747;
  font-family: ${secondaryFont};
  padding: 3rem;
  font-size: 1.2rem;
  line-height: 1.8;
  position: relative;
  z-index: 10;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -2;
    padding-top: 2rem;
    padding-left: 0.35rem;
    box-sizing: border-box;
    background-image: url("${zigZagPattern}");
    background-size: 300px;
    opacity: 0.3;
  }
`;

export const Title = styled.h1`
  font-weight: 600;
  color: ${linkBlue};
  text-transform: uppercase;
  margin-bottom: 3rem;
  display: flex;
  align-items: flex-end;
  line-height: 0.8;

  &:after {
    content: '';
    margin-left: 0.75rem;
    flex-grow: 1;
    height: 4px;
    background-image: ${linearGradientBackground};
  }
`;

export const Content = styled.p`
  line-height: 1.7;

  a {
    color: ${linkBlue};
    text-decoration: none;

    &:hover {
      border-bottom: solid 1px ${linkBlue};
    }
  }
`;