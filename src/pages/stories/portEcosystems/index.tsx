import React, {
  useEffect,
  useRef, useState,
} from 'react';
import {
 StoriesGrid,
} from '../../../styling/Grid';
import {
  FullWidth,
  StoryTitle,
  StorySectionContainer as StorySectionContainerBase,
  Authors,
  StickyContainer as StickyContainerBase,
  VizSource,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import styled from 'styled-components';
import DynamicTable from './DynamicTable';
import StandardFooter from '../../../components/text/StandardFooter';
import CoverPhotoImage from './images/cover-photo1-cropped.jpg';
import CoverPhotoImageLowRes from './images/cover-photo1-cropped-lowres.jpg';
import Helmet from 'react-helmet';
import SmartCoverPhoto from '../../../components/general/SmartCoverPhoto';
import DefaultHubHeader from '../../../components/navigation/DefaultHubHeader';
import {
  RootStandard as Root,
  Heading,
  MainNarrativeRoot as MainNarrativeRootBase,
  VizContainer as VizContainerBase,
  MobileText as MobileTextBase,
  SingleColumnNarrative as SingleColumnNarrativeBase,
  StickyText as StickyTextBase,
  FadeInContainer,
  // FadeInContainer,
} from '../sharedStyling';
import FullScreenImage from './FullScreenImage';
import { storyMobileWidth } from '../../../styling/Grid';
import useScrollingSections from '../../../hooks/useScrollingSections';


const StorySectionContainer = styled(StorySectionContainerBase)`
  min-height: 100vh;

  @media (max-width: ${storyMobileWidth}px) {
    min-height: 60vh;
    padding-bottom: 0;
  }
`;

const TableAndTextFlexContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;

  & * {
    box-sizing: border-box;
  }

  @media (max-width: ${storyMobileWidth}px) {
    flex-direction: column;
  }
`;

const TextContainer = styled.div`
  flex: 1 0 50%;
  padding: 0rem 50px;

  @media (max-width: ${storyMobileWidth}px) {
    padding: 0;
    width: 100%;
  }

`;

const TableContainer = styled.div`
  max-width: 50%;
  flex: 1 0 50%;
  height: 600px;
  padding: 0;
  margin: 0 auto;

  @media (max-width: ${storyMobileWidth}px) {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    flex: 1 0;
  }
`;

const SingleColumnNarrative = styled(SingleColumnNarrativeBase)`
  margin: 5rem 0;
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
    z-index: 1000;
  }

`;

const StickyContainer = styled(StickyContainerBase)`
  @media (max-width: ${storyMobileWidth}px) {
    padding-top: 10vh;
    min-height: 60vh !important;
  }
`;

const StickyText = styled(StickyTextBase)`
  @media (max-width: ${storyMobileWidth}px) {
    min-height: 60vh !important;
    -webkit-transform: translateZ(1px);
    transform: translateZ(1px);

  }
`;

const FirstStickyText = styled(StickyTextBase)`
  @media (max-width: ${storyMobileWidth}px) {
    -webkit-transform: translateZ(1px);
    transform: translateZ(1px);

  }
`;

const FirstMobileText = styled(MobileText)`
  @media (max-width: ${storyMobileWidth}px) {
    padding-top: 0;
  }
`;

const MainNarrativeRoot = styled(MainNarrativeRootBase)`
  @media (max-width: ${storyMobileWidth}px) {
    position: relative;
    z-index: 5000;
  }
`;

const VizContainer = styled(VizContainerBase)`
  @media (max-width: ${storyMobileWidth}px) {
    z-index: 0;
    -webkit-transform: translateZ(-1px);
    transform: translateZ(-1px);
  }
`;


const metaTitle = 'Harboring Opportunity: The Industrial Ecosystems of Port Cities | Harvard Growth Lab';
const metaDescription = 'Commercial ports are crucial to the world economy in driving trade and globalization, but they also play a strong role in shaping their local economies. In this analysis, we investigate the industrial composition of port cities and the types of activities that tend to concentrate more heavily near ports. We assess which of these activities are closely linked to port operations, which of these activities simply occur more frequently in port cities. The analysis suggests ways that these insights can be useful to policymakers seeking to develop and diversify port cities.';

const dataTable = (
  <DynamicTable
  columns={[
    {label: 'NAICS Chapter', key: 'naics_chapter'},
    {label: 'Description', key: 'naics_desc'},
  ]}
  data={[
    // {naics_desc: "Restaurants and Other Eating Places", naics_chapter: "Accommodation and Food Services"},
    // {naics_desc: "Traveler Accommodation", naics_chapter: "Accommodation and Food Services"},
    // {naics_desc: "Employment Services", naics_chapter: "Administrative and Support and Waste Management and Remediation Services"},
    // {naics_desc: "Services to Buildings and Dwellings", naics_chapter: "Administrative and Support and Waste Management and Remediation Services"},
    // {naics_desc: "Investigation and Security Services", naics_chapter: "Administrative and Support and Waste Management and Remediation Services"},
    // {naics_desc: "Travel Arrangement and Reservation Services", naics_chapter: "Administrative and Support and Waste Management and Remediation Services"},
    // {naics_desc: "Nonresidential Building Construction", naics_chapter: "Construction"},
    // {naics_desc: "Building Equipment Contractors", naics_chapter: "Construction"},
    // {naics_desc: "Other Heavy and Civil Engineering Construction", naics_chapter: "Construction"},
    // {naics_desc: "Foundation, Structure, and Building Exterior Contractors", naics_chapter: "Construction"},
    // {naics_desc: "Colleges, Universities, and Professional Schools", naics_chapter: "Educational Services"},
    // {naics_desc: "Other Schools and Instruction", naics_chapter: "Educational Services"},
    // {naics_desc: "General Medical and Surgical Hospitals", naics_chapter: "Health Care and Social Assistance"},
    // {naics_desc: "Offices of Physicians", naics_chapter: "Health Care and Social Assistance"},
    // {naics_desc: "Individual and Family Services", naics_chapter: "Health Care and Social Assistance"},
    // {naics_desc: "Newspaper, Periodical, Book, and Directory Publishers", naics_chapter: "Information"},
    // {naics_desc: "Other Information Services", naics_chapter: "Information"},
    // {naics_desc: "Management of Companies and Enterprises", naics_chapter: "Management of Companies and Enterprises"},
    // {naics_desc: "Bakeries and Tortilla Manufacturing", naics_chapter: "Manufacturing"},
    // {naics_desc: "Ship and Boat Building", naics_chapter: "Manufacturing"},
    // {naics_desc: "Business, Professional, Labor, Political, and Similar Organizations", naics_chapter: "Other Services (except Public Administration)"},
    // {naics_desc: "Personal Care Services", naics_chapter: "Other Services (except Public Administration)"},
    // {naics_desc: "Architectural, Engineering, and Related Services", naics_chapter: "Professional, Scientific, and Technical Services"},
    // {naics_desc: "Other Professional, Scientific, and Technical Services", naics_chapter: "Professional, Scientific, and Technical Services"},
    // {naics_desc: "Legal Services", naics_chapter: "Professional, Scientific, and Technical Services"},
    // {naics_desc: "Accounting, Tax Preparation, Bookkeeping, and Payroll Services", naics_chapter: "Professional, Scientific, and Technical Services"},
    // {naics_desc: "Offices of Real Estate Agents and Brokers", naics_chapter: "Real Estate and Rental and Leasing"},
    // {naics_desc: "Grocery Stores", naics_chapter: "Retail Trade"},
    // {naics_desc: "Other Miscellaneous Store Retailers", naics_chapter: "Retail Trade"},
    // {naics_desc: "Clothing Stores", naics_chapter: "Retail Trade"},
    // {naics_desc: "Building Material and Supplies Dealers", naics_chapter: "Retail Trade"},
    // {naics_desc: "Other Support Activities for Transportation", naics_chapter: "Transportation and Warehousing"},
    // {naics_desc: "Freight Transportation Arrangement", naics_chapter: "Transportation and Warehousing"},
    // {naics_desc: "Scheduled Air Transportation", naics_chapter: "Transportation and Warehousing"},
    // {naics_desc: "Support Activities for Water Transportation", naics_chapter: "Transportation and Warehousing"},
    // {naics_desc: "Specialized Freight Trucking", naics_chapter: "Transportation and Warehousing"},
    // {naics_desc: "Grocery and Related Product Merchant Wholesalers", naics_chapter: "Wholesale Trade"},
    // {naics_desc: "Apparel, Piece Goods, and Notions Merchant Wholesalers", naics_chapter: "Wholesale Trade"},
    // {naics_desc: "Petroleum and Petroleum Products Merchant Wholesalers", naics_chapter: "Wholesale Trade"}
    // Original above, modified below
    {naics_desc: 'Restaurants and Other Eating Places', naics_chapter: 'Accommodation and Food Services'},
    {naics_desc: 'Traveler Accommodation', naics_chapter: ''},
    {naics_desc: 'Employment Services', naics_chapter: 'Administrative and Support and Waste Management and Remediation Services'},
    {naics_desc: 'Services to Buildings and Dwellings', naics_chapter: ''},
    {naics_desc: 'Investigation and Security Services', naics_chapter: ''},
    {naics_desc: 'Travel Arrangement and Reservation Services', naics_chapter: ''},
    {naics_desc: 'Nonresidential Building Construction', naics_chapter: 'Construction'},
    {naics_desc: 'Building Equipment Contractors', naics_chapter: ''},
    {naics_desc: 'Other Heavy and Civil Engineering Construction', naics_chapter: ''},
    {naics_desc: 'Foundation, Structure, and Building Exterior Contractors', naics_chapter: ''},
    {naics_desc: 'Colleges, Universities, and Professional Schools', naics_chapter: 'Educational Services'},
    {naics_desc: 'Other Schools and Instruction', naics_chapter: ''},
    {naics_desc: 'General Medical and Surgical Hospitals', naics_chapter: 'Health Care and Social Assistance'},
    {naics_desc: 'Offices of Physicians', naics_chapter: ''},
    {naics_desc: 'Individual and Family Services', naics_chapter: ''},
    {naics_desc: 'Newspaper, Periodical, Book, and Directory Publishers', naics_chapter: 'Information'},
    {naics_desc: 'Other Information Services', naics_chapter: ''},
    {naics_desc: 'Management of Companies and Enterprises', naics_chapter: 'Management of Companies and Enterprises'},
    {naics_desc: 'Bakeries and Tortilla Manufacturing', naics_chapter: 'Manufacturing'},
    {naics_desc: 'Ship and Boat Building', naics_chapter: ''},
    {naics_desc: 'Business, Professional, Labor, Political, and Similar Organizations', naics_chapter: 'Other Services (except Public Administration)'},
    {naics_desc: 'Personal Care Services', naics_chapter: ''},
    {naics_desc: 'Architectural, Engineering, and Related Services', naics_chapter: 'Professional, Scientific, and Technical Services'},
    {naics_desc: 'Other Professional, Scientific, and Technical Services', naics_chapter: ''},
    {naics_desc: 'Legal Services', naics_chapter: ''},
    {naics_desc: 'Accounting, Tax Preparation, Bookkeeping, and Payroll Services', naics_chapter: ''},
    {naics_desc: 'Offices of Real Estate Agents and Brokers', naics_chapter: 'Real Estate and Rental and Leasing'},
    {naics_desc: 'Grocery Stores', naics_chapter: 'Retail Trade'},
    {naics_desc: 'Other Miscellaneous Store Retailers', naics_chapter: ''},
    {naics_desc: 'Clothing Stores', naics_chapter: ''},
    {naics_desc: 'Building Material and Supplies Dealers', naics_chapter: ''},
    {naics_desc: 'Other Support Activities for Transportation', naics_chapter: 'Transportation and Warehousing'},
    {naics_desc: 'Freight Transportation Arrangement', naics_chapter: ''},
    {naics_desc: 'Scheduled Air Transportation', naics_chapter: ''},
    {naics_desc: 'Support Activities for Water Transportation', naics_chapter: ''},
    {naics_desc: 'Specialized Freight Trucking', naics_chapter: ''},
    {naics_desc: 'Grocery and Related Product Merchant Wholesalers', naics_chapter: 'Wholesale Trade'},
    {naics_desc: 'Apparel, Piece Goods, and Notions Merchant Wholesalers', naics_chapter: ''},
    {naics_desc: 'Petroleum and Petroleum Products Merchant Wholesalers', naics_chapter: ''},
  ]}
  color={'#1f4b79'}
  invertHeading={true}
/>
);

const PortEcosystemsStory = () => {

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
  ]});

  const visualizationsPerSection = [
    {sectionIndex: 1, sectionRef: section_1, image: '1_Global_Ports.png', source: "<a target='_blank' href='https://data.humdata.org/dataset/global-ports'>UN World Food Programme Logistics Database</a>", title: 'Selected Global Port Cities'},
    {sectionIndex: 2, sectionRef: section_2, image: '2_recife_map.png', source: 'Dun & Bradstreet, UN World Food Programme, own calculations', title: 'Recife, Brazil'},
    {sectionIndex: 3, sectionRef: section_3, image: '3_antwerp_map.png', source: 'Dun & Bradstreet, UN World Food Programme, own calculations', title: 'Antwerp, Belgium'},
    {sectionIndex: 4, sectionRef: section_4, image: '4a_antwerp_treemap_5km_(larger_labels_no_legend).svg', source: 'Dun & Bradstreet', title: 'Antwerp, Belgium - Share of Employment, by Industry, within 5km of Port'},
    {sectionIndex: 5, sectionRef: section_5, image: '4b_antwerp_treemap_10km_(larger_labels).svg', source: 'Dun & Bradstreet', title: 'Antwerp, Belgium - Share of employment, by industry, within 10km of Port'},
    {sectionIndex: 6, sectionRef: section_6, image: '5_naics_chapter_world_vs_ports_10km_(transparent_with_legend)-01.svg', source: 'Dun & Bradstreet, own calculations', title: 'Employment Shares by Sector, World vs. Port Zones'},
    {sectionIndex: 7, sectionRef: section_7, image: '6_prof_services_world_vs_ports_10km_(transparent_with_legend)-01.svg', source: 'Dun & Bradstreet, own calculations', title: 'Employment Shares in Professional Services by Activity, World vs. Port Zones'},
    {sectionIndex: 8, sectionRef: section_8, image: '7_prof_services_rca.png', source: 'Dun & Bradstreet, own calculations', title: 'RCA of Port Cities in Professional Services'},
    {sectionIndex: 9, sectionRef: section_9, image: '8_ring_reduced.png', imageFullSize: '8_ring_full.png', source: 'Dun & Bradstreet, own calculations', title: 'Closest Proximity Industries to Support Activities for Water Transportation'},
  ];

  const ringVisualization = visualizationsPerSection.find((vis: any) => vis.sectionIndex == 9);

  const ringVisualizationImage = <FullScreenImage src={require(`./images/${ringVisualization!.image}`)} fullSizeSrc={require(`./images/${ringVisualization!.imageFullSize}`)}/>;
  const ringVisualizationSource = <VizSource><b>Click image to expand.</b> Source: <em>{ringVisualization!.source}</em></VizSource>;
  const ringVisualizationTitle = <VizTitle>{ringVisualization!.title}</VizTitle>;

  useEffect(() => {
    if(section) {
      const matchingVisualizationPerSection = visualizationsPerSection.find((item: any) => item.sectionIndex == section);

      if(matchingVisualizationPerSection) {
        setCurrentVisualization(matchingVisualizationPerSection);
      }
    }

  }, [section]);

  let visualizationImage = null;
  let visualizationSource = null;
  const useVisualization = currentVisualization === undefined ? visualizationsPerSection[0] : currentVisualization;
  if(useVisualization !== undefined) {
    if('imageFullSize' in useVisualization) {
      // The ring chart has a different full-size image to use when zoomed in
      visualizationImage = (
      <FullScreenImage src={require(`./images/${useVisualization.image}`)} fullSizeSrc={require(`./images/${useVisualization.imageFullSize}`)}/>
      );

    } else {
      visualizationImage = (
      <FullScreenImage src={require(`./images/${useVisualization.image}`)} />
      );

    }

    if('source' in useVisualization) {

      if(useVisualization.sectionIndex == 1) {
        visualizationSource = <VizSource>Source: <em>
          <a target='_blank' href='https://data.humdata.org/dataset/global-ports'>UN World Food Programme Logistics Database</a>
          </em></VizSource>;

      } else if(useVisualization.sectionIndex == 9) {
        visualizationSource = <VizSource><b>Click image to expand.</b> Source: <em>{useVisualization.source}</em></VizSource>;
      } else {
        visualizationSource = <VizSource>Source: <em>{useVisualization.source}</em></VizSource>;

      }

    }

  }

  const visualizationTitle = useVisualization && ('title' in useVisualization) ?
  (

  <VizTitle>{useVisualization.title}</VizTitle>

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
              <StoryTitle>Harboring Opportunity: The Industrial Ecosystems of Port Cities</StoryTitle>
              <Authors>
                May 18, 2023
              </Authors>
              <Authors>
                By Sophia Henn, Nikita Taniparti, Douglas Barrios
              </Authors>
            </FullWidth>
          </Heading>
        </StoriesGrid>
        <StoriesGrid>
          <SingleColumnNarrative ref={section_0} style={{marginBottom: 0}}>
                  <p>
                  Commercial ports are complex ecosystems that drive globalization and trade as we know it today. The COVID-19 pandemic and subsequent disruptions to the global supply chain have put a spotlight on the central role that ports play in shaping how we live. The <a target='_blank' href='https://growthlab.app/namibia-walvis-bay'>competitiveness of ports</a> is particularly vulnerable to rapidly changing market dynamics and the business decisions of shipping lines. While we often think about ports as gateways for transporting goods and materials across cities, countries, and continents, it is also relevant to ask: how do ports play a role in shaping their <em>local</em> economies? To hedge against vulnerabilities, how can port cities capitalize on their productive strengths to develop other industries?

                  </p>

                  <p>
                  Today, there are nearly 1,000 commercial ports that are situated within cities and towns in every corner of the world. Some are very large ports that serve as major crossroads for routes along global supply chains (Shanghai, China; Rotterdam, Netherlands); others are very small ports that focus on serving the immediate hinterland (Bethel, United States). Some are situated in major cities that also serve as the capitals of their respective countries (Manila, Philippines; Buenos Aires, Argentina); others are located in relatively small cities and serve as the main driver of the city’s growth (Gioia Tauro, Italy; Algeciras, Spain).
                  </p>
                  <p>
                  No matter the location or size of these ports, each one operates within a local ecosystem of industries that support port operations, process import/export activities, and transport goods inland. Some of these industries employ people with specialized skills for port functions, such as freight handling or marine engineering; other industries contribute to port functions but are also used by a range of other economic activities, such as financial and legal services. Some industries develop near ports not because they are needed for port functions, but because they benefit from having access to the resources, skills, and capabilities that the port offers, such as assembly plants and passenger cruise terminals.
                  </p>
                  <p>
                  We set out to identify which industries constitute this local ecosystem around ports. We analyze industries that are not only present in port cities but are more heavily concentrated near ports than in the world overall. By identifying these activities, we can contribute to the understanding of the comparative advantages of port cities and pathways for diversification that utilize their resources.
                  </p>

            </SingleColumnNarrative>
          </StoriesGrid>
          <StoriesGrid>
            <VizContainer style={{
              position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
              height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
            }}>
              <StickyContainer>
                {(!section || (section && section >=1 && section <= 8)) ? <>{visualizationTitle}{visualizationImage}{visualizationSource}</> : null}
              </StickyContainer>
            </VizContainer>
            <MainNarrativeRoot>
              <TextBlock>
              <StorySectionContainer ref={section_1}>

              <FirstStickyText>
                  <FirstMobileText>
                  <p>
                  How do we identify this ecosystem? We use global data from Dun & Bradstreet on business establishments to analyze how employment is concentrated across industries in 463 port cities in 49 countries. Our analysis focuses on cities that are not country capitals and have a population greater than 50,000. For a deeper dive on many of these port cities, check out <a target='_blank' href='https://public.tableau.com/app/profile/gl.namibia/viz/IndustrialEcosystemsofPortCities/Dashboard1?publish=yes'>this tool</a>!
                  </p>
                  </FirstMobileText>
                </FirstStickyText>

              </StorySectionContainer>
              <StorySectionContainer ref={section_2}>
              <StickyText>
                  <MobileText>
                    <p>
                    To understand the specific economic activities that happen near each port, we draw geographic buffer zones around the coordinates of each port. We create perimeters of 2, 5, 10, and 15 kilometers and take stock of the establishments registered within each zone. Here’s what those buffer zones look like around the port of Recife in Brazil. Each point represents an establishment from the data.
                    </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer ref={section_3}>
              <StickyText>
                  <MobileText>
                    <p>
                    By comparison, here’s what those buffer zones look like for the port of Antwerp in Belgium. As we can see, port zones can have very different densities of establishments.
                    </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer ref={section_4}>

              <StickyText>
                    <MobileText>
                    <p>
                    What economic activities occur in these zones? In the city of Antwerp, our database records 81,500 employees within 5 kilometers of the port. In this area, employment is most concentrated in transportation and warehousing and in professional, scientific and technical services including architecture and engineering services.
                    </p>
                    </MobileText>
                  </StickyText>
              </StorySectionContainer>
              <StorySectionContainer ref={section_5}>

              <StickyText>
                  <MobileText>
                  <p>
                  We can zoom out to a larger view of 10 kilometers around the port and observe how the concentration of employment changes across sectors. At this distance, our data records 151,000 total employees, with a lower share of employment in transportation and warehousing and higher share of employment in construction, manufacturing and healthcare compared to the 5 kilometer zone.
                  </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer ref={section_6}>

              <StickyText>
                  <MobileText>
                  <p>
                  Analyzing the employment composition of all port cities in our dataset reveals which types of industries tend to concentrate more heavily near ports. The darker bars show each sector’s employment share worldwide, while the lighter bars show each sector’s employment share within 10 kilometers of ports. Manufacturing is comparatively less concentrated near ports, while construction and healthcare are comparatively more concentrated near ports. Even when sectors occupy similar shares of employment worldwide and near ports, the specific activities being engaged by establishments can be quite different.

                  </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer ref={section_7}>

              <StickyText>
                  <MobileText>
                  <p>
                  For example, the sector of professional, scientific and technical (PST) services employs a significant and similar share of people near ports and worldwide (8.5% and 8% respectively). However, a breakdown of the sector shows that a different mix of activities is underlying these shares. Here are the different activities that make up PST services and the share of the sector’s employment that they occupy near ports and worldwide. We find that computer systems design represents 33% of employment in PST services globally, but just 16% near ports. Meanwhile, legal, architectural, and engineering services are comparatively more concentrated near ports, with shares of the sector’s employment that are 1.5 to 2 times larger than their share globally.
                  </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
              <StorySectionContainer ref={section_8}>
              <StickyText>
                  <MobileText>
                  <p>
                  For each industry, the ratio of its employment share near ports to its employment share globally can be considered the revealed comparative advantage (RCA) of port cities in engaging in the industry.  Industries that have higher concentrations of employment near ports than in the world overall (RCA &gt; 1) may have features that make them advantageous or necessary to locate near ports, such as the resources or skills they require, the types of establishments that consume them, the cost of transportation, or other unobserved characteristics. For these reasons, these industries may be strategic diversification options for a city looking to leverage the presence of its port to develop other competitive industries.
                  </p>
                  </MobileText>
                </StickyText>
              </StorySectionContainer>
            </TextBlock>
            </MainNarrativeRoot>
            </StoriesGrid>
            <StoriesGrid>
              <TableAndTextFlexContainer>
              <TableContainer>
                {dataTable}
                <FadeInContainer><VizSource>Source: <em>Own elaboration</em></VizSource></FadeInContainer>
              </TableContainer>

              <TextContainer>
                  <p>
                  We construct this measure of revealed comparative advantage for all industries using several specifications, including measuring different buffer zones and different ratios of industry presence. We search for industries that have a comparative advantage near ports (RCA &gt; 1) while also being economically significant in terms of employment (at least 1% of employees across all port cities). Moreover, we include a handful of capital-intensive industries that do not comprise a significant share of employment but are demanded relatively more by the industry encompassing port operations. Across these different specifications, we find 39 industries that have significant and more concentrated employment near ports compared to the world overall. These industries most often fall within the sectors of transportation and warehousing, construction, trade, professional and support services.
                  </p>
                  </TextContainer>
            </TableAndTextFlexContainer>
        </StoriesGrid>
        <StoriesGrid>
            <SingleColumnNarrative>
                  <p>
                  Finally, we ask: which of these industries share the closest latent capabilities with ports and their operations? Within our global dataset, a subset of establishments report that they engage in several different industries, not only one. In this industry classification system, port operations themselves are classified within the broader category of support activities for water transportation, which includes marine cargo handling and navigational services to shipping. To map which of the industries above are more closely linked to port operations, we examine which other industries are most likely to be reported by establishments that also engage in support activities for water transportation.
                  </p>
                  </SingleColumnNarrative>
          </StoriesGrid>
          <StoriesGrid>
          <VizContainer style={{
              position: window.innerWidth < 700 && section !== null ? 'sticky' : undefined,
              height: window.innerWidth < 700 && section !== null ? 'auto' : undefined,
            }}>
              <StickyContainer>
              <>{ringVisualizationTitle}{ringVisualizationImage}{ringVisualizationSource}</>
              </StickyContainer>
            </VizContainer>
            <MainNarrativeRoot>
              <TextBlock>
              <StorySectionContainer ref={section_9}>
              <FirstStickyText>
                  <FirstMobileText>
                  <p>
                  This ring chart shows the industries linked to support activities for water transportation, with a closer proximity to the center indicating greater similarity in required capabilities. Industries in red are those listed in the table above with a strong comparative advantage near ports. This analysis tells us a few things. Focusing on the center, we find that industries such as warehousing and storage, urban transit systems, and freight transport arrangement share close capabilities with port activities. But, only the latter is comparatively more concentrated near ports; while warehousing and urban transit systems are found near ports, they are also prevalent in non-port cities all around the world. The different proximities of industries with a comparative advantage near ports is also informative: other support activities for transportation and petroleum wholesalers may be more directly related to port functions, while ship and boat building and grocery wholesalers concentrate more heavily near ports but appear less closely linked to their functions. This analysis helps to distinguish activities that are not generally located more intensively in port cities but that do share latent productive capabilities with port operations.
                  </p>
                  </FirstMobileText>
                </FirstStickyText>
              </StorySectionContainer>
            </TextBlock>
          </MainNarrativeRoot>
          </StoriesGrid>
          <StoriesGrid>
            <SingleColumnNarrative>
                  <p>
                  This exercise identified what kinds of activities thrive within local port ecosystems by examining employment data in over 450 ports globally. Though no two port cities are the same, they share the capabilities for port functions that can be leveraged for the development of a wide range of industries. We find that port cities have a relatively large presence in many industries within transportation and trade. While this may be unsurprising, they also have a comparatively higher presence in healthcare and certain professional and support services that may not be immediately obvious to policymakers. Furthermore, while some of these industries share similar characteristics or features to port functions and water transportation, others may be less similar. Armed with these insights, policymakers formulating investment promotion strategies or industrial policy can make more informed decisions about the types of industries that may thrive in their port city. Ultimately, the success of these industries will also depend on contextual factors that are unique to each city, such as the availability of land, scarcity of resources, existing legislative frameworks, and more. For those seeking to enhance the economic resilience of port cities, these industries serve as a targeted starting point.
                  </p>
              </SingleColumnNarrative>
        </StoriesGrid>
      </Root>
      <StandardFooter />
    </>
  );
};

export default PortEcosystemsStory;
