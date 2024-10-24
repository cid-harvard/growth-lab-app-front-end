import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import {Routes} from '../../routing/routes';
import CloudIconSvgPath from '../../assets/cloud-icon.svg';
import {activeLinkColor} from '../../pages/landingPage/Utils';
import GrowthLabWhiteLogo from '../../assets/GL_logo_white.png'

const Root = styled.div`
  left: 0;
  right: 0;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  box-sizing: border-box;
  z-index: 100;
`;

const AppLink = styled(Link)`
  text-decoration: none;
  font-weight: 600;
  text-shadow: 0 0 2px rgba(0 0 0 / 50%);
`;

const Icon = styled.img`
  width: 1.1rem;
  height: 1.1rem;
  transform: translate(0, 1px);
  margin-right: 0.4rem;
`;
// const HarvardLine = styled.div``;
const LogoLine = styled.div`
  display: inline-flex;
  align-items: center;
  position: relative;
  padding: 0 4px 2px 4px;
  z-index: 10;

  &:before {
    content: '';
    position: absolute;
    z-index: -1;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 0.7rem;
    background-color: ${activeLinkColor};
    transition: height 0.2s ease;
  }
`;

const GrowthLabLink = styled.a`
  text-decoration: none;
  font-weight: 600;
`;

const GrowthLabLogo = styled.img`
  max-width: 100%;
  height: 30px;

  @media (max-width: 920px) {
    max-width: 250px;
  }
`;

interface Props {
  staticPosition?: boolean;
  growthLabLinkColor?: string;
  appLinkColor?: string;
  backgroundColor?: string;
}

export default (props: Props) => {
  const {staticPosition, growthLabLinkColor, appLinkColor, backgroundColor} = props;
  return (
    <Root style={{
      position: staticPosition ? 'static' : 'absolute',
      marginBottom: staticPosition ? '2rem' : undefined,
      backgroundColor,
    }}>
      <AppLink
        to={Routes.Landing}
        style={{color: appLinkColor ? appLinkColor : '#fff'}}
      >
        {/* <HarvardLine>Harvard Growth Lab</HarvardLine> */}
        <LogoLine><Icon src={CloudIconSvgPath} /> Viz Hub</LogoLine>
      </AppLink>
      <GrowthLabLink
        href='https://growthlab.hks.harvard.edu/'
        target='_blank'
        style={{color: growthLabLinkColor ? growthLabLinkColor : '#000'}}
      >
        {/* Harvard Growth Lab */}
      <GrowthLabLogo src={GrowthLabWhiteLogo} />
      </GrowthLabLink>
    </Root>
  );
};