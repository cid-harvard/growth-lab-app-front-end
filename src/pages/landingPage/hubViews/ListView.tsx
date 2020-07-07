import React from 'react';
import sortBy from 'lodash/sortBy';
import ListItem from '../components/ListItem';
import styled from 'styled-components/macro';
import {
  ProjectDatum,
  Status,
} from '../useData';
import {
  deepBlue,
  listViewMediumWidth,
  listViewSmallWidth,
} from '../Utils';
import {
  lightBaseColor,
  secondaryFont,
} from '../../../styling/styleUtils';
import {darken} from 'polished';

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
  color: ${darken(0.25, deepBlue)};
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
  data: undefined | {projects: ProjectDatum[]};
}

const ListView = ({data}: Props) => {
  const activeProjects:    React.ReactElement<any>[] = [];
  const completeProjects:  React.ReactElement<any>[] = [];
  const archivedProjects:  React.ReactElement<any>[] = [];
  const undefinedProjects: React.ReactElement<any>[] = [];
  const sortedProjects = data ? sortBy(data.projects, ['project_name']) : [];
  sortedProjects.forEach(project => {
    const projectElm = (
      <ListItem project={project} key={project.project_name} />
    );
    if (project.status === Status.Active) {
      activeProjects.push(projectElm);
    } else if (project.status === Status.Complete) {
      completeProjects.push(projectElm);
    } else if (project.status === Status.Archived) {
      archivedProjects.push(projectElm);
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
      {activeProjects}
      {completeProjects}
      {archivedProjects}
      {undefinedProjects}
    </Root>
  );
};

export default ListView;
