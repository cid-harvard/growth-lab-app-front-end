import React from "react";
import Layout from "./Layout";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import Loading from "../../components/general/Loading";
import FullPageError from "../../components/general/FullPageError";
import {
  HSProduct,
  NAICSIndustry,
  NamibiaThreshold,
  ThresholdType,
} from "./graphql/graphQLTypes";
import { Datum } from "react-panel-search";
import { generateStringId, ProductClass } from "./Utils";

const GET_ALL_INDUSTRIES = gql`
  query GetAllIndustries {
    allHs: namibiaHsList(inTool: false) {
      hsId
      name
      code
      inTool
      id
    }
    allNaics: namibiaNaicsList(inTool: false) {
      naicsId
      name
      code
      inTool
      id
    }
    namibiaThresholdList {
      key
      value
    }
  }
`;

interface SuccessResponse {
  allHs: {
    hsId: HSProduct["hsId"];
    name: HSProduct["name"];
    code: HSProduct["code"];
    inTool: HSProduct["inTool"];
    id: HSProduct["id"];
  }[];
  allNaics: {
    naicsId: NAICSIndustry["naicsId"];
    name: NAICSIndustry["name"];
    code: NAICSIndustry["code"];
    inTool: NAICSIndustry["inTool"];
    id: NAICSIndustry["id"];
  }[];
  namibiaThresholdList: NamibiaThreshold[];
}

const NamibiaTool = () => {
  const { loading, error, data } = useQuery<SuccessResponse, never>(
    GET_ALL_INDUSTRIES,
  );
  if (loading) {
    return <Loading />;
  } else if (error) {
    return <FullPageError message={error.message} />;
  } else if (data !== undefined) {
    const classificationHsParentId = "CLASSIFICATION-HS";
    const classificationNaicsParentId = "CLASSIFICATION-NAICS";
    const allData: Datum[] = [];
    const searchData: Datum[] = [
      {
        id: classificationHsParentId,
        title: "HS-4 Products",
        level: 1,
        parent_id: null,
        always_show: true,
      },
      {
        id: classificationNaicsParentId,
        title: "NAICS-6 Industries",
        level: 1,
        parent_id: null,
        always_show: true,
      },
    ];
    data.allHs.forEach((d) => {
      if (d.inTool) {
        searchData.push({
          id: generateStringId(ProductClass.HS, d.hsId),
          title: `${d.name} (HS ${d.code})`,
          level: 2,
          parent_id: classificationHsParentId,
        });
      }
      allData.push({
        id: generateStringId(ProductClass.HS, d.hsId),
        title: `${d.name} (HS ${d.code})`,
        level: 2,
        parent_id: classificationHsParentId,
      });
    });
    data.allNaics.forEach((d) => {
      if (d.inTool) {
        searchData.push({
          id: generateStringId(ProductClass.NAICS, d.naicsId),
          title: `${d.name} (NAICS ${d.code})`,
          level: 2,
          parent_id: classificationNaicsParentId,
        });
      }
      allData.push({
        id: generateStringId(ProductClass.NAICS, d.naicsId),
        title: `${d.name} (NAICS ${d.code})`,
        level: 2,
        parent_id: classificationNaicsParentId,
      });
    });
    const averageHSAttractiveness = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.averageHSAttractiveness,
    );
    const averageHSFeasibility = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.averageHSFeasibility,
    );
    const averageNAICSAttractiveness = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.averageNAICSAttractiveness,
    );
    const averageNAICSFeasibility = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.averageNAICSFeasibility,
    );
    const medianHSAttractiveness = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.medianHSAttractiveness,
    );
    const medianHSFeasibility = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.medianHSFeasibility,
    );
    const medianNAICSAttractiveness = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.medianNAICSAttractiveness,
    );
    const medianNAICSFeasibility = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.medianNAICSFeasibility,
    );
    const employmentFemaleAvg = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.employmentFemaleAvg,
    );
    const employmentLskillAvg = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.employmentLskillAvg,
    );
    const employmentYouthAvg = data.namibiaThresholdList.find(
      (d) => d.key === ThresholdType.employmentYouthAvg,
    );

    return (
      <Layout
        searchData={searchData}
        allData={allData}
        averageHSAttractiveness={
          averageHSAttractiveness ? averageHSAttractiveness.value : 0
        }
        averageHSFeasibility={
          averageHSFeasibility ? averageHSFeasibility.value : 0
        }
        averageNAICSAttractiveness={
          averageNAICSAttractiveness ? averageNAICSAttractiveness.value : 0
        }
        averageNAICSFeasibility={
          averageNAICSFeasibility ? averageNAICSFeasibility.value : 0
        }
        medianHSAttractiveness={
          medianHSAttractiveness ? medianHSAttractiveness.value : 0
        }
        medianHSFeasibility={
          medianHSFeasibility ? medianHSFeasibility.value : 0
        }
        medianNAICSAttractiveness={
          medianNAICSAttractiveness ? medianNAICSAttractiveness.value : 0
        }
        medianNAICSFeasibility={
          medianNAICSFeasibility ? medianNAICSFeasibility.value : 0
        }
        employmentFemaleAvg={
          employmentFemaleAvg ? employmentFemaleAvg.value : 0
        }
        employmentLskillAvg={
          employmentLskillAvg ? employmentLskillAvg.value : 0
        }
        employmentYouthAvg={employmentYouthAvg ? employmentYouthAvg.value : 0}
      />
    );
  } else {
    return null;
  }
};

export default NamibiaTool;
