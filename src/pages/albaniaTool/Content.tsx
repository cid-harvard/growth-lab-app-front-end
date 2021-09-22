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
import DataViz, {
  VizType,
  Legend,
  HowToReadDots,
} from 'react-fast-charts';
import TextBlock from '../../components/text/TextBlock';
import GradientHeader from '../../components/text/headers/GradientHeader';
import Helmet from 'react-helmet';
import { TreeNode } from 'react-dropdown-tree-select';
import { colorScheme } from './Utils';
import DynamicTable from '../../components/text/DynamicTable';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import { useHistory } from 'react-router';
import queryString from 'query-string';
import AlbaniaMapSvg from './assets/albania-logo.svg';
import ExploreNextFooter from '../../components/text/ExploreNextFooter';
import {rgba} from 'polished';
import {
  updateScatterPlotData,
  CSVDatum as ScatterPlotCSVDatum,
  NaceIdEnhancedScatterPlotDatum,
} from './transformers/transformScatterplotData';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
    Script,
    SubSectionEnum,
    NACEIndustry,
} from './graphql/graphQLTypes';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import ViabilityRadarChart from './components/ViabilityRadarChart';
import AttractivenessRadarChart from './components/AttractivenessRadarChart';
import IndustryNowLocation from './components/IndustryNowLocation';
import IndustryWagesBarChart from './components/IndustryWagesBarChart';
import transformIndustryNowTableData from './transformers/transformIndustryNowTableData';
import styled from 'styled-components/macro';
import {triggerGoogleAnalyticsEvent} from '../../routing/tracking';

const StyledP = styled.p`
  a {
    color: ${colorScheme.quaternary};
  }
`;

const GET_DATA_FOR_NACE_ID = gql`
  query GetDataForNaceId($naceId: Int!) {
    naceIndustry: albaniaNaceIndustry(naceId: $naceId) {
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
            strategy
          }
        }
      }
      industryNowLocation {
        edges {
          node {
            berat
            diber
            durres
            elbasan
            fier
            gjirokaster
            korce
            kukes
            lezhe
            shkoder
            tirane
            vlore
          }
        }
      }
      industryNowSchooling {
        edges {
          node {
            esBelowMale
            esBelowFemale
            lowerSecondaryMale
            lowerSecondaryFemale
            technicalVocationalMale
            technicalVocationalFemale
            hsSomeCollegeMale
            hsSomeCollegeFemale
            universityHigherMale
            universityHigherFemale
          }
        }
      }
      industryNowOccupation {
        edges {
          node {
            managersMale
            managersFemale
            professionalsMale
            professionalsFemale
            techniciansMale
            techniciansFemale
            clericalMale
            clericalFemale
            servicesMale
            servicesFemale
            craftMale
            craftFemale
            assemblyMale
            assemblyFemale
            primaryMale
            primaryFemale
            elementaryMale
            elementaryFemale
            otherMale
            otherFemale
          }
        }
      }
      industryNowNearestIndustry {
        edges {
          node {
            neighborName
            neighborRcaGte1
          }
        }
      }
      industryNowWage {
        edges {
          node {
            ind010k
            ind10k25k
            ind25k50k
            ind50k75k
            ind75k100k
            ind100kUp
            national010k
            national10k25k
            national25k50k
            national50k75k
            national75k100k
            national100kUp
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

interface Props {
  naceData: TreeNode[];
  scatterPlotData: NaceIdEnhancedScatterPlotDatum[];
  scatterPlotDataForDownload: ScatterPlotCSVDatum[];
  scripts: Script[];
  rawNaceData: NACEIndustry[];
}

const AlbaniaToolContent = (props: Props) => {
  const {
    naceData, scatterPlotData, scatterPlotDataForDownload, scripts,
    rawNaceData,
  } = props;

  const title='Albania’s Industry Targeting Dashboard';
  const metaTitle = title + ' | The Growth Lab at Harvard Kennedy School';
  const metaDescription = 'View data visualizations for Albania’s industries.';

  const {location: {pathname, search, hash}, push} = useHistory();
  const parsedQuery = queryString.parse(search);
  const industry = parsedQuery.industry ? parsedQuery.industry : '484'; // Default to Data processing, hosting

  let parent: TreeNode = {label: '', value: 'the industry'};
  const flattenedChildData: TreeNode[] = [];
  naceData.forEach(({children}: any) =>
    children.forEach((child: TreeNode) =>
      child.children.forEach((grandChild: TreeNode) => {
        flattenedChildData.push(grandChild);
        if (grandChild.value === industry) {
          parent = child;
        }
      }),
    ),
  );

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
    {label: 'Industry Now', target: '#industry-now', internalLink: true, scrollBuffer},
    {label: 'Nearby Industries', target: '#nearby-industries', internalLink: true, scrollBuffer},
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

  const overviewLinkDivider = '[LINK]';

  const OverviewText = ({text}: {text: string}) => {
    const textChunks = text.split(overviewLinkDivider).filter(t => t);
    if (textChunks.length === 3) {
      const gaCategory = 'Albania-overview-text-links';
      const gaEvent = 'click-link';
      return (
        <>
          <StyledP>
            <a
              href='https://albania.growthlab.cid.harvard.edu/'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() =>
                triggerGoogleAnalyticsEvent(gaCategory, gaEvent, 'growth_lab_link')
              }
            >
              Harvard Growth Lab research in Albania
            </a> {textChunks[0]} <a
              href='https://docs.google.com/document/d/1p1x3SmNF4ycsVdaE9-As6d9SN9FSYPFRF9ng5a-qVxc/edit?usp=sharing'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() =>
                triggerGoogleAnalyticsEvent(gaCategory, gaEvent, 'methodology_link')
              }
            >here</a> {textChunks[1]} <a
              href='https://atlas.cid.harvard.edu/explore?country=4&product=undefined&year=2017&productClass=HS&target=Product&partner=undefined&startYear=undefined'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() =>
                triggerGoogleAnalyticsEvent(gaCategory, gaEvent, 'atlas_link')
              }
            >Atlas of Economic Complexity
            </a> {textChunks[2]}
          </StyledP>
        </>
      );
    } else {
      return (
        <StyledP
          dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.Introduction, [
            {key: '<<growth_lab_link>>', value: `<a
              href='https://albania.growthlab.cid.harvard.edu/'
              target='_blank'
              rel='noopener noreferrer'
            >
              Harvard Growth Lab research in Albania
            </a>`},
            {key: '<<methodology_link>>', value: `<a
              href='https://docs.google.com/document/d/1p1x3SmNF4ycsVdaE9-As6d9SN9FSYPFRF9ng5a-qVxc/edit?usp=sharing'
              target='_blank'
              rel='noopener noreferrer'
            >here</a>`},
            {key: '<<atlas_link>>', value: `<a
              href='https://atlas.cid.harvard.edu/explore?country=4&product=undefined&year=2017&productClass=HS&target=Product&partner=undefined&startYear=undefined'
              target='_blank'
              rel='noopener noreferrer'
            >Atlas of Economic Complexity
            </a>`},
          ])}}
        />
      );
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
      industryNowLocation: {edges: industryNowLocationEdges},
      industryNowSchooling: {edges: industryNowSchoolingEdges},
      industryNowOccupation: {edges: industryNowOccupationEdges},
      industryNowNearestIndustry: {edges: industryNowNearestIndustryEdges},
      industryNowWage: {edges: IndustryNowWageEdges},
    } = data.naceIndustry;
    const factors = factorsEdge && factorsEdge.length && factorsEdge[0] ? factorsEdge[0].node : null;
    const industryNowLocationNode = industryNowLocationEdges && industryNowLocationEdges.length && industryNowLocationEdges[0]
      ? industryNowLocationEdges[0].node : null;
    const industryNowSchoolingNode = industryNowSchoolingEdges && industryNowSchoolingEdges.length && industryNowSchoolingEdges[0]
      ? industryNowSchoolingEdges[0].node : null;
    const industryNowOccupationNode = industryNowOccupationEdges && industryNowOccupationEdges.length && industryNowOccupationEdges[0]
      ? industryNowOccupationEdges[0].node : null;
    const industryNowNearestIndustryEdge =
      industryNowNearestIndustryEdges !== null
      ? industryNowNearestIndustryEdges : [];
      const industryNowWageEdge =
      IndustryNowWageEdges !== null
      ? IndustryNowWageEdges[0] : null;
    const { schooling, occupation, nearbyIndustry } = transformIndustryNowTableData({
      schoolingNode: industryNowSchoolingNode,
      occupationNode: industryNowOccupationNode,
      nearbyIndustryEdge: industryNowNearestIndustryEdge,
    });
    const strategy = factors && factors.strategy ? factors.strategy : '';
    content = (
      <>
        <div id={'overview'}>
          <SectionHeader>{SubSectionEnum.Overview}</SectionHeader>
          <p
            dangerouslySetInnerHTML={{
              __html: getSubsectionText(SubSectionEnum.Overview),
            }}
          />
        </div>
        <TwoColumnSection>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={updateScatterPlotData(scatterPlotData, selectedIndustry, updateSelectedIndustry)}
            axisLabels={{x: 'Viability', y: 'Attractiveness'}}
            axisMinMax={{
              minX: 0,
              maxX: 10,
              minY: 0,
              maxY: 10,
            }}
            showAverageLines={true}
            averageLineText={{
              x: 'Avg. Viability: 5',
              y: 'Avg. Attractiveness: 5',
            }}
            averageLineValue={{x: 5, y: 5}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Overview - ' + industryName}
            jsonToDownload={scatterPlotDataForDownload}
            quadrantLabels={{
              I: 'Most strategic\nfor investment\npromotion',
              II: 'Strategic if\nviability can\nbe improved',
              III: 'Least strategic\nfor investment\npromotion',
              IV: 'Limited\ngovernment\nsupport\nneeded',
            }}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.quaternary}>How Strategic is the Industry?</SubSectionHeader>
            <div
              dangerouslySetInnerHTML={{
                __html: getSubsectionText(SubSectionEnum.HowStrategicIsTheIndustry, [
                    {key: '<<description>>', value: `<strong>${industryName}</strong>`},
                    {key: '<<v_text>>', value: factors && factors.vText ? factors.vText : 'MISSING VALUE'},
                    {key: '<<a_text>>', value: factors && factors.aText ? factors.aText : 'MISSING VALUE'},
                    {key: '<<rca_text1>>', value: factors && factors.rcaText1 ? factors.rcaText1 : 'MISSING VALUE'},
                    {key: '<<rca_text2>>', value: factors && factors.rcaText2 ? factors.rcaText2 : 'MISSING VALUE'},
                    {key: '<<v_text>>', value: factors && factors.vText ? factors.vText : 'MISSING VALUE'},
                    {key: '<<a_text>>', value: factors && factors.aText ? factors.aText : 'MISSING VALUE'},
                    {key: '<<description>>',
                     value: `<span style="text-transform: lowercase">${industryName}</span>`},
                    {key: '<<strategy>>', value: strategy},
                  ]),
              }}
            />
            <HowToReadDots
              items={[
                {color: rgba(colorScheme.dataSecondary, 0.5), label: 'Not intensively present in Albania'},
                {color: rgba(colorScheme.data, 0.5), label: 'Intensively present in Albania'},
              ]}
              highlighted={highlighted}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <ViabilityRadarChart
            industryName={industryName}
            factors={factors}
            naceId={selectedIndustry.value}
            rawNaceData={rawNaceData}
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
          <AttractivenessRadarChart
            industryName={industryName}
            factors={factors}
            naceId={selectedIndustry.value}
            rawNaceData={rawNaceData}
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
        <div id={'industry-now'}>
          <SectionHeader>{SubSectionEnum.IndustryNow}</SectionHeader>
        </div>
        <div>
          <p
            dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.IndustryNow, [
                {key: '<<description>>',
                 value: `<strong style="text-transform: lowercase">${industryName}</strong>`},
                {key: '<<parent>>', value: parent.label.toLowerCase()},
                ])}}
          />
        </div>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>{SubSectionEnum.LocationOfWorkers}</SectionHeaderSecondary>
          <IndustryNowLocation
            locationNode={industryNowLocationNode}
            sectionHtml={getSubsectionText(SubSectionEnum.LocationOfWorkers)}
          />
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>{SubSectionEnum.EducationDistribution}</SectionHeaderSecondary>
          <DynamicTable
            columns={schooling.columns}
            data={schooling.data}
            color={colorScheme.quaternary}
          />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.EducationDistribution)}}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>{SubSectionEnum.OccupationDistribution}</SectionHeaderSecondary>
          <DynamicTable
            columns={occupation.columns}
            data={occupation.data}
            color={colorScheme.quaternary}
          />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.OccupationDistribution)}}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>{SubSectionEnum.IndustryWages}</SectionHeaderSecondary>
          <IndustryWagesBarChart industryWageEdge={industryNowWageEdge} />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.IndustryWages)}}
            />
            <Legend
              legendList={[
                {label: 'Industry', fill: lightBorderColor, stroke: undefined},
                {label: 'Country', fill: undefined, stroke: colorScheme.quaternary},
              ]}
            />
          </TextBlock>
        </TwoColumnSection>
        <div id={'nearby-industries'}>
          <SectionHeader>{SubSectionEnum.NearbyIndustries}</SectionHeader>
        </div>
        <TwoColumnSection>
          <DynamicTable
            columns={nearbyIndustry.columns}
            data={nearbyIndustry.data}
            color={colorScheme.quaternary}
          />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.NearbyIndustries, [
                  {key: '<<description>>', value: `<strong>${industryName.toLowerCase()}</strong>`},
              ])}}
            />
          </TextBlock>
        </TwoColumnSection>
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

  const introText = (
    <OverviewText
      text={getSubsectionText(SubSectionEnum.Introduction, [
        {key: '<<growth_lab_link>>', value: overviewLinkDivider},
        {key: '<<methodology_link>>', value: overviewLinkDivider},
        {key: '<<atlas_link>>', value: overviewLinkDivider},
      ])}
    />
  );

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
        data={naceData}
        onChange={updateSelectedIndustry}
        initialSelectedValue={selectedIndustry}
        imageSrc={AlbaniaMapSvg}
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
          {label: 'Country Profile', target: 'https://atlas.cid.harvard.edu/countries/4'},
          {label: 'Country Research', target: 'https://albania.growthlab.cid.harvard.edu/'},
        ]}
        introText={introText}
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
        title={title}
        backgroundColor={colorScheme.quaternary}
        exploreNextLinks={[
          {
            label: 'Country Profile',
            target: 'https://atlas.cid.harvard.edu/countries/4',
          },
          {
            label: 'Country Research',
            target: 'https://albania.growthlab.cid.harvard.edu/',
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