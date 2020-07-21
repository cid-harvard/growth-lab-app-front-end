import React, {useState, useRef, useContext} from 'react';
import {AppContext} from '../../../App';
import {
  secondaryFont,
} from '../../../styling/styleUtils';
import styled, {StyledComponent} from 'styled-components/macro';
import {
  HubProject,
  CardSizes,
} from '../graphql/graphQLTypes';
import {
  activeLinkColor,
  backgroundColor,
  darkBlue,
  deepBlue,
  getCategoryString,
} from '../Utils';
import {rgba, darken} from 'polished';
import SmartImage from '../../../components/general/SmartImage';

const zigZagPattern = require('../images/pattern.svg');

const Root = styled.div`
  min-width: 30%;
  min-height: 380px;
  margin-left: 2.5%;
  margin-bottom: 2.25rem;
  position: relative;
  padding: 2rem 1rem 0rem 2rem;
  box-sizing: border-box;
  font-family: ${secondaryFont};
  flexGrow: 1;
  box-sizing: border-box;

  @media (max-width: 900px) {
    min-width: 300px;
  }

  @media (max-width: 700px) {
    min-width: 100%;
    width: 100%;
    margin-left: 0;
  }
`;

const CalloutBase = styled.div`
  width: 250px;
  height: 250px;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 2rem;

  @media (max-width: 1050px) {
    min-width: 0;
    width: 80%;
  }
`;

const Category = styled(CalloutBase)`
  padding-left: 0.35rem;
  box-sizing: border-box;
  background-image: url("${zigZagPattern}");
`;

const CategoryText = styled.h2`
  font-size: 0.875rem;
  font-weight: 600;
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
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.4);
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

const ZigZagOverlay = styled.div`
  background-image: url("${zigZagPattern}");
  background-size: cover;
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
`;

const AnnouncementBadge = styled(CalloutBase)`
  pointer-events: none;
  display: flex;
  justify-content: flex-end;
`;

const AnnouncementText = styled.h3`
  margin: 0;
  padding: 0.5rem 0.7rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${backgroundColor};
  background-color: ${activeLinkColor};
  text-transform: uppercase;
`;

const Title = styled.h1`
  background-color: rgba(173, 138, 132, 0.6);
  color: #fff;
  font-size: 1.5rem;
  padding: 2rem 1.25rem;
  text-transform: uppercase;
  font-weight: 400;
  position: relative;
`;

const MetaDataContainerBase = styled.div`
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

const MetaDataContainerSmall = styled(MetaDataContainerBase)`
  @media (min-width: 701px) {
    padding: 1rem;
  }
`;


const MetaTitleContainerBase = styled.h1`
  color: #fff;
  text-transform: uppercase;
  font-weight: 400;
  margin-bottom: 1.75rem;
`;

const MetaTitleContainerSmall = styled(MetaTitleContainerBase)`
  @media (min-width: 701px) {
    font-size: 1.2rem;
  }
`;

const MetaDetailBase = styled.h2`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0 0 0.4rem;
`;

const MetaDetailSmall = styled(MetaDetailBase)`
  @media (min-width: 701px) {
    font-size: 0.9rem;
  }
`;

const Cursor = styled.div`
  width: 95px;
  height: 95px;
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
  font-size: 0.7rem;
  color: ${darken(0.25, deepBlue)};
`;

const StatusText = styled.span`
  text-transform: capitalize;
`;

interface Props {
  project: HubProject;
}

const HubCard = ({project}: Props) => {
  const {windowWidth} = useContext(AppContext);

  const contentRef = useRef<HTMLAnchorElement | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{x: number, y: number} | undefined>(undefined);

  if (!project.link || !project.show) {
    return null;
  }

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
  let maxWidth: string | undefined;
  let MetaDataContainer: StyledComponent<any, any>;
  let MetaTitleContainer: StyledComponent<any, any>;
  let MetaDetail: StyledComponent<any, any>;
  if (project.cardSize === CardSizes.LARGE) {
    MetaDataContainer = MetaDataContainerBase;
    MetaTitleContainer = MetaTitleContainerBase;
    MetaDetail = MetaDetailBase;
    width = '100%';
    maxWidth = '100%';
    flexGrow = 1;
  } else if (project.cardSize === CardSizes.MEDIUM) {
    MetaDataContainer = MetaDataContainerBase;
    MetaTitleContainer = MetaTitleContainerBase;
    MetaDetail = MetaDetailBase;
    width = '60%';
    maxWidth = windowWidth > 900 ? '70%' : undefined;
    flexGrow = 1;
  } else {
    MetaDataContainer = MetaDataContainerSmall;
    MetaTitleContainer = MetaTitleContainerSmall;
    MetaDetail = MetaDetailSmall;
    width = '28%';
    maxWidth = windowWidth > 900 ? '30%' : undefined;
    flexGrow = 1;
  }
  const style: React.CSSProperties = {
    flexGrow, width, maxWidth,
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

  const title = project.cardSize === CardSizes.LARGE && !(mouseCoords !== undefined || windowWidth < 900) ? (
    <Title>{project.projectName}</Title>
  ) : null;

  const status = project.status ? (
    <MetaDetail>Status: <StatusText>{project.status.toLowerCase()}</StatusText></MetaDetail>
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

  const cardImageLo = project.cardImageLo
    ? require('../images/low-res/' + project.cardImageLo + '.jpg')
    : require('../images/image.jpg');
  const cardImageHi = project.cardImageHi
    ? require('../images/high-res/' + project.cardImageHi + '.jpg')
    : require('../images/image.jpg');

  const category = getCategoryString(project.projectCategory);

  const link = project.localFile
    ? require('../internalContent/' + project.link) : project.link;

  return (
    <Root style={style}>
      <Category>
        <CategoryText dangerouslySetInnerHTML={{__html: category}} />
      </Category>
      <Content
        href={link}
        ref={contentRef}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setMouseCoords(undefined)}
      >
        <SmartImage
          lowResSrc={cardImageLo}
          highResSrc={cardImageHi}
        />
        <ZigZagOverlay />
        {title}
        <MetaDataContainer style={metaDataStyle}>
          <MetaTitleContainer>{project.projectName}</MetaTitleContainer>
          <MetaDetail>Category: <span dangerouslySetInnerHTML={{__html: category}} /></MetaDetail>
          {status}
        </MetaDataContainer>
        {cursor}
      </Content>
      {announcement}
    </Root>
  );
};

export default HubCard;
