import React, {useState} from 'react';
import Content, {colorScheme} from './Content';
import PasswordProtectedPage from '../../components/text/PasswordProtectedPage';

const numDaysBetween = function(d1: Date, d2: Date) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
};

const JordanToolEntry = () => {

  let initialLockedState: boolean = true;

  const localStorageKey = process.env.REACT_APP_JORDAN_LOCALSTORAGE_KEY;
  const localStorageTimestampKey = process.env.REACT_APP_JORDAN_LOCALSTORAGE_TIMESTAMP_KEY;
  if (localStorageKey && localStorageTimestampKey) {
    const storedKeyVal = localStorage.getItem(localStorageKey);
    const storedKeyTimestamp = localStorage.getItem(localStorageTimestampKey);
    if (storedKeyVal === process.env.REACT_APP_JORDAN_PASSWORD && storedKeyTimestamp) {
      const d1 = new Date();
      const d2 = new Date(storedKeyTimestamp);
      if (numDaysBetween(d1, d2) < 30) {
        initialLockedState = false;
      }
    }
  }

  const [locked, setLocked] = useState<boolean>(initialLockedState);

  const checkPassword = (val: string) => {
    if (val === process.env.REACT_APP_JORDAN_PASSWORD) {
      setLocked(false);
      if (localStorageKey && localStorageTimestampKey) {
        localStorage.setItem(localStorageKey, val);
        localStorage.setItem(localStorageTimestampKey, new Date().toString());
      }
    }
  };

  if (locked) {
    return (
      <PasswordProtectedPage
        title={'Please enter your password to enter the tool'}
        onPasswordSubmit={checkPassword}
        buttonColor={colorScheme.primary}
      />
    );
  } else {
    return (
      <Content />
    );
  }
};

export default JordanToolEntry;
