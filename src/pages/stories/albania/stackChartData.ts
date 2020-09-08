import {StackChartConfig, StackChartDatum} from 'react-fast-charts';
import raw from 'raw.macro';

enum Category {
  AgricultureForestryAndFishing = 'Agriculture, forestry and fishing',
  MiningAndQuarrying = 'Mining and quarrying',
  Manufacturing = 'Manufacturing',
  ElectricityGasSteamAndAirConditioningSupply = 'Electricity, gas, steam and air conditioning supply',
  WaterSupplySewerageWasteManagementAndRemediationActivities = 'Water supply, sewerage, waste management and remediation activities',
  Construction = 'Construction',
  WholesaleAndRetailTradeRepairOfMotorVehiclesMotorcycles = 'Wholesale and retail trade; repair of motor vehicles, motorcycles',
  TransportationAndAccommodation = 'Transportation and accommodation',
  InformationAndCommunication = 'Information and communication',
  FinancialAndInsuranceActivities = 'Financial and insurance activities',
  RealEstateActivities = 'Real estate activities',
  ProfessionalScientificAndTechnicalActivities = 'Professional, scientific and technical activities',
  AdministrativeAndSupportServiceActivities = 'Administrative and support service activities',
  Education = 'Education',
  HumanHealthAndSocialWorkActivities = 'Human health and social work activities',
  ArtsEntertainmentAndRecreation = 'Arts, entertainment and recreation',
  OtherServiceActivities = 'Other service activities',
  ActivitiesOfExtraterritorialOrganizationsAndBodies = 'Activities of extraterritorial organizations and bodies',
}

export const industries: {name: Category, id: number, fill: string}[] = [
  {id: 0,  fill: '#f7ba7e', name: Category.AgricultureForestryAndFishing},
  {id: 1,  fill: '#ffc3c2', name: Category.MiningAndQuarrying},
  {id: 2,  fill: '#ed999a', name: Category.Manufacturing},
  {id: 3,  fill: '#d3c17f', name: Category.ElectricityGasSteamAndAirConditioningSupply},
  {id: 4,  fill: '#e5c9de', name: Category.WaterSupplySewerageWasteManagementAndRemediationActivities},
  {id: 5,  fill: '#9ac694', name: Category.Construction},
  {id: 6,  fill: '#c3ac9e', name: Category.WholesaleAndRetailTradeRepairOfMotorVehiclesMotorcycles},
  {id: 7,  fill: '#cfaec6', name: Category.TransportationAndAccommodation},
  {id: 8,  fill: '#b5d6d3', name: Category.InformationAndCommunication},
  {id: 9,  fill: '#f6e1a0', name: Category.FinancialAndInsuranceActivities},
  {id: 10, fill: '#e4a9bf', name: Category.RealEstateActivities},
  {id: 11, fill: '#d5cfcd', name: Category.ProfessionalScientificAndTechnicalActivities},
  {id: 12, fill: '#c5dff1', name: Category.AdministrativeAndSupportServiceActivities},
  {id: 13, fill: '#b9e3b0', name: Category.Education},
  {id: 14, fill: '#90c0be', name: Category.HumanHealthAndSocialWorkActivities},
  {id: 15, fill: '#ffd7b0', name: Category.ArtsEntertainmentAndRecreation},
  {id: 16, fill: '#ffa600', name: Category.OtherServiceActivities},
  {id: 17, fill: '#93aeca', name: Category.ActivitiesOfExtraterritorialOrganizationsAndBodies},
];

const rawData = JSON.parse(raw('./data/fdi_stack_chart_data.json'));

const config: StackChartConfig = {
  primaryKey: 'quarter',
  groups: [],
};

const transformedData: StackChartDatum[] = [];

rawData.forEach((d: any) => {
  const targetIndex = transformedData.findIndex(t => t.quarter === d.quarter);
  const category = (d.category as string).replace(/,|-|;/gi, '').replace(/ /gi, '_').toLowerCase();
  const targetFill = industries.find(({name}) => name ===  d.category);
  const fill = targetFill && targetFill.fill ? targetFill.fill : '#666';
  if (targetIndex === -1) {
    transformedData.push({
      quarter: d.quarter,
      [category]: d.value,
    });
  } else {
    transformedData[targetIndex][category] = d.value;
  }
  if (!config.groups.find(({key}) => key === category)) {
    config.groups.push({
      key: category,
      label: d.category,
      fill,
    });
  }
});

export const stackConfig = config;
export const stackData = transformedData;
