import React from 'react';
import sortBy from 'lodash/sortBy';
import HubCard from '../components/HubCard';
import styled from 'styled-components/macro';
import {
  HubProject,
} from '../graphql/graphQLTypes';

const Root = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

interface Props {
  projects: HubProject[];
}

const GridView = ({projects}: Props) => {
  const sortedProjects = sortBy(projects.filter(({ordering}) => ordering), ['ordering']);
  const cards = sortedProjects.map(project => {
    return (
      <HubCard project={project} key={project.projectName} />
    );
  });
  return (
    <Root>
      {cards}
    </Root>
  );
};

export default GridView;
