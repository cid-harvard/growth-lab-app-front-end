import React from 'react';
import sortBy from 'lodash/sortBy';
import ListItem from '../components/ListItem';
import styled from 'styled-components';
import {
  HubProject,
  ProjectCategories,
} from '../graphql/graphQLTypes';
import {
  backgroundGray,
  listViewMediumWidth,
  listViewSmallWidth,
} from '../Utils';
import {
  lightBaseColor,
  secondaryFont,
} from '../../../styling/styleUtils';

const Root = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  margin-left: 1.25rem;
  font-family: ${secondaryFont};
  margin-bottom: 5rem;

  @media (max-width: ${listViewSmallWidth}px) {
    grid-template-columns: auto;
    grid-auto-flow: row;
  }
`;

const TitleCell = styled.div`
  color: ${backgroundGray};
  border-bottom: solid 1px ${lightBaseColor};
  text-align: center;
  padding: 1rem;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (max-width: ${listViewMediumWidth}px) {
    font-size: 0.9rem;
    padding: 0.5rem;
  }

  @media (max-width: ${listViewSmallWidth}px) {
    display: none;
  }
`;

interface Props {
  projects: HubProject[];
}

const ListView = ({projects}: Props) => {
  const atlasProjects: React.ReactElement<any>[] = [];
  const annualBestOf: React.ReactElement<any>[] = [];
  const countryDashboards:  React.ReactElement<any>[] = [];
  const visualStories:  React.ReactElement<any>[] = [];
  const softwarePackages: React.ReactElement<any>[] = [];
  const presentations: React.ReactElement<any>[] = [];
  const prototypes: React.ReactElement<any>[] = [];
  const undefinedProjects: React.ReactElement<any>[] = [];
  const sortedProjects = sortBy(projects, ['projectName']);
  sortedProjects.forEach(project => {
    const projectElm = (
      <ListItem project={project} key={project.projectName} />
    );
    if (project.projectCategory === ProjectCategories.ATLAS_PROJECTS) {
      atlasProjects.push(projectElm);
    } else if (project.projectCategory === ProjectCategories.COUNTRY_DASHBOARDS) {
      countryDashboards.push(projectElm);
    } else if (project.projectCategory === ProjectCategories.VISUAL_STORIES) {
      visualStories.push(projectElm);
    } else if (project.projectCategory === ProjectCategories.SOFTWARE_PACKAGES) {
      softwarePackages.push(projectElm);
    } else if (project.projectCategory === ProjectCategories.PRESENTATIONS) {
      presentations.push(projectElm);
    } else if (project.projectCategory === ProjectCategories.PROTOTYPES_EXPERIMENTS) {
      prototypes.push(projectElm);
    } else if (project.projectCategory === ProjectCategories.ANNUAL_BEST_OF) {
      annualBestOf.push(projectElm);
    } else {
      undefinedProjects.push(projectElm);
    }
  });
  return (
    <Root>
      <TitleCell>Project Name</TitleCell>
      <TitleCell>Project Category</TitleCell>
      <TitleCell>Status</TitleCell>
      <TitleCell>Link</TitleCell>
      {atlasProjects}
      {annualBestOf}
      {countryDashboards}
      {visualStories}
      {softwarePackages}
      {presentations}
      {prototypes}
      {undefinedProjects}
    </Root>
  );
};

export default ListView;
