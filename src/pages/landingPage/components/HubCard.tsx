import React, {useState, useRef, useContext} from 'react';
import {AppContext} from '../../../App';
import {
  lightBorderColor,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {
  // ProjectCategory,
  // Announcement,
  // Status,
  CardSize,
  ProjectDatum,
} from '../useData';

const Root = styled.div`
  min-width: 350px;
  min-height: 420px;
  margin-left: 1.25rem;
  margin-bottom: 2.25rem;
  position: relative;
  padding: 2rem 1rem 0rem 2rem;
  box-sizing: border-box;
`;

const CalloutBase = styled.div`
  width: 300px;
  height: 300px;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 2rem;
`;

const Category = styled(CalloutBase)`
  background-color: teal;
  padding-left: 0.5rem;
  box-sizing: border-box;
`;

const CategoryText = styled.h2`
  font-size: 0.85rem;
  margin: 0;
  writing-mode: vertical-lr;
  text-orientation: mixed;
  transform: rotate(-180deg);
`;

const Content = styled.a`
  display: block;
  background-color: salmon;
  border: solid 1px ${lightBorderColor};
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;

  &:hover {
    cursor: none;
  }
`;

const AnnouncementBadge = styled(CalloutBase)`
  pointer-events: none;
  display: flex;
  justify-content: flex-end;
`;

const AnnouncementText = styled.h3`
  margin: 1px 0 0;
  padding: 0;
  font-size: 1rem;
  text-transform: uppercase;
  background-color: red;
`;

const Title = styled.h1`
`;

const MetaDataContainer = styled.div``;
const MetaTitleContainer = styled.h1``;
const MetaDetail = styled.h2``;

const Cursor = styled.div`
  width: 100px;
  height: 100px;
  background-color: #fff;
  border-radius: 400px;
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

interface Props {
  project: ProjectDatum;
}

const HubCard = ({project}: Props) => {
  const {windowWidth} = useContext(AppContext);

  const contentRef = useRef<HTMLAnchorElement | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{x: number, y: number} | undefined>(undefined);

  const onMouseMove = (e: React.MouseEvent) => {
    const node = contentRef.current;
    if (node) {
      const offset = node.getBoundingClientRect();
      const x = e.clientX - offset.left;
      const y = e.clientY - offset.top;
      setMouseCoords({x, y});
    } else {
      setMouseCoords(undefined);
    }
  };

  let flexGrow: number;
  let width: string | undefined;
  if (project.card_size === CardSize.Large) {
    width = '100%';
    flexGrow = 3;
  } else if (project.card_size === CardSize.Medium) {
    width = '54%';
    flexGrow = 3;
  } else {
    width = undefined;
    flexGrow = 1;
  }
  const style: React.CSSProperties = {
    flexGrow, width,
  };

  const announcement = project.announcement && !mouseCoords ? (
    <AnnouncementBadge>
      <div>
        <AnnouncementText>
          {project.announcement}
        </AnnouncementText>
      </div>
    </AnnouncementBadge>
  ) : null;

  const title = project.card_size === CardSize.Large ? (
    <Title>{project.project_name}</Title>
  ) : null;

  const status = project.status ? (
    <MetaDetail>Status: {project.status}</MetaDetail>
  ) : null;

  const cursor = mouseCoords !== undefined ? (
    <Cursor
      style={{
        left: mouseCoords.x,
        top: mouseCoords.y,
      }}
    >
      Click to view project
    </Cursor>
  ) : null;

  const metaData = mouseCoords !== undefined || windowWidth < 900 ? (
    <>
      <MetaDataContainer>
        <MetaTitleContainer>{project.project_name}</MetaTitleContainer>
        <MetaDetail>Category: {project.project_category}</MetaDetail>
        {status}
      </MetaDataContainer>
    </>
  ) : <>{title}</>;
  return (
    <Root style={style}>
      <Category>
        <CategoryText>
          {project.project_category}
        </CategoryText>
      </Category>
      <Content
        href={project.link}
        ref={contentRef}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setMouseCoords(undefined)}
      >
        {metaData}
        {cursor}
      </Content>
      {announcement}
    </Root>
  );
};

export default HubCard;
