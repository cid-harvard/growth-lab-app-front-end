import React from 'react';
import {useProductClass, ProductClass} from '../Utils';

const OverviewText = () => {
  const productClass = useProductClass();
  if (productClass === ProductClass.HS) {
     return (
     <>
        <p>
          This industry targeting tool is custom-made for Namibia. Users can choose any of 1241 products (based on HS 1992 product codes at the 4-digit level) from the above drop-down list and explore the product’s match with Namibia’s current productive capabilities and comparative advantages and disadvantages. The tool is designed for use by government and non-government entities that seek to attract foreign direct investment (FDI) to Namibia to accelerate economic development.
        </p>
        <p>
          Harvard Growth Lab research in Namibia shows that the long-term rate of economic growth will be determined by the pace at which the country can develop new economic activities and attract skills and investment from abroad. Detailed information on the methodology and data sources used in this tool can be found here. This tool can be used in combination with the Growth Lab’s <a href='https://atlas.cid.harvard.edu/explore?country=155' target='_blank' rel='noopener noreferrer'>Atlas of Economic Complexity</a> and the <a href='https://metroverse.cid.harvard.edu/' target='_blank' rel='noopener noreferrer'>Metoroverse</a> to explore patterns in global trade in very high detail and city-level analytics of productive capabilities.
        </p>
      </>
    );
  } else {
    return (
      <p>About the Namibia Tool. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    );
  }
};

export default OverviewText;
