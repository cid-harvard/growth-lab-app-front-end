export const defaultPaletteColors = [
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#ffa600',
  '#c1ab00',
  '#86a927',
  '#4fa049',
  '#019463',
  '#008575',
  '#00747a',
  '#166273',
];

export const defaultDivergentColors = [
  '#00876c',
  '#8cbcac',
  '#f1f1f1',
  '#ec9c9d',
  '#d43d51',
];

export const defaultCoolChloropleth = [
  '#004c6d',
  '#326988',
  '#5487a5',
  '#76a6c2',
  '#98c7e0',
  '#bbe8ff',
];

export const defaultHotChloropleth = [
  '#ff7b00',
  '#fd9936',
  '#fcb45e',
  '#fbcc88',
  '#fce2b4',
  '#fff6e2',
];

const ranges = [
  { divider: 1e18 , suffix: 'E' },
  { divider: 1e15 , suffix: 'P' },
  { divider: 1e12 , suffix: 'T' },
  { divider: 1e9 , suffix: 'B' },
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' },
];

export const formatNumber = (n: number) => {
  for (const range of ranges) {
    if (n >= range.divider) {
      return parseFloat((n / range.divider).toFixed(2)).toString() + range.suffix;
    }
  }
  return n.toString();
};

export function adaptLabelFontSize(d: any) {
  // var xPadding, diameter, labelAvailableWidth, labelWidth;

  const xPadding = 8;
  const diameter = 2 * d.r;
  const labelAvailableWidth = diameter - xPadding;

  // @ts-ignore
  const labelWidth = this.getComputedTextLength();

  // There is enough space for the label so leave it as is.
  if (labelWidth < labelAvailableWidth) {
    return null;
  }

  /*
   * The meaning of the ratio between labelAvailableWidth and labelWidth equaling 1 is that
   * the label is taking up exactly its available space.
   * With the result as `1em` the font remains the same.
   *
   * The meaning of the ratio between labelAvailableWidth and labelWidth equaling 0.5 is that
   * the label is taking up twice its available space.
   * With the result as `0.5em` the font will change to half its original size.
   */
  return (labelAvailableWidth / labelWidth) + 'em';
}
