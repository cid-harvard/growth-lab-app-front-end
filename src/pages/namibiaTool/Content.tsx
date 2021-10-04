import React, {useState} from 'react';
import Helmet from 'react-helmet';
import GradientHeader from '../../components/text/headers/GradientHeader';
import {rgba} from 'polished';
import { colorScheme } from './Utils';
import OverviewText from './components/OverviewText';
import { Content } from '../../styling/Grid';
import StickySubHeading from '../../components/text/StickySubHeading';
import useFakeQuery from '../../hooks/useFakeQuery';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import {
  SectionHeader,
} from '../../styling/styleUtils';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import ExploreNextFooter from '../../components/text/ExploreNextFooter';
import styled from 'styled-components/macro';

const PlaceholderSpace = styled.div`
  height: 75vh;
`;

const NamibiaToolContent = () => {
  const title='Namibia’s Industry Targeting Dashboard';
  const metaTitle = title + ' | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Namibia’s industries.';

  const [navHeight, setNavHeight] = useState<number>(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(0);
  const scrollBuffer = navHeight + stickyHeaderHeight;

  const links: NavItem[] = [
    {label: 'Overview', target: '#overview', internalLink: true, scrollBuffer},
    {label: 'Major FDI Companies', target: '#major-fdi-companies', internalLink: true, scrollBuffer},
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
    content = (
      <>
        <div id={'overview'}>
          <SectionHeader>Overview</SectionHeader>
        </div>
        <PlaceholderSpace />
        <div id={'major-fdi-companies'}>
          <SectionHeader>Major FDI Companies</SectionHeader>
        </div>
        <PlaceholderSpace />
        <div id={'industry-now'}>
          <SectionHeader>Industry Now</SectionHeader>
        </div>
        <PlaceholderSpace />
        <div id={'nearby-industries'}>
          <SectionHeader>Nearby Industries</SectionHeader>
        </div>
        <PlaceholderSpace />
      </>
    );
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
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
      </Helmet>
      <GradientHeader
        title={title}
        hasSearch={true}
        searchLabelText={'To Start Select an Industry:'}
        data={[]}
        onChange={undefined}
        initialSelectedValue={undefined}
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
        linkColor={'#fff'}
        links={[
          {label: 'Country Profile', target: 'https://atlas.cid.harvard.edu/countries/155'},
          {label: 'Country Research', target: 'https://albania.growthlab.cid.harvard.edu/'},
        ]}
        introText={<OverviewText />}
      />
      {nav}
      <Content>
        <StickySubHeading
          title={'Selected Inudustry Name'}
          highlightColor={colorScheme.primary}
          onHeightChange={(h) => setStickyHeaderHeight(h)}
        />
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
    </>
  );
};

export default NamibiaToolContent;
