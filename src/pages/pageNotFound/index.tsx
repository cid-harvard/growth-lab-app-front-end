import React from 'react';
import GradientHeader from '../../components/text/headers/GradientHeader';

const PageNotFound = () => {
  return (
    <>
      <GradientHeader
        title={'404: The page you are looking for could not be found'}
        hasSearch={false}
        imageSrc={''}
        backgroundColor={'#333'}
        textColor={'#fff'}
        linkColor={'#333'}
        links={[
          {label: 'Return to Landing Page', target: '/'},
        ]}
      />
    </>
  );
};

export default PageNotFound;