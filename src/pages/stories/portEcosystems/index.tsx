import React, {
  useRef,
} from 'react';
import {
  StoriesFlexContainer,
} from '../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StorySectionContainer as StorySectionContainerBase,
  Authors,
  StickyContainer as StickyContainerBase,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components';

import StandardFooter from '../../../components/text/StandardFooter';
import CoverPhotoImage from './images/cover-photo1.jpg';
import CoverPhotoImageLowRes from './images/cover-photo1.jpg'; // NEED LOW-RES
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../components/navigation/DefaultHubHeader';
import {
  RootStandard,
  Heading,
  MainNarrativeRoot,
  VizContainer as VizContainerBase,
  MobileText as MobileTextBase,
  // FadeInContainer,
} from '../sharedStyling';
import FullScreenImage from './FullScreenImage';

const Root = styled(RootStandard)`
  background-color: unset;
`;

const StorySectionContainer = styled(StorySectionContainerBase)`
  display: flex;
  flex-direction: row;
`;

const VizContainer = styled(VizContainerBase)`
  flex: 8 0;
  min-height: 100vh;
`;


const StickyCenteredContainer = styled(StickyContainerBase)`
  justify-content: flex-start;
  padding-top: 2rem;
  & img {
    width: 100%;
    object-fit: contain;
  }
`;

const MobileText = styled(MobileTextBase)`
  padding-top: 2rem;
  flex: 5 0;
  padding-left: 2rem;
`;

const metaTitle = 'Harboring Opportunity: The Industrial Ecosystems of Port Cities | Harvard Growth Lab';
const metaDescription = 'TBD';



const PortEcosystemsStory = () => {
  const section_0 = useRef<HTMLParagraphElement | null>(null);
  const section_1 = useRef<HTMLParagraphElement | null>(null);
  const section_2 = useRef<HTMLParagraphElement | null>(null);
  const section_3 = useRef<HTMLParagraphElement | null>(null);
  const section_4 = useRef<HTMLParagraphElement | null>(null);
  const section_5 = useRef<HTMLParagraphElement | null>(null);
  const section_6 = useRef<HTMLParagraphElement | null>(null);
  const section_7 = useRef<HTMLParagraphElement | null>(null);
  const section_8 = useRef<HTMLParagraphElement | null>(null);
  // const section_10 = useRef<HTMLParagraphElement | null>(null);
  // const section_11 = useRef<HTMLParagraphElement | null>(null);
  // const section_12 = useRef<HTMLParagraphElement | null>(null);
  // const section_13 = useRef<HTMLParagraphElement | null>(null);
  // const section_14 = useRef<HTMLParagraphElement | null>(null);
  // const section_15 = useRef<HTMLParagraphElement | null>(null);
  // const section_16 = useRef<HTMLParagraphElement | null>(null);
  // const section_17 = useRef<HTMLParagraphElement | null>(null);
  // const section_18 = useRef<HTMLParagraphElement | null>(null);

  // const {section} = useScrollingSections({refs: [
  //   section_0,
  //   section_1,
  //   section_2,
  //   section_3,
  //   section_4,
  //   section_5,
  //   section_6,
  //   section_7,
  //   section_8,
  //   section_10,
  //   section_11,
  //   section_12,
  //   section_13,
  //   section_14,
  //   section_15,
  //   section_16,
  //   section_17,
  //   section_18,
  // ]});

  // const prevSection = usePrevious(section);




  // const formatYear = (maxYear: number) => (n: number) => {
  //   const year = window.innerWidth > storyMobileWidth ? n.toString() : n.toString().replace('20', '\'');
  //   return n - Math.ceil(n) === 0 && n <= maxYear ? year : '';
  // };



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
        <StoriesFlexContainer>
          <Heading>
            <FullWidth>
              <StoryTitle>Harboring Opportunity: The Industrial Ecosystems of Port Cities</StoryTitle>
              <Authors>
                TBD publish date
              </Authors>
              <Authors>
                By TBD
              </Authors>
            </FullWidth>
          </Heading>
        </StoriesFlexContainer>
        <StoriesFlexContainer>
          <MainNarrativeRoot ref={section_0}>
            <TextBlock>
              <StorySectionContainer>
                  <p>
                  Commercial ports are complex ecosystems that drive globalization and trade as we know it today. The COVID-19 pandemic and subsequent disruptions to the global supply chain have put a spotlight on the central role ports that play in shaping how we live. The cities where ports are located are particularly vulnerable to shifting market dynamics and the business decisions of shipping lines. While we often think about ports as gateways for transporting goods and materials across cities, countries, and continents, it is also relevant to ask: how do ports play a role in shaping their <em>local</em> economies? To hedge against vulnerabilities, how can port cities capitalize on their productive strengths to develop other industries?
                  </p>
                
              </StorySectionContainer>
              <StorySectionContainer>
                
                  <MobileText ref={section_1}>
                  <p>
                  Today, there are nearly 1,000 commercial ports that are situated within cities and towns in every corner of the world. Some are very large ports that serve as major crossroads for routes along global supply chains (Shanghai, China; Rotterdam, Netherlands); others are very small ports that focus on serving the immediate hinterland (Bethel, United States). Some are situated in major cities that also serve as the capitals of their respective countries (Manila, Philippines; Buenos Aires, Argentina); others are located in relatively small cities and serve as the main driver of the city’s growth (Gioia Tauro, Italy; Algeciras, Spain).
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                
                  <MobileText ref={section_2}>
                  <p>
                  No matter the location or size of these ports, each one operates within a local ecosystem of industries that support port operations, process import/export activities, and transport goods inland. This ecosystem includes industries across many sectors, including transportation and warehousing, repair and maintenance, automation, and ICT. Some of these industries employ people with specialized skills for port functions, such as freight handling or marine engineering; other industries contribute to port functions but are also used by a range of other economic activities, such as financial and legal services. Some industries develop near ports not because they are needed for port functions, but because they benefit from having access to the resources, skills, and capabilities that the port offers, such as assembly plants and passenger cruise terminals. 
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                
                  <MobileText ref={section_2}>
                  <p>
                  We set out to identify which salient industries constitute this local ecosystem around ports. We analyze industries that are not only present in port cities, but are more heavily concentrated near ports than in the world overall. By better identifying the economic activities that form this ecosystem, we can highlight policies that better target the regional development goals of port cities and better adapt policy measures to respond to local dynamics. For smaller port areas that aspire to diversify their economic activity for new engines of growth and employment, these industries can serve as a starting point as options that leverage the resources of the port.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/1_all_ports_map_v2.svg")}/>
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText ref={section_3}>
                  <p>
                  How do we identify this ecosystem? We use global data from Dun & Bradstreet on business establishments to analyze how employment is concentrated across industries in 463 port cities in 49 countries. Our analysis focuses on cities that are not country capitals and have a population greater than 50,000 people. The analysis also does not include dry ports such as freight villages in the United Kingdom or intermodal logistics parks in the United States.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
              <VizContainer>
              <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/2_recife_map.png")} />
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText ref={section_4}>
                    <p>
                    To understand the specific economic activities that happen near each port, we draw geographic buffer zones around the coordinates of each port. We create perimeters of 2, 5, 10, and 15 kilometers and take stock of the establishments registered within each zone. Here’s what those buffer zones look like around the port of Recife in Brazil. Each point represents an establishment from the database.
                    </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/3_antwerp_map.png")}/>
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText>
                    <p>
                    By comparison, here’s what those buffer zones look like for the port of Antwerp in Belgium. As we can see, port zones can have very different densities of establishments.
                    </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/4a_antwerp_treemap_5km_withlegend.svg")} />
                  </StickyCenteredContainer>
                </VizContainer>
                  
                    <MobileText ref={section_5}>
                    <p>
                    What economic activities occur in these zones? In the city of Antwerp, our database records 81,500 employees within 5 kilometers of the port. In this area, employment is most concentrated in transportation and warehousing and in professional, scientific and technical services including architecture and engineering services. 
                    </p>
                    </MobileText>
                  
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/4b_antwerp_treemap_10km.svg")} />
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText ref={section_6}>
                  <p>
                  We can zoom out to a larger view of 10 kilometers around the port and observe how the concentration of employment changes across sectors. At this distance, our data records 151,000 total employees, with a lower share of employment in transportation and warehousing and higher share of employment in construction, manufacturing and healthcare compared to the 5 kilometer zone. 
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/5_naics_chapter_world_vs_ports_10km.svg")} />
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText ref={section_7}>
                  <p>
                  By analyzing the employment composition in all port cities in our dataset, we can identify which industries seem to concentrate more heavily near ports. Here we show some of these sectors. The darker bars indicate each sector’s concentration of employment in the world, while the lighter bars indicate each sector’s concentration of employment within 10 kilometers of ports. When the lighter bars are greater than the darker ones, these industries are counted as intensively more present in ports than in the world overall. However, we can disaggregate these broad sectors into detailed sub-sectors and similarly analyze the relative employment shares in port cities and globally. This illustrates that even when broad economic sectors may have similar shares of employment near ports and in the world overall, the types of activities within each sector can be quite different.

                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/6_prof_services_world_vs_ports_10km.svg")} />
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText ref={section_8}>
                  <p>
                  For example, the sector of professional, scientific, and technical services employs a significant and similar share of people within 10 kilometers of ports and in the world overall (8.5% and 8% of employment respectively). Breaking this down into more detailed industries, we find that the activities most present near ports are actually quite different than those most engaged globally. This figure shows a handful of industries classified within the professional services sector. Globally, 33% of employment within the sector is concentrated in computer systems design services, while near ports it occupies just 16% of employment in the sector. Near ports, architecture and engineering services make up the largest industry within this sector and have a concentration that is 1.5 times larger than the global share. These differences are observed across other sectors, too: manufacturing comprises 14% of employment within 10 kilometers of ports but 24% of employment globally. The largest industries by employment near ports are food and transportation equipment manufacturing, while the largest by employment in the world are manufacturing of computer and electronic products, machinery, and fabricated metal products.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/7_prof_services_rca.png")} />
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText>
                  <p>
                  For each industry, the ratio of its employment share near ports to its employment share globally is the revealed comparative advantage (RCA) of that industry in port cities.  Industries that have higher concentrations of employment near ports than in the world overall (RCA &gt; 1) may have features that make it advantageous or necessary to locate near ports, such as the resources or skills it requires, the types of establishments that consume the industry, the cost of transportation, or other unobserved characteristics. For these reasons, these industries may be strategic diversification options for a city looking to leverage the presence of its port to develop other competitive industries.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                {/* TABLE OF DATA HERE */}
                
                  <MobileText>
                  <p>
                  We construct this measure of revealed comparative advantage for all industries using several specifications, including measuring different buffer zones and different ratios of industry presence. We search for industries that have a comparative advantage near ports (RCA &gt; 1) while also being economically significant in terms of employment (at least 1% of employees across all port cities). Moreover, we include a handful of capital-intensive industries that do not comprise a significant share of employment but are demanded relatively more by the industry encompassing port operations. Across these different specifications, we find 39 industries that have significant and concentrated employment near ports compared to the world overall. These industries most often fall within the sectors of transportation and warehousing, construction, trade, professional and support services.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                
                  <MobileText>
                  <p>
                  We then ask: which of these industries share the closest latent capabilities with ports and their operations? Within our global dataset, a subset of establishments report that they engage in several different industries, not only one. In this industry classification system, port operations themselves are classified within the broader category of support activities for water transportation, which includes marine cargo handling and navigational services to shipping. To map which of the 39 industries in the list above are more closely linked to port operations, we examine which other industries are most likely to be reported by establishments that also engage in support activities for water transportation.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                <VizContainer>
                <StickyCenteredContainer>
                  <FullScreenImage src={require("./images/8_ring_reduced.png")} fullSizeSrc={require("./images/8_ring_full.png")}/>
                  </StickyCenteredContainer>
                </VizContainer>
                
                  <MobileText>
                  <p>
                  This ring chart visualizes industries that are found to be most closely linked to support activities for water transportation. Those closer to the center are more similar to support activities for water transportation in terms of the capabilities needed to engage in them. Industries with a red ring are those that port cities have a strong comparative advantage in (RCA &gt; 1) relative to the rest of the world -- they are in the list of 39 industries. For example, we find that other support activities for transportation and freight transport arrangement are most closely associated with support activities for water transportation. Industries that are intensively present in port cities but that are less similar to support activities for water transportation are ship and boat building, wholesalers of various goods, construction and other services. This analysis can help us disentangle which types of activities concentrate more heavily near ports because they might share closer capabilities with port functions and which activities might locate near ports for other reasons. As can be seen as well, some industries most similar to port operations do not necessarily have a comparative advantage in port cities, but are found intensively in many other places around the world.
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
              <StorySectionContainer>
                
                  <MobileText>
                  <p>
                  This exercise identified what kinds of activities thrive within local port ecosystems by examining employment data in over 450 ports globally. Though no two port cities are the same, they may share the capabilities for port functions that can be leveraged for the development of a wide range of industries. We find that port cities have a relatively large presence of many industries within transportation and trade. While this may be unsurprising, they also have a comparatively higher presence of healthcare and certain professional and support services that may not be immediately obvious to policymakers. Furthermore, while some of these industries share similar characteristics or features to port functions and water transportation, others may be less similar. Armed with these insights, policymakers formulating investment promotion strategies or industrial policy can make more informed decisions about the types of industries that may thrive in their port city. Ultimately, the success of these industries will also depend on contextual factors that are unique to each city, such as the availability of land, scarcity of resources, existing legislative frameworks, and more. For those seeking to enhance the economic resilience of port cities, these industries serve as a targeted starting point.
                  </p>
                  <p>
                  Alongside this story, we’ve published a tool where you can explore the industrial composition of many of the port cities described here, along with hundreds of others around the world. Check it out <a target="_blank" href="https://public.tableau.com/app/profile/gl.namibia/viz/IndustrialEcosystemsofPortCities/Dashboard1?publish=yes">here</a>!
                  </p>
                  </MobileText>
                
              </StorySectionContainer>
            </TextBlock>
          </MainNarrativeRoot>
        </StoriesFlexContainer>
      </Root>
      <StandardFooter />
    </>
  );
};

export default PortEcosystemsStory;
