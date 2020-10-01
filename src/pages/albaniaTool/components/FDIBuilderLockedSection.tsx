import React, {useState} from 'react';
import { colorScheme } from '../Utils';
import PasswordProtectedComponent from '../../../components/text/PasswordProtectedComponent';

interface Props {
  children: React.ReactNode;
}

export default (props: Props) => {
  const { children } = props;
  const [fdiPasswordValue, setFdiPasswordValue] = useState<string>('');

  if (fdiPasswordValue === process.env.REACT_APP_ALBANIA_FDI_PASSWORD) {
    return(
      <>
        {children}
      </>
    );
  } else {
    return(
      <PasswordProtectedComponent
        title={'This section is password protected. Please enter your password to access FDI data.'}
        buttonColor={colorScheme.primary}
        onPasswordSubmit={setFdiPasswordValue}
      >
        <></>
      </PasswordProtectedComponent>
    );
  }
};