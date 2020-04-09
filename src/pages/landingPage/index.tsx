import React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from '../../routing/routes';
import { ContentFull} from '../../styling/Grid';
import {
  Card,
} from '../../styling/styleUtils';
import GradientHeader from '../../components/text/headers/GradientHeader';
import styled from 'styled-components/macro';
import AlbaniaMapSvg from '../albaniaTool/albania-logo.svg';

const Content = styled(ContentFull)`
  display: flex;
  justify-content: space-around;
  align-content: flex-start;
  flex-wrap: wrap;
`;

const CardLinkWrapper = styled(Link)`
  display: block;
  color: inherit;
  text-decoration: inherit;
  width: 30%;
  height: auto;
  flex-shrink: 0;
  margin-bottom: 2rem;
  display: block;

  &:hover {
    color: inherit;
  }

  @media (max-width: 800px) {
    width: 45%;
  }

  @media (max-width: 500px) {
    width: 100%;
  }
`;

const ProjectCard = styled(Card)`
  height: 100%;
  margin-bottom: 0;
`;

const CardTitle = styled.h3`
  color: #4c4c4c;
  text-align: center;
`;

const CardImage = styled.img`
  max-height: 200px;
`;

const LandingPage = () => {
  return (
    <>
      <GradientHeader
        title={'Country Dashboards from Harvard\'s Growth Lab'}
        hasSearch={false}
        imageSrc={''}
        backgroundColor={'#54A3C6'}
        textColor={'#fff'}
        linkColor={'#54A3C6'}
        links={[
          {label: 'Atlas Explore', target: 'https://atlas.cid.harvard.edu/explore/'},
          {label: 'Atlas Country Profiles', target: 'https://atlas.cid.harvard.edu/countries/'},
        ]}
      />
      <Content>
        <CardLinkWrapper to={Routes.AlbaniaTool}>
          <ProjectCard>
            <CardImage src={AlbaniaMapSvg} alt={'Albania’s Industry Targeting Dashboard'} />
            <CardTitle>
              Albania’s Industry Targeting Dashboard
            </CardTitle>
          </ProjectCard>
        </CardLinkWrapper>
        <CardLinkWrapper to={Routes.JordanTool}>
          <ProjectCard>
            <CardTitle>
              Jordan’s Complexity Profile
            </CardTitle>
          </ProjectCard>
        </CardLinkWrapper>
      </Content>
    </>
  );
};

export default LandingPage;