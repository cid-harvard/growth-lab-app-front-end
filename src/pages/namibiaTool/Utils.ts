import {createContext, useContext} from 'react';

export enum ProductClass {
  HS = 'HS',
  NAICS = 'NAICS',
}

export const colorScheme = {
  primary: '#527777',
  secondary: '#f1ac88',
  quaternary: '#527777',
  header: 'rgb(55,115,118)',
  data: '#327a76',
  dataSecondary: '#8A5396',
};

export const generateStringId = (productClass: ProductClass, id: string) => `${productClass}-${id}`;
export const extractIdAndClass = (stringId: string) => {
  const [productClass, id] = stringId.split('-');
  return {productClass, id} as {productClass: ProductClass, id: string};
};

export const ProductClassContext = createContext<ProductClass>(ProductClass.HS);
export const useProductClass = () => useContext(ProductClassContext);
