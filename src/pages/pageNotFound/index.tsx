import React from 'react';
import GradientHeader from '../../components/text/headers/GradientHeader';

const PageNotFound = () => {
  return (
    <>
      <GradientHeader
        title={'404: The page you are looking for could not be found'}
        hasSearch={false}
        imageSrc={''}
        primaryColor={'#54A3C6'}
        gradient={`linear-gradient(
            0deg,
            rgba(224, 176, 78, 0.3) 0%,
            #54A3C6 100%
          )`
        }
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