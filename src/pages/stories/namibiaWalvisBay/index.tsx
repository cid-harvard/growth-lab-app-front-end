import React, {
  useEffect,
  useRef, useState,
} from 'react';
import { StoriesGrid } from '../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StorySectionContainer as StorySectionContainerBase,
  Authors,
  StickyContainer,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components';
import useScrollingSections from '../../../hooks/useScrollingSections';
import StandardFooter from '../../../components/text/StandardFooter';
import CoverPhotoImage from './images/cover-photo2.jpg';
import CoverPhotoImageLowRes from './images/cover-photo2-lowres.jpg'; 
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../components/navigation/DefaultHubHeader';
import {
  RootStandard as Root,
  Heading,
  MainNarrativeRoot,
  VizContainer,
  MobileText,
  SingleColumnNarrative,
  StickyText,
  FadeInContainer,
  // FadeInContainer,
} from '../sharedStyling';
import FullScreenImage from './FullScreenImage';

const metaTitle = 'Port Resiliency in the Face of Global Shocks: The Case of Walvis Bay in Namibia | Harvard Growth Lab';
const metaDescription = 'The article explores the economic resilience of ports in the face of global shocks, with particular focus on the port of Walvis Bay, Namibia. Walvis Bay faces challenges in attracting volume due to its relative unconnectedness to population centers in Africa, but it experienced a fourteen-fold increase in containerized cargo volumes during the global commodity super-cycle. This was due to its efficient operations and relative competitiveness. However, containerized traffic plummet at the end of the cycle and volumes have struggled to recover since. The article  discusses the potential opportunities for growth in the future by capitalizing on global developments in clean energy technologies and the closeness to mining operations in the region, whereby Walvis Bay can serve as a regional logistics hub for exports.';


const StorySectionContainer = styled(StorySectionContainerBase)`
  min-height: 100vh;
`;

const ButtonLink = styled.a<{primaryColor: string, secondaryColor: string}>`
  && {

  border: 1px solid ${({primaryColor}) => primaryColor};
  color: ${({primaryColor}) => primaryColor};
  font-size: 0.875rem;
  text-transform: uppercase;
  text-decoration: none;
  padding: 0.4rem 0.6rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  display: inline-block;

  }

  &&:hover {
    color: ${({secondaryColor}) => secondaryColor};
    background-color: ${({primaryColor}) => primaryColor};
    border-color: ${({primaryColor}) => primaryColor};
  }
`;

const ButtonContainer = styled.div`
  margin-top: 1.2rem;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const VizTitle = styled.h4`
  margin: 0;
  padding: 0.5rem 0;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  grid-row: 1;

`;

const ExploreMoreButtons = () => {

  let primaryColor = "#000";
  let secondaryColor = "#fff";

  return <ButtonContainer>
        <ButtonLink
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          href={"https://atlas.cid.harvard.edu/countries/155"}
          target={'_blank'}
          key={"linkout_namibia-country-profile"}
        >
        Country Profile
      </ButtonLink>
        <ButtonLink
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          href={"https://growthlab.app/namibia-tool"}
          target={'_blank'}
          key={"linkout_namibia-tool"}
        >
        Industry Dashboard
      </ButtonLink>
      <ButtonLink
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          href={"https://growthlab.cid.harvard.edu/policy-research/namibia"}
          target={'_blank'}
          key={"linkout_namibia-research"}
        >
        Country Research
      </ButtonLink>
  </ButtonContainer>

}

const NamibiaWalvisBayStory = () => {

  const [currentVisualization, setCurrentVisualization] = useState<any | undefined>(undefined);

  const section_0 = useRef<HTMLParagraphElement | null>(null);
  const section_1 = useRef<HTMLParagraphElement | null>(null);
  const section_2 = useRef<HTMLParagraphElement | null>(null);
  const section_3 = useRef<HTMLParagraphElement | null>(null);
  const section_4 = useRef<HTMLParagraphElement | null>(null);
  const section_5 = useRef<HTMLParagraphElement | null>(null);
  const section_6 = useRef<HTMLParagraphElement | null>(null);
  const section_7 = useRef<HTMLParagraphElement | null>(null);
  const section_8 = useRef<HTMLParagraphElement | null>(null);
  const section_9 = useRef<HTMLParagraphElement | null>(null);
  const section_10 = useRef<HTMLParagraphElement | null>(null);
  const section_11 = useRef<HTMLParagraphElement | null>(null);
  const section_12 = useRef<HTMLParagraphElement | null>(null);


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
    section_9,
    section_10,
    section_11,
    section_12
  ]});

  const visualizationsPerSection = [
    {sectionIndex: 1, sectionRef: section_1, image: "Pop_Cities.png"},
    {sectionIndex: 2, sectionRef: section_2, image: "Pop_Travel_Time_2.png"},
    {sectionIndex: 3, sectionRef: section_3, image: "Pop_Travel_Time_3.png"},
    {sectionIndex: 4, sectionRef: section_4, image: "area_barplot_pop.jpeg"},
    {sectionIndex: 5, sectionRef: section_5, image: "PC_Railways.png"},
    {sectionIndex: 6, sectionRef: section_6, image: "shipping_routes_3.png"},
    {sectionIndex: 7, sectionRef: section_7, image: "namibia-line-chart-1.png"},
    {sectionIndex: 8, sectionRef: section_8, image: "namibia-line-chart-2.png"},
    {sectionIndex: 9, sectionRef: section_9, image: "Scatter.png"},
    {sectionIndex: 10, sectionRef: section_10, image: "TreeMap.png", title: "Re-exports by HS-4 commodity 2015-2020"},
    {sectionIndex: 11, sectionRef: section_11, image: "mines.png"},
    {sectionIndex: 12, sectionRef: section_12, image: "Namibia-vertical-bar-chart.png"}
  ];

  useEffect(() => {
    if(section) {
      let matchingVisualizationPerSection = visualizationsPerSection.find((item: any) => item.sectionIndex == section);

      if(matchingVisualizationPerSection) {
        setCurrentVisualization(matchingVisualizationPerSection);
      }
    }

  }, [section]);

  const visualizationImage = currentVisualization !== undefined ? 
    (
      <FadeInContainer>
    <FullScreenImage src={require(`./images/${currentVisualization.image}`)} />
    </FadeInContainer>
    ) : null;

  const visualizationTitle = currentVisualization && ('title' in currentVisualization) ? 
  (
    <FadeInContainer>
  <VizTitle>{currentVisualization.title}</VizTitle>
  </FadeInContainer>
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
      <DefaultHubHeader />
      <SmartCoverPhoto
        highResSrc={CoverPhotoImage}
        lowResSrc={CoverPhotoImageLowRes}
      />
      <Root>
        <StoriesGrid>
          <Heading>
            <FullWidth>
              <StoryTitle>Port Resiliency in the Face of Global Shocks: The Case of Walvis Bay in Namibia</StoryTitle>
              <Authors>
                May 14, 2023
              </Authors>
              <Authors>
                By Fernando Garcia, Nikita Taniparti, and Douglas Barrios
              </Authors>
              <ExploreMoreButtons />
            </FullWidth>
          </Heading>
        </StoriesGrid>
        <StoriesGrid>
          <SingleColumnNarrative ref={section_0}>
          <p>
                  Ports are essential for global trade and economic development, acting as key connectors for the movement of goods and people around the world. Beyond their function as trade facilitators, port cities themselves can serve as significant <a target="_blank" href="https://growthlab.app/port-ecosystems">economic hubs</a>. For instance, in cities such as Singapore, Rotterdam, and Antwerp, while their respective ports only account for a small percentage of global container trade (4.7%, 1.9%, and 0.9%, respectively), they are responsible for a substantial proportion of national employment within a 10-kilometer radius of the port location (28.9%, 6.1%, and 6.4%).
                  </p>
                  <p>
                  Ports are not immune to globalization and the potential for global shocks to disrupt their economic performance. As global shipping lines continue to consolidate, supply chain disruptions and commodity shocks can have far-reaching effects on ports’ performance, making it imperative for these key nodes to focus on maintaining their resilience.
                  </p>
                  <p>
                  One challenge facing many ports in the African subcontinent is the need to maintain their competitiveness in the face of increasing global competition. To remain economically viable, ports must invest in efficient operations in logistics, transportation, and service-related industries and make significant capital investments in handling capacity to keep up with demand. Failure to do so creates opportunities for other ports while also increasing the volatility of trade flows once trade shocks occur.
                  </p>
          </SingleColumnNarrative>
        </StoriesGrid>
        <StoriesGrid>
          <VizContainer style={{
            position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
            height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
          }}>
            <StickyContainer>
              {visualizationTitle}
              {(section && section >=1 && section <= 9) ? visualizationImage : null}
            </StickyContainer>
          </VizContainer>
          <MainNarrativeRoot ref={section_0}>
            <TextBlock>
              <StorySectionContainer>

                <StickyText>
                  <MobileText ref={section_1}>
                  <p>
                  The ability to attract volumes through ports depends partly on their proximity to population centers. This is highlighted by the population density map of Africa, which reveals that population centers are heterogeneously distributed across the continent. Some of the largest cities in Africa, including Kinshasa in the Democratic Republic of the Congo, Lagos in Nigeria, Luanda in Angola, Dar es Salaam in Tanzania, Johannesburg in South Africa, and Abidjan in Ivory Coast, are key examples of population centers that are likely to be major contributors to port traffic. These cities, among others, play a significant role in shaping the demand for port services across the African continent.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_2}>
                    <p>
                    Connectivity between population centers across Africa also varies, with travel times from the nearest port being a key factor. This can be observed by visualizing the time it takes to reach population centers from the nearest port, where driving for 16 hours can lead to vastly different distances depending on the starting point. For instance, ports located in the southern, mid-western, and eastern regions of Africa, such as Walvis Bay in Namibia, Luanda and Lobito in Angola, Durban in South Africa, and Beira in Mozambique, among others, play a crucial role in connecting these regions to population centers. However, the distance and connectivity between these population centers and ports can vary greatly.
                    </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_3}>
                    <p>
                    The case of the Port of Walvis Bay is particularly interesting. Walvis Bay is supported by a strong road network that covers vast distances in 16 hours. But driving this far doesn’t reach many significant population centers. For example, in 16 hours of travel by road, you can reach the south of Angola, west of Botswana, north of South Africa, or southeast Zambia. Notably, Namibia is the second least densely populated country globally, and Walvis Bay is relatively unconnected to markets. This is in stark contrast to ports like Luanda, Durban, or Beira.
                    </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_4}>
                    <p>
                    Concretely, one can calculate the number of people in these 16-hour travel time areas and find that the Port of Walvis Bay is the least connected to population centers among these peer ports. This matters while evaluating the port’s competitiveness and the ability to attract volumes and generate economic activity to drive growth in the region. 
                    </p>
                    </MobileText>
                    </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_5}>
                  <p>
                  Besides roads, railways can connect ports to inland population centers. Even though rail transportation is more time- and cost-effective when traveling long distances, connectivity by rail to Walvis Bay doesn’t compare to regional ports. There are currently no direct connections from Walvis Bay to Botswana, Zambia, or Zimbabwe. At the same time, there are direct rail lines between Zambia and the Democratic Republic of the Congo to the Port of Lobito, Angola.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_6}>
                  <p>
                  Even internationally, Walvis Bay is not directly linked to the main maritime shipping routes — as is the case of South Africa, for example — adding further friction to its connectivity and interaction with global trade dynamics.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_7}>
                  <p>
                  Despite the odds, Walvis Bay experienced a significant and impressive fourteen-fold increase in containerized cargo between 2000-2012. During the commodity price supercycle of the 2000s, commodities such as oil, metals, and agricultural products surged, providing a boon for many African nations. In response, these countries increased their exports and were able to import more goods for consumption and investment. One beneficiary of this trend was the Walvis Bay Port, which experienced a surge in demand for imported goods in neighboring Angola. This surge in demand was partly driven by the Port of Luanda's reduced competitiveness and the heavily congested ports in South Africa. As a result, major global shipping lines began to rely on Walvis Bay as a transshipment hub. Although very small, its market share in containerized traffic increased five-fold during this period. The port's success continued to grow as its uncongested and efficient operations met the rising demand for commodities in the region.
                  </p>
                  <p>
                  With an eye toward the future, Walvis Bay embarked on an ambitious port expansion in 2014 to prepare for further volume increases at a time where the utilization rate of the container terminal stood at 95%. The expansion project, completed in 2019, increased the port's capacity from 350 thousand twenty-foot equivalent units (TEUs) — a standard unit of measurement used in the shipping industry to quantify the cargo capacity of a container — to 750 thousand TEUs. This major upgrade sets the stage for even more significant growth and development for Walvis Bay, cementing its status as a key player in the transshipment business. 
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                <MobileText ref={section_8}>
                  <p>
                  However, the demand abruptly fell after 2012 due to the crash in global commodity prices. Markets in Namibia, Angola, and South Africa witnessed steep drops in demand and imports. The fallout from this sharp decline was felt acutely at the Port of Walvis Bay, which saw containerized traffic plummet immediately. Today, containerized volumes have not recovered to the level at the height of the boom and stand just below 200 thousand TEUs. Demand fell, curtailing volumes, and the expansion of the port was rendered ineffectual. This double whammy meant that the port’s utilization rate fell from 95% in 2012 to 23%, which heavily impacted the port’s revenue by 2022.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_9}>
                  <p>
                  While the current utilization rate suggests a lackluster economic outlook for the port, absolute volumes are not strikingly low. On average, higher incomes are associated with larger container traffic volumes in countries. Namibia experienced a sharp fall in volumes, but because it outperformed expectations in volume during the economic boom, the current level of traffic through Walvis Bay is in line with countries of similar incomes.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
            </TextBlock>
          </MainNarrativeRoot>
        </StoriesGrid>
      <StoriesGrid>
        <SingleColumnNarrative>
                  <p>
                  The Port of Walvis Bay has faced its fair share of setbacks over the years. Despite facing challenges such as poor connectivity and limited market access, the port managed to attract substantial container traffic to meet the high demand from neighboring countries during the global commodity supercycle. However, when these markets experienced a decline in purchasing power, the port suffered a collapse in transshipment, resulting in a significant drop in cargo volume.
                  </p>
                  <p>
                  Moving forward, the volume of cargo handled at the port will be limited by Namibia's economic growth, unless there is an increase in external demand and ports in the region remain uncompetitive. The port's best chance for growth is to align itself with Namibia's overall economic expansion. While there are potential opportunities for growth in the future, authorities must be prepared to seize them. There are at least two promising avenues to do so.
                  </p>
                </SingleColumnNarrative>
        </StoriesGrid>
        <StoriesGrid>
        <VizContainer style={{
              position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
              height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
            }}>

              <StickyContainer>
              {visualizationTitle}
              {(section && section >=10) ? visualizationImage : null}

              </StickyContainer>
            </VizContainer>
            <MainNarrativeRoot>
              <TextBlock>
              <StorySectionContainer>
                <StickyText>
                  <MobileText ref={section_10}>
                  <p>
                  First, Namibia has demonstrated success at re-exporting mineral products. Between 2015-2020, the main re-exports were unrefined copper and diamonds, primarily to China and Belgium. Zooming in on copper, re-exports increased twelve-fold in value during this time. The cargo originates in Solwezi, Zambia, and is exported through Walvis Bay to reach Belgium. Why Walvis Bay?
                  </p>
                  <p>
                  Despite Solwezi being closer to Beira, Mozambique, travel time is comparable, and choosing Walvis Bay as the port for exports reduces the number of national borders that must be crossed. Additionally, once turn-around times — the time it takes for a truck to unload its cargo and depart from the port — are factored in, it is faster and cheaper to export through Walvis Bay than to Dar es Salaam, Tanzania, or Durban, South Africa. Finally, Walvis Bay lies along an efficient maritime route to Europe via West Africa.
                  </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_11}>
                  <p>
                  The re-export of copper from Solwezi, Zambia, stands as a successful example of the potential for Walvis Bay to become a crucial hub for the re-export of critical minerals and raw materials, particularly as the world moves towards cleaner technologies that require these resources for electrification. Building on this success, targeted initiatives can be established to facilitate the re-export of additional copper from the Democratic Republic of Congo (DRC) and cobalt from both Zambia and the DRC. The Walvis Bay Port's strategic location and well-established infrastructure make it well positioned to play a central role in facilitating such exports. As a result, it is imperative that the port continues to foster an environment that is conducive to the movement of these vital resources, thus enabling southern Africa to capitalize on the growing global demand for critical minerals and raw materials.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_12}>
                  <p>
                  Second, the US, EU, and Asia are increasingly investing in green hydrogen as a means of decarbonizing fuel-intensive industries such as steel and cement manufacturing. Given Namibia's abundant and largely untapped potential for solar and wind energy, the country has become an attractive destination for major investments in green hydrogen. The potential for hydrogen to be commercially viable in liquid form for transportation by ship could further drive demand for this renewable energy source. Ports can be crucial in facilitating green hydrogen projects by providing infrastructure and services that support green hydrogen production, storage, transportation, and distribution to key markets in the EU, the US, and Asia. Therefore, as Namibia taps into its renewable energy potential and diversifies into new economic activities to support global decarbonization efforts, the Port of Walvis Bay can play a role in the green hydrogen value-chain by making its spare capacity available, collaborating with government officials, partnering with importing countries and ports, and developing its workforce to handle this potential surge in demand.
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              </TextBlock>
            </MainNarrativeRoot>
          </StoriesGrid>
          <StoriesGrid>
            <SingleColumnNarrative>
                  <p>
                  Ultimately, the Port of Walvis Bay in Namibia depends in part on its connectedness to inland markets and is, therefore, vulnerable to shocks affecting those markets. Nonetheless, it can improve its economic resilience by capitalizing on global developments in clean energy technologies and the closeness to mining operations in the region. While the port may remain a potential hub for transshipment, it has pathways toward developing its own comparative advantages.
                  </p>
                  </SingleColumnNarrative>
        </StoriesGrid>
      </Root>
      <StandardFooter />
    </>
  );
};

export default NamibiaWalvisBayStory;
