import React, {useState} from 'react';
import { Content } from '../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
  Light,
  HeaderWithLegend,
  lightBorderColor,
  SubSectionHeader,
  ParagraphHeader,
  SmallParagraph,
  SectionHeaderSecondary,
} from '../../styling/styleUtils';
import StickySubHeading from '../../components/text/StickySubHeading';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import DataViz, {VizType} from '../../components/dataViz';
import TextBlock from '../../components/text/TextBlock';
import PasswordProtectedComponent from '../../components/text/PasswordProtectedComponent';
import InlineToggle from '../../components/text/InlineToggle';
import GradientHeader from '../../components/text/headers/GradientHeader';
import Helmet from 'react-helmet';
import { TreeNode } from 'react-dropdown-tree-select';
import {
  testCountryListData,
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
  testFDIColumns1,
  testFDIData1,
  tripleStackBarChartTestData,
} from './testData';
import Legend from '../../components/dataViz/Legend';
import ColorScaleLegend from '../../components/dataViz/ColorScaleLegend';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import DynamicTable from '../../components/text/DynamicTable';
import QueryTableBuilder from '../../components/tools/QueryTableBuilder';
import raw from 'raw.macro';
import noop from 'lodash/noop';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import { useHistory } from 'react-router';
import queryString from 'query-string';
import AlbaniaMapSvg from './albania-logo.svg';
import ExploreNextFooter, {SocialType} from '../../components/text/ExploreNextFooter';
import {lighten, rgba} from 'polished';
import {updateScatterPlotData, CSVDatum as ScatterPlotCSVDatum} from './transformScatterplotData';
import HowToReadDots from '../../components/dataViz/HowToReadDots';
import {
    Script,
    SubSectionEnum,
} from '../../graphql/graphQLTypes';

const albaniaMapData = JSON.parse(raw('./albania-geojson.geojson'));
const featuresWithValues = albaniaMapData.features.map((feature: any, i: number) => {
  const percent = (i + 1) * 7;
  const properties = {...feature.properties, percent, tooltipContent: `
    <strong>${feature.properties.ADM1_SQ}</strong>: ${percent}%`};
  return {...feature, properties};
});
const geoJsonWithValues = {...albaniaMapData, features: featuresWithValues};

interface Props {
  naceData: TreeNode[];
  scatterPlotData: ScatterPlotDatum[];
  scatterPlotDataForDownload: ScatterPlotCSVDatum[];
  scripts: Script[];
}

const AlbaniaToolContent = (props: Props) => {
  const {
    naceData, scatterPlotData, scatterPlotDataForDownload, scripts,
  } = props;

  const metaTitle = 'Albania’s Industry Targeting Dashboard | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Albania\'s industries.';

  const {location: {pathname, search, hash}, push} = useHistory();
  const parsedQuery = queryString.parse(search);
  const industry = parsedQuery.industry ? parsedQuery.industry : '511'; // Default to Specialised design activities;

  const flattenedChildData: TreeNode[] = [];
  naceData.forEach(({children}: any) =>
    children.forEach((child: TreeNode) =>
      child.children.forEach((grandChild: TreeNode) => flattenedChildData.push(grandChild))));

  const initialSelectedIndustry = industry ? flattenedChildData.find(({value}) => value === industry) : undefined;

  const [selectedIndustry, setSelectedIndustry] = useState<TreeNode | undefined>(initialSelectedIndustry);
  const updateSelectedIndustry = (val: TreeNode) => {
    setSelectedIndustry(val);
    push(pathname + '?industry=' + val.value + hash);
  };

  const [fdiPasswordValue, setFdiPasswordValue] = useState<string>('');

  const [selectedCountry, setSelectedCountry] = useState<TreeNode>(testCountryListData[0]);
  const [navHeight, setNavHeight] = useState<number>(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(0);
  const scrollBuffer = navHeight + stickyHeaderHeight;

  const industryName = selectedIndustry && selectedIndustry.label ? selectedIndustry.label : 'No Industry Selected';

  const links: NavItem[] = [
    {label: 'Overview', target: '#overview', internalLink: true, scrollBuffer},
    {label: 'Industry Potential', target: '#industry-potential', internalLink: true, scrollBuffer},
    {label: 'Industry Now', target: '#industry-now', internalLink: true, scrollBuffer},
  ];
  useScrollBehavior({
    bufferTop: scrollBuffer,
    navAnchors: links.map(({target}) => target),
  });

  const scatterPlotNode = scatterPlotData.find(({label}) => label === industryName);
  const highlighted = scatterPlotNode ? {
      color: scatterPlotNode.fill ? rgba(scatterPlotNode.fill, 0.5) : '#666',
      label: industryName,
    } : undefined;

  let content: React.ReactElement<any> | null;
  let nav: React.ReactElement<any> | null;
  if (selectedIndustry === undefined) {
    content = null;
    nav = null;
  } else {
    const fdiBuilder = fdiPasswordValue === process.env.REACT_APP_ALBANIA_FDI_PASSWORD ? (
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onQueryDownloadClick={noop}
        onUpdateClick={noop}
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
        itemName={'companies'}
        columns={testFDIColumns1}
        tableData={testFDIData1}
      />
    ) : (
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onQueryDownloadClick={noop}
        onUpdateClick={noop}
        selectFields={[
          {
            id: 'country',
            label: 'Source Country',
            data: [testQueryBuilderDataCountry[0]],
            required: true,
          },
          {
            id: 'city',
            label: 'Source City',
            data: [testQueryBuilderDataCity[0]],
            dependentOn: 'country',
          },
        ]}
        itemName={'companies'}
        columns={testFDIColumns1}
        tableData={[]}
        disabled={true}
      />
    );
    const getSubsectionText = (subsection: SubSectionEnum) => {
      const selectedScript = scripts ? scripts.find((script) => script.subsection === subsection) : null;
      if (selectedScript && selectedScript.text) {
        return selectedScript.text;
      } else {
        return 'No script found for ' + subsection;
      }
    }
    content = (
      <>
        <TwoColumnSection id={'overview'}>
          <SectionHeader>Overview</SectionHeader>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={updateScatterPlotData(scatterPlotData, selectedIndustry)}
            axisLabels={{bottom: 'Viability', left: 'Attractiveness'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Overview - ' + industryName}
            jsonToDownload={scatterPlotDataForDownload}
          />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.Overview)}}
            />
            <HowToReadDots
              items={[
                {color: rgba(colorScheme.dataSecondary, 0.5), label: 'RCA < 1'},
                {color: rgba(colorScheme.data, 0.5), label: 'RCA ≥ 1'},
              ]}
              highlighted={highlighted}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'albania-spyder-chart-2'}
            vizType={VizType.RadarChart}
            data={spiderPlotTestData2}
            color={{start: colorScheme.quaternary, end: colorScheme.quaternary}}
            maxValue={100}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Viability Factors - ' + industryName}
            jsonToDownload={spiderPlotTestData2[0]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.quaternary}>Viability Factors</SubSectionHeader>
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.RCAInAlbania}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.RCAInAlbania)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.LowDistanceToIndustry}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.LowDistanceToIndustry)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.HighFDIToPeerCountries}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.HighFDIToPeerCountries)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.LowContractIntensity}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.LowContractIntensity)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.HighElectricityIntensity}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.HighElectricityIntensity)}}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'albania-spyder-chart-3'}
            vizType={VizType.RadarChart}
            data={spiderPlotTestData3}
            color={{start: colorScheme.quaternary, end: colorScheme.quaternary}}
            maxValue={100}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Attractiveness Factors - ' + industryName}
            jsonToDownload={spiderPlotTestData3[0]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.quaternary}>Attractiveness Factors</SubSectionHeader>
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.HighRelativeWages}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.HighRelativeWages)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.HighYouthEmployment}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.HighYouthEmployment)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.HighGlobalFDIFlows}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.HighGlobalFDIFlows)}}
            />
            <ParagraphHeader color={colorScheme.quaternary}>{SubSectionEnum.HighExportPropensity}</ParagraphHeader>
            <SmallParagraph
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.HighExportPropensity)}}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection id={'industry-potential'}>
          <SectionHeader>Industry potential</SectionHeader>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>FDI Companies</SectionHeaderSecondary>
          <DataViz
            id={'albania-company-bar-chart' + selectedCountry.value}
            vizType={VizType.BarChart}
            data={tripleStackBarChartTestData}
            axisLabels={{left: 'US$ Millions'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Identifying Companies - ' + industryName}
            jsonToDownload={getBarChartOverlayData(selectedCountry.value)}
          />
          <TextBlock>
            <HeaderWithLegend legendColor={ (() => {
              if (selectedCountry.value === 'World') {
                return colorScheme.primary;
              }
              if (selectedCountry.value === 'Europe') {
                return colorScheme.quaternary;
              }
              if (selectedCountry.value === 'Balkans') {
                return colorScheme.header;
              }
              return colorScheme.primary;
            })()}>
              <div>
                Top Global FDI in <InlineToggle
                    data={testCountryListData}
                    colorClassName={'albania-color-scheme'}
                    onChange={setSelectedCountry}
                  />
              </div>
            </HeaderWithLegend>
            <ol>
              <li>Planet Food World (PFWC), <Light>Suadi Arabia</Light>
              </li>
              <li>Biopalm Energy, <Light>India</Light>
              </li>
              <li>Al-Bader International Development, <Light>Kuwait</Light>
              </li>
              <li>Heilongjiang Beidahuang, <Light>China</Light>
              </li>
              <li>Chongqing Grain Group, <Light>China</Light>
              </li>
              <li>Charoen Pokphand Group, <Light>Thailand</Light>
              </li>
              <li>Fresh Del Monte Produce, <Light>United States of America</Light>
              </li>
              <li>Herakles Farms, <Light>United States of America</Light>
              </li>
              <li>Nader &amp; Ebrahim, <Light>Bahrain</Light>
              </li>
              <li>Rijk Zwaan, <Light>Netherlands</Light>
              </li>
            </ol>
            <Legend
              legendList={[
                {label: 'Rest of World', fill: colorScheme.primary, stroke: undefined},
                {label: 'Rest of Europe', fill: colorScheme.quaternary, stroke: undefined},
                {label: 'Balkans', fill: colorScheme.header, stroke: undefined},
              ]}
            />
          </TextBlock>
        </TwoColumnSection>
        <div>
          <SectionHeaderSecondary color={colorScheme.quaternary}>FDI Company Builder</SectionHeaderSecondary>
          <PasswordProtectedComponent
            title={'This section is password protected. Please enter your password to access FDI data.'}
            buttonColor={colorScheme.primary}
            onPasswordSubmit={setFdiPasswordValue}
          >
            {fdiBuilder}
          </PasswordProtectedComponent>
        </div>
        <TwoColumnSection id={'industry-now'}>
          <SectionHeader>Industry Now</SectionHeader>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>Location of Workers</SectionHeaderSecondary>
          <DataViz
            id={'albania-geo-map'}
            vizType={VizType.GeoMap}
            data={geoJsonWithValues}
            minColor={lighten(0.5, colorScheme.quaternary)}
            maxColor={colorScheme.quaternary}
          />
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <ColorScaleLegend
              minLabel={0.28}
              maxLabel={30.8}
              minColor={lighten(0.5, colorScheme.quaternary)}
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
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'albania-company-bar-chart-2'}
            vizType={VizType.BarChart}
            data={[barChartData, barChartOverlayData2]}
            axisLabels={{left: 'US$ Millions'}}
          />
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
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
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </TextBlock>
        </TwoColumnSection>
      </>
    );
    nav = (
      <StickySideNav
        links={links}
        backgroundColor={'#ecf0f2'}
        borderColor={'#819ea8'}
        hoverColor={'#b7c7cd'}
        borderTopColor={'#fff'}
        onHeightChange={(h) => setNavHeight(h)}
        marginTop={stickyHeaderHeight + 'px'}
      />
    );
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
        title={'Albania’s Industry Targeting Dashboard'}
        hasSearch={true}
        searchLabelText={'To Start Select an Industry:'}
        data={naceData}
        onChange={updateSelectedIndustry}
        initialSelectedValue={initialSelectedIndustry}
        imageSrc={AlbaniaMapSvg}
        imageProps={{
          imgWidth: '110px',
        }}
        backgroundColor={colorScheme.header}
        textColor={'#fff'}
        linkColor={'#fff'}
        links={[
          {label: 'Country Profile', target: 'https://atlas.cid.harvard.edu/countries/4'},
          {label: 'Country Research', target: '#'},
        ]}
      />
      {nav}
      <Content>
        <StickySubHeading
          title={industryName}
          highlightColor={colorScheme.primary}
          onHeightChange={(h) => setStickyHeaderHeight(h)}
        />
        {content}
      </Content>
      <ExploreNextFooter
        backgroundColor={colorScheme.quaternary}
        socialItems={[
          {
            target: 'https://www.facebook.com/HarvardCID/',
            type: SocialType.facebook,
          },
          {
            target: 'https://twitter.com/HarvardGrwthLab',
            type: SocialType.twitter,
          },
          {
            target: 'https://www.linkedin.com/company/center-for-international-development-harvard-university/',
            type: SocialType.linkedin,
          },
        ]}
        exploreNextLinks={[
          {
            label: 'Country Profile',
            target: 'https://atlas.cid.harvard.edu/countries/4',
          },
          {
            label: 'Country Research',
            target: '#',
          },
        ]}
        attributions={[
          'Growth Lab’s Albania Research Team:  Miguel Santos, Ermal Frasheri, Timothy O’Brien, Daniela Muhaj, Patricio Goldstein and Jessie Lu.',
          'Growth Lab’s Digital Development & Design Team:  Annie White, Brendan Leonard, Nil Tuzcu and Kyle Soeltz.',
        ]}
      />
    </>
  );
};

export default AlbaniaToolContent;