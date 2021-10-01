export interface Factor {
  aRelativeDemand: number;
  aResiliency: number;
  aEmploymentGroupsInterest: number;
  aFdi: number;
  aExportPropensity: number;
  fPortPropensity: number;
  fExistingPresence: number;
  fRemoteness: number;
  fScarceFactors: number;
  fInputAvailability: number;
  attractiveness: number;
  feasibility: number;
  shareFemale: number;
  shareYouth: number;
  shareLskill: number;
  id: string;
}

export interface Proximity {
  partnerId: string;
  proximity: number;
  rank: number;
  id: string;
}

export interface RelativeDemand {
  locationCode: string;
  countryDemandAvg: number;
  countryDemandPcAvg: number;
  id: string;
}

export interface Occupation {
  occupation: string;
  isAvailable: boolean;
  rank: number;
  id: string;
}

interface BaseProductIndustry {
  name: string;
  code: string;
  level: string;
  parentId: number;
  complexityReport: boolean;
  inTool: boolean;
  factors: {
    edges: {
      node: Factor;
    }[],
  };
  proximity: {
    edges: {
      node: Proximity;
    }[],
  };
  relativeDemand: {
    edges: {
      node: RelativeDemand;
    }[],
  };
  occupation: {
    edges: {
      node: Occupation;
    }[],
  };
  id: string;
}

export interface HSProduct extends BaseProductIndustry {
  hsId: string;
}

export interface NAICSIndustry extends BaseProductIndustry {
  naicsId: string;
}

export enum ThresholdType {
  averageHSAttractiveness = 'hs_attractiveness_avg',
  averageHSFeasibility = 'hs_feasibility_avg',
  averageNAICSAttractiveness = 'naics_attractiveness_avg',
  averageNAICSFeasibility = 'naics_feasibility_avg',
}

export interface NamibiaThreshold {
  key: ThresholdType;
  value: number;
}
