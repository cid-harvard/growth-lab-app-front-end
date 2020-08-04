const Routes = {
  Landing: '/',
  About: '/about',
  Community: '/community',
  AlbaniaTool: '/albania-tool',
  AlbaniaStory: '/accelerating-growth-in-albania',
  JordanTool: '/jordan-tool',
}

const defaultTitle = 'The Growth Lab at Harvard Kennedy School';
const defaultDescription = 'Translating Growth Lab research into powerful online tools and interactive storytelling';

const metadata = [
  {
    url: Routes.Landing,
    title: 'Harvard Growth Lab Digital Hub | ' + defaultTitle ,
    description: defaultDescription,
  },
  {
    url: Routes.About,
    title: 'About | ' + defaultTitle,
    description: defaultDescription,
  },
  {
    url: Routes.Community,
    title: 'Community | ' + defaultTitle,
    description: defaultDescription,
  },
  {
    url: Routes.AlbaniaTool,
    title: 'Albania’s Industry Targeting Dashboard | ' + defaultTitle,
    description: 'View data visualizations for Albania’s industries.',
  },
  {
    url: Routes.AlbaniaStory,
    title: 'Can Albania’s Economic Turnaround Survive COVID-19? A Growth Diagnostic Update | ' + defaultTitle,
    description: 'This brief analysis takes stock of Albania’s economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.',
  },
  {
    url: Routes.JordanTool,
    title: 'A Roadmap for Export Diversification: Jordan’s Complexity Profile | ' + defaultTitle,
    description: 'This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.',
  },
];

module.exports = {
  metadata,
  Routes,
};