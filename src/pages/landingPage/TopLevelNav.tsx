import React from 'react';
import { useLocation } from 'react-router';
import TopLevelStickyNav, {NavItem} from '../../components/navigation/TopLevelStickyNav';
import {Routes, hubId} from '../../routing/routes';

interface Props {
  showTitle: boolean;
  linkColor: string;
  activeColor: string;
  backgroundColor: string;
  backgroundImage: string | undefined;
}

const TopLevelNav = (props: Props) => {
  const {
    linkColor, showTitle, activeColor, backgroundColor,
    backgroundImage,
  } = props;

  const {pathname, hash} = useLocation();

  const hubLink: NavItem = pathname === Routes.Landing
    ? { label: 'Hub', target: '#' + hubId, internalLink: true,  active: hash === '#' + hubId}
    : { label: 'Hub', target: Routes.Landing + '#' + hubId, active: false};

  const navLinks: NavItem[] = [
    {...hubLink},
    {label: 'Community', target: Routes.Community, active: pathname === Routes.Community},
    {label: 'About', target: Routes.About,  active: pathname === Routes.About},
  ];

  const title = showTitle ? 'Growth Lab Viz Hub' : '';

  return (
    <TopLevelStickyNav
      id={'growth-lab-app-homepage-navigation'}
      links={navLinks}
      linkColor={linkColor}
      activeColor={activeColor}
      backgroundColor={backgroundColor}
      backgroundImage={backgroundImage}
      title={title}
    />
  );
};

export default TopLevelNav;