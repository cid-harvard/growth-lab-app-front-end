export enum ProductClass {
  HS = 'HS',
  NAICS = 'NAICS',
}

export const colorScheme = {
  primary: '#84a9ac',
  quaternary: '#4d7082',
  header: '#204052',
  data: '#327a76',
  dataSecondary: '#8A5396',
};

export const generateStringId = (productClass: ProductClass, id: string) => `${productClass}-${id}`;
export const extractIdAndClass = (stringId: string) => {
  const [productClass, id] = stringId.split('-');
  return {productClass, id};
};
