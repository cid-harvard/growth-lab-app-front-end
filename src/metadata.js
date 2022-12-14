const Routes = {
  Landing: '/',
  About: '/about',
  Community: '/community',
  AlbaniaTool: '/albania-tool',
  AlbaniaStory: '/accelerating-growth-in-albania',
  JordanTool: '/jordan-tool',
  JordanOverview: '/jordan-project-overview',
  BestOf2020: '/best-of-2020',
  BestOf2021: '/best-of-2021',
  BestOf2022: '/best-of-2022',
  NamibiaTool: '/namibia-tool',
  CustomProductSpace: '/custom-product-space',
  CustomIndustrySpace: '/custom-industry-space',
}

const defaultTitle = 'The Growth Lab at Harvard Kennedy School';
const defaultDescription = 'Translating Growth Lab research into powerful online tools and interactive storytelling';
const defaultOgImage = 'default.png';
const defaultFavicon = '/favicon.svg';

const metadata = [
  {
    url: Routes.Landing,
    title: 'Harvard Growth Lab Viz Hub | ' + defaultTitle ,
    description: defaultDescription,
    og_image: 'growth-lab-hub.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.About,
    title: 'About | ' + defaultTitle,
    description: defaultDescription,
    og_image: 'growth-lab-hub.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.Community,
    title: 'Community | ' + defaultTitle,
    description: defaultDescription,
    og_image: 'growth-lab-hub.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.AlbaniaTool,
    title: 'Albania’s Industry Targeting Dashboard | ' + defaultTitle,
    description: 'View data visualizations for Albania’s industries.',
    og_image: 'albania-dashboard-card-background.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.AlbaniaStory,
    title: 'Can Albania’s Economic Turnaround Survive COVID-19? A Growth Diagnostic Update | ' + defaultTitle,
    description: 'This brief analysis takes stock of Albania’s economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.',
    og_image: 'albania-story-card-background.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.JordanTool,
    title: 'A Roadmap for Export Diversification: Jordan’s Complexity Profile | ' + defaultTitle,
    description: 'This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.',
    og_image: 'jordan-tool-background.png',
    favicon: defaultFavicon,
  },
  {
    url: Routes.JordanOverview,
    title: 'A Roadmap for Export Diversification: Jordan’s Complexity Profile | ' + defaultTitle,
    description: 'This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.',
    og_image: 'jordan-tool-background.png',
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2020,
    title: '15 Visual Insights from the Growth Lab in 2020 | ' + defaultTitle,
    description: "2020's most notable visual insights from faculty, fellows, researchers and staff at Harvard’s Growth Lab.",
    og_image: 'best-of-2020-share-image.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2021,
    title: 'Visual Insights from the Growth Lab\'s 2021 Research | ' + defaultTitle,
    description: "2021's most notable visual insights from faculty, fellows, researchers and staff at Harvard’s Growth Lab.",
    og_image: 'best-of-2021-share-image.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2022,
    title: 'Visual Insights from the Growth Lab\'s 2022 Research | ' + defaultTitle,
    description: "2022's most notable visual insights from faculty, fellows, researchers and staff at Harvard’s Growth Lab.",
    og_image: 'best-of-2022-card-background-lo.jpg',
    favicon: defaultFavicon,
  },
  {
    url: Routes.NamibiaTool,
    title: 'Namibia’s Industry Targeting Dashboard | ' + defaultTitle,
    description: 'View data visualizations for Namibia’s industries.',
    og_image: defaultOgImage,
    favicon: defaultFavicon,
  },
];

const get = (route) => {
  const data = metadata.find(({url}) => url === route);
  if (data) {
    return data;
  } else {
    return {
      url: route,
      title: 'Harvard Growth Lab Viz Hub | ' + defaultTitle ,
      description: defaultDescription,
      og_image: defaultOgImage,
      favicon: defaultFavicon,
    }
  }
}

module.exports = {
  metadata,
  Routes,
  get,
};