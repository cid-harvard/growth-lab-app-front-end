import React from 'react';
import Content from './Content';
import useFakeQuery from '../../hooks/useFakeQuery';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';

const NamibiaTool = () => {
  const {loading, error, data} = useFakeQuery();
  if (loading) {
    return <Loading />;
  } else if (error) {
    return (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data !== undefined) {
    return (
      <>
        <Content
        />
      </>
    );
  } else {
    return null;
  }
};

export default NamibiaTool;
