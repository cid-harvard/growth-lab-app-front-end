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
