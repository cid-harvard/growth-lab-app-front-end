import React from 'react';
import HubStickyNav, {LinkItem} from '../../../components/navigation/HubStickyNav';
import {activeLinkColor} from '../Utils';
import {navHeight} from '../../../components/navigation/TopLevelStickyNav';
import {useHistory} from 'react-router-dom';

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
  const history = useHistory();

  const setSearchView = () => {
    setActiveView(View.search);
    if (!history.location.search) {
      history.push('/?query=Albania&#hub');
    }
  };

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
      onClick: setSearchView,
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
