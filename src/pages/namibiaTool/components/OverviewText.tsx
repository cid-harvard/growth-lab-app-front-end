import React from 'react';
import {useProductClass, ProductClass} from '../Utils';

const OverviewText = () => {
  const productClass = useProductClass();
  const dropdownLine = (productClass === ProductClass.HS)
    ? 'Users can choose any of 1241 products (based on HS 1992 product codes at the 4-digit level) from the above drop-down list and explore the product’s match with Namibia’s current productive capabilities and comparative advantages and disadvantages.'
    : 'Users can choose any of 305 industries (based on NAICS industry codes at the 6-digit level) from the above drop-down list and explore the industry’s match with Namibia’s current productive capabilities and comparative advantages and disadvantages.';
  return (
  <>
     <p>
       This industry targeting tool is custom-made for Namibia. {dropdownLine} The tool is designed for use by government and non-government entities that seek to attract foreign direct investment (FDI) to Namibia to accelerate economic development.
     </p>
     <p>
        Harvard Growth Lab research in Namibia shows that the long-term rate of economic growth will be determined by the pace at which the country can develop new economic activities and attract skills and investment from abroad. Detailed information on the methodology and data sources used in this tool can be found <a href='https://docs.google.com/document/d/1WUDKvL4g-Rt9v2SN_womLlGJ5ABpLz4EglXlcTjkCPo/edit?usp=sharing' target='_blank' rel='noopener noreferrer'>here</a>. This tool can be used in combination with the Growth Lab’s <a href='https://atlas.cid.harvard.edu/explore?country=155' target='_blank' rel='noopener noreferrer'>Atlas of Economic Complexity</a> and the <a href='https://metroverse.cid.harvard.edu/' target='_blank' rel='noopener noreferrer'>Metroverse</a> to explore patterns in global trade in very high detail and city-level analytics of productive capabilities.
     </p>
   </>
  );
};

export default OverviewText;
