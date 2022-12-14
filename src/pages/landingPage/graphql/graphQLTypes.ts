export enum ProjectCategories {
  ATLAS_PROJECTS = 'ATLAS_PROJECTS',
  COUNTRY_DASHBOARDS = 'COUNTRY_DASHBOARDS',
  VISUAL_STORIES = 'VISUAL_STORIES',
  PROTOTYPES_EXPERIMENTS = 'PROTOTYPES_EXPERIMENTS',
  PRESENTATIONS = 'PRESENTATIONS',
  SOFTWARE_PACKAGES = 'SOFTWARE_PACKAGES',
  ANNUAL_BEST_OF = 'ANNUAL_BEST_OF'
}

export enum CardSizes {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export enum ProjectStatuses {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETE = 'COMPLETE',
}

export interface HubProject {
  projectName: string;
  link: string | null;
  projectCategory: ProjectCategories | null;
  show: boolean | null;
  data: string[] | null;
  keywords: string[] | null;
  cardSize: CardSizes | null;
  announcement: string | null;
  ordering: number | null;
  cardImageHi: string | null;
  cardImageLo: string | null;
  status: ProjectStatuses | null;
  localFile: boolean | null;
  id: string;
}

export interface HubKeyword {
  keyword: string;
  projects: number | null;
}