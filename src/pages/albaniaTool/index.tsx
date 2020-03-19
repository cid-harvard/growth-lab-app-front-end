import React, {useState} from 'react';
import { Content } from '../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
  Light,
  HeaderWithLegend,
  lightBorderColor,
  InlineTwoColumnSection,
  SubSectionHeader,
  ParagraphHeader,
  SmallParagraph,
  SmallOrderedList,
  NarrowPaddedColumn,
  LargeParagraph,
  SectionHeaderSecondary,
} from '../../styling/styleUtils';
import StickySubHeading from '../../components/text/StickySubHeading';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import DataViz, {VizType} from '../../components/dataViz';
import TextBlock, {Alignment} from '../../components/text/TextBlock';
import InlineToggle from '../../components/text/InlineToggle';
import HeaderWithSearch from '../../components/navigation/HeaderWithSearch';
import Helmet from 'react-helmet';
import { TreeNode } from 'react-dropdown-tree-select';
import {
  testCountryListData,
  testSearchBarData,
  scatterPlotData,
  spiderPlotTestData2,
  spiderPlotTestData3,
  barChartData,
  getBarChartOverlayData,
  colorScheme,
  barChartOverlayData2,
  testTableColumns1,
  testTableData1,
  testQueryBuilderDataCountry,
  testQueryBuilderDataCity,
} from './testData';
import Legend from '../../components/dataViz/Legend';
import ColorScaleLegend from '../../components/dataViz/ColorScaleLegend';
import DynamicTable from '../../components/text/DynamicTable';
import QueryBuilder from '../../components/tools/QueryBuilder';
import raw from 'raw.macro';
import noop from 'lodash/noop';
import useScrollBehavior from '../../hooks/useScrollBehavior';

const albaniaMapData = JSON.parse(raw('./albania-geojson.geojson'));
const featuresWithValues = albaniaMapData.features.map((feature: any, i: number) => {
  const percent = (i + 1) * 7;
  const properties = {...feature.properties, percent, tooltipContent: `
    <strong>${feature.properties.ADM1_SQ}</strong>: ${percent}%`};
  return {...feature, properties};
});
const geoJsonWithValues = {...albaniaMapData, features: featuresWithValues};

const links: NavItem[] = [
  {label: 'Overview', target: '#overview', internalLink: true},
  {label: 'Industry Potential', target: '#industry-potential', internalLink: true},
  {label: 'Industry Now', target: '#industry-now', internalLink: true},
];

const AlbaniaTool = () => {
  const metaTitle = 'Albania Dashboard | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Albania\'s industries.';

  const [selectedIndustry, setSelectedIndustry] = useState<TreeNode | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<TreeNode>(testCountryListData[0]);
  const [navHeight, setNavHeight] = useState<number>(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(0);

  const industryName = selectedIndustry && selectedIndustry.label ? selectedIndustry.label : 'No Industry Selected';

  useScrollBehavior({
    bufferTop: navHeight + stickyHeaderHeight,
    navAnchors: links.map(({target}) => target),
  });

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
        searchLabelText={'Please Select an Industry'}
        data={testSearchBarData}
        onChange={setSelectedIndustry}
      />
      <StickySideNav
        links={links}
        backgroundColor={colorScheme.tertiary}
        hoverColor={colorScheme.secondary}
        borderColor={colorScheme.primary}
        onHeightChange={(h) => setNavHeight(h)}
      />
      <Content>
        <StickySubHeading
          title={industryName}
          highlightColor={colorScheme.tertiary}
          onHeightChange={(h) => setStickyHeaderHeight(h)}
        />
        <TwoColumnSection id={'overview'}>
          <SectionHeader>Overview</SectionHeader>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={scatterPlotData}
            axisLabels={{bottom: 'X Axis', left: 'Y Axis'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Overview - ' + industryName}
            jsonToDownload={scatterPlotData}
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
        <TwoColumnSection>
          <DataViz
            id={'albania-spyder-chart-2'}
            vizType={VizType.RadarChart}
            data={spiderPlotTestData2}
            color={{start: colorScheme.primary, end: colorScheme.primary}}
            maxValue={100}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Viability Factors - ' + industryName}
            jsonToDownload={spiderPlotTestData2[0]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.quaternary}>Viability Factors</SubSectionHeader>
            <ParagraphHeader color={colorScheme.quaternary}>RCA in Albania</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>RCA in Peers</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>Water Intensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>Electricity Intensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>Availability of Inputs</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'albania-spyder-chart-3'}
            vizType={VizType.RadarChart}
            data={spiderPlotTestData3}
            color={{start: colorScheme.primary, end: colorScheme.primary}}
            maxValue={100}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Viability Factors - ' + industryName}
            jsonToDownload={spiderPlotTestData3[0]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.quaternary}>Attractiveness Factors</SubSectionHeader>
            <ParagraphHeader color={colorScheme.quaternary}>RCA in Albania</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>RCA in Peers</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>Water Intensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>Electricity Intensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.quaternary}>Availability of Inputs</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
          </TextBlock>
        </TwoColumnSection>
        <SectionHeader id={'industry-potential'}>Industry potential</SectionHeader>
        <TwoColumnSection columnDefs={'2.5fr 3.5fr'}>
          <SectionHeaderSecondary color={colorScheme.quaternary}>FDI Companies</SectionHeaderSecondary>
          <DataViz
            id={'albania-company-bar-chart' + selectedCountry.value}
            vizType={VizType.BarChart}
            data={barChartData}
            overlayData={getBarChartOverlayData(selectedCountry.value)}
            axisLabels={{left: 'Y Axis Label'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Identifying Companies - ' + industryName}
            jsonToDownload={getBarChartOverlayData(selectedCountry.value)}
          />
          <InlineTwoColumnSection>
            <NarrowPaddedColumn>
              <HeaderWithLegend legendColor={lightBorderColor}>Top Global FDI Companies</HeaderWithLegend>
              <SmallOrderedList>
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
              </SmallOrderedList>
            </NarrowPaddedColumn>
            <NarrowPaddedColumn>
              <HeaderWithLegend legendColor={colorScheme.primary}>
                <div>
                  Top Global FDI in <InlineToggle
                      data={testCountryListData}
                      colorClassName={'albania-orange'}
                      onChange={setSelectedCountry}
                    />
                </div>
              </HeaderWithLegend>
              <SmallOrderedList>
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
              </SmallOrderedList>
            </NarrowPaddedColumn>
          </InlineTwoColumnSection>
        </TwoColumnSection>
        <div>
          <SectionHeaderSecondary color={colorScheme.quaternary}>FDI Company Builder</SectionHeaderSecondary>
          <QueryBuilder
            title={'Customize Your List & Download'}
            fullDownload={{
              label: 'Download the full list of companies',
              onClick: noop,
            }}
            primaryColor={colorScheme.primary}
            onQueryDownloadClick={noop}
            selectFields={[
              {
                id: 'country',
                label: 'Source Country',
                data: testQueryBuilderDataCountry,
                required: true,
              },
              {
                id: 'city',
                label: 'Source City',
                data: testQueryBuilderDataCity,
                dependentOn: 'country',
              },
            ]}
            checkboxes={[
              {
                label: 'Filter #1',
                value: 'Filter #1',
                checked: false,
              },
              {
                label: 'Filter #2',
                value: 'Filter #2',
                checked: false,
              },
              {
                label: 'Filter #3',
                value: 'Filter #3',
                checked: false,
              },
            ]}
          />
        </div>
        <SectionHeader id={'industry-now'}>Industry Now</SectionHeader>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>Location of Workers</SectionHeaderSecondary>
          <DataViz
            id={'albania-geo-map'}
            vizType={VizType.GeoMap}
            data={geoJsonWithValues}
            minColor={colorScheme.tertiary}
            maxColor={colorScheme.quaternary}
          />
          <TextBlock align={Alignment.Center}>
            <LargeParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </LargeParagraph>
            <ColorScaleLegend
              minLabel={0.28}
              maxLabel={30.8}
              minColor={colorScheme.tertiary}
              maxColor={colorScheme.quaternary}
              title={'Percentage of workers in the industry'}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>Industry Wages</SectionHeaderSecondary>
          <DynamicTable
            columns={testTableColumns1}
            data={testTableData1}
            color={colorScheme.quaternary}
          />
          <TextBlock align={Alignment.Center}>
            <LargeParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </LargeParagraph>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'albania-company-bar-chart-2'}
            vizType={VizType.BarChart}
            data={barChartData}
            overlayData={barChartOverlayData2}
            axisLabels={{left: 'Y Axis Label'}}
          />
          <TextBlock align={Alignment.Center}>
            <LargeParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </LargeParagraph>
            <Legend
              legendList={[
                {label: 'Industry', fill: lightBorderColor, stroke: undefined},
                {label: 'Country', fill: undefined, stroke: colorScheme.quaternary},
              ]}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>Occupation Distribution</SectionHeaderSecondary>
          <DynamicTable
            columns={testTableColumns1}
            data={testTableData1}
            color={colorScheme.quaternary}
          />
          <TextBlock align={Alignment.Center}>
            <LargeParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </LargeParagraph>
          </TextBlock>
        </TwoColumnSection>
      </Content>
      <StickySideNav
        links={links}
        backgroundColor={colorScheme.tertiary}
        hoverColor={colorScheme.secondary}
        borderColor={colorScheme.primary}
      />
    </>
  );
};

export default AlbaniaTool;