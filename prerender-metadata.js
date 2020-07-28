console.log('Begin prerender of HTML pages');

const defaultTitle = 'Harvard Growth Lab Digital Hub';
const defaultDescription = 'Translating Growth Lab research into powerful online tools and interactive storytelling';

const routeData = [
  {
    url: '/',
    title: defaultTitle + ' - The Growth Lab at Harvard Kennedy School',
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