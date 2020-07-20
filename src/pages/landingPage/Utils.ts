import {
  FullWidthContent,
} from '../../styling/Grid';
import styled from 'styled-components/macro';
import {navHeight} from '../../components/navigation/TopLevelStickyNav';
import {
  ProjectCategories,
} from './graphql/graphQLTypes';

export const activeLinkColor = '#fc9b81';
export const backgroundColor = '#e5e6e6';
export const linearGradientBackground = 'linear-gradient(to left, #2f383f, #96c4c5)';
export const backgroundPattern = require('./pattern-background.png');

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

export const getCategoryString = (value: ProjectCategories | null) => {
  if (value === ProjectCategories.ATLAS_PROJECTS) {
    return 'Atlas Projects';
  } else if (value === ProjectCategories.COUNTRY_DASHBOARDS) {
    return 'Country Dashboards';
  } else if (value === ProjectCategories.VISUAL_STORIES) {
    return 'Visual Stories';
  } else if (value === ProjectCategories.PROTOTYPES_EXPERIMENTS) {
    return 'Prototypes/Experiments';
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
