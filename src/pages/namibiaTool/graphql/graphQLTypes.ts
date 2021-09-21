interface Factor {
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
  id: string;
}

export interface HSProduct extends BaseProductIndustry {
  hsId: string;
}

export interface NAICSIndustry extends BaseProductIndustry {
  naicsId: string;
}
