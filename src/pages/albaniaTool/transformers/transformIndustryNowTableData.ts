import {
  IndustryNowSchooling,
  IndustryNowOccupation,
  IndustryNowNearestIndustryEdge,
} from '../../../graphql/graphQLTypes';
import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../../components/text/DynamicTable';

interface Input {
  schoolingNode: IndustryNowSchooling | null;
  occupationNode: IndustryNowOccupation | null;
  nearbyIndustryEdge: (IndustryNowNearestIndustryEdge | null)[];
}

export default (input: Input) => {
  const {
    schoolingNode, occupationNode, nearbyIndustryEdge,
  } = input;

  const schoolingColumns: DynamicTableColumn[] = [
    {label: 'Level of Education', key: 'education'},
    {label: 'Male', key: 'male'},
    {label: 'Female', key: 'female'},
  ];

  let schoolingTableData: DynamicTableDatum[];
  if (schoolingNode === null) {
    schoolingTableData = [];
  } else {
    const {
      esBelowMale, esBelowFemale,
      lowerSecondaryMale, lowerSecondaryFemale,
      technicalVocationalMale, technicalVocationalFemale,
      hsSomeCollegeMale, hsSomeCollegeFemale,
      universityHigherMale, universityHigherFemale,
    } = schoolingNode;
    schoolingTableData = [
      {
        education: 'Primary of below',
        male: esBelowMale !== null ? esBelowMale.toFixed(2) + '%' : 'No data',
        female: esBelowFemale !== null ? esBelowFemale.toFixed(2) + '%' : 'No data',
      },
      {
        education: 'Lower Secondary',
        male: lowerSecondaryMale !== null ? lowerSecondaryMale.toFixed(2) + '%' : 'No data',
        female: lowerSecondaryFemale !== null ? lowerSecondaryFemale.toFixed(2) + '%' : 'No data',
      },
      {
        education: 'Vocational or Technical',
        male: technicalVocationalMale !== null ? technicalVocationalMale.toFixed(2) + '%' : 'No data',
        female: technicalVocationalFemale !== null ? technicalVocationalFemale.toFixed(2) + '%' : 'No data',
      },
      {
        education: 'Secondary and Some College',
        male: hsSomeCollegeMale !== null ? hsSomeCollegeMale.toFixed(2) + '%' : 'No data',
        female: hsSomeCollegeFemale !== null ? hsSomeCollegeFemale.toFixed(2) + '%' : 'No data',
      },
      {
        education: 'University and above',
        male: universityHigherMale !== null ? universityHigherMale.toFixed(2) + '%' : 'No data',
        female: universityHigherFemale !== null ? universityHigherFemale.toFixed(2) + '%' : 'No data',
      },
    ];
  }

  const occupationColumns: DynamicTableColumn[] = [
    {label: 'Occupation', key: 'occupation'},
    {label: 'Male', key: 'male'},
    {label: 'Female', key: 'female'},
  ];

  let occupationTableData: DynamicTableDatum[];
  if (occupationNode === null) {
    occupationTableData = [];
  } else {
    const {
      managersMale, managersFemale,
      professionalsMale, professionalsFemale,
      techniciansMale, techniciansFemale,
      clericalMale, clericalFemale,
      servicesMale, servicesFemale,
      craftMale, craftFemale,
      assemblyMale, assemblyFemale,
      primaryMale, primaryFemale,
      elementaryMale, elementaryFemale,
      otherMale, otherFemale,
    } = occupationNode;
    occupationTableData = [
      {
        occupation: 'Managers',
        male: managersMale !== null ? managersMale.toFixed(2) + '%' : 'No data',
        female: managersFemale !== null ? managersFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Professionals',
        male: professionalsMale !== null ? professionalsMale.toFixed(2) + '%' : 'No data',
        female: professionalsFemale !== null ? professionalsFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Technicians and Associate Professionals',
        male: techniciansMale !== null ? techniciansMale.toFixed(2) + '%' : 'No data',
        female: techniciansFemale !== null ? techniciansFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Clerical Support Workers',
        male: clericalMale !== null ? clericalMale.toFixed(2) + '%' : 'No data',
        female: clericalFemale !== null ? clericalFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Service and Sales Workers',
        male: servicesMale !== null ? servicesMale.toFixed(2) + '%' : 'No data',
        female: servicesFemale !== null ? servicesFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Craft and Related Trade Workers',
        male: craftMale !== null ? craftMale.toFixed(2) + '%' : 'No data',
        female: craftFemale !== null ? craftFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Machine Operators and Assemblers',
        male: assemblyMale !== null ? assemblyMale.toFixed(2) + '%' : 'No data',
        female: assemblyFemale !== null ? assemblyFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Skilled Agriculture and Fishery Workers',
        male: primaryMale !== null ? primaryMale.toFixed(2) + '%' : 'No data',
        female: primaryFemale !== null ? primaryFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Elementary Occupations',
        male: elementaryMale !== null ? elementaryMale.toFixed(2) + '%' : 'No data',
        female: elementaryFemale !== null ? elementaryFemale.toFixed(2) + '%' : 'No data',
      },
      {
        occupation: 'Other',
        male: otherMale !== null ? otherMale.toFixed(2) + '%' : 'No data',
        female: otherFemale !== null ? otherFemale.toFixed(2) + '%' : 'No data',
      },
    ];
  }

  const nearbyIndustryColumns: DynamicTableColumn[] = [
    {label: 'Industry Name', key: 'industryName'},
    {label: 'RCA > 1', key: 'rcaGreaterThan1'},
  ];

  const nearbyIndustryTableData: DynamicTableDatum[] = [];
  nearbyIndustryEdge.forEach(edge => {
    if (edge !== null && edge.node !== null) {
      const {
        neighborName, neighborRcaGte1,
      } = edge.node;
      let rcaGreaterThan1: string;
      if (neighborRcaGte1 === null) {
        rcaGreaterThan1 = 'No data';
      } else {
        rcaGreaterThan1 = neighborRcaGte1 === true ? 'Yes' : 'No';
      }
      nearbyIndustryTableData.push({
        industryName: neighborName !== null ? neighborName : 'Unknown',
        rcaGreaterThan1,
      });
    }
  });

  return {
    schooling: {columns: schoolingColumns, data: schoolingTableData},
    occupation: {columns: occupationColumns, data: occupationTableData},
    nearbyIndustry: {columns: nearbyIndustryColumns, data: nearbyIndustryTableData},
  };
};