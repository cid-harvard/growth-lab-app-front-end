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
