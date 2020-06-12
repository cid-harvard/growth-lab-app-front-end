export enum Routes {
  Landing = '/',
  About = '/about',
  Community = '/community',
  Sandbox = '/sandbox/:section/:detail',
  AlbaniaTool = '/albania-tool',
  AlbaniaStory = '/stories/albania',
  JordanTool = '/jordan-tool',
}

export const hubId = 'hub';

export enum SandboxSection {
  DataViz = 'dataviz',
}

export enum DataVizSections {
  LineChart = 'linechart',
  GeoMap = 'geomap',
}
