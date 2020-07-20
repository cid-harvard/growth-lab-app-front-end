import React from 'react';
import HubStickyNav, {LinkItem} from '../../../components/navigation/HubStickyNav';
import {activeLinkColor} from '../Utils';
import {navHeight} from '../../../components/navigation/TopLevelStickyNav';

export enum View {
  grid,
  list,
  search,
}

interface Props {
  activeView: View;
  setActiveView: (val: View) => void;
}

const StickySideNav = (props: Props) => {
  const { activeView, setActiveView} = props;

  const links: LinkItem[] = [
    {
      label: 'Grid',
      onClick: () => setActiveView(View.grid),
      isActive: activeView === View.grid,
    },
    {
      label: 'List',
      onClick: () => setActiveView(View.list),
      isActive: activeView === View.list,
    },
    {
      label: 'Search Keywords',
      onClick: () => setActiveView(View.search),
      isActive: activeView === View.search,
    },
  ];

  return (
    <HubStickyNav
      links={links}
      offsetTop={(navHeight * 16) + 32} // navHeight (in rems) * base font size
      primaryColor={activeLinkColor}
    />
  );
};

export default StickySideNav;
