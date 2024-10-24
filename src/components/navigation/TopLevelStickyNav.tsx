import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { scrollToAnchor } from '../../hooks/useScrollBehavior';
import {FullWidthHeaderContent} from '../../styling/Grid';
import HarvardLogo from "../../assets/harvard-logo.png";
import {secondaryFont} from '../../styling/styleUtils';

export const navHeight = 3.375; // in rem

const Root = styled.nav<{$backgroundImage?: string}>`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  transition: background 0.25s ease;

  &:after {
    ${({$backgroundImage}) => $backgroundImage ? "content: '';" : ''}
    display: block;
    position: absolute;
    top:0;
    left:0;
    height: 100%;
    width: 100%;
    ${
      ({$backgroundImage}) => $backgroundImage
        ? 'background-image: url(' + $backgroundImage + ');' : ''
    }
    z-index: -2;
    background-size:cover;
  }
  &:before {
    ${({$backgroundImage}) => $backgroundImage ? "content: '';" : ''}
    display: block;
    position: absolute;
    top:0;
    left:0;
    height: 100%;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ContentContainer = styled(FullWidthHeaderContent)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: ${navHeight}rem;
  padding: 0 0.5rem;
`;

const Title = styled.h1`
  margin: 0;
  text-transform: uppercase;
  font-size: 1rem;
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  font-family: ${secondaryFont};
  text-transform: uppercase;
  margin: 0;
`;
const ListItem = styled.li`
  font-size: 1.1rem;

  &:not(:last-child) {
    margin-right: 2rem;
  }
`;

const linkStyles = `
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  &:hover {
    span {
      width: 100%;
    }
  }
`;

const NavLinkInternal = styled.a`
  ${linkStyles}
`;
const NavLinkExternal = styled(Link)`
  ${linkStyles}
`;

const Underline = styled.span`
  flex-grow: 1;
  width: 0;
  height: 0.3rem;
  background-color: #fff;
  transition: width 0.15s ease;
`;

const HarvardLogoImg = styled.img`
  height: 24px;
  margin-top: auto;
  margin-bottom: auto;
`;

export interface NavItem {
  label: string;
  target: string;
  internalLink?: boolean;
  active: boolean;
}

interface Props {
  id: string;
  title: string;
  links: NavItem[];
  linkColor: string;
  activeColor: string;
  backgroundColor: string;
  backgroundImage?: string;
}

const TopLevelStickyNav = (props: Props) => {
  const {
    links, linkColor, title, activeColor, backgroundColor,
    backgroundImage,
  } = props;

  const {search, pathname} = useLocation();
  const navigate = useNavigate();

  const linkList = links.map(({label, target, internalLink, active}) => {
    const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (internalLink) {
        e.preventDefault();
        navigate(pathname + search + target);
        scrollToAnchor({anchor: target});
      }
    };
    const navLink = internalLink ? (
      <NavLinkInternal
        href={target}
        style={{color: linkColor}}
        onClick={onClick}
      >
        {label}
        <Underline
          style={{
            width: active ? '100%' : undefined,
            background: activeColor,
          }}
        />
      </NavLinkInternal>
    ) : (
      <NavLinkExternal
        to={target}
        style={{color: linkColor}}
      >
        {label}
        <Underline
          style={{
            width: active ? '100%' : undefined,
            background: activeColor,
          }}
        />
      </NavLinkExternal>
    );
    return (
      <ListItem key={label + target}>
        {navLink}
      </ListItem>
    );
  });

  // Add Harvard Logo link to top-level nav, link externally to Harvard website
  linkList.push(
    <a href="http://www.harvard.edu/" target="_blank">
    <HarvardLogoImg src={HarvardLogo} alt="Harvard University" />
    </a>
  )

  return (
    <Root
      style={{background: backgroundColor}}
      $backgroundImage={backgroundImage}
    >
      <ContentContainer>
        <Title style={{color: linkColor}}>
          {title}
        </Title>
        <NavList>
          {linkList}
        </NavList>
      </ContentContainer>
    </Root>
  );
};

export default TopLevelStickyNav;
