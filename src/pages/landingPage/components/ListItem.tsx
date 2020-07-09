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
  deepBlue,
  listViewMediumWidth,
  listViewSmallWidth,
  getCategoryString,
} from '../Utils';
import {darken, rgba} from 'polished';

const Cell = styled.a`
  text-align: center;
  text-transform: uppercase;
  padding: 2.5rem 1rem;
  border-bottom: solid 1px ${lightBaseColor};
  font-size: 1.1rem;
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
  color: ${darken(0.15, deepBlue)};

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

  @media (max-width: ${listViewSmallWidth}px) {
    font-size: 1rem;
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
      projectName, projectCategory, status, link,
    },
  } = props;

  const [hovered, setHovered] = useState<boolean>(false);
  const onMouseEnter = () => setHovered(true);
  const onMouseLeave = () => setHovered(false);

  if (!link) {
    return null;
  }

  const linkText = link.replace(/(^\w+:|^)\/\//, '');
  const category = getCategoryString(projectCategory);

  return (
    <>
      <Title
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(deepBlue, 0.15) : undefined}}
      >
        {projectName}
      </Title>
      <Cell
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(deepBlue, 0.15) : undefined}}
      >
        <MobileTitle>Category:</MobileTitle>
        {category}
      </Cell>
      <Cell
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(deepBlue, 0.15) : undefined}}
      >
        <MobileTitle>Status:</MobileTitle>
        {status}
      </Cell>
      <Link
        href={link}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{backgroundColor: hovered ? rgba(deepBlue, 0.15) : undefined}}
      >
        <Anchor>{linkText}</Anchor>
        <Anchor>↗</Anchor>
      </Link>
    </>
  );
};

export default ListItem;
