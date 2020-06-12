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
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components/macro';
import useScrollingSections from '../../../hooks/useScrollingSections';
import usePrevious from '../../../hooks/usePrevious';
import DataViz, {VizType} from '../../../components/dataViz';
import getLineChartData from './getLineChartData';

const Root = styled(FullWidthContent)`

`;

const StickyText = styled(StickyContainer)`
  top: 10vh;
`;

const AlbaniaStory = () => {
  const firstSection = useRef<HTMLParagraphElement | null>(null);
  const secondSection = useRef<HTMLParagraphElement | null>(null);
  const thirdSection = useRef<HTMLParagraphElement | null>(null);

  const {section} = useScrollingSections({refs: [
    firstSection,
    secondSection,
    thirdSection,
  ]});

  const prevSection = usePrevious(section);

  const lineChartData = getLineChartData({
    section, prevSection: prevSection === undefined || prevSection === null ? null : prevSection,
  });

  return (
    <Root>
      <CoverPhoto />
      <StoriesGrid>
        <FullWidth>
          <StoryTitle>How to Accelerate Economic Growth in Albania</StoryTitle>
          <p>
            This brief analysis takes stock of Albania’s economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.
          </p>
        </FullWidth>
      </StoriesGrid>
      <StoriesGrid>
        <StoryHeading>Taking Stock of the Growth Process prior to COVID-19</StoryHeading>
        <div style={{position: 'relative'}}>
          <StickyContainer>

            <DataViz
              id={'albania-story-line-chart'}
              vizType={VizType.LineChart}
              data={lineChartData}
              axisLabels={{left: 'Year on Year Percent Change in GDP per capita'}}
              axisMinMax={{
                minY: -5,
                maxY: 8,
                minX: 2010,
                maxX: 2019,
              }}
            />
          </StickyContainer>
        </div>
        <TextBlock>
          <StorySectionContainer>
            <StickyText>
              <p ref={firstSection}>
                Looking back on the last decade, the Albanian economy achieved an extraordinary turnaround. Itis not a stretch to call it an Albanian Miracle. Things looked bleak back in 2013 as annual per capita income growth had decelerated over the previous five years to reach a low of 1.0%.
              </p>
            </StickyText>
          </StorySectionContainer>
          <StorySectionContainer>
            <StickyText>
              <p ref={secondSection}>
                Albania faced deep macroeconomic and electricity system vulnerabilities as well as recession in Greece and Italy amidst the broader euro crisis. When Albania entered an IMF program to support a fiscal adjustment in late 2013, the expectation was a further slowdown under austerity. But instead, the Albanian economy began to thrive. Per capita growth accelerated over each of the next five years to surpass 4.0% in 2018.
              </p>
            </StickyText>
          </StorySectionContainer>
          <StorySectionContainer>
            <StickyText>
              <p ref={thirdSection}>
                Albania’s debt path was put on a solidly downward trajectory, the electricity system was stabilized, and economic outcomes decoupled from those of the EU. With a per capita growth rate of twice the EU-average by 2018, Albania was on pace to reach the income level of Germany today in 32 years — a longer time period than many Albanians desire, but one that would be miraculous given Albania’s starting position.
              </p>
            </StickyText>
          </StorySectionContainer>
          <p>
            Growth since 2013 has been broad-based with job creation that has been inclusive. Although the bulk of growth has come from service activities, all sectors of the economy have expanded. This differs greatly from growth prior to the global financial crisis, which depended heavily on remittances and an unsustainable construction boom. Rates of employment and labor force participation have been on the rise since 2014, and the unemployment rate had been on a steady decline since 2015 until just recently.
          </p>
          <p>
            Labor market outcomes have been improving for all combinations of gender and age groups.
          </p>
          <p>
            More people are getting jobs; more jobs are in the formal sector; and more people are working inlarge firms. A recent analysis of the first two years of the new Income and Living Conditions Survey, shows that relative poverty declined between 2017 and 2018. As incomes are rising, the relative poverty income threshold rose significantly (by 11%) and yet the number of Albanians below the threshold declined, showing that the benefits of growth are being largely shared. The survey also shows declining inequality for all age groups.
          </p>
        </TextBlock>
      </StoriesGrid>
      <StoriesGrid>
        <div style={{position: 'relative'}}><StickyContainer>Tree Map</StickyContainer></div>
        <TextBlock>
          <p>
            The overall share of employment in agriculture has fallen as the economy has modernized, while paid jobs in agriculture have increased. But while the transformation in agriculture has been noteworthy, the bulk of job growth, output growth, and export growth have come from three segments of the economy in particular: manufacturing, tourism, and business process outsourcing (BPO). More than half of export growth over 2013-17 has come from what is classified in international data as information and communications technologies (ICT) and travel and tourism. Unfortunately, the latter category is now being hard hit by the COVID-19 pandemic.
          </p>
        </TextBlock>
      </StoriesGrid>
      <StoriesGrid>
        <div style={{position: 'relative'}}><StickyContainer>Geo Maps</StickyContainer></div>
        <TextBlock>
          <p>
            Most new job opportunities have emerged in and around cities, where a service-driven economy tends to aggregate. As a result, urbanization has coincided with growth as people have moved into Tirana, Durres, and Vlora and out of all other prefectures.
          </p>
          <div>Color Scale</div>
          <p>
            Incomes per capita have grown in both cities and across rural prefectures — with the exceptions of Kukës, Fier, and Gjirokastër — with many regions growing in absolute terms even as they have declined in population.
          </p>
          <div>Color Scale</div>
          <p>
            Incomes per capita have grown in both cities and across rural prefectures — with the exceptions of Kukës, Fier, and Gjirokastër — with many regions growing in absolute terms even as they have declined in population. Source: INSTATDespite achieving broad-based growth under difficult conditions, many Albanians still feel left behind. The economic expansion has delivered jobs, but wage growth has not always kept pace. While there are signs of stronger wage growth in the last few years, real wages have stagnated over much of the growth acceleration, with the exception of employees in larger firms. In particular, manufacturing jobs such as those in the fason industry (i.e. garments, textiles, and footwear) pay lower wages than the rest of the economy. On the whole, diversification of the manufacturing sector leaves much to be desired. Given that emigration is a much faster way to converge one’s own income than waiting three decades for Albanian incomes to catch up, many Albanians still desire to leave.
          </p>
          <p>
            An annual survey by Gallup shows that more than half of Albanians would like to move permanently to another country — a rate that has actually increased since 2013. Gallup surveys also show that Albanians’ assessment of their local job market has continued to improve in the same period, although a slight majority is consistently dissatisfied with the standard of living and40% of the sample see it getting worse over time.
          </p>
        </TextBlock>
      </StoriesGrid>
      <StoriesGrid>
      </StoriesGrid>
    </Root>
  );
};

export default AlbaniaStory;
