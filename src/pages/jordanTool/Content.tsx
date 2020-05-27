import React, {useState} from 'react';
import Helmet from 'react-helmet';
import GradientHeader from '../../components/text/headers/GradientHeader';
import { Content } from '../../styling/Grid';
import StickySubHeading from '../../components/text/StickySubHeading';
import ExploreNextFooter, {defaultSocialIcons} from '../../components/text/ExploreNextFooter';
import useFetchData, {colorScheme} from './fetchData';
import { TreeNode } from 'react-dropdown-tree-select';
import DataViz, {VizType} from '../../components/dataViz';
import {
  TwoColumnSection,
  SectionHeader,
  SmallParagraph,
  SubSectionHeader,
  ParagraphHeader,
  HeaderWithLegend,
  Light,
  SectionHeaderSecondary,
  InlineTwoColumnSection,
  lightBorderColor,
} from '../../styling/styleUtils';
import Legend from '../../components/dataViz/Legend';
import HowToReadDots from '../../components/dataViz/HowToReadDots';
import ColorScaleLegend from '../../components/dataViz/ColorScaleLegend';
import DynamicTable from '../../components/text/DynamicTable';
import TextBlock, {Alignment} from '../../components/text/TextBlock';
import BlowoutValue from '../../components/text/BlowoutValue';
import {lighten, rgba} from 'polished';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import JordanLogoSVG from './jordan-dotted-map.svg';
import {JordanIndustry} from './graphql/graphQLTypes';
import queryString from 'query-string';
import { useHistory } from 'react-router';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import staticText from './data/staticText';

interface Props {
  industryList: TreeNode[];
  rawIndustryList: JordanIndustry[];
}

const JordanTool = (props: Props) => {
  const {
    industryList, rawIndustryList,
  } = props;
  const metaTitle = 'A Roadmap for Export Diversification: Jordan’s Complexity Profile';
  const metaDescription = 'This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.';


  const {location: {pathname, search, hash}, push} = useHistory();
  const parsedQuery = queryString.parse(search);
  const industry = parsedQuery.industry ? parsedQuery.industry : '161'; // default to vegetables and melons

  const flattenedChildData: TreeNode[] = [];
  industryList.forEach(({children}: any) =>
    children.forEach((child: TreeNode) => flattenedChildData.push(child)));

  const initialSelectedIndustry = flattenedChildData.find(({value}) => value === industry);

  const [selectedIndustry, setSelectedIndustry] = useState<TreeNode>(initialSelectedIndustry as TreeNode);
  const updateSelectedIndustry = (val: TreeNode) => {
    setSelectedIndustry(val);
    push(pathname + '?industry=' + val.value + hash);
  };
  const {data, loading, error} = useFetchData({variables: {
    id: selectedIndustry ? selectedIndustry.value : '161',
  }, rawIndustryList, setSelectedIndustry: updateSelectedIndustry});

  const [navHeight, setNavHeight] = useState<number>(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number>(0);
  const scrollBuffer = navHeight + stickyHeaderHeight;

  const links: NavItem[] = [
    {label: 'Overview', target: '#overview', internalLink: true, scrollBuffer},
    {label: 'Industry Potential', target: '#industry-potential', internalLink: true, scrollBuffer},
    {label: 'Industry Now', target: '#industry-now', internalLink: true, scrollBuffer},
  ];
  useScrollBehavior({
    bufferTop: scrollBuffer,
    navAnchors: links.map(({target}) => target),
  });

  let content: React.ReactElement<any> | null;
  if (loading) {
    content = <Loading />;
  } else if (error) {
    console.error(error);
    content = (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data !== undefined) {
    const {
      scatterPlotData, scatterPlotCsvData,
      viabilityData, viabilityCsvData,
      attractivenessData, attractivenessCsvData,
      globalTopFdiList, regionTopFdiList,
      sectorTableColumns, sectorTableData,
      wagesTableColumns, wagesTableData,
      schoolTableColumns, schoolTableData,
      occupationTableColumns, occupationTableData,
      jordanGeoJson, jordanMapMinVal, jordanMapMaxVal,
      wageHistogramData,
      overTimeHistogramData, overTimeHistogramCsvData,
      text, control,
    } = data;
    const industryName: string = selectedIndustry ? selectedIndustry.label : '';
    const scatterPlotNode = scatterPlotData.find(({label}) => label === industryName);
    const highlighted = scatterPlotNode ? {
      color: scatterPlotNode.fill ? scatterPlotNode.fill : '#666',
      label: industryName,
    } : undefined;
    const globalTopFdiListElms = globalTopFdiList.map(({company, sourceCountry, rank}) => (
        <li key={rank}>{company},<br /><Light>{sourceCountry}</Light></li>
      ));
    const regionTopFdiListElms = regionTopFdiList.map(({company, sourceCountry, rank}) => (
        <li key={rank}>{company},<br /><Light>{sourceCountry}</Light></li>
      ));
    const fdiBarSection = control.fdi ? (
        <>
          <DataViz
            id={'jordan-fdi-bar-chart'}
            vizType={VizType.BarChart}
            data={overTimeHistogramData}
            axisLabels={{left: 'USD'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Foreign Direct Investment - ' + industryName}
            jsonToDownload={overTimeHistogramCsvData}
          />
          <InlineTwoColumnSection>
            <TextBlock>
              <HeaderWithLegend legendColor={colorScheme.lightGray}>
                <div>
                  {staticText.industryPotential.globalFdi}
                </div>
              </HeaderWithLegend>
              <ol>
                {globalTopFdiListElms}
              </ol>
            </TextBlock>
            <TextBlock>
              <HeaderWithLegend legendColor={colorScheme.primary}>
                <div>
                  {staticText.industryPotential.menaFdi}
                </div>
              </HeaderWithLegend>
              <ol>
                {regionTopFdiListElms}
              </ol>
            </TextBlock>
          </InlineTwoColumnSection>
        </>
      ) : (
        <>
          <DataViz
            id={'jordan-company-bar-chart'}
            vizType={VizType.Error}
            message={'No Data'}
          />
          <TextBlock align={Alignment.Center}>
            <strong>{selectedIndustry.label}</strong> could not be matched with disaggregated data on Foreign Direct Investments.
          </TextBlock>
        </>) ;
    const womenAndHighSkill = control.women ? (
      <TwoColumnSection>
        <BlowoutValue
          value={text.percentFemale}
          color={colorScheme.primary}
          description={text.female}
        />
        <BlowoutValue
          value={text.percentHighSkill}
          color={colorScheme.primary}
          description={text.highSkill}
        />
      </TwoColumnSection>
    ) : (
      <p style={{textAlign: 'center'}}>
        There is not enough data for female labor and high-skilled labor for <strong>{selectedIndustry.label}</strong>.
      </p>
    );
    const industryNow = control.labor ? (
      <>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>
            {staticText.industryNow.sectorDemographics}
          </SectionHeaderSecondary>
          <DynamicTable
            columns={sectorTableColumns}
            data={sectorTableData}
            color={colorScheme.primary}
          />
          <TextBlock>
            <p>{text.demographic}</p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>
            {staticText.industryNow.locationOfWorkers}
          </SectionHeaderSecondary>
          <DataViz
            id={'jordan-geo-map'}
            vizType={VizType.GeoMap}
            data={jordanGeoJson}
            minColor={lighten(0.5, colorScheme.primary)}
            maxColor={colorScheme.primary}
          />
          <TextBlock>
            <p>{text.location}</p>
            <ColorScaleLegend
              minLabel={jordanMapMinVal}
              maxLabel={jordanMapMaxVal}
              minColor={lighten(0.5, colorScheme.primary)}
              maxColor={colorScheme.primary}
              title={'Percentage of workers in the industry'}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>
            {staticText.industryNow.schoolingDistribution}
          </SectionHeaderSecondary>
          <DynamicTable
            columns={schoolTableColumns}
            data={schoolTableData}
            color={colorScheme.primary}
          />
          <TextBlock>
            <p>{text.schooling}</p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>
            {staticText.industryNow.industryWages}
          </SectionHeaderSecondary>
          <DynamicTable
            columns={wagesTableColumns}
            data={wagesTableData}
            color={colorScheme.primary}
          />
          <TextBlock>
            <p>{text.avgWage}</p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'jordan-company-bar-chart-2'}
            vizType={VizType.BarChart}
            data={wageHistogramData}
            axisLabels={{left: '% of Workers', bottom: 'Industry Wages (JD)'}}
          />
          <TextBlock>
            <p>{text.wageHist}</p>
            <Legend
              legendList={[
                {label: 'Industry', fill: lightBorderColor, stroke: undefined},
                {label: 'Country', fill: undefined, stroke: colorScheme.primary},
              ]}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>
            {staticText.industryNow.occupationDistribution}
          </SectionHeaderSecondary>
          <DynamicTable
            columns={occupationTableColumns}
            data={occupationTableData}
            color={colorScheme.primary}
          />
          <TextBlock>
            <p>{text.occupation}</p>
          </TextBlock>
        </TwoColumnSection>
      </>
    ) : (
      <TextBlock>
        <p style={{textAlign: 'center'}}>
          <strong>{selectedIndustry.label}</strong> could not be matched with existing labor markets data, based on 2018 household surveys.
        </p>
      </TextBlock>
    );
    content = (
      <>
        <div id={'overview'}>
          <SectionHeader>Overview</SectionHeader>
          <p>{staticText.overview}</p>
        </div>
        <TwoColumnSection>
          <DataViz
            id={'jordan-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={scatterPlotData}
            axisLabels={{bottom: 'Viability', left: 'Attractiveness'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Overview - ' + industryName}
            axisMinMax={{
              minX: 10,
              minY: 10,
              maxX: 40,
              maxY: 40,
            }}
            jsonToDownload={scatterPlotCsvData}
          />
          <TextBlock>
            <p>
              {text.scatter}
            </p>
            <HowToReadDots
              items={[
                {color: rgba(colorScheme.primary, 0.5), label: 'RCA < 1'},
                {color: rgba(colorScheme.secondary, 0.5), label: 'RCA ≥ 1'},
              ]}
              highlighted={highlighted}
            />
            <DynamicTable
              columns={[
                {label: '', key: 'phase'},
                {label: 'Intensive (RCA ≥ 1)', key: 'intensive'},
                {label: 'Extensive (RCA < 1)', key: 'extensive'},
              ]}
              data={[
                {phase: 'Phase 0', intensive: 'Above median Attractiveness', extensive: ''},
                {phase: 'Phase 1', intensive: '', extensive: 'Above median in both Attractiveness and Viability'},
                {phase: 'Phase 2', intensive: 'Below median Attractiveness', extensive: 'Above median in either Attractiveness and Viability'},
                {phase: 'Phase 4', intensive: '', extensive: 'Below median in both Attractiveness and Viability'},
              ]}
              fontSize={'0.85rem'}
              stickFirstCol={true}
              verticalGridLines={true}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'jordan-viability-radar-chart'}
            vizType={VizType.RadarChart}
            data={viabilityData}
            color={{start: colorScheme.primary, end: colorScheme.primary}}
            maxValue={10}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Viability Factors - ' + industryName}
            jsonToDownload={[viabilityCsvData]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.primary}>{staticText.viabilityFactors.title}</SubSectionHeader>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.viabilityFactors.rcaJordan.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.viabilityFactors.rcaJordan.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.viabilityFactors.rcaPeers.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.viabilityFactors.rcaPeers.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.viabilityFactors.waterIntensity.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.viabilityFactors.waterIntensity.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.viabilityFactors.electricityIntensity.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.viabilityFactors.electricityIntensity.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.viabilityFactors.availabilityOfInputs.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.viabilityFactors.availabilityOfInputs.description}
            </SmallParagraph>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'jordan-attractiveness-radar-chart'}
            vizType={VizType.RadarChart}
            data={attractivenessData}
            color={{start: colorScheme.primary, end: colorScheme.primary}}
            maxValue={10}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Attractiveness Factors - ' + industryName}
            jsonToDownload={[attractivenessCsvData]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.primary}>{staticText.attractivenessFactors.title}</SubSectionHeader>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.attractivenessFactors.femaleEmploymentPotential.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.attractivenessFactors.femaleEmploymentPotential.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.attractivenessFactors.highSkillEmploymentPotential.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.attractivenessFactors.highSkillEmploymentPotential.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.attractivenessFactors.FDIWorld.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.attractivenessFactors.FDIWorld.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.attractivenessFactors.FDIRegion.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.attractivenessFactors.FDIRegion.description}
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>
              {staticText.attractivenessFactors.exportPropensity.title}
            </ParagraphHeader>
            <SmallParagraph>
              {staticText.attractivenessFactors.exportPropensity.description}
            </SmallParagraph>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection id={'industry-potential'}>
          <SectionHeader>{staticText.industryPotential.title}</SectionHeader>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>
            {staticText.industryPotential.fdiTitle}
          </SectionHeaderSecondary>
          {fdiBarSection}
        </TwoColumnSection>
        {womenAndHighSkill}
        <TwoColumnSection id={'industry-now'}>
          <SectionHeader>{staticText.industryNow.title}</SectionHeader>
        </TwoColumnSection>
        {industryNow}
      </>
    );
  } else {
    content = null;
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
        title={metaTitle}
        hasSearch={true}
        searchLabelText={'To Start Select an Industry:'}
        imageSrc={JordanLogoSVG}
        data={industryList}
        onChange={updateSelectedIndustry}
        initialSelectedValue={selectedIndustry}
        imageProps={{
          imgWidth: '150px',
        }}
        backgroundColor={colorScheme.primary}
        textColor={'#fff'}
        linkColor={'#fff'}
        introText={<p dangerouslySetInnerHTML={{__html: staticText.intro}} />}
      />
      <StickySideNav
        id={'jordan-tool-side-navigation'}
        links={links}
        backgroundColor={colorScheme.quaternary}
        borderColor={colorScheme.primary}
        hoverColor={colorScheme.teriary}
        borderTopColor={'#fff'}
        onHeightChange={(h) => setNavHeight(h)}
        marginTop={stickyHeaderHeight + 'px'}
      />
      <Content>
        <StickySubHeading
          title={selectedIndustry ? selectedIndustry.label : ''}
          highlightColor={colorScheme.secondary}
          onHeightChange={(h) => setStickyHeaderHeight(h)}
        />
        {content}
      </Content>
      <ExploreNextFooter
        backgroundColor={colorScheme.primary}
        socialItems={defaultSocialIcons}
        exploreNextLinks={[
          {
            label: 'Country Profile',
            target: 'https://atlas.cid.harvard.edu/countries/113',
          },
        ]}
        attributions={[
          'Growth Lab’s Jordan Research Team:  Miguel Santos, Timothy O’Brien and Patricio Goldstein',
          'Growth Lab’s Digital Development & Design Team:  Annie White, Brendan Leonard, Nil Tuzcu and Kyle Soeltz.',
        ]}
      />
    </>
  );
 };

 export default JordanTool;