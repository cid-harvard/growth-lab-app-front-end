import React, {
  useRef,
} from 'react';
import {
  FullWidthContent,
  StoriesGrid,
} from '../../../styling/Grid';
import {
  CoverPhoto,
  FullWidth,
  StoryTitle,
  StoryHeading,
  StickyContainer,
  StorySectionContainer,
  primaryFont,
  secondaryFont,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components/macro';
import useScrollingSections from '../../../hooks/useScrollingSections';
import usePrevious from '../../../hooks/usePrevious';
import DataViz, {VizType} from '../../../components/dataViz';
import {LabelPlacement} from '../../../components/dataViz/barChart';
import getLineChartData from './getLineChartData';
import PrimaryMap from './PrimaryMap';
import GrowthProjectionsMap from './GrowthProjectionsMap';
import RoadTravelMap from './RoadTravelMap';
import FlightRoutesMap from './FlightRoutesMap';
import StandardFooter from '../../../components/text/StandardFooter';
import {stackData, stackConfig} from './stackChartData';
import ClusterChart from './clusterChart';
import treemapData from './treemapData';
import albaniaVsRegionalPeersData from './albaniaVsRegionalPeersData';
import DynamicTable from '../../../components/text/DynamicTable';
import electricityBarChartData from './barChartData';
import BoxAndWhiskersChart from './BoxAndWhiskersChart';
import CoverPhotoImage from './cover-photo.png';
import Helmet from 'react-helmet';

const metaTitle = 'How to Accelerate Economic Growth in Albania | Harvard Growth Lab';
const metaDescription = 'This brief analysis takes stock of Albania’s economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.';

const Root = styled(FullWidthContent)`
  font-family: 'Source Serif Pro', serif;
  padding-bottom: 8rem;
  color: #333;
  background-color: #f9f9f3;

  p {
    font-size: 1.25rem;
  }

  h3 {
    color: #333;
    text-align: center;
    font-family: ${primaryFont};
    text-transform: uppercase;
    font-weight: 400;
  }

  p + h3 {
    margin-top: 3rem;
  }
`;

const Heading = styled.div`
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  grid-column: 1 / -1;
`;

const VizContainer = styled.div`
  position: relative;
  z-index: 100;
`;

const SingleColumnNarrative = styled.div`
  grid-column: 1 / -1;

  p,
  h2 {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
`;

const InlineVizContainer = styled.div`
  max-width: 700px;
  height: 450px;
  margin: 1.75rem auto;
`;

const ClusterChartContainer = styled.div`
  max-width: 650px;
  min-height: 700px;
  margin: 1.75rem auto;
`;

const BarChartContainer = styled(InlineVizContainer)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border: solid 1px #dfdfdf;
`;

const TableContainer = styled.div`
  max-width: 650px;
  padding: 0 50px;
  margin: 2.75rem auto;
`;

const StickyText = styled(StickyContainer)`
  top: 10vh;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 60vh;
  transition: opacity 0.6s ease;
`;

const tableColor = '#1f4b79';

const BracketBase = styled.div`
  width: 8px;
  height: 50%;
  position: absolute;
  border-left: 4px solid ${tableColor};
`;

const BottomBracket = styled(BracketBase)`
  transform: translate(calc(-100% - 16px), -50%);
  border-bottom: 4px solid ${tableColor};
`;

const TopBracket = styled(BracketBase)`
  transform: translate(calc(-100% - 16px), 50%);
  border-top: 4px solid ${tableColor};
`;

const LargeBracket = styled.div`
  width: 18px;
  height: 150%;
  position: absolute;
  transform: translate(calc(-200% - 10px), 50%);
  border-left: 4px solid ${tableColor};
  border-bottom: 4px solid ${tableColor};
  border-top: 4px solid ${tableColor};
  border-top-left-radius: 400px;
  border-bottom-left-radius: 400px;

  &:after {
    content: '►';
    display: block;
    font-size: 19px;
    color: ${tableColor};
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(100%, -50%);
  }
`;

const BarChart = styled.div`
  position: relative;
`;

const CenterBarChart = styled(BarChart)`
  border-left: solid 1px #dfdfdf;
  border-right: solid 1px #dfdfdf;
`;

const AlbaniaStory = () => {
  const section_0 = useRef<HTMLParagraphElement | null>(null);
  const section_1 = useRef<HTMLParagraphElement | null>(null);
  const section_2 = useRef<HTMLParagraphElement | null>(null);
  const section_3 = useRef<HTMLParagraphElement | null>(null);
  const section_4 = useRef<HTMLParagraphElement | null>(null);
  const section_5 = useRef<HTMLParagraphElement | null>(null);
  const section_6 = useRef<HTMLParagraphElement | null>(null);
  const section_7 = useRef<HTMLParagraphElement | null>(null);
  const section_8 = useRef<HTMLParagraphElement | null>(null);
  const section_10 = useRef<HTMLParagraphElement | null>(null);
  const section_11 = useRef<HTMLParagraphElement | null>(null);
  const section_12 = useRef<HTMLParagraphElement | null>(null);
  const section_13 = useRef<HTMLParagraphElement | null>(null);
  const section_14 = useRef<HTMLParagraphElement | null>(null);
  const section_15 = useRef<HTMLParagraphElement | null>(null);
  const section_16 = useRef<HTMLParagraphElement | null>(null);
  const section_17 = useRef<HTMLParagraphElement | null>(null);
  const section_18 = useRef<HTMLParagraphElement | null>(null);

  const {section} = useScrollingSections({refs: [
    section_0,
    section_1,
    section_2,
    section_3,
    section_4,
    section_5,
    section_6,
    section_7,
    section_8,
    section_10,
    section_11,
    section_12,
    section_13,
    section_14,
    section_15,
    section_16,
    section_17,
    section_18,
  ]});

  const prevSection = usePrevious(section);

  const {
    lineChartData, minX, maxX, minY, maxY,
    leftAxis, animateAxis, lineChartTitle,
  } = getLineChartData({
    section, prevSection: prevSection === undefined || prevSection === null ? null : prevSection,
  });

  const formatYear = (maxYear: number) => (n: number) => n - Math.ceil(n) === 0 && n <= maxYear ? n.toString() : '';

  let dataViz: React.ReactElement<any> | null;
  let vizTitle: string;
  if (section === null || section < 5) {
    vizTitle = lineChartTitle;
    dataViz = (
      <DataViz
        id={'albania-story-line-chart'}
        vizType={VizType.LineChart}
        data={lineChartData}
        axisLabels={{left: leftAxis}}
        axisMinMax={{minY, maxY, minX, maxX}}
        animateAxis={animateAxis}
        formatAxis={{x: formatYear(2019)}}
        tickCount={{
          x: maxX - minX,
        }}
        rootStyles={{margin: 0}}
        labelFont={secondaryFont}
      />
    );
  } else if (section < 6) {
    vizTitle = 'Main Drivers of Export Growth in Albania, 2013-2017';
    dataViz = (
      <DataViz
        id={'albania-story-tree-map'}
        vizType={VizType.TreeMap}
        data={treemapData}
        rootStyles={{margin: 0}}
        labelFont={secondaryFont}
      />
    );
  } else {
    dataViz = null;
    if (section && section >= 8) {
      vizTitle = 'GDP per capita, 2018';
    } else {
      if (section && section <= 6) {
        vizTitle = 'Population Change, 2013-2017';
      } else {
        vizTitle = 'GDP Growth, 2013-2017';
      }
    }
  }

  const stackChart = section && section > 8 && section < 12 ? (
    <DataViz
      id={'albania-story-stack-chart'}
      vizType={VizType.StackChart}
      config={stackConfig}
      data={stackData}
      labelFont={secondaryFont}
    />
  ) : null;

  const albaniaEciPeers = section && section > 9 && section < 13 ? (
    <DataViz
      id={'albania-story-eci-peers-line'}
      vizType={VizType.LineChart}
      data={albaniaVsRegionalPeersData.eci}
      axisMinMax={albaniaVsRegionalPeersData.eciAxis}
      formatAxis={{x: formatYear(2017)}}
      labelFont={secondaryFont}
    />
  ) : null;

  const albaniaGdpPeers = section && section > 10 && section < 14 ? (
    <DataViz
      id={'albania-story-gdp-peers-line'}
      vizType={VizType.LineChart}
      data={albaniaVsRegionalPeersData.gdp}
      axisMinMax={albaniaVsRegionalPeersData.gdpAxis}
      formatAxis={{x: formatYear(2017)}}
      labelFont={secondaryFont}
    />
  ) : null;

  const clusterChart = section && section > 11 && section < 15 ? (
    <ClusterChart />
  ) : null;

  const electricityBarCharts = section && section > 13 && section < 17 ? (
    <>
      <BarChart>
        <DataViz
          id={'albania-story-electricity-bar-chart-main-constraints'}
          vizType={VizType.BarChart}
          data={[electricityBarChartData.main_constraint.data]}
          axisMinMax={{minY: 0, maxY: 36}}
          averageLines={[
            {
              value: electricityBarChartData.main_constraint.umic_average_line,
              label: 'UMIC Average',
              strokeDasharray: 3,
              labelPlacement: LabelPlacement.right,
            },
            {
              value: electricityBarChartData.main_constraint.balkans_average_line,
              label: 'Balkans Average',
            },
          ]}
          labelFont={secondaryFont}
        />
      </BarChart>
      <CenterBarChart>
        <DataViz
          id={'albania-story-electricity-bar-chart-outages-month'}
          vizType={VizType.BarChart}
          data={[electricityBarChartData.outages_month.data]}
          axisMinMax={{minY: 0, maxY: 36}}
          hideAxis={{left: true}}
          averageLines={[
            {
              value: electricityBarChartData.outages_month.umic_average_line,
              label: 'UMIC Average',
              strokeDasharray: 3,
              labelPlacement: LabelPlacement.right,
            },
            {
              value: electricityBarChartData.outages_month.balkans_average_line,
              label: 'Balkans Average',
            },
          ]}
          labelFont={secondaryFont}
        />
      </CenterBarChart>
      <BarChart>
        <DataViz
          id={'albania-story-electricity-bar-chart-average-losses'}
          vizType={VizType.BarChart}
          data={[electricityBarChartData.average_losses.data]}
          axisMinMax={{minY: 0, maxY: 36}}
          hideAxis={{left: true}}
          averageLines={[
            {
              value: electricityBarChartData.average_losses.umic_average_line,
              label: 'UMIC Average',
              strokeDasharray: 3,
              labelPlacement: LabelPlacement.right,
            },
            {
              value: electricityBarChartData.average_losses.balkans_average_line,
              label: 'Balkans Average',
            },
          ]}
          labelFont={secondaryFont}
        />
      </BarChart>
    </>
  ) : null;

  const boxAndWhiskersChart = section && section > 14 && section < 18 ? (
    <BoxAndWhiskersChart />
  ) : null;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <meta property='og:title' content={metaTitle} />
        <meta property='og:description' content={metaDescription} />
        <link href='https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;700&display=swap' rel='stylesheet' />
      </Helmet>
      <Root>
        <CoverPhoto
          style={{backgroundImage: `url("${CoverPhotoImage}")`}}
        />
        <StoriesGrid>
          <Heading>
            <FullWidth>
              <StoryTitle>How to Accelerate Economic Growth in Albania</StoryTitle>
              <p>
                This brief analysis takes stock of Albania’s economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.
              </p>
            </FullWidth>
          </Heading>
        </StoriesGrid>
        <StoriesGrid>
          <StoryHeading>Taking Stock of the Growth Process prior to COVID-19</StoryHeading>
          <VizContainer>
            <StickyContainer>
              <h3>{vizTitle}</h3>
              {dataViz}
              <MapContainer style={{
                opacity: section && section >= 6 ? '1' : '0',
                position: section && section >= 6 ? 'relative' : 'absolute',
                top: section && section >= 6 ? 0 : -10000,
                left: section && section >= 6 ? 0 : -10000,
                height: 450,
              }}>
                <PrimaryMap
                  section={section}
                />
              </MapContainer>
            </StickyContainer>
          </VizContainer>
          <TextBlock>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_0}>
                  Looking back on the last decade, the Albanian economy achieved an extraordinary turnaround. Itis not a stretch to call it an Albanian Miracle. Things looked bleak back in 2013 as annual per capita income growth had decelerated over the previous five years to reach a low of 1.0%.
                </p>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_1}>
                  Albania faced deep macroeconomic and electricity system vulnerabilities as well as recession in Greece and Italy amidst the broader euro crisis. When Albania entered an IMF program to support a fiscal adjustment in late 2013, the expectation was a further slowdown under austerity. But instead, the Albanian economy began to thrive. Per capita growth accelerated over each of the next five years to surpass 4.0% in 2018.
                </p>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_2}>
                  Albania’s debt path was put on a solidly downward trajectory, the electricity system was stabilized, and economic outcomes decoupled from those of the EU. With a per capita growth rate of twice the EU-average by 2018, Albania was on pace to reach the income level of Germany today in 32 years — a longer time period than many Albanians desire, but one that would be miraculous given Albania’s starting position.
                </p>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_3}>
                  Growth since 2013 has been broad-based with job creation that has been inclusive. Although the bulk of growth has come from service activities, all sectors of the economy have expanded. This differs greatly from growth prior to the global financial crisis, which depended heavily on remittances and an unsustainable construction boom. Rates of employment and labor force participation have been on the rise since 2014, and the unemployment rate had been on a steady decline since 2015 until just recently.
                </p>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_4}>
                  Labor market outcomes have been improving for all combinations of gender and age groups.
                </p>
                <p>
                  More people are getting jobs; more jobs are in the formal sector; and more people are working inlarge firms. A recent analysis of the first two years of the new Income and Living Conditions Survey, shows that relative poverty declined between 2017 and 2018. As incomes are rising, the relative poverty income threshold rose significantly (by 11%) and yet the number of Albanians below the threshold declined, showing that the benefits of growth are being largely shared. The survey also shows declining inequality for all age groups.
                </p>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
                <StickyText>
                  <p ref={section_5}>
                    The overall share of employment in agriculture has fallen as the economy has modernized, while paid jobs in agriculture have increased. But while the transformation in agriculture has been noteworthy, the bulk of job growth, output growth, and export growth have come from three segments of the economy in particular: manufacturing, tourism, and business process outsourcing (BPO). More than half of export growth over 2013-17 has come from what is classified in international data as information and communications technologies (ICT) and travel and tourism. Unfortunately, the latter category is now being hard hit by the COVID-19 pandemic.
                  </p>
                </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_6}>
                  Most new job opportunities have emerged in and around cities, where a service-driven economy tends to aggregate. As a result, urbanization has coincided with growth as people have moved into Tirana, Durres, and Vlora and out of all other prefectures.
                </p>
                <div>Color Scale</div>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_7}>
                  Incomes per capita have grown in both cities and across rural prefectures — with the exceptions of Kukës, Fier, and Gjirokastër — with many regions growing in absolute terms even as they have declined in population.
                </p>
                <div>Color Scale</div>
              </StickyText>
            </StorySectionContainer>
            <StorySectionContainer>
              <StickyText>
                <p ref={section_8}>
                  Incomes per capita have grown in both cities and across rural prefectures — with the exceptions of Kukës, Fier, and Gjirokastër — with many regions growing in absolute terms even as they have declined in population. Source: INSTATDespite achieving broad-based growth under difficult conditions, many Albanians still feel left behind. The economic expansion has delivered jobs, but wage growth has not always kept pace. While there are signs of stronger wage growth in the last few years, real wages have stagnated over much of the growth acceleration, with the exception of employees in larger firms. In particular, manufacturing jobs such as those in the fason industry (i.e. garments, textiles, and footwear) pay lower wages than the rest of the economy. On the whole, diversification of the manufacturing sector leaves much to be desired. Given that emigration is a much faster way to converge one’s own income than waiting three decades for Albanian incomes to catch up, many Albanians still desire to leave.
                </p>
                <p>
                  An annual survey by Gallup shows that more than half of Albanians would like to move permanently to another country — a rate that has actually increased since 2013. Gallup surveys also show that Albanians’ assessment of their local job market has continued to improve in the same period, although a slight majority is consistently dissatisfied with the standard of living and40% of the sample see it getting worse over time.
                </p>
              </StickyText>
            </StorySectionContainer>
          </TextBlock>
          <SingleColumnNarrative>
            <StoryHeading>Taking Stock of the Growth Process prior to COVID-19</StoryHeading>
            <p ref={section_10}>
              Based on our Atlas of Economic Complexity, Albania’s anticipated steady state economic growth rate for the next 10 years based on the embedded capabilities of the economy is around 3.3%.
            </p>
            <h3>Growth Projections, 2017-2027</h3>
            <InlineVizContainer>
              <GrowthProjectionsMap />
            </InlineVizContainer>
            <p ref={section_11}>
              In other words, Albania’s growth is expected to converge to this pace over time. In 2019, a combination of a poor year of hydropower production and the phasing out of major energy-investments resulted in a slowdown in growth to under 2.5% during the first half of the year, but growth rebounded to closer to 3% for 2019 overall. Recently, growth has been tied closely to Albania’s high rate of incoming foreign direct investment (FDI). Albania’s FDI has been high as a share of GDP in recent years but also highly focused in the energy sector, and much of this energy-related investment, which is expected to slow moving forward. Moreover, outside the early stages of physical construction, job creation in this highly capital-intensive sector is typically meager.
            </p>
            <h3>
              FDI Stock by Economic Activity, 2014-2019
              <br /><small>(in millions of Euros)</small>
            </h3>
            <InlineVizContainer>
              {stackChart}
            </InlineVizContainer>
            <p ref={section_12}>
              Despite the recent growth acceleration, Albania’s Economic Complexity Index (a measure of the economies capabilities to produce diversified goods and services) remains the lowest in the region.
            </p>
            <h3>ECI - Albania vs. Regional Peers, 2000-2017</h3>
            <InlineVizContainer>
              {albaniaEciPeers}
            </InlineVizContainer>
            <p ref={section_13}>
              This also explains why Albania’s economy remains less export-oriented than neighboring countries despite being equally close to the large European market.
            </p>
            <h3>Exports as a Share of GDP - Albania vs. Regional Peers, 2000 - 2017</h3>
            <InlineVizContainer>
              {albaniaGdpPeers}
            </InlineVizContainer>
            <p>
              These trends imply that pace of sustainable economic growth, and particularly the creation of good jobs, will be limited by the pace at which the Albanian economy absorbs knowhow from abroad to diversify economic activities. While the exact rate of growth may adjust up and down based on temporary causes (the current COVID-19 shock, rainfall and electricity output, natural disasters, etc.), the overall strength and quality of growth will depend on the goods and services that the Albanian economy learns to produce.
            </p>
            <p>
              As shown in past growth diagnostic research for Albania, diversification of economic activities to date has taken place primarily through especially through non-energy FDI, diaspora involvement, and circular migration. As companies enter Albania from other countries and individuals return to Albania after time spent abroad, they tend to expand the Albanian economy’s ability to capitalize on latent comparative advantages. Over the period since 2013, FDI has been dominated in scale by the energy sector, but smaller investments by foreign companies have had outsized impacts in their introduction of entire industries, and many jobs, that have changed the structure of the economy. These new industries include BPO, seafood production, and aggregation of fruits and vegetable production for export. Meanwhile, the Albanian diaspora and returning migrants have introduced new products, business practices and market knowhow across sectors, most dramatically in tourism and agriculture.
            </p>
            <p ref={section_14}>
              FDI and diaspora have together aided the accumulation of knowhow of the private sector, but cross-country comparisons suggest that the pace of knowhow introduction from abroad could be much, much faster. The dataset fDi Markets, which tracks cross-border investments announced online, has captured just a few announced projects in Albania in last decade. Notably, in each sector where Albania has received investment, other countries in the region have received significantly more projects from a more diverse set of source countries. Romania stands out especially for the amount of FDI it has received in the areas where investors have shown interest in Albania.
            </p>
            <h3>Investments vs. Regional Peers, 2000-2019</h3>
            <ClusterChartContainer>
              {clusterChart}
            </ClusterChartContainer>
            <StoryHeading>The Path to Stronger Growth in the Aftermath of COVID-19</StoryHeading>
            <p>
              The next phase of the Albanian miracle will require more co-evolution of state functions and delivery to meet the changing needs of the private sector, including actions that accelerate knowhow acquisition from abroad. In 2017, the Growth Lab published a comprehensive growth diagnostic for the Albanian economy and found the following breakdown of constraints to growth.
            </p>
            <TableContainer>
              <DynamicTable
                columns={[
                  {label: 'Most Binding Constraints', key: 'most_binding'},
                  {label: 'Lesser Constraints', key: 'lesser_constraints'},
                ]}
                data={[
                  {
                    most_binding: (
                      <>
                        <LargeBracket />
                        <span style={{fontWeight: 600}}>Slow accumulation</span>
                      </>
                    ),
                    lesser_constraints: 'Access to finance',
                  },
                  {
                    most_binding: (
                      <>
                        <TopBracket />
                        Rule of law weaknesses and perceptions
                      </>
                    ),
                    lesser_constraints: 'Tax policy & tax administration',
                  },
                  {
                    most_binding: (
                      <>
                        <BottomBracket />
                        Access to land (for some industries)
                      </>
                    ),
                    lesser_constraints: 'Electricity system',
                  },
                  {
                    most_binding: '',
                    lesser_constraints: 'Transportation infrastructure',
                  },
                  {
                    most_binding: '',
                    lesser_constraints: 'Education system',
                  },
                  {
                    most_binding: '',
                    lesser_constraints: 'Macroeconomic system',
                  },
                ]}
                color={tableColor}
                invertHeading={true}
                showOverflow={true}
              />
            </TableContainer>
            <p>
              The diagnostic found that the Albanian economy was in a “low-knowhow” equilibrium and that the potential sources of knowhow inflows (FDI, diaspora involvement, immigration) were largely limited by specific rule of law issues and, especially, the outward perception of rule of law issues in the country. Since this report was written, the productive knowhow constraint has been relaxing gradually — perhaps most clearly evidenced by widespread increases in relevant variables in the 2019 edition of the World Bank Enterprise Survey against the last survey in 2013 — which has coincided with the gradual growth acceleration. However, despite general clear improvement in many rule of law issues, which is reflected both in firm surveys and in progress toward Albanian accession into the European Union, perceptions of poor rule of law continue to slow knowhow acquisition.
            </p>
            <p>
              The following changes are noteworthy since the diagnostic was completed in 2017, which impact Albania’s comparative advantages and disadvantages as a destination for global business investment in search of efficiency and access to the European market.
            </p>
            <TableContainer>
              <DynamicTable
                columns={[
                  {label: 'Positive Change', key: 'positive_change'},
                  {label: 'Mixed or Negative Change', key: 'mixed_or_negative_change'},
                ]}
                data={[
                  {positive_change: 'Productive knowhow (gradual)', mixed_or_negative_change: 'Access to land'},
                  {positive_change: 'Rule of law (in general)', mixed_or_negative_change: 'Road transport'},
                  {positive_change: 'Access to finance', mixed_or_negative_change: 'Court system'},
                  {positive_change: 'Electricity system', mixed_or_negative_change: 'Text policy and tax administration'},
                  {positive_change: 'Education system', mixed_or_negative_change: ''},
                  {positive_change: 'Macroeconomic stability', mixed_or_negative_change: ''},
                ]}
                color={tableColor}
                invertHeading={true}
                showOverflow={true}
              />
            </TableContainer>
            <p ref={section_15}>
              Albania’s electricity system has continued to improve in order to deliver electricity reliably and at a low price. Whereas more than a quarter of firms used to report electricity as their biggest constraint, this has fallen to less than 10% of firms, very close to average for upper middle-income countries, as the occurrence of outages and firm losses due to outages have fallen dramatically. Albania still underperforms in comparison to the rest of the Balkan region, which has very low-cost electricity on the whole. Given Albania’s recent success in tendering very low-cost solar generation to complement its predominantly hydropower generation, this is likely to continue to improve.
            </p>
            <h3>Responses to Electricity Questions in World Bank Enterprise Surveys</h3>
            <BarChartContainer>
              {electricityBarCharts}
            </BarChartContainer>
            <p ref={section_16}>
              On the opposite extreme, performance of the court system and reports of “monopoly or unfair competition” have grown as constraints based on a variety of firm surveys. Although measures of government effectiveness have improved markedly across surveys and bribery has reduced among most interactions with government (with the exception of tax collection), judicial reforms appear to have traded off an old problem of corrupt judges for a new problem of too few judges. While the process is a critical step forward, it is resulting in businesses that rely on the court system to settle disputed to face an increased likelihood of delays. In fact, despite positive reforms, Albanian exports have become increasing focused in products that are less intensive in the use of contracts to manage supplier relationships.
            </p>
            <h3>Albania - Contract Intensity of Exports</h3>
            <InlineVizContainer>
              {boxAndWhiskersChart}
            </InlineVizContainer>
            <p ref={section_17}>
              Meanwhile, Albania has had mixed success in improving transportation infrastructure. While several major road projects have been completed that have reduced travel times and improved connectivity — including to the Kosovo border and to large Southern cities — congestion has increased on major roads connecting Tirana to Durres and Shkodër, as road supply improvements have not kept pace with increasing demand.
            </p>
            <h3>Changes in Road Travel Time, 2017 and 2019</h3>
            <InlineVizContainer>
              <RoadTravelMap />
            </InlineVizContainer>
            <p ref={section_18}>
              Due less to infrastructure and more to management changes, Albania has enjoyed a rapid expansion in air travel and connectivity to European cities from its one airport outside of Tirana. This has supported tourism growth, to a point where the need for a second airport is being evaluated. International air travel growth is especially important given Albania’s lack of a rail network to connect to the rest of Europe.
            </p>
            <h3>Flight Connections from Tirana</h3>
            <InlineVizContainer>
              <FlightRoutesMap />
            </InlineVizContainer>
            <p>
              In order to rebound quickly from COVID-19 and pave the way for faster convergence in income levels with the European Union, the capabilities of the Government of Albania must continue to evolve to meet the demands of a diversifying economy and to attract new FDI to accelerate the growth of productive knowhow. This evolution requires not only continued improvement in macroeconomic management, traditional infrastructure development, and institutional reform to deliver greater rule of law — all of which have improved in recent years. It also requires innovation in the capabilities of government to deliver public goods on which future diversification will rely and the use of proactive and targeted investment promotion to attract global companies to Albania.
            </p>
            <p>
              While the health impacts of COVID-19 have been impressively contained in Albania, which will allow for a relatively fast opening of the domestic economy, the economic shock of the crisis due to external factors is severe and likely to be prolonged. This makes the present a critical time for innovation in government capabilities. The newly created Albanian Investment Corporation has been designed as an institution to support forward-looking public good development, while new tools for identifying global FDI that can thrive in Albania are now being used to strategize for accelerating knowhow acquisition and growth in a world that has been fundamentally changed by COVID-19.
            </p>
          </SingleColumnNarrative>
        </StoriesGrid>
      </Root>
      <StandardFooter />
    </>
  );
};

export default AlbaniaStory;
