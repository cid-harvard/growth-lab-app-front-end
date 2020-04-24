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
import { colorScheme } from './Utils';
import Legend from '../../components/dataViz/Legend';
import ColorScaleLegend from '../../components/dataViz/ColorScaleLegend';
import DynamicTable from '../../components/text/DynamicTable';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import { useHistory } from 'react-router';
import queryString from 'query-string';
import AlbaniaMapSvg from './assets/albania-logo.svg';
import ExploreNextFooter, {SocialType} from '../../components/text/ExploreNextFooter';
import {lighten, rgba} from 'polished';
import {
  updateScatterPlotData,
  CSVDatum as ScatterPlotCSVDatum,
  NaceIdEnhancedScatterPlotDatum,
} from './transformers/transformScatterplotData';
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
import IndustryNowLocation from './components/IndustryNowLocation';
import IndustryWagesBarChart from './components/IndustryWagesBarChart';
import transformIndustryNowTableData from './transformers/transformIndustryNowTableData';
import styled from 'styled-components/macro';

const StyledP = styled.p`
  a {
    color: ${colorScheme.quaternary};
  }
`;

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
            avgCapex
            avgJobs
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
    content = (
      <>
        <div id={'overview'}>
          <SectionHeader>{SubSectionEnum.Overview}</SectionHeader>
          <StyledP
            dangerouslySetInnerHTML={{
              __html: getSubsectionText(SubSectionEnum.Introduction, [{
                  key: '<link to growth story>',
                  value: '(<a href="https://albania.growthlab.cid.harvard.edu/">View the Country Research</a>)',
                }, {
                  key: 'here <insert link>',
                  value: '(<a href="https://albania.growthlab.cid.harvard.edu/">here</a>)',
                }]),
            }}
          />
        </div>
        <TwoColumnSection>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={updateScatterPlotData(scatterPlotData, selectedIndustry, updateSelectedIndustry)}
            axisLabels={{bottom: 'Viability', left: 'Attractiveness'}}
            axisMinMax={{
              minX: 0,
              maxX: 10,
              minY: 0,
              maxY: 10,
            }}
            showAverageLines={true}
            averageLineText={{
              left: 'Avg. Attractiveness: 5',
              bottom: 'Avg. Viability: 5',
            }}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Overview - ' + industryName}
            jsonToDownload={scatterPlotDataForDownload}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.quaternary}>How Strategic is the Industry?</SubSectionHeader>
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
        <div id={'industry-potential'}>
          <SectionHeader>FDI Company Trading</SectionHeader>
        </div>
        <div>
          <p
            dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.IndustryPotential)}}
          />
        </div>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>FDI Companies</SectionHeaderSecondary>
          <FDIStackedBarChart
            selectedIndustry={selectedIndustry}
            fdiMarketsOvertimeEdges={fdiMarketsOvertimeEdges}
          />
          <FDITop10List fdiMarketsEdges={fdiMarketsEdges} />
        </TwoColumnSection>
        <div>
          <SectionHeaderSecondary color={colorScheme.quaternary}>Custom FDI Companies List</SectionHeaderSecondary>
          <FDIBuilderTable industryName={industryName} fdiMarketsEdges={fdiMarketsEdges} />
        </div>
        <div id={'industry-now'}>
          <SectionHeader>{SubSectionEnum.IndustryNow}</SectionHeader>
        </div>
        <div>
          <p
            dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.IndustryNow)}}
          />
        </div>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>{SubSectionEnum.LocationOfWorkers}</SectionHeaderSecondary>
          <IndustryNowLocation
            locationNode={industryNowLocationNode}
          />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.LocationOfWorkers)}}
            />
            <ColorScaleLegend
              minLabel={0}
              maxLabel={100}
              minColor={lighten(0.55, colorScheme.quaternary)}
              maxColor={colorScheme.quaternary}
              title={'Percentage of industry workers in each region'}
            />
          </TextBlock>
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
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.quaternary}>{SubSectionEnum.NearbyIndustries}</SectionHeaderSecondary>
          <DynamicTable
            columns={nearbyIndustry.columns}
            data={nearbyIndustry.data}
            color={colorScheme.quaternary}
          />
          <TextBlock>
            <p
              dangerouslySetInnerHTML={{__html: getSubsectionText(SubSectionEnum.NearbyIndustries)}}
            />
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
          {label: 'Country Research', target: 'https://albania.growthlab.cid.harvard.edu/'},
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