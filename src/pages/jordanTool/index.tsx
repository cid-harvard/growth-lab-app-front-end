import React, {useState} from 'react';
import Helmet from 'react-helmet';
import GradientHeader from '../../components/text/headers/GradientHeader';
import { Content } from '../../styling/Grid';
import StickySubHeading from '../../components/text/StickySubHeading';
import ExploreNextFooter, {SocialType} from '../../components/text/ExploreNextFooter';
import useFetchTestData from './fetchTestData';
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
import TextBlock from '../../components/text/TextBlock';
import BlowoutValue from '../../components/text/BlowoutValue';
import {lighten, rgba} from 'polished';
import StickySideNav, { NavItem } from '../../components/navigation/StickySideNav';
import useScrollBehavior from '../../hooks/useScrollBehavior';
import JordanLogoSVG from './jordan-dotted-map.svg';

const colorScheme = {
  primary: '#46899F',
  secondary: '#E0B04E',
  teriary: '#9ac5d3',
  quaternary: '#ecf0f2',
};

 const JordanTool = () => {
  const metaTitle = 'A Roadmap for Export Diversification: Jordan’s Complexity Profile';
  const metaDescription = 'This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.';

  const [selectedIndustry, setSelectedIndustry] = useState<TreeNode | undefined>(undefined);
  const {data, loading, error} = useFetchTestData({variables: {
    id: selectedIndustry ? selectedIndustry.value : null,
  }});

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

  let header: React.ReactElement<any> = (
    <GradientHeader
      title={metaTitle}
      hasSearch={false}
      imageProps={{
        imgWidth: '150px',
      }}
      imageSrc={JordanLogoSVG}
      backgroundColor={colorScheme.primary}
      textColor={'#fff'}
      linkColor={'#fff'}
    />
  );
  let content: React.ReactElement<any> | null;
  let nav: React.ReactElement<any> | null = null;
  if (loading) {
    content = null;
  } else if (error) {
    console.error(error);
    content = null;
  } else if (data !== undefined) {
    const {
      industryData, scatterPlotData, viabilityData, attractivenessData,
      barChartData, jordanGeoJson, barChartData2, tableColumns, tableData,
    } = data;
    if (industryData) {
      if (selectedIndustry === undefined) {
        setSelectedIndustry(industryData[0].children[0]);
      }
      header = (
        <GradientHeader
          title={metaTitle}
          hasSearch={true}
          searchLabelText={'To Start Select an Industry:'}
          imageSrc={JordanLogoSVG}
          data={industryData}
          onChange={setSelectedIndustry}
          initialSelectedValue={industryData[0].children[0]}
          imageProps={{
            imgWidth: '150px',
          }}
          backgroundColor={colorScheme.primary}
          textColor={'#fff'}
          linkColor={'#fff'}
        />
      );
    }
    const industryName: string = selectedIndustry ? selectedIndustry.label : '';
    const scatterPlotNode = scatterPlotData.find(({label}) => label === industryName);
    const highlighted = scatterPlotNode ? {
      color: scatterPlotNode.fill ? scatterPlotNode.fill : '#666',
      label: industryName,
    } : undefined;
    content = (
      <>
        <TwoColumnSection id={'overview'}>
          <SectionHeader>Overview</SectionHeader>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={scatterPlotData}
            axisLabels={{bottom: 'Viability', left: 'Attractiveness'}}
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
                {label: 'Intensive (RCA ≥ 1', key: 'intensive'},
                {label: 'Extensive (RCA < 1', key: 'extensive'},
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
            id={'albania-spyder-chart-2'}
            vizType={VizType.RadarChart}
            data={viabilityData}
            color={{start: colorScheme.primary, end: colorScheme.primary}}
            maxValue={100}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Viability Factors - ' + industryName}
            jsonToDownload={viabilityData[0]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.primary}>Viability Factors</SubSectionHeader>
            <ParagraphHeader color={colorScheme.primary}>RCA in Jordan</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>RCA in Peers</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>Water Intensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>Electricity Intensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>Availability of Inputs</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <DataViz
            id={'albania-spyder-chart-3'}
            vizType={VizType.RadarChart}
            data={attractivenessData}
            color={{start: colorScheme.primary, end: colorScheme.primary}}
            maxValue={100}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Attractiveness Factors - ' + industryName}
            jsonToDownload={attractivenessData[0]}
          />
          <TextBlock>
            <SubSectionHeader color={colorScheme.primary}>Attractiveness Factors</SubSectionHeader>
            <ParagraphHeader color={colorScheme.primary}>Female Employment Potential</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>High Skill Employment Potential</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>FDI in the World</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>FDI in the Region</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
            <ParagraphHeader color={colorScheme.primary}>Export Propensity</ParagraphHeader>
            <SmallParagraph>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </SmallParagraph>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection id={'industry-potential'}>
          <SectionHeader>Industry potential</SectionHeader>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>Foreign Direct Investment</SectionHeaderSecondary>
          <DataViz
            id={'albania-company-bar-chart'}
            vizType={VizType.BarChart}
            data={barChartData}
            axisLabels={{left: 'US$ Millions'}}
            enablePNGDownload={true}
            enableSVGDownload={true}
            chartTitle={'Identifying Companies - ' + industryName}
            jsonToDownload={barChartData[0]}
          />
          <InlineTwoColumnSection>
            <TextBlock>
              <HeaderWithLegend legendColor={colorScheme.primary}>
                <div>
                  Top Global FDI Companies
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
            </TextBlock>
            <TextBlock>
              <HeaderWithLegend legendColor={colorScheme.primary}>
                <div>
                  Top FDI Investors in MENA
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
            </TextBlock>
          </InlineTwoColumnSection>
        </TwoColumnSection>
        <TwoColumnSection>
          <BlowoutValue
            value={'24%'}
            color={colorScheme.primary}
            description={'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'}
          />
          <BlowoutValue
            value={'22%'}
            color={colorScheme.primary}
            description={'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'}
          />
        </TwoColumnSection>
        <TwoColumnSection id={'industry-now'}>
          <SectionHeader>Industry Now</SectionHeader>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>Sector Demographics</SectionHeaderSecondary>
          <DynamicTable
            columns={tableColumns}
            data={tableData}
            color={colorScheme.primary}
          />
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>Location of Workers</SectionHeaderSecondary>
          <DataViz
            id={'albania-geo-map'}
            vizType={VizType.GeoMap}
            data={jordanGeoJson}
            minColor={lighten(0.5, colorScheme.primary)}
            maxColor={colorScheme.primary}
          />
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <ColorScaleLegend
              minLabel={0.28}
              maxLabel={30.8}
              minColor={lighten(0.5, colorScheme.primary)}
              maxColor={colorScheme.primary}
              title={'Percentage of workers in the industry'}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>Schooling Distribution</SectionHeaderSecondary>
          <DynamicTable
            columns={tableColumns}
            data={tableData}
            color={colorScheme.primary}
          />
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>Industry Wages</SectionHeaderSecondary>
          <DynamicTable
            columns={tableColumns}
            data={tableData}
            color={colorScheme.primary}
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
            data={barChartData2}
            axisLabels={{left: 'US$ Millions'}}
          />
          <TextBlock>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <Legend
              legendList={[
                {label: 'Industry', fill: lightBorderColor, stroke: undefined},
                {label: 'Country', fill: undefined, stroke: colorScheme.primary},
              ]}
            />
          </TextBlock>
        </TwoColumnSection>
        <TwoColumnSection>
          <SectionHeaderSecondary color={colorScheme.primary}>Occupation Distribution</SectionHeaderSecondary>
          <DynamicTable
            columns={tableColumns}
            data={tableData}
            color={colorScheme.primary}
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
        backgroundColor={colorScheme.quaternary}
        borderColor={colorScheme.primary}
        hoverColor={colorScheme.teriary}
        borderTopColor={'#fff'}
        onHeightChange={(h) => setNavHeight(h)}
        marginTop={stickyHeaderHeight + 'px'}
      />
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
      {header}
      {nav}
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
            target: 'https://atlas.cid.harvard.edu/countries/113',
          },
        ]}
        attributions={[
          'Growth Lab’s Jordan Research Team:  -----',
          'Growth Lab’s Digital Development & Design Team:  Annie White, Brendan Leonard, Nil Tuzcu and Kyle Soeltz.',
        ]}
      />
    </>
  );
 };

 export default JordanTool;