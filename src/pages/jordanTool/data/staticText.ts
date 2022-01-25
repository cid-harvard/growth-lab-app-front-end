export default {
 intro: 'The following tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University. The goal is to provide a roadmap to identify the economic activities with the highest potential to diversify Jordan’s export basket and drive growth, while supporting higher wages. The methodology used to identify and prioritize high potential industries is summarized <a href="http://cid-harvard.github.io/jordan/Summary.pdf">here</a>. The tool allows its user to prioritize among different activities, and provides a list of top companies investing in the sector worldwide and for the Middle East and North Africa region.',
 overview: 'Within the export themes with the highest export potential, industries were prioritized through the analysis of five key factors that influence their viability and another five that determine their attractiveness. Viability and Attractiveness scores were calculated by standardizing indicators on each factor and aggregating the five factors for each category. These were ultimately used to define prioritization phases for each industry.',
 viabilityFactors: {
   title: 'Viability Factors',
   rcaJordan: {
     title: 'RCA in Jordan',
     description: 'The sector’s Revealed Comparative Advantage measures the relative advantage or disadvantage a country has in the production of a certain good or service, based on its weight in the country’s current total employment.',
   },
   rcaPeers: {
     title: 'RCA in Peers',
     description: 'The factor measures the average Revealed Comparative Advantage in peer economies for Jordan, setting a higher ranking for industries that are relatively more prevalent in pre-selected benchmarks.',
   },
   waterIntensity: {
     title: 'Water Intensity',
     description: 'Taking into consideration Jordan’s water scarcity problem, the factor places a higher weight to industries that are less dependent on water supply.',
   },
   electricityIntensity: {
     title: 'Electricity Intensity',
     description: 'Considering that electricity was identified as a binding constraint, the factor places higher weight to industries less intensive on electricity as an input.',
   },
   availabilityOfInputs: {
     title: 'Availability of Inputs',
     description: 'Ranks highly industries where most inputs that are deemed strategic for the industry’s development are available in the local market (either locally produced or imported).',
   },
 },
 attractivenessFactors: {
   title: 'Attractiveness Factors',
   femaleEmploymentPotential: {
     title: 'Female Employment Potential',
     description: 'Potential the sector has of employing women, considering its current behavior in other economies.',
   },
   highSkillEmploymentPotential: {
     title: 'High Skill Employment Potential',
     description: 'Potential the sector has of employing highly skilled workers, considering its current behavior in other economies.',
   },
   FDIWorld: {
     title: 'FDI in the World',
     description: 'A measure of global FDI flows is considered a proxy for world demand for each industry.',
   },
   FDIRegion: {
     title: 'FDI in the Region',
     description: 'A measure of regional FDI flows weights the region’s capacity to attract FDI in the sector.',
   },
   exportPropensity: {
     title: 'Export Propensity',
     description: 'Measures the probability of exporting of a firm within the industry, considering their behavior in the world.',
   },
 },
 industryPotential: {
   title: 'Industry Potential',
   fdiTitle: 'Foreign Direct Investment',
   globalFdi: 'Top Global FDI Companies',
   menaFdi: 'Top FDI Investors in MENA',
 },
 industryNow: {
   title: 'Industry Now',
   sectorDemographics: 'Sector Demographics',
   locationOfWorkers: 'Location of Workers',
   schoolingDistribution: 'Schooling Distribution',
   industryWages: 'Industry Wages',
   occupationDistribution: 'Occupation Distribution',
 },

};