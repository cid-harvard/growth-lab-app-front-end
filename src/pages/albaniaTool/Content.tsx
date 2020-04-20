import React, {useState} from 'react';
import { Content } from '../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
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
import GradientHeader from '../../components/text/headers/GradientHeader';
import Helmet from 'react-helmet';
import { TreeNode } from 'react-dropdown-tree-select';
import {
  barChartData,
  barChartOverlayData2,
  testTableColumns1,
  testTableData1,
} from './testData';
import { colorScheme } from './Utils';
import Legend from '../../components/dataViz/Legend';
import ColorScaleLegend from '../../components/dataViz/ColorScaleLegend';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';
import DynamicTable from '../../components/text/DynamicTable';
import raw from 'raw.macro';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import { useHistory } from 'react-router';
import queryString from 'query-string';
import AlbaniaMapSvg from './assets/albania-logo.svg';
import ExploreNextFooter, {SocialType} from '../../components/text/ExploreNextFooter';
import {lighten, rgba} from 'polished';
import {updateScatterPlotData, CSVDatum as ScatterPlotCSVDatum} from './transformers/transformScatterplotData';
import HowToReadDots from '../../components/dataViz/HowToReadDots';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
    Script,
    SubSectionEnum,
    NACEIndustry,
} from '../../graphql/graphQLTypes';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import ViabilityRadarChart from './components/ViabilityRadarChart';
import AttractivenessRadarChart from './components/AttractivenessRadarChart';
import FDIStackedBarChart from './components/FDIStackedBarChart';
import FDIBuilderTable from './components/FDIBuilderTable';
import FDITop10List from './components/FDITop10List';

const GET_DATA_FOR_NACE_ID = gql`
  query GetDataForNaceId($naceId: Int!) {
    naceIndustry(naceId: $naceId) {
      naceId
      name
      code
      level
      factors {
        edges {
          node {
            rca
            vRca
            vDist
            vFdipeers
            vContracts
            vElect
            avgViability
            aYouth
            aWage
            aFdiworld
            aExport
            avgAttractiveness
            vText
            aText
            rcaText1
            rcaText2
          }
        }
      }
      fdiMarkets {
        edges {
          node {
            parentCompany
            sourceCountry
            sourceCity
            capexWorld
            capexEurope
            capexBalkans
            projectsWorld
            projectsEurope
            projectsBalkans
          }
        }
      }
      fdiMarketsOvertime {
        edges {
          node {
            destination
            projects0306
            projects0710
            projects1114
            projects1518
          }
        }
      }
    }
  }
`;

interface SuccessResponse {
  naceIndustry: NACEIndustry;
}

interface Variables {
  naceId: number;
}

const albaniaMapData = JSON.parse(raw('./assets/albania-geojson.geojson'));
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

  const initialSelectedIndustry = flattenedChildData.find(({value}) => value === industry);

  const [selectedIndustry, setSelectedIndustry] = useState<TreeNode>(initialSelectedIndustry as TreeNode);
  const updateSelectedIndustry = (val: TreeNode) => {
    setSelectedIndustry(val);
    push(pathname + '?industry=' + val.value + hash);
  };

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

  const getSubsectionText = (subsection: SubSectionEnum, variables?: {key: string, value: string}[]) => {
    const selectedScript = scripts ? scripts.find((script) => script.subsection === subsection) : null;
    if (selectedScript && selectedScript.text) {
      let text = selectedScript.text;
      if (variables) {
        variables.forEach(({key, value}) => text = text.replace(key, value));
      }
      return text;
    } else {
      return 'No script found for ' + subsection;
    }
  };

  const {loading, error, data} = useQuery<SuccessResponse, Variables>(GET_DATA_FOR_NACE_ID,
    {variables: {naceId: parseInt(selectedIndustry.value, 10)}});

  let content: React.ReactElement<any> | null;
  let nav: React.ReactElement<any> | null;
  if (selectedIndustry === undefined) {
    content = null;
    nav = null;
  } else if (loading === true) {
    content = <Loading />;
    nav = null;
  } else if (error !== undefined) {
    content = (
      <FullPageError
        message={error.message}
      />
    );
    nav = null;
  } else if (data && data.naceIndustry) {
    const {
      factors: {edges: factorsEdge},
      fdiMarketsOvertime: {edges: fdiMarketsOvertimeEdges},
      fdiMarkets: {edges: fdiMarketsEdges},
    } = data.naceIndustry;
    const factors = factorsEdge && factorsEdge.length && factorsEdge[0] ? factorsEdge[0].node : null;
    content = (
      <>
        <TwoColumnSection id={'overview'}>
          <SectionHeader>{SubSectionEnum.Overview}</SectionHeader>
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
              dangerouslySetInnerHTML={{
                __html: getSubsectionText(SubSectionEnum.Overview, [
                    {key: '<<description>>', value: `<strong>${industryName}</strong>`},
                    {key: '<<v_text>>', value: factors && factors.vText ? factors.vText : 'MISSING VALUE'},
                    {key: '<<a_text>>', value: factors && factors.aText ? factors.aText : 'MISSING VALUE'},
                    {key: '<<rca_text1>>', value: factors && factors.rcaText1 ? factors.rcaText1 : 'MISSING VALUE'},
                    {key: '<<rca_text2>>', value: factors && factors.rcaText2 ? factors.rcaText2 : 'MISSING VALUE'},
                    {key: '<<v_text>>', value: factors && factors.vText ? factors.vText : 'MISSING VALUE'},
                    {key: '<<a_text>>', value: factors && factors.aText ? factors.aText : 'MISSING VALUE'},
                  ]),
              }}
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
          <ViabilityRadarChart industryName={industryName} factors={factors} />
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
          <AttractivenessRadarChart industryName={industryName} factors={factors} />
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
          <FDIStackedBarChart
            selectedIndustry={selectedIndustry}
            fdiMarketsOvertimeEdges={fdiMarketsOvertimeEdges}
          />
          <FDITop10List fdiMarketsEdges={fdiMarketsEdges} />
        </TwoColumnSection>
        <div>
          <SectionHeaderSecondary color={colorScheme.quaternary}>FDI Company Builder</SectionHeaderSecondary>
          <FDIBuilderTable />
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