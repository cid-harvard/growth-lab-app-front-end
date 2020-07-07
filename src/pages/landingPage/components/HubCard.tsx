import React, {useState, useRef, useContext} from 'react';
import {AppContext} from '../../../App';
import {
  lightBorderColor,
  secondaryFont,
} from '../../../styling/styleUtils';
import styled from 'styled-components/macro';
import {
  CardSize,
  ProjectDatum,
} from '../useData';
import {
  activeLinkColor,
  backgroundColor,
  darkBlue,
  deepBlue,
} from '../Utils';
import {rgba, darken} from 'polished';


const Root = styled.div`
  min-width: 350px;
  min-height: 420px;
  margin-left: 1.25rem;
  margin-bottom: 2.25rem;
  position: relative;
  padding: 2rem 1rem 0rem 2rem;
  box-sizing: border-box;
  font-family: ${secondaryFont};

  @media (max-width: 700px) {
    min-width: 0;
    width: 100%;
  }
`;

const CalloutBase = styled.div`
  width: 300px;
  height: 300px;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 2rem;

  @media (max-width: 700px) {
    min-width: 0;
    width: 80%;
  }
`;

const Category = styled(CalloutBase)`
  padding-left: 0.35rem;
  box-sizing: border-box;
  background-image: url("${require('../images/pattern.svg')}");
`;

const CategoryText = styled.h2`
  font-size: 0.85rem;
  margin: 0;
  writing-mode: vertical-lr;
  text-orientation: mixed;
  transform: rotate(-180deg);
  text-transform: uppercase;
  padding: 0.3rem 0.1rem;
  background-color: ${backgroundColor};
  color: ${activeLinkColor};
`;

const Content = styled.a`
  display: block;
  border: solid 1px ${lightBorderColor};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  text-decoration: none;

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
  padding: 0.5rem 0.7rem;
  font-size: 1.2rem;
  font-weight: 400;
  color: ${backgroundColor};
  background-color: ${activeLinkColor};
  text-transform: uppercase;
`;

const Title = styled.h1`
  background-color: ${rgba(darken(0.45, activeLinkColor), 0.3)};
  color: #fff;
  padding: 2rem 1.25rem;
  text-transform: uppercase;
  font-weight: 400;
`;

const MetaDataContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 2rem;
  background-image: linear-gradient(to bottom, ${rgba(darkBlue, 0.85)}, ${rgba(deepBlue, 0.85)});
  transition: transform 0.2s ease;
`;
const MetaTitleContainer = styled.h1`
  color: #fff;
  text-transform: uppercase;
  font-weight: 400;
  margin-bottom: 1.75rem;
`;
const MetaDetail = styled.h2`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0 0 0.4rem;
`;

const Cursor = styled.div`
  width: 120px;
  height: 120px;
  background-color: #fff;
  border-radius: 400px;
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  background-image: url("${require('../images/pattern.svg')}");
  background-size: 200%;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${darken(0.25, deepBlue)};
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

  const announcement = project.announcement && (!mouseCoords || windowWidth < 900) ? (
    <AnnouncementBadge>
      <div>
        <AnnouncementText>
          {project.announcement}
        </AnnouncementText>
      </div>
    </AnnouncementBadge>
  ) : null;

  const title = project.card_size === CardSize.Large && !(mouseCoords !== undefined || windowWidth < 900) ? (
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
      Click to<br />view project
    </Cursor>
  ) : null;

  const metaDataStyle: React.CSSProperties = {
    transform: mouseCoords !== undefined || windowWidth < 900 ? 'translate(0)' : 'translate(-100%, 0)',
  };
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
        style={{backgroundImage: `url("${require('../images/' + project.card_image)}")`}}
      >
        {title}
        <MetaDataContainer style={metaDataStyle}>
          <MetaTitleContainer>{project.project_name}</MetaTitleContainer>
          <MetaDetail>Category: {project.project_category}</MetaDetail>
          {status}
        </MetaDataContainer>
        {cursor}
      </Content>
      {announcement}
    </Root>
  );
};

export default HubCard;
