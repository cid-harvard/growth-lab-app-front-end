import React from 'react';
import sortBy from 'lodash/sortBy';
import HubCard from '../components/HubCard';
import styled from 'styled-components/macro';
import {
  ProjectDatum,
} from '../useData';

const Root = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

interface Props {
  data: undefined | {projects: ProjectDatum[]};
}

const GridView = ({data}: Props) => {
  const sortedProjects = data ? sortBy(data.projects.filter(({ordering}) => ordering), ['ordering']) : [];
  const cards = sortedProjects.map(project => {
    return (
      <HubCard project={project} key={project.project_name} />
    );
  });
  return (
    <Root>
      {cards}
    </Root>
  );
};

export default GridView;
