import {useState, useEffect} from 'react';
import raw from 'raw.macro';

export enum ProjectCategory {
  AtlasProjects = 'Atlas Projects',
  CountryDashboards = 'Country Dashboards',
  VisualStories = 'Visual Stories',
  PrototypesExperiments = 'Prototypes / Experiments',
  Presentations = 'Presentations',
  SoftwarePackages = 'Software Packages',
}

export enum Announcement {
  UpdatedData = 'Updated Data',
  New = 'New',
  NewFeature = 'New Feature',
}

export enum Status {
  Active = 'Active',
  Complete = 'Complete',
  Archived = 'Archived',
}

export enum CardSize {
  Large = 'Large',
  Medium = 'Medium',
  Small = 'Small',
}

interface RawDatum {
  project_name: string;
  link: string;
  project_category: ProjectCategory;
  data: string;
  keywords: string;
  card_size: CardSize;
  announcement: Announcement | 'None';
  ordering: number | '';
  card_image: string;
  status: Status | '';
}

export interface ProjectDatum {
  project_name: string;
  link: string;
  project_category: ProjectCategory;
  data: string | undefined;
  keywords: string[];
  card_size: CardSize;
  announcement: Announcement | undefined;
  ordering: number | undefined;
  card_image: string;
  status: Status | undefined;
}

interface Output {
  loading: boolean;
  error: undefined | {message: string};
  data: undefined | {projects: ProjectDatum[]};
}

export default () => {
  const [output, setOutput] = useState<Output>({
    loading: true, error: undefined, data: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      const rawData: RawDatum[] = JSON.parse(raw('./data.json'));
      const projects: ProjectDatum[] = rawData.map((d) => {
        return {
          ...d,
          data: d.data && d.data.length ? d.data : undefined,
          keywords: d.keywords.split(','),
          announcement: d.announcement === 'None' ? undefined : d.announcement,
          ordering: d.ordering ? d.ordering : undefined,
          status: d.status && d.status.length ? d.status : undefined,
        };
      });
      setOutput({loading: false, error: undefined, data: {projects}});
    };
    fetchData();
  }, [setOutput]);

  return output;
};