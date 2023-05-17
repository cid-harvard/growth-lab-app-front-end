import React, {
  useEffect,
  useRef, useState,
} from 'react';
import { StoriesGrid, storyMobileWidth } from '../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StorySectionContainer as StorySectionContainerBase,
  Authors,
  StickyContainer,
  VizSource
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
  MobileText as MobileTextBase,
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

  & p {
    margin-bottom: 3rem;
  }

  @media (max-width: ${storyMobileWidth}px) {
    min-height: 60vh;
  }

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

const VizTitle = styled.h3`
  margin: 0.5rem 0;
  padding: 0.5rem 0 0;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 400;
  grid-row: 1;
`;

const MobileText = styled(MobileTextBase)`
  @media (max-width: ${storyMobileWidth}px) {
    padding: 20vh 0;
  }

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

  // <VizSource>Source: <em>{vizSource}</em></VizSource>

  const visualizationsPerSection = [
    {sectionIndex: 1, sectionRef: section_1, image: "Pop_Cities.png", title: "Africa's Population Density and 16-hour Travel Times", source: "Own elaboration using WorldPop and ArcGIS Routing API"},
    {sectionIndex: 2, sectionRef: section_2, image: "Pop_Travel_Time_2.png", title: "Africa's Population Density and 16-hour Travel Times", source: "Own elaboration using WorldPop and ArcGIS Routing API"},
    {sectionIndex: 3, sectionRef: section_3, image: "Pop_Travel_Time_3.png", title: "Africa's Population Density and 16-hour Travel Times", source: "Own elaboration using WorldPop and ArcGIS Routing API"},
    {sectionIndex: 4, sectionRef: section_4, image: "area_barplot_pop.png", title: "Port Connectivity to Population Centers within 16 Hours Travel Time", source: "Own elaboration"},
    {sectionIndex: 5, sectionRef: section_5, image: "PC_Railways.png", title: "Rail Connectivity in Southern Africa", source: "Own elaboration using OMS"},
    {sectionIndex: 6, sectionRef: section_6, image: "shipping_routes_3.png", title: "The Walvis Bay Port and Global Shipping Lanes", source: "Benden, P. (2022). Global Shipping Lanes. Zenodo."},
    {sectionIndex: 7, sectionRef: section_7, image: "namibia-line-chart-1-no-title.png", title: "Container Cargo Handled at the Walvis Bay Port", source: "Namibian Port Authority"},
    {sectionIndex: 8, sectionRef: section_8, image: "namibia-line-chart-2-no-title.png", title: "Container Cargo Handled at the Walvis Bay Port", source: "Namibian Port Authority"},
    {sectionIndex: 9, sectionRef: section_9, image: "Scatter.png", title: "GDP vs. Container Traffic Per Capita in 2019", source: "WDI"},
    {sectionIndex: 10, sectionRef: section_10, image: "nam_reexports_new_withlegend-transparent.svg", title: "Re-exports by HS-4 Commodity 2015-2020", source: "COMTRADE"},
    {sectionIndex: 11, sectionRef: section_11, image: "mines.png", title: "Mining Projects in Africa by the Type of Mineral", source: "World Bank"},
    {sectionIndex: 12, sectionRef: section_12, image: "Namibia-vertical-bar-chart.png", source: "EIA and IRENA"}
  ];

  useEffect(() => {
    if(section) {
      let matchingVisualizationPerSection = visualizationsPerSection.find((item: any) => item.sectionIndex == section);

      if(matchingVisualizationPerSection) {
        setCurrentVisualization(matchingVisualizationPerSection);
      }
    }

  }, [section]);

  let useVisualization = currentVisualization === undefined ? visualizationsPerSection[0] : currentVisualization;

  const visualizationImage = useVisualization !== undefined ? 
    (
      <FadeInContainer>
    <FullScreenImage src={require(`./images/${useVisualization.image}`)} />
    </FadeInContainer>
    ) : null;

  const visualizationTitle = useVisualization && ('title' in useVisualization) ? 
  (
    <FadeInContainer>
  <VizTitle>{useVisualization.title}</VizTitle>
  </FadeInContainer>
  ) : null;

  const visualizationSource = useVisualization !== undefined && ('source' in useVisualization) ? (
    <FadeInContainer><VizSource>Source: <em>{useVisualization.source}</em></VizSource></FadeInContainer>
  ) : null

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
                May 18, 2023
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
                    Ports are critical for global trade, connecting goods and people across the world. Even though some ports may account for a small percentage of global trade, they serve as <a target='_blank' href='https://growthlab.app/port-ecosystems'>economic hubs</a> and are responsible for a significant portion of national employment within their vicinity. However, ports are vulnerable to global shocks that can disrupt their economic performance, making it crucial to maintain their resilience.
                  </p>
          </SingleColumnNarrative>
        </StoriesGrid>
        <StoriesGrid>
          <VizContainer style={{
            position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
            height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
          }}>
            <StickyContainer>
              {(!section || (section && section >=1 && section <= 9)) ? <>{visualizationTitle}{visualizationImage}{visualizationSource}</> : null}
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
                    Connectivity between population centers across Africa also varies, with travel times from the nearest port being a key factor. This can be observed by visualizing the time it takes to reach population centers from the nearest port, where driving for 16 hours can lead to vastly different distances depending on the starting point. For instance, ports located in the southern, mid-western, and eastern regions of Africa, such as Luanda and Lobito in Angola, Durban in South Africa, and Beira in Mozambique, among others, play a crucial role in connecting these regions to population centers. However, the distance and connectivity between these population centers and ports can vary greatly.
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
                  Despite the odds, Walvis Bay experienced an impressive fourteen-fold increase in containerized cargo during the commodity price supercycle of the 2000s. Commodities such as oil, metals, and agricultural products surged, providing a boon for many African nations. In response, these countries increased their exports and imported more goods for consumption and investment. Ports in Angola and South Africa were unable to keep up with the surge in demand and one beneficiary of this trend was the Walvis Bay Port. Major global shipping lines began to rely on Walvis Bay as a transshipment hub. The port's success continued to grow as its uncongested and efficient operations met the rising demand in the region.
                  </p>
                  <p>
                  With an eye toward the future, Walvis Bay embarked on an ambitious port expansion in 2014 to prepare for further volume increases at a time where the utilization rate of the container terminal stood at 95%. The expansion project, completed in 2019, increased the port's capacity from 350 thousand twenty-foot equivalent units (TEUs) — a standard unit of measurement used in the shipping industry to quantify the cargo capacity of a container — to 750 thousand TEUs. This major upgrade looked to cement its status as a key player in the transshipment business. 
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                <MobileText ref={section_8}>
                  <p>
                  However, the demand abruptly fell after 2012 due to the crash in global commodity prices. Markets in Namibia, Angola, and South Africa witnessed steep drops in demand and imports. The fallout from this sharp decline was felt acutely at the Port of Walvis Bay, which saw containerized traffic plummet immediately. Today, containerized volumes have not recovered to the level at the height of the boom and stand just below 200 thousand TEUs. Demand fell, curtailing volumes, and the expansion of the port was rendered ineffectual. This dual impact meant that the port’s utilization rate fell from 95% in 2012 to 23%, which heavily impacted the port’s revenue by 2022.
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
              {(section && section >=10) ? <>{visualizationTitle}{visualizationImage}{visualizationSource}</> : null}
              </StickyContainer>
            </VizContainer>
            <MainNarrativeRoot>
              <TextBlock>
              <StorySectionContainer>
                <StickyText>
                  <MobileText ref={section_10}>
                  <p>
                  First, Namibia has demonstrated success at re-exporting mineral products. Between 2015-2020, the main re-exports were unrefined copper and diamonds, primarily to China and Belgium. Zooming in on copper, re-exports increased twelve-fold in value during this time. The cargo originates in Solwezi, Zambia, and is exported through Walvis Bay to reach Europe. Why Walvis Bay? Despite Solwezi being closer to Beira, Mozambique, travel time is comparable, choosing Walvis Bay as the port for exports reduces the number of national borders that must be crossed, and once turn-around times are factored in, it is faster and cheaper to export through Walvis Bay. Finally, Walvis Bay lies along an efficient maritime route to Europe via West Africa.
                  </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_11}>
                  <p>
                  The re-export of copper from Solwezi, Zambia, stands as a successful example of the potential for Walvis Bay to become a crucial hub for the re-export of critical minerals and raw materials, particularly as the world moves towards cleaner technologies that require these resources for electrification. Building on this success, targeted initiatives can be established to facilitate the re-export of additional copper from the Democratic Republic of Congo (DRC) and cobalt from both Zambia and the DRC. The Walvis Bay Port's strategic location and well-established infrastructure make it well positioned to play a central role in facilitating such exports. 
                  </p>
                  </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer>
              <StickyText>
                  <MobileText ref={section_12}>
                  <p>
                  Second, the US, EU, and Asia are increasingly investing in green hydrogen as a means of decarbonizing fuel-intensive industries such as steel and cement manufacturing. Given Namibia's abundant and largely untapped potential for solar and wind energy, the country has become an attractive destination for major investments in green hydrogen. Transport and storage costs will play a significant role in the competitiveness of hydrogen. The potential for hydrogen to be commercially viable in liquid form or as ammonia for transportation by ship could further drive demand for this renewable energy source. Ports can be crucial in facilitating green hydrogen projects by providing infrastructure and services that support green hydrogen production, storage, transportation, and distribution to key markets in the EU, the US, and Asia. Therefore, as Namibia taps into its renewable energy potential and diversifies into new economic activities to support global decarbonization efforts, the Port of Walvis Bay can play a role in the green hydrogen value-chain by making its spare capacity available, collaborating with government officials, partnering with importing countries and ports, and developing its workforce to handle this potential surge in demand.
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
