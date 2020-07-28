console.log('Begin prerender of HTML pages');

const defaultTitle = 'The Growth Lab at Harvard Kennedy School';
const defaultDescription = 'Translating Growth Lab research into powerful online tools and interactive storytelling';

const routeData = [
  {
    url: '/',
    title: 'Harvard Growth Lab Digital Hub | ' + defaultTitle ,
    description: defaultDescription,
  },
  {
    url: '/about',
    title: 'About | ' + defaultTitle,
    description: defaultDescription,
  },
  {
    url: '/community',
    title: 'Community | ' + defaultTitle,
    description: defaultDescription,
  },
  {
    url: '/albania-tool',
    title: 'Albania’s Industry Targeting Dashboard | ' + defaultTitle,
    description: 'View data visualizations for Albania’s industries.',
  },
  {
    url: '/accelerating-growth-in-albania',
    title: 'Can Albania’s Economic Turnaround Survive COVID-19? A Growth Diagnostic Update | ' + defaultTitle,
    description: 'This brief analysis takes stock of Albania’s economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.',
  },
  {
    url: '/jordan-tool',
    title: 'A Roadmap for Export Diversification: Jordan’s Complexity Profile | ' + defaultTitle,
    description: 'This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.',
  },
];

const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, './', 'build', 'index.html');

// read in the index.html file
fs.readFile(filePath, 'utf8', function(err, data) {
  if (err) {
    return console.error(err);
  }

  routeData.forEach(({url, title, description}) => {
    let result = data;
    result = result.replace(/\$OG_TITLE/g, title);
    result = result.replace(/\$OG_DESCRIPTION/g, description);
    let filename = url.substring(1).replace(/\//g, '-');
    if (filename.length) {
      filename = filename + '.html';
    } else {
      filename = 'index.html';
    }
    fs.writeFile(path.resolve(__dirname, './', 'build', filename), result, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Saved ' + filename);
      }
    });
  })

});