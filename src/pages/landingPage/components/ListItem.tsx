import React, {useState} from 'react';
import {
  HubProject,
} from '../graphql/graphQLTypes';
import styled from 'styled-components/macro';
import {
  lightBaseColor,
  baseColor,
} from '../../../styling/styleUtils';
import {
  listViewMediumWidth,
  listViewSmallWidth,
  getCategoryString,
  backgroundGray,
} from '../Utils';
import {rgba} from 'polished';

const Cell = styled.a`
  text-align: center;
  text-transform: uppercase;
  padding: 2.5rem 1rem;
  border-bottom: solid 1px ${lightBaseColor};
  font-size: 1rem;
  text-decoration: none;
  color: ${baseColor};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${listViewMediumWidth}px) {
    font-size: 0.9rem;
    padding: 1.8rem 0.5rem;
  }

  @media (max-width: ${listViewSmallWidth}px) {
    text-align: left;
    justify-content: flex-start;
    border: none;
    padding: 0.25rem;
    text-transform: none;
    font-size: 0.85rem;
  }
`;

const Title = styled(Cell)`
  text-align: left;
  justify-content: flex-start;
  font-size: 1rem;
  font-weight: 600;
  color: ${backgroundGray};

  @media (max-width: ${listViewMediumWidth}px) {
    font-size: 0.9rem;
  }

  @media (max-width: ${listViewSmallWidth}px) {
    text-transform: uppercase;
    font-size: 1rem;
    padding-top: 1rem;
  }
`;

const Link = styled(Cell)`
  text-transform: none;
  text-align: left;
  display: grid;
  grid-template-columns: 1fr auto;
  font-size: 0.875rem;

  @media (max-width: ${listViewSmallWidth}px) {
    padding-bottom: 1rem;
    border-bottom: solid 1px ${lightBaseColor};
    grid-template-columns: auto auto;
    grid-column-gap: 1rem;
  }
`;

const Anchor = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${lightBaseColor};
`;

const Arrow = styled(Anchor)`
  font-size: 1.1rem;
`;

const MobileTitle = styled.span`
  display: none;

  @media (max-width: ${listViewSmallWidth}px) {
    display: block;
    margin-right: 0.75rem;
    font-weight: 600;
  }
`;

interface Props {
  project: HubProject;
}

const ListItem = (props: Props) => {
  const {
    project:{
      projectName, projectCategory, status,
    }, project,
  } = props;

  const [hovered, setHovered] = useState<boolean>(false);
  const onMouseEnter = () => setHovered(true);
  const onMouseLeave = () => setHovered(false);

  if (!project.link || !project.show) {
    return null;
  }

  const link = project.localFile
    ? require('../internalContent/' + project.link) : project.link;

  const linkText = project.localFile
   ? 'growthlab.app' + link : link.replace(/(^\w+:|^)\/\//, '');
  const category = getCategoryString(projectCategory);

  return (
    <>
      <Title
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(backgroundGray, 0.15) : undefined}}
      >
        {projectName}
      </Title>
      <Cell
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(backgroundGray, 0.15) : undefined}}
      >
        <MobileTitle>Category:</MobileTitle>
        <span dangerouslySetInnerHTML={{__html: category}} />
      </Cell>
      <Cell
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(backgroundGray, 0.15) : undefined}}
      >
        <MobileTitle>Status:</MobileTitle>
        {status}
      </Cell>
      <Link
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(backgroundGray, 0.15) : undefined}}
      >
        <Anchor>{linkText}</Anchor>
        <Arrow>↗</Arrow>
      </Link>
    </>
  );
};

export default ListItem;
