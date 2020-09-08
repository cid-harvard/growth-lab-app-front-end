import React from 'react';
import styled, {keyframes} from 'styled-components/macro';
import {Link} from 'react-router-dom';
import {Routes} from '../../routing/routes';
import {
  activeLinkColor,
  backgroundGray,
  backgroundPattern,
} from '../landingPage/Utils';
import {
  secondaryFont,
} from '../../styling/styleUtils';
import LogoIMG from '../landingPage/logo.png';
import raw from 'raw.macro';

const arrowSVG = raw('../landingPage/images/arrow.svg');

const slidein = keyframes`
  from {background-position: top;}
  to {background-position: -200px 0px}
`;

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  padding: 2rem;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top:0;
    left:0;
    z-index: -3;
    background-color: ${backgroundGray};
    width: 100%;
    height: 100%;
    opacity: 0.9;
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    top:0;
    left:0;
    height: 100%;
    width: 100%;
    background-image: url(${backgroundPattern});
    z-index: -2;
    background-size:cover;
    animation: ${slidein} 20s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
`;

const GrowthLabButton = styled(Link)`
  font-family: ${secondaryFont};
  padding: 8px 16px;
  color: ${backgroundGray};
  background-color: white;
  font-size: 14px;
  border-radius: 16px;
  text-decoration: none;
  display: inline-block;
  position: relative;
  z-index: 30;

  &:hover {
    color: ${activeLinkColor};
  }
`;

const Arrow = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  display: inline-block;
  margin-left: 0.75em;

  svg {
    width: 100%;
    height: 100%;

    polygon {
      fill: ${activeLinkColor};
    }
  }
`;

const Logo = styled.img`
  width: 100%;
  max-width: 200px;
  position: absolute;
  top: 0;
  left: 0;
  margin: 1rem 2rem;
`;
const PageNotFound = () => {
  return (
    <Root>
      <a
        href='https://growthlab.cid.harvard.edu/'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Logo src={LogoIMG} />
      </a>
      <h1>Uh-oh. The page you are looking for could not be found.</h1>
      <div>
        <GrowthLabButton to={Routes.Landing}>
          Go to the Growth Lab Viz Hub Home Page
          <Arrow
            dangerouslySetInnerHTML={{__html: arrowSVG}}
          />
        </GrowthLabButton>
      </div>
    </Root>
  );
};

export default PageNotFound;