import React from 'react';
import { Content, Footer } from '../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
} from '../../styling/styleUtils';
import StickySubHeading from '../../components/text/StickySubHeading';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import DataViz, {VizType} from '../../components/dataViz';
import TextBlock from '../../components/text/TextBlock';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import HeaderWithSearch from '../../components/navigation/HeaderWithSearch';

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

const colorScheme = {
  primary: '#F1A189',
  secondary: '#F8CCBF',
  tertiary: '#FCEEEB',
}

const links: NavItem[] = [
  {label: 'Overview', target: '#overview'},
  {label: 'Potential', target: '#potential'},
  {label: 'Industry Now', target: '#industry-now'},
  {label: 'Region Matching', target: '#region-matching'},
];

const AlbaniaTool = () => {
  return (
    <>
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
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            </p>
            <p>
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
            </p>
          </TextBlock>
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