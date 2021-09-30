import React from 'react';
import Layout from './Layout';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import {
  HSProduct,
  NAICSIndustry,
  Factor,
} from './graphql/graphQLTypes';
import {Datum} from 'react-panel-search';
import {
  generateStringId,
  ProductClass,
} from './Utils';

const GET_ALL_INDUSTRIES = gql`
  query GetAllIndustries {
    allHs: namibiaHsList(inTool: false) {
      hsId
      name
      code
      inTool
      id
      factors {
        edges {
          node {
            attractiveness
            feasibility
            id
          }
        }
      }
    }
    allNaics: namibiaNaicsList(inTool: false) {
      naicsId
      name
      code
      inTool
      id
      factors {
        edges {
          node {
            attractiveness
            feasibility
            id
          }
        }
      }
    }
  }
`;

interface SuccessResponse {
  allHs: {
    hsId: HSProduct['hsId'];
    name: HSProduct['name'];
    code: HSProduct['code'];
    inTool: HSProduct['inTool'];
    id: HSProduct['id'];
    factors: {
      edges: {
        node: {
          attractiveness: Factor['attractiveness'];
          feasibility: Factor['feasibility'];
        },
      }[],
    }
  }[];
  allNaics: {
    naicsId: NAICSIndustry['naicsId'];
    name: NAICSIndustry['name'];
    code: NAICSIndustry['code'];
    inTool: NAICSIndustry['inTool'];
    id: NAICSIndustry['id'];
    factors: {
      edges: {
        node: {
          attractiveness: Factor['attractiveness'];
          feasibility: Factor['feasibility'];
        },
      }[],
    }
  }[];
}

const NamibiaTool = () => {
  const {loading, error, data} = useQuery<SuccessResponse, never>(GET_ALL_INDUSTRIES);
  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data !== undefined) {
    const classificationHsParentId = 'CLASSIFICATION-HS';
    const classificationNaicsParentId = 'CLASSIFICATION-NAICS';
    let totalHSFeasibility: number = 0;
    let totalHSAttractiveness: number = 0;
    let totalNAICSFeasibility: number = 0;
    let totalNAICSAttractiveness: number = 0;
    const allData: Datum[] = [];
    const searchData: Datum[] = [
      {
        id: classificationHsParentId,
        title: 'HS-4 Products',
        level: 1,
        parent_id: null,
        always_show: true,
      }, {
        id: classificationNaicsParentId,
        title: 'NAICS-6 Industries',
        level: 1,
        parent_id: null,
        always_show: true,
      },
    ];
    data.allHs.forEach(d => {
      if (d.factors && d.factors.edges && d.factors.edges[0] && d.factors.edges[0].node) {
        totalHSFeasibility += d.factors.edges[0].node.feasibility;
        totalHSAttractiveness += d.factors.edges[0].node.attractiveness;
      }
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
    data.allNaics.forEach(d => {
      if (d.factors && d.factors.edges && d.factors.edges[0] && d.factors.edges[0].node) {
        totalNAICSFeasibility += d.factors.edges[0].node.feasibility;
        totalNAICSAttractiveness += d.factors.edges[0].node.attractiveness;
      }
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
    return (
      <Layout
        searchData={searchData}
        allData={allData}
        averageHSAttractiveness={totalHSAttractiveness / data.allHs.length}
        averageHSFeasibility={totalHSFeasibility / data.allHs.length}
        averageNAICSAttractiveness={totalNAICSAttractiveness / data.allNaics.length}
        averageNAICSFeasibility={totalNAICSFeasibility / data.allNaics.length}
      />
    );
  } else {
    return null;
  }
};

export default NamibiaTool;
