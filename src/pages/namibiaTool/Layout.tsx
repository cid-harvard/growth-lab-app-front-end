import React, {useState} from 'react';
import Helmet from 'react-helmet';
import GradientHeaderPanelSearch, {IntroTextPosition} from '../../components/text/headers/GradientHeaderPanelSearch';
import {rgba} from 'polished';
import {
  colorScheme,
  ProductClass,
  extractIdAndClass,
  ProductClassContext,
} from './Utils';
import OverviewText from './components/OverviewText';
import { Content } from '../../styling/Grid';
import useFakeQuery from '../../hooks/useFakeQuery';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import ExploreNextFooter from '../../components/text/ExploreNextFooter';
import {Datum} from 'react-panel-search';
import { useHistory } from 'react-router';
import queryString from 'query-string';
import QueryHS from './QueryHS';
import QueryNAICS from './QueryNAICS';

interface Props {
  searchData: Datum[];
  allData: Datum[];
  averageHSFeasibility: number;
  averageHSAttractiveness: number;
  averageNAICSFeasibility: number;
  averageNAICSAttractiveness: number;
}

const NamibiaToolLayout = (props: Props) => {
  const {
    searchData, allData,
    averageHSFeasibility, averageHSAttractiveness,
    averageNAICSFeasibility, averageNAICSAttractiveness,
  } = props;
  const title='Namibia’s Industry Targeting Dashboard';
  const metaTitle = title + ' | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Namibia’s industries.';

  const {location: {pathname, search, hash}, push} = useHistory();
  const parsedQuery = queryString.parse(search);
  const selected = parsedQuery.selected ? parsedQuery.selected : 'HS-1651'; // Default to Data processing, hosting

  const initialSelectedIndustry = searchData.find(d => d.id === selected);

  const [selectedIndustry, setSelectedIndustry] = useState<Datum>(initialSelectedIndustry as Datum);
  const {productClass, id} = extractIdAndClass(selectedIndustry.id as string);
  const updateSelectedIndustry = (val: Datum) => {
    setSelectedIndustry(val);
    push(pathname + '?selected=' + val.id + hash);
  };
  const onNodeClick = (targetId: string) => {
    const target = searchData.find(d => d.id === targetId);
    if (target) {
      setSelectedIndustry(target);
      push(pathname + '?selected=' + target.id + hash);
    }
  };

  const [navHeight, setNavHeight] = useState<number>(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(0);
  const scrollBuffer = navHeight + stickyHeaderHeight;

  const links: NavItem[] = [
    {label: 'Overview', target: '#overview', internalLink: true, scrollBuffer},
    {label: 'Industry Now', target: '#industry-now', internalLink: true, scrollBuffer},
    {label: 'Nearby Industries', target: '#nearby-industries', internalLink: true, scrollBuffer},
  ];

  useScrollBehavior({
    bufferTop: scrollBuffer,
    navAnchors: links.map(({target}) => target),
  });

  const {loading, error, data} = useFakeQuery();

  let content: React.ReactElement<any> | null;
  let nav: React.ReactElement<any> | null;
  if (loading === true) {
    content = <Loading />;
    nav = null;
  } else if (error !== undefined) {
    content = (
      <FullPageError
        message={error.message}
      />
    );
    nav = null;
  } else if (data) {
    if (productClass === ProductClass.HS) {
      content = (
        <QueryHS
          id={id}
          setStickyHeaderHeight={setStickyHeaderHeight}
          onNodeClick={onNodeClick}
          allData={allData}
          averageFeasibility={averageHSFeasibility}
          averageAttractiveness={averageHSAttractiveness}
        />
      );
    } else if (productClass === ProductClass.NAICS) {
      content = (
        <QueryNAICS
          id={id}
          setStickyHeaderHeight={setStickyHeaderHeight}
          onNodeClick={onNodeClick}
          allData={allData}
          averageFeasibility={averageNAICSFeasibility}
          averageAttractiveness={averageNAICSAttractiveness}
        />
      );
    } else {

      content = (
        <FullPageError
          message={'Invalid Classification'}
        />
      );
    }
    nav = (
      <StickySideNav
        id={'albania-tool-side-navigation'}
        links={links}
        backgroundColor={'#ecf0f2'}
        borderColor={'#819ea8'}
        hoverColor={'#b7c7cd'}
        borderTopColor={'#fff'}
        onHeightChange={(h) => setNavHeight(h)}
        marginTop={stickyHeaderHeight + 'px'}
      />
    );
  } else {
    content = null;
    nav = null;
  }

  return (
    <ProductClassContext.Provider value={productClass}>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
      </Helmet>
      <GradientHeaderPanelSearch
        title={title}
        hasSearch={true}
        searchLabelText={'To Start Select a Product or Industry:'}
        data={searchData}
        onChange={updateSelectedIndustry}
        selectedValue={selectedIndustry}
        imageSrc={undefined}
        imageProps={{
          imgWidth: '110px',
        }}
        primaryColor={colorScheme.header}
        gradient={`linear-gradient(
            0deg,
            rgba(255,255,255,0) 0%,
            ${rgba(colorScheme.header, 0.85)} 100%
          )`
        }
        textColor={'#fff'}
        linkColor={colorScheme.primary}
        links={[
          {label: 'Country Profile', target: 'https://atlas.cid.harvard.edu/countries/155'},
          {label: 'Country Research', target: 'https://albania.growthlab.cid.harvard.edu/'},
        ]}
        introText={<OverviewText />}
        introTextPosition={IntroTextPosition.Bottom}
      />
      {nav}
      <Content>
        {content}
      </Content>
      <ExploreNextFooter
        title={title}
        backgroundColor={colorScheme.quaternary}
        exploreNextLinks={[
          {
            label: 'Country Profile',
            target: 'https://atlas.cid.harvard.edu/countries/155',
          },
          {
            label: 'Country Research',
            target: 'https://albania.growthlab.cid.harvard.edu/',
          },
        ]}
        attributions={[
          'Growth Lab’s Namibia Research Team:  Andrés Fortunato, Douglas Barrios, Miguel Santos, Nikita Taniparti, Sophia Henn',
          'Growth Lab’s Digital Development & Design Team:  Annie White, Brendan Leonard, Nil Tuzcu and Kyle Soeltz.',
        ]}
      />
    </ProductClassContext.Provider>
  );
};

export default NamibiaToolLayout;
