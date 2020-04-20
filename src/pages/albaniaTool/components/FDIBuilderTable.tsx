import React, {useState} from 'react';
import QueryTableBuilder from '../../../components/tools/QueryTableBuilder';
import noop from 'lodash/noop';
import {
  testQueryBuilderDataCountry,
  testQueryBuilderDataCity,
  testFDIColumns1,
  testFDIData1,
} from '../testData';
import { colorScheme } from '../Utils';
import PasswordProtectedComponent from '../../../components/text/PasswordProtectedComponent';

export default () => {
  const [fdiPasswordValue, setFdiPasswordValue] = useState<string>('');

  let content: React.ReactElement<any>;
  if (fdiPasswordValue === process.env.REACT_APP_ALBANIA_FDI_PASSWORD) {
    content = (
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onQueryDownloadClick={noop}
        onUpdateClick={noop}
        selectFields={[
          {
            id: 'country',
            label: 'Source Country',
            data: testQueryBuilderDataCountry,
            required: true,
          },
          {
            id: 'city',
            label: 'Source City',
            data: testQueryBuilderDataCity,
            dependentOn: 'country',
          },
        ]}
        itemName={'companies'}
        columns={testFDIColumns1}
        tableData={testFDIData1}
      />
    );
  } else {
    content = (
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onQueryDownloadClick={noop}
        onUpdateClick={noop}
        selectFields={[
          {
            id: 'country',
            label: 'Source Country',
            data: [testQueryBuilderDataCountry[0]],
            required: true,
          },
          {
            id: 'city',
            label: 'Source City',
            data: [testQueryBuilderDataCity[0]],
            dependentOn: 'country',
          },
        ]}
        itemName={'companies'}
        columns={testFDIColumns1}
        tableData={[]}
        disabled={true}
      />
    );
  }
  return (
    <PasswordProtectedComponent
      title={'This section is password protected. Please enter your password to access FDI data.'}
      buttonColor={colorScheme.primary}
      onPasswordSubmit={setFdiPasswordValue}
    >
      {content}
    </PasswordProtectedComponent>
  );
};