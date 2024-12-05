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
import { useNavigate, useLocation } from 'react-router';
import queryString from 'query-string';
import QueryHS from './QueryHS';
import QueryNAICS from './QueryNAICS';
import NamibiaMapSvg from './assets/namibia-logo.svg';

interface Props {
  searchData: Datum[];
  allData: Datum[];
  averageHSFeasibility: number;
  averageHSAttractiveness: number;
  averageNAICSFeasibility: number;
  averageNAICSAttractiveness: number;
  medianHSFeasibility: number;
  medianHSAttractiveness: number;
  medianNAICSFeasibility: number;
  medianNAICSAttractiveness: number;
  employmentFemaleAvg: number;
  employmentLskillAvg: number;
  employmentYouthAvg: number;
}

const NamibiaToolLayout = (props: Props) => {
  const {
    searchData, allData,
    averageHSFeasibility, averageHSAttractiveness,
    averageNAICSFeasibility, averageNAICSAttractiveness,
    medianHSFeasibility, medianHSAttractiveness,
    medianNAICSFeasibility, medianNAICSAttractiveness,
    employmentFemaleAvg, employmentLskillAvg, employmentYouthAvg,
  } = props;
  const title='Namibia’s Industry Targeting Dashboard';
  const metaTitle = title + ' | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Namibia’s industries.';

  const navigate = useNavigate();
  const {pathname, search, hash} = useLocation();
  const parsedQuery = queryString.parse(search);
  const selected = parsedQuery.selected ? parsedQuery.selected : 'HS-1764'; // Default to MOTOR VEHICLES FOR TRANSPORTING GOODS (HS 8704)

  const initialSelectedIndustry = searchData.find(d => d.id === selected);

  const [selectedIndustry, setSelectedIndustry] = useState<Datum>(initialSelectedIndustry as Datum);
  const {productClass, id} = extractIdAndClass(selectedIndustry.id as string);
  const updateSelectedIndustry = (val: Datum) => {
    setSelectedIndustry(val);
    navigate(pathname + '?selected=' + val.id + hash);
  };
  const onNodeClick = (targetId: string) => {
    const target = searchData.find(d => d.id === targetId);
    if (target) {
      setSelectedIndustry(target);
      navigate(pathname + '?selected=' + target.id + hash);
    }
  };

  const [navHeight, setNavHeight] = useState<number>(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(0);
  const scrollBuffer = navHeight + stickyHeaderHeight;

  const links: NavItem[] = [
    {label: 'Overview', target: '#overview', internalLink: true, scrollBuffer},
    { label: 'Industry Characteristics', target: '#industry-now', internalLink: true, scrollBuffer},
    { label: 'Nearby ' + (productClass === ProductClass.HS ? 'Products' : 'Industries'), target: '#nearby-industries', internalLink: true, scrollBuffer},
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
          medianFeasibility={medianHSFeasibility}
          medianAttractiveness={medianHSAttractiveness}
          employmentFemaleAvg={employmentFemaleAvg}
          employmentLskillAvg={employmentLskillAvg}
          employmentYouthAvg={employmentYouthAvg}
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
          medianFeasibility={medianNAICSFeasibility}
          medianAttractiveness={medianNAICSAttractiveness}
          employmentFemaleAvg={employmentFemaleAvg}
          employmentLskillAvg={employmentLskillAvg}
          employmentYouthAvg={employmentYouthAvg}
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
        imageSrc={NamibiaMapSvg}
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
          { label: 'Country Profile', target: 'https://atlas.hks.harvard.edu/countries/516'},
          { label: 'Country Research', target: 'https://growthlab.hks.harvard.edu/applied-research/namibia'},
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
            target: 'https://atlas.hks.harvard.edu/countries/516',
          },
          {
            label: 'Country Research',
            target: 'https://growthlab.hks.harvard.edu/applied-research/namibia',
          },
        ]}
        attributions={[
          'Growth Lab’s Namibia Research Team:  Andrés Fortunato, Douglas Barrios, Miguel Santos, Nikita Taniparti, Sophia Henn, Jorge Tudela and Jessie Lu',
          'Growth Lab’s Digital Development & Design Team:  Annie White, Brendan Leonard, Nil Tuzcu and Kyle Soeltz.',
        ]}
      />
    </ProductClassContext.Provider>
  );
};

export default NamibiaToolLayout;
