import React from 'react';
import { Content, Footer } from '../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
  Light,
  HeaderWithLegend,
  lightBorderColor,
  InlineTwoColumnSection,
} from '../../styling/styleUtils';
import StickySubHeading from '../../components/text/StickySubHeading';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import DataViz, {VizType} from '../../components/dataViz';
import TextBlock from '../../components/text/TextBlock';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import { Datum as BarChartDatum } from '../../components/dataViz/barChart';
import HeaderWithSearch from '../../components/navigation/HeaderWithSearch';
import Helmet from 'react-helmet';

const colorScheme = {
  primary: '#F1A189',
  secondary: '#F8CCBF',
  tertiary: '#FCEEEB',
};

const scatterPlotData: ScatterPlotDatum[] = [
  {
    label: 'Boston',
    x: 7,
    y: 4,
    tooltipContent: 'Tooltip Content',
    fill: 'red',
  },
  {
    label: 'Cambridge',
    x: 5,
    y: 8,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    radius: 10,
  },
  {
    label: 'Somerville',
    x: 2,
    y: 11,
    tooltipContent: 'Tooltip Content',
    fill: 'blue',
    radius: 5,
  },
  {
    label: 'Acton',
    x: 6,
    y: 3,
    tooltipContent: 'Tooltip Content',
  },
  {
    label: 'Stow',
    x: 10,
    y: 4,
    tooltipContent: 'Tooltip Content',
    radius: 6,
  },
];

const barChartData: BarChartDatum[] = [
  {
    x: 'Boston',
    y: 4,
    tooltipContent: 'Tooltip Content',
    fill: lightBorderColor,
  },
  {
    x: 'Cambridge',
    y: 8,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    fill: lightBorderColor,
  },
  {
    x: 'Somerville',
    y: 11,
    tooltipContent: 'Tooltip Content',
    fill: lightBorderColor,
  },
  {
    x: 'Acton',
    y: 3,
    tooltipContent: 'Tooltip Content',
    fill: lightBorderColor,
  },
  {
    x: 'Stow',
    y: 4,
    fill: lightBorderColor,
  },
];

const barChartOverlayData: BarChartDatum[] = [
  {
    x: 'Boston',
    y: 2,
    tooltipContent: 'Tooltip Content',
    fill: colorScheme.primary,
  },
  {
    x: 'Cambridge',
    y: 4,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    fill: colorScheme.primary,
  },
  {
    x: 'Somerville',
    y: 7,
    tooltipContent: 'Tooltip Content',
    fill: colorScheme.primary,
  },
  {
    x: 'Acton',
    y: 1,
    tooltipContent: 'Tooltip Content',
    fill: colorScheme.primary,
  },
  {
    x: 'Stow',
    y: 3,
    fill: colorScheme.primary,
  },
];

const links: NavItem[] = [
  {label: 'Overview', target: '#overview'},
  {label: 'Potential', target: '#potential'},
  {label: 'Industry Now', target: '#industry-now'},
  {label: 'Region Matching', target: '#region-matching'},
];

const AlbaniaTool = () => {
  const metaTitle = 'Albania Dashboard | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Albania\'s industries.';

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
      </Helmet>
      <HeaderWithSearch
        title={'Albania Complexity Analysis'}
        searchLabelTest={'Please Select an Industry'}
      />
      <StickySideNav
        links={links}
        backgroundColor={colorScheme.tertiary}
        hoverColor={colorScheme.secondary}
        borderColor={colorScheme.primary}
      />
      <Content>
        <StickySubHeading
          title={'Food & Agriculture'}
          highlightColor={colorScheme.tertiary}
        />
        <TwoColumnSection id={'overview'}>
          <SectionHeader>Overview</SectionHeader>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={scatterPlotData}
            axisLabels={{bottom: 'X Axis', left: 'Y Axis'}}
          />
          <TextBlock>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection columnDefs={'2.5fr 3fr'}>
          <SectionHeader>Identifying Companies</SectionHeader>
          <DataViz
            id={'albania-company-bar-chart'}
            vizType={VizType.BarChart}
            data={barChartData}
            overlayData={barChartOverlayData}
            axisLabels={{left: 'Y Axis Label'}}
          />
          <InlineTwoColumnSection>
            <div>
              <HeaderWithLegend legendColor={lightBorderColor}>Top Global FDI Companies</HeaderWithLegend>
              <ol>
                <li>Planet Food World (PFWC)
                  <br /><Light>Suadi Arabia</Light>
                </li>
                <li>Biopalm Energy
                  <br /><Light>India</Light>
                </li>
                <li>Al-Bader International Development
                  <br /><Light>Kuwait</Light>
                </li>
                <li>Heilongjiang Beidahuang
                  <br /><Light>China</Light>
                </li>
                <li>Chongqing Grain Group
                  <br /><Light>China</Light>
                </li>
                <li>Charoen Pokphand Group
                  <br /><Light>Thailand</Light>
                </li>
                <li>Fresh Del Monte Produce
                  <br /><Light>United States of America</Light>
                </li>
                <li>Herakles Farms
                  <br /><Light>United States of America</Light>
                </li>
                <li>Nader &amp; Ebrahim
                  <br /><Light>Bahrain</Light>
                </li>
                <li>Rijk Zwaan
                  <br /><Light>Netherlands</Light>
                </li>
              </ol>
            </div>
            <div>
              <HeaderWithLegend legendColor={colorScheme.primary}>Top Global FDI in Europe</HeaderWithLegend>
              <ol>
                <li>Planet Food World (PFWC)
                  <br /><Light>Suadi Arabia</Light>
                </li>
                <li>Biopalm Energy
                  <br /><Light>India</Light>
                </li>
                <li>Al-Bader International Development
                  <br /><Light>Kuwait</Light>
                </li>
                <li>Heilongjiang Beidahuang
                  <br /><Light>China</Light>
                </li>
                <li>Chongqing Grain Group
                  <br /><Light>China</Light>
                </li>
                <li>Charoen Pokphand Group
                  <br /><Light>Thailand</Light>
                </li>
                <li>Fresh Del Monte Produce
                  <br /><Light>United States of America</Light>
                </li>
                <li>Herakles Farms
                  <br /><Light>United States of America</Light>
                </li>
                <li>Nader &amp; Ebrahim
                  <br /><Light>Bahrain</Light>
                </li>
                <li>Rijk Zwaan
                  <br /><Light>Netherlands</Light>
                </li>
              </ol>
            </div>
          </InlineTwoColumnSection>
        </TwoColumnSection>
      </Content>
      <StickySideNav
        links={links}
        backgroundColor={colorScheme.tertiary}
        hoverColor={colorScheme.secondary}
        borderColor={colorScheme.primary}
      />
      <Footer>
        Footer
      </Footer>
    </>
  );
};

export default AlbaniaTool;