import React from 'react';
import { ProductClass } from './Utils';
import useFakeQuery from '../../hooks/useFakeQuery';
import Loading from '../../components/general/Loading';
import FullPageError from '../../components/general/FullPageError';
import ContentWrapper from './Content';

interface Props {
  id: string;
  productClass: ProductClass;
  name: string;

  setStickyHeaderHeight: (h: number) => void;
}

const QueryHS = (props: Props) => {
  const {
    id, name, setStickyHeaderHeight,
  } = props;

  const {loading, error, data} = useFakeQuery();

  if (loading === true) {
    return <Loading />;
  } else if (error !== undefined) {
    return (
      <FullPageError
        message={error.message}
      />
    );
  } else if (data) {
    return (
      <ContentWrapper
        id={id}
        name={name}
        productClass={ProductClass.HS}
        setStickyHeaderHeight={setStickyHeaderHeight}
      />
    );
  } else {
    return null;
  }

};

export default QueryHS;
